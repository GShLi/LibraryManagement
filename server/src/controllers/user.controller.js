const userService = require('../services/user.service');
const { success, created, paginated } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const { page, pageSize, keyword, role, status } = req.query;
    const result = await userService.list({
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 20,
      keyword,
      role,
      status
    });
    paginated(res, result);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await userService.getById(parseInt(req.params.id));
    success(res, result);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { username, password, role, name, phone, email, readerType, borrowLimit } = req.body;
    const result = await userService.create({ username, password, role, name, phone, email, readerType, borrowLimit });
    created(res, { id: result.id, username: result.username, role: result.role }, '创建成功');
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    await userService.update(parseInt(req.params.id), req.body);
    success(res, null, '更新成功');
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    await userService.updateStatus(parseInt(req.params.id), req.body.status);
    success(res, null, '状态更新成功');
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    await userService.resetPassword(parseInt(req.params.id), req.body.password);
    success(res, null, '密码重置成功');
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await userService.changePassword(parseInt(req.params.id), oldPassword, newPassword);
    success(res, null, '密码修改成功');
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await userService.softDelete(parseInt(req.params.id), req.user.userId);
    success(res, null, '删除成功');
  } catch (err) {
    next(err);
  }
};
