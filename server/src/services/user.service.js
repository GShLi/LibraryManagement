const bcrypt = require('bcryptjs');
const { User, Reader, Borrow, sequelize } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { generateReaderNo } = require('../utils/barcode');

const BCRYPT_ROUNDS = 10;

async function list({ page = 1, pageSize = 20, role, status, keyword }) {
  const where = {};
  if (role) where.role = role;
  if (status) where.status = status;
  if (keyword) {
    where.username = { [Op.like]: `%${keyword}%` };
  }

  const offset = (page - 1) * pageSize;
  const { rows, count } = await User.findAndCountAll({
    where,
    include: [{ model: Reader, as: 'reader' }],
    attributes: { exclude: ['password'] },
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
  const user = await User.findByPk(id, {
    include: [{ model: Reader, as: 'reader' }],
    attributes: { exclude: ['password'] }
  });
  if (!user) {
    throw new NotFoundError('用户不存在', 40201);
  }
  return user;
}

async function create({ username, password, role, name, phone, email, readerType, borrowLimit }) {
  // Check username uniqueness
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    throw new ConflictError('用户名已存在', 40202);
  }

  // Validate role
  if (!['admin', 'librarian', 'reader'].includes(role)) {
    throw new ConflictError('无效的用户角色', 40204);
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const t = await sequelize.transaction();
  try {
    const user = await User.create({
      username,
      password: hashedPassword,
      role,
      status: 'active',
      login_attempts: 0
    }, { transaction: t });

    if (role === 'reader') {
      const readerNo = await generateReaderNo({ sequelize });
      const limit = borrowLimit || 5;
      await Reader.create({
        user_id: user.id,
        reader_no: readerNo,
        name: name || username,
        phone: phone || '',
        email: email || null,
        reader_type: readerType || 'student',
        borrow_limit: limit,
        current_borrowed: 0,
        status: 'active'
      }, { transaction: t });
    }

    await t.commit();

    const createdUser = await User.findByPk(user.id, {
      include: [{ model: Reader, as: 'reader' }],
      attributes: { exclude: ['password'] }
    });

    return createdUser;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async function update(id, data) {
  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('用户不存在', 40201);
  }

  // Check username uniqueness if changing
  if (data.username && data.username !== user.username) {
    const existing = await User.findOne({ where: { username: data.username } });
    if (existing && existing.id !== id) {
      throw new ConflictError('用户名已存在', 40202);
    }
  }

  const userData = {};
  if (data.password) {
    userData.password = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
  }
  if (data.username) userData.username = data.username;
  if (data.role) {
    if (!['admin', 'librarian', 'reader'].includes(data.role)) {
      throw new ConflictError('无效的用户角色', 40204);
    }
    userData.role = data.role;
  }

  await user.update(userData);

  // Update reader fields if provided
  if (user.role === 'reader' || (data.role === 'reader')) {
    const reader = await Reader.findOne({ where: { user_id: id } });
    if (reader) {
      const readerData = {};
      if (data.name) readerData.name = data.name;
      if (data.phone) readerData.phone = data.phone;
      if (data.email !== undefined) readerData.email = data.email;
      if (data.readerType) readerData.reader_type = data.readerType;
      if (data.borrowLimit !== undefined) readerData.borrow_limit = data.borrowLimit;
      if (Object.keys(readerData).length > 0) {
        await reader.update(readerData);
      }
    }
  }

  return User.findByPk(id, {
    include: [{ model: Reader, as: 'reader' }],
    attributes: { exclude: ['password'] }
  });
}

async function updateStatus(id, status) {
  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('用户不存在', 40201);
  }

  await user.update({ status });

  // Sync reader status
  const reader = await Reader.findOne({ where: { user_id: id } });
  if (reader) {
    await reader.update({ status });
  }

  return true;
}

async function resetPassword(id, newPassword) {
  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('用户不存在', 40201);
  }

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await user.update({ password: hashedPassword, login_attempts: 0, status: 'active', locked_until: null });

  return true;
}

async function changePassword(id, oldPassword, newPassword) {
  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('用户不存在', 40201);
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new ConflictError('原密码错误', 40116);
  }

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await user.update({ password: hashedPassword });

  return true;
}

async function softDelete(id, currentUserId) {
  if (id === currentUserId) {
    throw new ConflictError('不能删除自己的账户', 40203);
  }

  const user = await User.findByPk(id);
  if (!user) {
    throw new NotFoundError('用户不存在', 40201);
  }

  // Check no active borrows for readers
  const reader = await Reader.findOne({ where: { user_id: id } });
  if (reader) {
    const activeBorrows = await Borrow.count({
      where: {
        reader_id: reader.user_id,
        status: { [Op.in]: ['borrowing', 'overdue'] }
      }
    });
    if (activeBorrows > 0) {
      throw new ConflictError('该读者存在未归还的借阅，无法删除', 40203);
    }
  }

  await user.destroy(); // soft delete via paranoid

  return true;
}

module.exports = {
  list,
  getById,
  create,
  update,
  updateStatus,
  resetPassword,
  changePassword,
  softDelete
};
