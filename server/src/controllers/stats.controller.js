const statsService = require('../services/stats.service');
const { success } = require('../utils/response');

exports.overview = async (req, res, next) => {
  try {
    const result = await statsService.overview();
    success(res, result);
  } catch (err) {
    next(err);
  }
};

exports.borrowRanking = async (req, res, next) => {
  try {
    const { startDate, endDate, categoryCode, topN } = req.query;
    const result = await statsService.borrowRanking({
      startDate,
      endDate,
      categoryCode,
      topN: topN ? parseInt(topN, 10) : 20
    });
    success(res, result);
  } catch (err) {
    next(err);
  }
};

exports.overdueStats = async (req, res, next) => {
  try {
    const { startDate, endDate, dimension } = req.query;
    const result = await statsService.overdueStats({
      startDate,
      endDate,
      dimension: dimension || 'reader'
    });
    success(res, result);
  } catch (err) {
    next(err);
  }
};
