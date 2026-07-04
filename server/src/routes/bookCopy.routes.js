const { Router } = require('express');
const router = Router();
const controller = require('../controllers/bookCopy.controller');
const { auth, requireRole } = require('../middleware/auth');
const { body, query, param } = require('express-validator');
const validate = require('../middleware/validator');

router.get('/', auth, requireRole('admin', 'librarian'), [
  query('bookId').notEmpty().withMessage('图书ID不能为空'),
  query('page').optional().isInt({ min: 1 }).withMessage('页码需为正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数1-100'),
  validate
], controller.listByBook);

router.get('/:id', auth, requireRole('admin', 'librarian'), [
  param('id').notEmpty().withMessage('副本ID不能为空'),
  validate
], controller.getById);

router.post('/', auth, requireRole('admin', 'librarian'), [
  body('bookId').notEmpty().withMessage('图书ID不能为空'),
  body('count').isInt({ min: 1, max: 100 }).withMessage('添加数量需为1-100的整数'),
  validate
], controller.addCopies);

router.put('/:id/location', auth, requireRole('admin', 'librarian'), [
  param('id').notEmpty().withMessage('副本ID不能为空'),
  body('location').trim().notEmpty().withMessage('位置不能为空'),
  validate
], controller.updateLocation);

module.exports = router;
