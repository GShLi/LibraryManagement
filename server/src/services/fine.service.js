const { Fine, Reader, Borrow, BookCopy, Book } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, ConflictError } = require('../utils/errors');
const auditService = require('./audit.service');

async function list({ page = 1, pageSize = 20, status, readerId, startDate, endDate }) {
  const where = {};
  if (status) where.status = status;
  if (readerId) where.reader_id = readerId;
  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) where.created_at[Op.gte] = new Date(startDate);
    if (endDate) where.created_at[Op.lte] = new Date(endDate + 'T23:59:59');
  }

  const offset = (page - 1) * pageSize;
  const { rows, count } = await Fine.findAndCountAll({
    where,
    include: [
      { model: Reader, as: 'reader', attributes: ['user_id', 'reader_no', 'name', 'phone'] },
      {
        model: Borrow,
        as: 'borrow',
        include: [
          {
            model: BookCopy,
            as: 'copy',
            include: [{ model: Book, as: 'book', attributes: ['id', 'isbn', 'title', 'author', 'cover_url'] }]
          }
        ]
      }
    ],
    order: [['created_at', 'DESC']],
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

async function getById(id) {
  const fine = await Fine.findByPk(id, {
    include: [
      { model: Reader, as: 'reader', attributes: ['user_id', 'reader_no', 'name', 'phone'] },
      {
        model: Borrow,
        as: 'borrow',
        include: [
          {
            model: BookCopy,
            as: 'copy',
            include: [{ model: Book, as: 'book', attributes: ['id', 'isbn', 'title', 'author', 'cover_url'] }]
          }
        ]
      }
    ]
  });
  if (!fine) {
    throw new NotFoundError('罚款记录不存在', 40601);
  }
  return fine;
}

async function pay(id, userId, ip) {
  const fine = await Fine.findByPk(id, {
    include: [
      { model: Reader, as: 'reader' },
      { model: Borrow, as: 'borrow', include: [{ model: BookCopy, as: 'copy', include: [{ model: Book, as: 'book' }] }] }
    ]
  });
  if (!fine) {
    throw new NotFoundError('罚款记录不存在', 40601);
  }

  if (fine.status === 'paid') {
    throw new ConflictError('该罚款已缴纳', 40602);
  }

  await fine.update({
    status: 'paid',
    paid_at: new Date()
  });

  const bookTitle = fine.borrow && fine.borrow.copy && fine.borrow.copy.book
    ? fine.borrow.copy.book.title : '未知图书';
  const readerName = fine.reader ? fine.reader.name : '未知读者';

  await auditService.log(userId, 'pay_fine', 'fine', id,
    `缴纳罚款: ${readerName}, 图书: ${bookTitle}, 金额: ${fine.amount}元`, ip);

  return {
    id: fine.id,
    amount: fine.amount,
    status: 'paid',
    paidAt: new Date().toISOString()
  };
}

module.exports = {
  list,
  getById,
  pay
};
