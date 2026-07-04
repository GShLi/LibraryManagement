const { Router } = require('express');
const router = Router();
const controller = require('../controllers/book.controller');
const { auth, optionalAuth, requireRole } = require('../middleware/auth');
const { body, query, param } = require('express-validator');
const validate = require('../middleware/validator');

router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('页码需为正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数1-100'),
  validate
], controller.search);

router.get('/:id', optionalAuth, [
  param('id').notEmpty().withMessage('图书ID不能为空'),
  validate
], controller.getById);

router.post('/', auth, requireRole('admin', 'librarian'), [
  body('isbn').trim().notEmpty().withMessage('ISBN不能为空'),
  body('title').trim().notEmpty().withMessage('书名不能为空'),
  body('author').trim().notEmpty().withMessage('作者不能为空'),
  body('publisher').optional().trim(),
  body('categoryId').optional(),
  body('publishDate').optional().isDate().withMessage('出版日期格式不正确'),
  body('totalCopies').optional().isInt({ min: 0 }).withMessage('副本数需为非负整数'),
  body('price').optional().isFloat({ min: 0 }).withMessage('价格需为非负数'),
  validate
], controller.create);

router.put('/:id', auth, requireRole('admin', 'librarian'), [
  param('id').notEmpty().withMessage('图书ID不能为空'),
  body('title').optional().trim().notEmpty().withMessage('书名不能为空'),
  body('author').optional().trim().notEmpty().withMessage('作者不能为空'),
  body('isbn').optional().trim().notEmpty().withMessage('ISBN不能为空'),
  body('publisher').optional().trim(),
  body('categoryId').optional(),
  body('publishDate').optional().isDate().withMessage('出版日期格式不正确'),
  body('price').optional().isFloat({ min: 0 }).withMessage('价格需为非负数'),
  validate
], controller.update);

router.delete('/:id', auth, requireRole('admin', 'librarian'), [
  param('id').notEmpty().withMessage('图书ID不能为空'),
  validate
], controller.withdraw);

router.post('/:id/restore', auth, requireRole('admin', 'librarian'), [
  param('id').notEmpty().withMessage('图书ID不能为空'),
  validate
], controller.restore);

module.exports = router;
