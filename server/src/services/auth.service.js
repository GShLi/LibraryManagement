const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Reader, sequelize } = require('../models');
const { UnauthorizedError, ConflictError } = require('../utils/errors');
const { generateReaderNo } = require('../utils/barcode');
const auditService = require('./audit.service');
const systemService = require('./system.service');
const appConfig = require('../config');

const BCRYPT_ROUNDS = 10;

async function register({ username, password, name, phone, email }) {
  // Validate password: >= 8 chars, contains letter AND number
  if (!password || password.length < 8) {
    throw new ConflictError('密码长度不能少于8位', 40113);
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new ConflictError('密码必须包含字母和数字', 40113);
  }

  // Check username uniqueness
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    throw new ConflictError('用户名已存在', 40111);
  }

  // Check phone uniqueness
  const existingPhone = await Reader.findOne({ where: { phone } });
  if (existingPhone) {
    throw new ConflictError('手机号已被注册', 40112);
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const readerType = 'student';
  const borrowLimitKey = `borrow_limit_${readerType}`;
  const borrowLimit = systemService.getConfigInt(borrowLimitKey, 5);

  // Generate reader_no with a temporary approach until reader is created
  const readerNo = await generateReaderNo({ sequelize });

  const t = await sequelize.transaction();
  try {
    const user = await User.create({
      username,
      password: hashedPassword,
      role: 'reader',
      status: 'active',
      login_attempts: 0
    }, { transaction: t });

    await Reader.create({
      user_id: user.id,
      reader_no: readerNo,
      name,
      phone,
      email: email || null,
      reader_type: readerType,
      borrow_limit: borrowLimit,
      current_borrowed: 0,
      status: 'active'
    }, { transaction: t });

    await t.commit();

    return { userId: user.id, username: user.username, readerNo };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async function login({ username, password, rememberMe = false, ip = '127.0.0.1' }) {
  // Find user including soft-deleted
  const user = await User.findOne({ where: { username }, paranoid: false });
  if (!user) {
    throw new UnauthorizedError('用户名或密码错误', 40110);
  }

  // Check if user is soft-deleted
  if (user.deleted_at) {
    throw new UnauthorizedError('用户名或密码错误', 40110);
  }

  // Check status
  if (user.status === 'disabled') {
    throw new UnauthorizedError('账户已被禁用', 40114);
  }

  if (user.status === 'locked' && user.locked_until) {
    if (new Date(user.locked_until) > new Date()) {
      throw new UnauthorizedError('账户已被锁定，请稍后再试', 40115);
    } else {
      // Auto reset if lock expired
      await user.update({ status: 'active', login_attempts: 0 });
      user.status = 'active';
      user.login_attempts = 0;
    }
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const newAttempts = user.login_attempts + 1;
    if (newAttempts >= 5) {
      const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      await user.update({
        login_attempts: newAttempts,
        status: 'locked',
        locked_until: lockedUntil
      });
      throw new UnauthorizedError('密码错误次数过多，账户已锁定15分钟', 40115);
    } else {
      await user.update({ login_attempts: newAttempts });
      throw new UnauthorizedError('用户名或密码错误', 40110);
    }
  }

  // Login success
  await user.update({ login_attempts: 0 });

  // Get reader info
  const reader = await Reader.findOne({ where: { user_id: user.id } });

  // Create audit log
  await auditService.log(user.id, 'login', 'user', user.id, `用户 ${username} 登录成功`, ip);

  // Sign JWT
  const expiresIn = rememberMe ? appConfig.jwt.rememberMeExpiresIn : appConfig.jwt.expiresIn;
  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    appConfig.jwt.secret,
    { expiresIn }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      name: reader ? reader.name : null,
      readerNo: reader ? reader.reader_no : null
    }
  };
}

async function getProfile(userId) {
  const user = await User.findByPk(userId, {
    include: [{ model: Reader, as: 'reader' }]
  });
  if (!user) {
    throw new UnauthorizedError('用户不存在', 40110);
  }
  const { password, ...safeUser } = user.toJSON();
  return safeUser;
}

module.exports = { register, login, getProfile };
