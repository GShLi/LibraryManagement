const { Router } = require('express');
const router = Router();
const controller = require('../controllers/user.controller');
const { auth, requireRole } = require('../middleware/auth');
const { body, query, param } = require('express-validator');
const validate = require('../middleware/validator');

router.get('/', auth, requireRole('admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('页码需为正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数1-100'),
  validate
], controller.list);

router.post('/', auth, requireRole('admin'), [
  body('username').trim().notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 50 }).withMessage('用户名长度3-50个字符'),
  body('password').trim().notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6, max: 100 }).withMessage('密码长度6-100个字符'),
  body('role').trim().notEmpty().withMessage('角色不能为空')
    .isIn(['admin', 'librarian', 'reader']).withMessage('角色不合法'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  body('phone').optional().isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  body('realName').optional().trim().isLength({ max: 50 }).withMessage('姓名最长50个字符'),
  validate
], controller.create);

router.get('/:id', auth, requireRole('admin', 'librarian'), [
  param('id').notEmpty().withMessage('用户ID不能为空'),
  validate
], controller.getById);

router.put('/:id', auth, requireRole('admin'), [
  param('id').notEmpty().withMessage('用户ID不能为空'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  body('phone').optional().isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  body('realName').optional().trim().isLength({ max: 50 }).withMessage('姓名最长50个字符'),
  validate
], controller.update);

router.put('/:id/status', auth, requireRole('admin'), [
  param('id').notEmpty().withMessage('用户ID不能为空'),
  body('status').trim().notEmpty().withMessage('状态不能为空')
    .isIn(['active', 'disabled']).withMessage('状态不合法'),
  validate
], controller.updateStatus);

router.put('/:id/password', auth, requireRole('admin'), [
  param('id').notEmpty().withMessage('用户ID不能为空'),
  body('password').trim().notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6, max: 100 }).withMessage('密码长度6-100个字符'),
  validate
], controller.resetPassword);

router.patch('/:id/password', auth, [
  param('id').notEmpty().withMessage('用户ID不能为空'),
  body('oldPassword').trim().notEmpty().withMessage('原密码不能为空'),
  body('newPassword').trim().notEmpty().withMessage('新密码不能为空')
    .isLength({ min: 6, max: 100 }).withMessage('新密码长度6-100个字符'),
  validate
], controller.changePassword);

router.delete('/:id', auth, requireRole('admin'), [
  param('id').notEmpty().withMessage('用户ID不能为空'),
  validate
], controller.delete);

module.exports = router;
