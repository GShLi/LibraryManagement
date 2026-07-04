const { Reader, User, Borrow, BookCopy, Book } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, ConflictError } = require('../utils/errors');

async function list({ page = 1, pageSize = 20, status, readerType, keyword }) {
  const where = {};
  if (status) where.status = status;
  if (readerType) where.reader_type = readerType;
  if (keyword) {
    where[Op.or] = [
      { reader_no: { [Op.like]: `%${keyword}%` } },
      { name: { [Op.like]: `%${keyword}%` } },
      { phone: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const offset = (page - 1) * pageSize;
  const { rows, count } = await Reader.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'role', 'status']
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
  const reader = await Reader.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: { exclude: ['password'] }
      }
    ]
  });
  if (!reader) {
    throw new NotFoundError('读者不存在', 40301);
  }
  return reader;
}

async function update(id, data) {
  const reader = await Reader.findByPk(id);
  if (!reader) {
    throw new NotFoundError('读者不存在', 40301);
  }

  // Check phone uniqueness
  if (data.phone && data.phone !== reader.phone) {
    const existing = await Reader.findOne({ where: { phone: data.phone } });
    if (existing && existing.user_id !== id) {
      throw new ConflictError('手机号已被使用', 40112);
    }
  }

  await reader.update(data);
  return reader.reload({
    include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
  });
}

async function updateStatus(id, status) {
  const reader = await Reader.findByPk(id);
  if (!reader) {
    throw new NotFoundError('读者不存在', 40301);
  }

  if (!['active', 'lost'].includes(status)) {
    throw new ConflictError('无效的读者状态');
  }

  await reader.update({ status });

  // Also sync user status
  const user = await User.findByPk(reader.user_id);
  if (user) {
    const userStatus = status === 'active' ? 'active' : 'disabled';
    await user.update({ status: userStatus });
  }

  return true;
}

async function getBorrowHistory(id, { page = 1, pageSize = 20, status, startDate, endDate }) {
  const reader = await Reader.findByPk(id);
  if (!reader) {
    throw new NotFoundError('读者不存在', 40301);
  }

  const where = { reader_id: id };
  if (status) where.status = status;
  if (startDate || endDate) {
    where.borrow_date = {};
    if (startDate) where.borrow_date[Op.gte] = new Date(startDate);
    if (endDate) where.borrow_date[Op.lte] = new Date(endDate + 'T23:59:59');
  }

  const offset = (page - 1) * pageSize;
  const { rows, count } = await Borrow.findAndCountAll({
    where,
    include: [
      {
        model: BookCopy,
        as: 'copy',
        include: [
          {
            model: Book,
            as: 'book',
            attributes: ['id', 'isbn', 'title', 'author', 'cover_url']
          }
        ]
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

module.exports = {
  list,
  getById,
  update,
  updateStatus,
  getBorrowHistory
};
