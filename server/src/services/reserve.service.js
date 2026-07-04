const { Reserve, Book, Reader } = require('../models');
const { NotFoundError, ConflictError, ForbiddenError } = require('../utils/errors');
const auditService = require('./audit.service');
const systemService = require('./system.service');

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

async function create({ bookId, copyId, readerId }) {
  // Check book exists
  const book = await Book.findByPk(bookId);
  if (!book) {
    throw new NotFoundError('图书不存在', 40401);
  }

  // Check no existing waiting reservation for same reader+book
  const existing = await Reserve.findOne({
    where: {
      reader_id: readerId,
      book_id: bookId,
      status: 'waiting'
    }
  });
  if (existing) {
    throw new ConflictError('您已预约过该书', 40702);
  }

  // Don't allow reserve when copies are available
  if (book.available_copies > 0) {
    throw new ConflictError('该书有可借副本，请直接借阅', 40703);
  }

  const reserveExpireDays = systemService.getConfigInt('reserve_expire_days', 7);
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + reserveExpireDays);

  const reserve = await Reserve.create({
    reader_id: readerId,
    book_id: bookId,
    copy_id: copyId || null,
    reserve_date: new Date(),
    expire_date: formatDate(expireDate),
    status: 'waiting'
  });

  // Get reader info for audit
  const reader = await Reader.findByPk(readerId);
  await auditService.log(readerId, 'reserve', 'reserve', reserve.id,
    `读者 ${reader ? reader.name : readerId} 预约图书: ${book.title}`, '127.0.0.1');

  return {
    reserveId: reserve.id,
    bookId: reserve.book_id,
    bookTitle: book.title,
    reserveDate: reserve.reserve_date.toISOString(),
    expireDate: reserve.expire_date,
    status: reserve.status
  };
}

async function cancel(id, userId, userRole) {
  const reserve = await Reserve.findByPk(id, {
    include: [
      { model: Book, as: 'book', attributes: ['id', 'title'] },
      { model: Reader, as: 'reader' }
    ]
  });

  if (!reserve) {
    throw new NotFoundError('预约记录不存在', 40701);
  }

  if (reserve.status !== 'waiting') {
    throw new ConflictError('该预约已处理，无法取消');
  }

  // Reader can only cancel own; admin/librarian can cancel any
  if (userRole === 'reader' && reserve.reader_id !== userId) {
    throw new ForbiddenError('无权取消他人预约');
  }

  await reserve.update({ status: 'cancelled' });

  await auditService.log(userId, 'cancel_reserve', 'reserve', id,
    `取消预约: ${reserve.book.title}`, '127.0.0.1');

  return { message: '预约已取消' };
}

async function list({ page = 1, pageSize = 20, status, readerId, userRole, userId }) {
  const where = {};
  if (status) where.status = status;

  // Reader can only see own reservations
  if (userRole === 'reader') {
    where.reader_id = userId;
  } else if (readerId) {
    where.reader_id = readerId;
  }

  const offset = (page - 1) * pageSize;
  const { count, rows } = await Reserve.findAndCountAll({
    where,
    include: [
      { model: Reader, as: 'reader', attributes: ['user_id', 'reader_no', 'name', 'phone'] },
      { model: Book, as: 'book', attributes: ['id', 'isbn', 'title', 'author', 'cover_url'] }
    ],
    order: [['reserve_date', 'DESC']],
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

module.exports = {
  create,
  cancel,
  list
};
