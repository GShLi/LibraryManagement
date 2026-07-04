const { Borrow, BookCopy, Book, Reader, Fine, Reserve, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, ConflictError } = require('../utils/errors');
const auditService = require('./audit.service');
const systemService = require('./system.service');

// Date helpers
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date) {
  if (!date) return null;
  if (typeof date === 'string') {
    return date.includes('T') ? date.split('T')[0] : date;
  }
  return date.toISOString().split('T')[0];
}

function todayStr() {
  return formatDate(new Date());
}

async function borrowBooks({ readerNo, barcodes, operatorId, ip }) {
  // Find reader by reader_no OR phone
  const reader = await Reader.findOne({
    where: {
      [Op.or]: [
        { reader_no: readerNo },
        { phone: readerNo }
      ]
    },
    include: [{ model: User, as: 'user', attributes: ['id', 'username', 'status'] }]
  });

  if (!reader) {
    throw new NotFoundError('读者不存在', 40301);
  }

  // Validate reader status
  if (reader.status === 'frozen') {
    throw new ConflictError('读者账户已被冻结', 40302);
  }
  if (reader.status === 'lost') {
    throw new ConflictError('读者已挂失', 40303);
  }
  if (reader.status === 'disabled') {
    throw new ConflictError('读者账户已被禁用', 40304);
  }

  // Also check user status
  if (reader.user && reader.user.status !== 'active') {
    throw new ConflictError('读者账户状态异常', 40304);
  }

  // Check no overdue borrows
  const todayDate = todayStr();
  const overdueCount = await Borrow.count({
    where: {
      reader_id: reader.user_id,
      status: { [Op.in]: ['borrowing', 'overdue'] },
      due_date: { [Op.lt]: todayDate }
    }
  });
  if (overdueCount > 0) {
    throw new ConflictError('存在逾期未还的图书，无法借阅', 40503);
  }

  // Check no unpaid fines
  const unpaidFineCount = await Fine.count({
    where: {
      reader_id: reader.user_id,
      status: 'unpaid'
    }
  });
  if (unpaidFineCount > 0) {
    throw new ConflictError('存在未缴纳的罚款，无法借阅', 40504);
  }

  // Check borrow limit
  const newBorrowCount = Array.isArray(barcodes) ? barcodes.length : 1;
  if (reader.current_borrowed + newBorrowCount > reader.borrow_limit) {
    throw new ConflictError(`超出借阅上限(${reader.borrow_limit}本)，当前已借${reader.current_borrowed}本`, 40502);
  }

  const barcodeList = Array.isArray(barcodes) ? barcodes : [barcodes];

  // Resolve copies
  const copies = [];
  const bookIds = new Set();
  for (const barcode of barcodeList) {
    const copy = await BookCopy.findOne({
      where: { barcode },
      include: [{ model: Book, as: 'book' }]
    });
    if (!copy || copy.status !== 'available') {
      throw new ConflictError(`条码 ${barcode} 的副本不可借阅`, 40408);
    }
    if (!copy.book || copy.book.status !== 'active') {
      throw new ConflictError(`条码 ${barcode} 对应的图书不可借阅`);
    }
    copies.push(copy);
    bookIds.add(copy.book_id);
  }

  // Check reservation conflicts: other readers have waiting reservations for these books
  const conflictingReservations = await Reserve.count({
    where: {
      book_id: { [Op.in]: Array.from(bookIds) },
      status: 'waiting',
      reader_id: { [Op.ne]: reader.user_id }
    }
  });
  if (conflictingReservations > 0) {
    throw new ConflictError('该图书有其他读者预约，无法借阅', 40506);
  }

  const borrowDurationDays = systemService.getConfigInt('borrow_duration_days', 30);

  const t = await sequelize.transaction();
  try {
    const borrowRecords = [];
    for (const copy of copies) {
      const borrow = await Borrow.create({
        reader_id: reader.user_id,
        copy_id: copy.id,
        operator_id: operatorId,
        borrow_date: new Date(),
        due_date: addDays(new Date(), borrowDurationDays),
        status: 'borrowing',
        renew_count: 0
      }, { transaction: t });

      await BookCopy.update(
        { status: 'borrowed' },
        { where: { id: copy.id }, transaction: t }
      );

      await Book.update(
        { available_copies: sequelize.literal('available_copies - 1') },
        { where: { id: copy.book_id }, transaction: t }
      );

      // Auto fulfill borrower's waiting reservation for this book
      await Reserve.update(
        { status: 'fulfilled' },
        {
          where: {
            book_id: copy.book_id,
            reader_id: reader.user_id,
            status: 'waiting'
          },
          transaction: t
        }
      );

      borrowRecords.push({
        id: borrow.id,
        barcode: copy.barcode,
        bookTitle: copy.book.title,
        dueDate: formatDate(borrow.due_date),
        borrowDate: formatDate(borrow.borrow_date)
      });
    }

    // Increment reader.current_borrowed
    await Reader.update(
      { current_borrowed: sequelize.literal(`current_borrowed + ${newBorrowCount}`) },
      { where: { user_id: reader.user_id }, transaction: t }
    );

    await t.commit();

    await auditService.log(operatorId, 'borrow', 'borrow', borrowRecords.map(r => r.id).join(','),
      `读者 ${reader.name}(${reader.reader_no}) 借阅 ${newBorrowCount} 本图书`, ip);

    return {
      readerName: reader.name,
      readerNo: reader.reader_no,
      borrowCount: newBorrowCount,
      records: borrowRecords
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async function returnBook(borrowId, operatorId, ip) {
  const borrow = await Borrow.findByPk(borrowId, {
    include: [
      { model: BookCopy, as: 'copy', include: [{ model: Book, as: 'book' }] },
      { model: Reader, as: 'reader' }
    ]
  });

  if (!borrow) {
    throw new NotFoundError('借阅记录不存在', 40501);
  }

  if (borrow.status === 'returned') {
    throw new ConflictError('该书已归还', 40507);
  }

  const returnDate = new Date();
  const dueDate = new Date(borrow.due_date);
  const diffTime = returnDate.getTime() - dueDate.getTime();
  const overdueDays = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;

  const finalStatus = overdueDays > 0 ? 'overdue' : 'returned';
  let fineAmount = 0;
  let fineRecord = null;

  const t = await sequelize.transaction();
  try {
    // Update borrow record
    await borrow.update({
      status: finalStatus,
      return_date: returnDate
    }, { transaction: t });

    // Update copy to available
    await BookCopy.update(
      { status: 'available' },
      { where: { id: borrow.copy_id }, transaction: t }
    );

    // Decrement reader current_borrowed
    await Reader.update(
      { current_borrowed: sequelize.literal('current_borrowed - 1') },
      { where: { user_id: borrow.reader_id }, transaction: t }
    );

    // Increment book available_copies
    await Book.update(
      { available_copies: sequelize.literal('available_copies + 1') },
      { where: { id: borrow.copy.book_id }, transaction: t }
    );

    // Handle overdue fine
    if (overdueDays > 0) {
      const fineRate = systemService.getConfigFloat('fine_rate', 0.5);
      const fineMaxMultiple = systemService.getConfigFloat('fine_max_multiple', 2.0);
      const bookPrice = parseFloat(borrow.copy.book.price) || 0;
      const rawFine = overdueDays * fineRate;
      const maxFine = bookPrice * fineMaxMultiple;
      fineAmount = parseFloat(Math.min(rawFine, maxFine).toFixed(2));

      fineRecord = await Fine.create({
        borrow_id: borrowId,
        reader_id: borrow.reader_id,
        overdue_days: overdueDays,
        amount: fineAmount,
        reason: 'overdue',
        status: 'unpaid'
      }, { transaction: t });

      // Check if overdue >= freeze_days
      const freezeDays = systemService.getConfigInt('freeze_days', 60);
      if (overdueDays >= freezeDays) {
        await Reader.update(
          { status: 'frozen' },
          { where: { user_id: borrow.reader_id }, transaction: t }
        );
      }
    }

    await t.commit();

    await auditService.log(operatorId, 'return', 'borrow', borrowId,
      `归还图书: ${borrow.copy.book.title}, ${overdueDays > 0 ? `逾期${overdueDays}天` : '按时归还'}`, ip);

    const result = {
      borrowId,
      bookTitle: borrow.copy.book.title,
      barcode: borrow.copy.barcode,
      borrowDate: formatDate(borrow.borrow_date),
      dueDate: formatDate(borrow.due_date),
      returnDate: formatDate(returnDate),
      status: finalStatus,
      overdueDays,
      fine: fineRecord ? { id: fineRecord.id, amount: fineAmount, overdueDays } : null
    };

    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async function renewBook(borrowId, userId, userRole) {
  const borrow = await Borrow.findByPk(borrowId, {
    include: [
      { model: BookCopy, as: 'copy', include: [{ model: Book, as: 'book' }] },
      { model: Reader, as: 'reader' }
    ]
  });

  if (!borrow) {
    throw new NotFoundError('借阅记录不存在', 40501);
  }

  // Can only renew books with status 'borrowing'
  if (borrow.status !== 'borrowing') {
    throw new ConflictError('该书状态不允许续借', 40508);
  }

  // Check if overdue
  if (new Date(borrow.due_date) < new Date()) {
    throw new ConflictError('该书已逾期，无法续借', 40508);
  }

  // Check renew limit
  const maxRenewCount = systemService.getConfigInt('max_renew_count', 2);
  if (borrow.renew_count >= maxRenewCount) {
    throw new ConflictError(`续借次数已达上限(${maxRenewCount}次)`, 40509);
  }

  // Check no reservation by other readers
  const otherReservation = await Reserve.count({
    where: {
      book_id: borrow.copy.book_id,
      status: 'waiting',
      reader_id: { [Op.ne]: borrow.reader_id }
    }
  });
  if (otherReservation > 0) {
    throw new ConflictError('该书有其他读者预约，无法续借', 40510);
  }

  const renewDurationDays = systemService.getConfigInt('renew_duration_days', 30);
  const previousDueDate = formatDate(borrow.due_date);

  await borrow.update({
    due_date: addDays(new Date(), renewDurationDays),
    renew_count: borrow.renew_count + 1
  });

  await auditService.log(userId, 'renew', 'borrow', borrowId,
    `续借图书: ${borrow.copy.book.title}, 原到期日: ${previousDueDate}, 新到期日: ${formatDate(borrow.due_date)}, 续借次数: ${borrow.renew_count + 1}`, '127.0.0.1');

  return {
    borrowId,
    bookTitle: borrow.copy.book.title,
    barcode: borrow.copy.barcode,
    previousDueDate,
    newDueDate: formatDate(borrow.due_date),
    renewCount: borrow.renew_count + 1
  };
}

async function list({ page = 1, pageSize = 20, status, readerId, startDate, endDate }) {
  const where = {};
  if (status) where.status = status;
  if (readerId) where.reader_id = readerId;
  if (startDate || endDate) {
    where.borrow_date = {};
    if (startDate) where.borrow_date[Op.gte] = new Date(startDate);
    if (endDate) where.borrow_date[Op.lte] = new Date(endDate + 'T23:59:59');
  }

  const offset = (page - 1) * pageSize;
  const { rows, count } = await Borrow.findAndCountAll({
    where,
    include: [
      { model: Reader, as: 'reader', attributes: ['user_id', 'reader_no', 'name', 'phone'] },
      {
        model: BookCopy, as: 'copy',
        include: [{ model: Book, as: 'book', attributes: ['id', 'isbn', 'title', 'author', 'cover_url'] }]
      }
    ],
    order: [['borrow_date', 'DESC']],
    offset,
    limit: pageSize
  });

  return {
    list: rows,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize)
  };
}

async function listOverdue({ page = 1, pageSize = 20, readerId }) {
  const todayDate = todayStr();
  const where = {
    status: { [Op.in]: ['borrowing', 'overdue'] },
    due_date: { [Op.lt]: todayDate }
  };
  if (readerId) where.reader_id = readerId;

  const offset = (page - 1) * pageSize;
  const { rows, count } = await Borrow.findAndCountAll({
    where,
    include: [
      { model: Reader, as: 'reader', attributes: ['user_id', 'reader_no', 'name', 'phone'] },
      {
        model: BookCopy, as: 'copy',
        include: [{ model: Book, as: 'book', attributes: ['id', 'isbn', 'title', 'author', 'cover_url'] }]
      }
    ],
    order: [['due_date', 'ASC']],
    offset,
    limit: pageSize
  });

  // Attach overdue days to each row
  const list = rows.map(row => {
    const dueDate = new Date(row.due_date);
    const now = new Date();
    const overdueDays = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      ...row.toJSON(),
      overdueDays: overdueDays > 0 ? overdueDays : 0
    };
  });

  return {
    list,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize)
  };
}

module.exports = {
  borrowBooks,
  returnBook,
  renewBook,
  list,
  listOverdue
};
