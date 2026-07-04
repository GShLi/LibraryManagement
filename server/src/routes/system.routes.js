const { Router } = require('express');
const router = Router();
const controller = require('../controllers/system.controller');
const { auth, requireRole } = require('../middleware/auth');
const { body, query, param } = require('express-validator');
const validate = require('../middleware/validator');

router.get('/configs', auth, requireRole('admin'), controller.getConfigs);

router.put('/configs', auth, requireRole('admin'), [
  body().isObject().withMessage('配置数据需为对象'),
  validate
], controller.updateConfigs);

router.get('/logs', auth, requireRole('admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('页码需为正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数1-100'),
  validate
], controller.getLogs);

router.get('/backup', auth, requireRole('admin'), controller.listBackups);

router.post('/backup', auth, requireRole('admin'), controller.createBackup);

router.post('/backup/:id/restore', auth, requireRole('admin'), [
  param('id').notEmpty().withMessage('备份ID不能为空'),
  validate
], controller.restoreBackup);

module.exports = router;
