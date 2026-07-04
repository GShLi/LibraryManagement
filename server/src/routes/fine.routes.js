const { Router } = require('express');
const router = Router();
const controller = require('../controllers/fine.controller');
const { auth, requireRole } = require('../middleware/auth');
const { body, query, param } = require('express-validator');
const validate = require('../middleware/validator');

router.get('/', auth, requireRole('admin', 'librarian'), [
  query('page').optional().isInt({ min: 1 }).withMessage('页码需为正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数1-100'),
  validate
], controller.list);

router.get('/:id', auth, requireRole('admin', 'librarian'), [
  param('id').notEmpty().withMessage('罚款记录ID不能为空'),
  validate
], controller.getById);

router.put('/:id/pay', auth, requireRole('admin', 'librarian'), [
  param('id').notEmpty().withMessage('罚款记录ID不能为空'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('金额需为非负数'),
  body('paymentMethod').optional().isIn(['cash', 'wechat', 'alipay', 'card']).withMessage('支付方式不合法'),
  validate
], controller.pay);

module.exports = router;
