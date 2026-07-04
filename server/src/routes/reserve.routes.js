const { Router } = require('express');
const router = Router();
const controller = require('../controllers/reserve.controller');
const { auth, requireRole } = require('../middleware/auth');
const { body, query, param } = require('express-validator');
const validate = require('../middleware/validator');

router.post('/', auth, requireRole('reader'), [
  body('bookId').notEmpty().withMessage('图书ID不能为空'),
  body('bookCopyId').optional(),
  validate
], controller.create);

router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('页码需为正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数1-100'),
  validate
], controller.list);

router.delete('/:id', auth, [
  param('id').notEmpty().withMessage('预约记录ID不能为空'),
  validate
], controller.cancel);

module.exports = router;
