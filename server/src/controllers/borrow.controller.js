const borrowService = require('../services/borrow.service');
const { success, created, paginated } = require('../utils/response');

exports.borrowBooks = async (req, res, next) => {
  try {
    const { readerNo, barcodes } = req.body;
    const operatorId = req.user.userId;
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const result = await borrowService.borrowBooks({ readerNo, barcodes, operatorId, ip });
    created(res, result, '借书成功');
  } catch (err) {
    next(err);
  }
};

exports.returnBook = async (req, res, next) => {
  try {
    const operatorId = req.user.userId;
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const result = await borrowService.returnBook(parseInt(req.params.id), operatorId, ip);
    success(res, result, result.overdue ? '还书成功，该图书已逾期，请缴纳罚款' : '还书成功');
  } catch (err) {
    next(err);
  }
};

exports.renewBook = async (req, res, next) => {
  try {
    const result = await borrowService.renewBook(parseInt(req.params.id), req.user.userId, req.user.role);
    success(res, result, '续借成功');
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { page, pageSize, status, readerId, startDate, endDate } = req.query;
    const result = await borrowService.list({
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

exports.listOverdue = async (req, res, next) => {
  try {
    const { page, pageSize, readerId } = req.query;
    const result = await borrowService.listOverdue({
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 20,
      readerId: readerId ? parseInt(readerId) : undefined
    });
    paginated(res, result);
  } catch (err) {
    next(err);
  }
};
