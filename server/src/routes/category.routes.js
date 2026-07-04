const { Router } = require('express');
const router = Router();
const controller = require('../controllers/category.controller');
const { query } = require('express-validator');
const validate = require('../middleware/validator');

router.get('/', [
  query('parentCode').optional().trim(),
  query('flat').optional().isIn(['true', 'false', '1', '0']).withMessage('flat 参数不合法'),
  validate
], controller.getTree);

module.exports = router;
