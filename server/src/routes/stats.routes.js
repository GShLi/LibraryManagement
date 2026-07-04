const { Router } = require('express');
const router = Router();
const controller = require('../controllers/stats.controller');
const { auth, requireRole } = require('../middleware/auth');
const { query } = require('express-validator');
const validate = require('../middleware/validator');

router.get('/overview', auth, requireRole('admin', 'librarian'), [
  query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
  query('endDate').optional().isISO8601().withMessage('结束日期格式不正确'),
  validate
], controller.overview);

router.get('/borrow-ranking', auth, requireRole('admin', 'librarian'), [
  query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
  query('endDate').optional().isISO8601().withMessage('结束日期格式不正确'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('排行数量1-50'),
  validate
], controller.borrowRanking);

router.get('/overdue', auth, requireRole('admin', 'librarian'), [
  query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
  query('endDate').optional().isISO8601().withMessage('结束日期格式不正确'),
  validate
], controller.overdueStats);

module.exports = router;
