const { Router } = require('express');
const router = Router();
const controller = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validator');

router.post('/register', [
  body('username').trim().notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 50 }).withMessage('用户名长度3-50个字符'),
  body('password').trim().notEmpty().withMessage('密码不能为空')
    .isLength({ min: 8, max: 32 }).withMessage('密码长度8-32个字符'),
  body('name').trim().notEmpty().withMessage('姓名不能为空'),
  body('phone').trim().notEmpty().withMessage('手机号不能为空'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  validate
], controller.register);

router.post('/login', [
  body('username').trim().notEmpty().withMessage('用户名不能为空'),
  body('password').trim().notEmpty().withMessage('密码不能为空'),
  body('rememberMe').optional().isBoolean().withMessage('rememberMe 需为布尔值'),
  validate
], controller.login);

router.get('/me', auth, controller.me);
router.post('/logout', auth, controller.logout);

module.exports = router;
