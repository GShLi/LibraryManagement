const reserveService = require('../services/reserve.service');
const { success, created, paginated } = require('../utils/response');

exports.create = async (req, res, next) => {
  try {
    const { bookId, copyId } = req.body;
    const readerId = req.user.userId;
    const result = await reserveService.create({ bookId, copyId, readerId });
    created(res, result, '预约成功');
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    await reserveService.cancel(parseInt(req.params.id), req.user.userId, req.user.role);
    success(res, null, '预约已取消');
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { page, pageSize, status } = req.query;
    const result = await reserveService.list({
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 20,
      status,
      userId: req.user.userId,
      userRole: req.user.role
    });
    paginated(res, result);
  } catch (err) {
    next(err);
  }
};
