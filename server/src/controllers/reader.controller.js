const readerService = require('../services/reader.service');
const { success, paginated } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const { page, pageSize, keyword, status, readerType } = req.query;
    const result = await readerService.list({
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 20,
      keyword,
      status,
      readerType
    });
    paginated(res, result);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await readerService.getById(req.params.id);
    success(res, result);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const result = await readerService.update(req.params.id, req.body);
    success(res, result, '更新成功');
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const result = await readerService.updateStatus(req.params.id, req.body.status);
    success(res, result, '状态更新成功');
  } catch (err) {
    next(err);
  }
};

exports.getBorrowHistory = async (req, res, next) => {
  try {
    const { page, pageSize, status } = req.query;
    const result = await readerService.getBorrowHistory(req.params.id, {
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 20,
      status
    });
    paginated(res, result);
  } catch (err) {
    next(err);
  }
};
