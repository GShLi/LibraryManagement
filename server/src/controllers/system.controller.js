const systemService = require('../services/system.service');
const { success, created, paginated } = require('../utils/response');

exports.getConfigs = async (req, res, next) => {
  try {
    const configs = systemService.getAllConfigs();
    success(res, { configs });
  } catch (err) {
    next(err);
  }
};

exports.updateConfigs = async (req, res, next) => {
  try {
    const { configs } = req.body;
    const configMap = {};
    for (const item of configs) {
      configMap[item.key] = item.value;
    }
    await systemService.updateConfigs(configMap, req.user.userId);
    success(res, null, '配置更新成功');
  } catch (err) {
    next(err);
  }
};

exports.getLogs = async (req, res, next) => {
  try {
    const { page, pageSize, action, userId, startDate, endDate } = req.query;
    const result = await systemService.getLogs({
      page: parseInt(page, 10) || 1,
      pageSize: parseInt(pageSize, 10) || 20,
      action,
      userId: userId ? parseInt(userId) : undefined,
      startDate,
      endDate
    });
    paginated(res, result);
  } catch (err) {
    next(err);
  }
};

exports.listBackups = async (req, res, next) => {
  try {
    const result = systemService.listBackups();
    success(res, { list: result });
  } catch (err) {
    next(err);
  }
};

exports.createBackup = async (req, res, next) => {
  try {
    const result = await systemService.createBackup();
    created(res, {
      id: result.filename,
      filename: result.filename,
      fileSize: require('fs').statSync(result.path).size,
      createdAt: new Date().toISOString()
    }, '备份创建成功');
  } catch (err) {
    next(err);
  }
};

exports.restoreBackup = async (req, res, next) => {
  try {
    const result = await systemService.restoreBackup(parseInt(req.params.id));
    success(res, result, '备份恢复成功，请重启服务以使恢复生效');
  } catch (err) {
    next(err);
  }
};
