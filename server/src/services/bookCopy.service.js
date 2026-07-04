const { BookCopy, Book, sequelize } = require('../models');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { generateBarcodes } = require('../utils/barcode');
const auditService = require('./audit.service');

async function listByBook(bookId, status) {
  const where = { book_id: bookId };
  if (status) where.status = status;

  const copies = await BookCopy.findAll({
    where,
    include: [{ model: Book, as: 'book', attributes: ['id', 'isbn', 'title'] }],
    order: [['barcode', 'ASC']]
  });

  return copies;
}

async function getById(id) {
  const copy = await BookCopy.findByPk(id, {
    include: [{ model: Book, as: 'book' }]
  });
  if (!copy) {
    throw new NotFoundError('副本不存在', 40407);
  }
  return copy;
}

async function addCopies(bookId, count, location, userId, ip) {
  const book = await Book.findByPk(bookId);
  if (!book) {
    throw new NotFoundError('图书不存在', 40401);
  }

  if (!count || count <= 0) {
    throw new ConflictError('副本数量必须大于0', 40409);
  }

  const t = await sequelize.transaction();
  try {
    const barcodes = await generateBarcodes({ sequelize }, count);
    const copyRecords = barcodes.map(barcode => ({
      book_id: bookId,
      barcode,
      status: 'available',
      location: location || null,
      condition: 'new'
    }));

    await BookCopy.bulkCreate(copyRecords, { transaction: t });

    await book.update({
      total_copies: book.total_copies + count,
      available_copies: book.available_copies + count
    }, { transaction: t });

    await t.commit();

    await auditService.log(userId, 'add_copies', 'book', bookId, `为图书 ${book.title} 新增 ${count} 个副本`, ip);

    return { message: `成功新增 ${count} 个副本`, bookId, count };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async function updateLocation(id, location, userId, ip) {
  const copy = await BookCopy.findByPk(id);
  if (!copy) {
    throw new NotFoundError('副本不存在', 40407);
  }

  await copy.update({ location });

  await auditService.log(userId, 'update_copy_location', 'book_copy', id, `更新副本 ${copy.barcode} 位置为: ${location}`, ip);

  return copy;
}

module.exports = {
  listByBook,
  getById,
  addCopies,
  updateLocation
};
