const bookCopyService = require('../services/bookCopy.service');
const { success, created } = require('../utils/response');

exports.listByBook = async (req, res, next) => {
  try {
    const { bookId, status } = req.query;
    if (!bookId) {
      return res.status(400).json({ code: 40001, message: '缺少必填参数 bookId', data: null });
    }
    const result = await bookCopyService.listByBook(parseInt(bookId), status);
    success(res, { list: result });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await bookCopyService.getById(parseInt(req.params.id));
    success(res, result);
  } catch (err) {
    next(err);
  }
};

exports.addCopies = async (req, res, next) => {
  try {
    const { bookId, count, location } = req.body;
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const result = await bookCopyService.addCopies(parseInt(bookId), parseInt(count), location, req.user.userId, ip);
    created(res, result, '副本增加成功');
  } catch (err) {
    next(err);
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const result = await bookCopyService.updateLocation(parseInt(req.params.id), req.body.location, req.user.userId, ip);
    success(res, null, '位置更新成功');
  } catch (err) {
    next(err);
  }
};
