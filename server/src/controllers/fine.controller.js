const fineService = require('../services/fine.service');
const { success, paginated } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const { page, pageSize, status, readerId, startDate, endDate } = req.query;
    const result = await fineService.list({
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 20,
      status,
      readerId: readerId ? parseInt(readerId) : undefined,
      startDate,
      endDate
    });
    paginated(res, result);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await fineService.getById(parseInt(req.params.id));
    success(res, result);
  } catch (err) {
    next(err);
  }
};

exports.pay = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const result = await fineService.pay(parseInt(req.params.id), req.user.userId, ip);
    success(res, result, '罚款已标记为已缴纳');
  } catch (err) {
    next(err);
  }
};
