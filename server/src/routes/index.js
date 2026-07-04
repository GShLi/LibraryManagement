const { Router } = require('express');
const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/readers', require('./reader.routes'));
router.use('/books', require('./book.routes'));
router.use('/book-copies', require('./bookCopy.routes'));
router.use('/borrows', require('./borrow.routes'));
router.use('/fines', require('./fine.routes'));
router.use('/reserves', require('./reserve.routes'));
router.use('/stats', require('./stats.routes'));
router.use('/categories', require('./category.routes'));
router.use('/system', require('./system.routes'));

module.exports = router;
