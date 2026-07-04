const authService = require('../services/auth.service');
const auditService = require('../services/audit.service');
const { success, created } = require('../utils/response');

exports.register = async (req, res, next) => {
  try {
    const { username, password, name, phone, email } = req.body;
    const result = await authService.register({ username, password, name, phone, email });
    created(res, result, '注册成功');
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password, rememberMe } = req.body;
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const result = await authService.login({ username, password, rememberMe, ip });
    success(res, result, '登录成功');
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const result = await authService.getProfile(req.user.userId);
    success(res, result);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await auditService.log(req.user.userId, 'user.logout', 'user', String(req.user.userId), '用户主动登出', ip);
    success(res, null, '登出成功');
  } catch (err) {
    next(err);
  }
};
