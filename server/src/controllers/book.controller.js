const bookService = require('../services/book.service');
const { success, created, paginated } = require('../utils/response');

exports.search = async (req, res, next) => {
  try {
    const { page, pageSize, keyword, author, isbn, categoryCode, status, publishYearStart, publishYearEnd, sortBy, sortOrder } = req.query;
    const isGuest = !req.user;
    const result = await bookService.search({
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 20,
      keyword, author, isbn, categoryCode, status,
      publishYearStart: publishYearStart ? parseInt(publishYearStart) : undefined,
      publishYearEnd: publishYearEnd ? parseInt(publishYearEnd) : undefined,
      sortBy, sortOrder
    }, isGuest);
    paginated(res, result);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await bookService.getById(req.params.id);
    success(res, result);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const result = await bookService.create(req.body, req.user.userId, ip);
    created(res, result, '入库成功');
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const result = await bookService.update(req.params.id, req.body);
    success(res, null, '更新成功');
  } catch (err) {
    next(err);
  }
};

exports.withdraw = async (req, res, next) => {
  try {
    const { reason, remark } = req.body;
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await bookService.withdraw(req.params.id, reason, remark, req.user.userId, ip);
    success(res, null, '下架成功');
  } catch (err) {
    next(err);
  }
};

exports.restore = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await bookService.restore(req.params.id, req.user.userId, ip);
    success(res, null, '重新上架成功');
  } catch (err) {
    next(err);
  }
};
