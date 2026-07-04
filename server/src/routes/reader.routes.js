const { Router } = require('express');
const router = Router();
const controller = require('../controllers/reader.controller');
const { auth, requireRole } = require('../middleware/auth');
const { body, query, param } = require('express-validator');
const validate = require('../middleware/validator');

router.get('/', auth, requireRole('admin', 'librarian'), [
  query('page').optional().isInt({ min: 1 }).withMessage('页码需为正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数1-100'),
  validate
], controller.list);

router.get('/:id', auth, requireRole('admin', 'librarian'), [
  param('id').notEmpty().withMessage('读者ID不能为空'),
  validate
], controller.getById);

router.put('/:id', auth, [
  param('id').notEmpty().withMessage('读者ID不能为空'),
  body('name').optional().trim().notEmpty().withMessage('姓名不能为空'),
  body('phone').optional().isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  body('readerType').optional().isIn(['student', 'teacher', 'public']).withMessage('读者类型不合法'),
  validate
], controller.update);

router.put('/:id/status', auth, requireRole('admin', 'librarian'), [
  param('id').notEmpty().withMessage('读者ID不能为空'),
  body('status').trim().notEmpty().withMessage('状态不能为空')
    .isIn(['active', 'suspended', 'cancelled']).withMessage('状态不合法'),
  validate
], controller.updateStatus);

router.get('/:id/borrow-history', auth, [
  param('id').notEmpty().withMessage('读者ID不能为空'),
  query('page').optional().isInt({ min: 1 }).withMessage('页码需为正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数1-100'),
  validate
], controller.getBorrowHistory);

module.exports = router;
