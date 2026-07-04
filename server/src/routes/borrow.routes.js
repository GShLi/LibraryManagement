const { Router } = require('express');
const router = Router();
const controller = require('../controllers/borrow.controller');
const { auth, requireRole } = require('../middleware/auth');
const { body, query, param } = require('express-validator');
const validate = require('../middleware/validator');

router.post('/', auth, requireRole('admin', 'librarian'), [
  body('readerNo').notEmpty().withMessage('读者证号或手机号不能为空'),
  body('barcodes').isArray({ min: 1 }).withMessage('请至少选择一个图书条码'),
  body('barcodes.*').notEmpty().withMessage('条码不能为空'),
  validate
], controller.borrowBooks);

router.get('/overdue', auth, requireRole('admin', 'librarian'), controller.listOverdue);

router.get('/', auth, requireRole('admin', 'librarian'), controller.list);

router.put('/:id/return', auth, requireRole('admin', 'librarian'), controller.returnBook);

router.put('/:id/renew', auth, controller.renewBook);

module.exports = router;
