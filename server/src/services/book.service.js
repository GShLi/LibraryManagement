const { Book, BookCopy, Category, Borrow, sequelize } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { generateBarcodes } = require('../utils/barcode');
const auditService = require('./audit.service');

function isValidISBN(isbn) {
  // ISBN-10 or ISBN-13 validation
  const clean = isbn.replace(/[-\s]/g, '');
  if (clean.length === 10) {
    return /^\d{9}[\dXx]$/.test(clean);
  }
  if (clean.length === 13) {
    return /^\d{13}$/.test(clean);
  }
  return false;
}

async function search({
  page = 1,
  pageSize = 20,
  keyword,
  author,
  isbn,
  categoryCode,
  status,
  publishYearStart,
  publishYearEnd,
  sortBy = 'publish_date',
  sortOrder = 'DESC'
}, isGuest = false) {
  const where = {};

  if (isGuest) {
    where.status = 'active';
  } else if (status) {
    where.status = status;
  }

  if (keyword) {
    where[Op.or] = [
      { title: { [Op.like]: `%${keyword}%` } },
      { author: { [Op.like]: `%${keyword}%` } },
      { isbn: { [Op.like]: `%${keyword}%` } },
      { keywords: { [Op.like]: `%${keyword}%` } }
    ];
  }

  if (author) {
    where.author = { [Op.like]: `%${author}%` };
  }

  if (isbn) {
    where.isbn = isbn;
  }

  if (categoryCode) {
    where.category_code = { [Op.like]: `${categoryCode}%` };
  }

  if (publishYearStart) {
    where.publish_date = { ...where.publish_date, [Op.gte]: `${publishYearStart}-01-01` };
  }
  if (publishYearEnd) {
    where.publish_date = { ...where.publish_date, [Op.lte]: `${publishYearEnd}-12-31` };
  }

  // Validate sortBy to prevent SQL injection
  const allowedSortFields = ['publish_date', 'title', 'author', 'created_at', 'price', 'total_copies', 'available_copies'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'publish_date';
  const sortDir = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  const offset = (page - 1) * pageSize;
  const { rows, count } = await Book.findAndCountAll({
    where,
    include: [{ model: Category, as: 'category', attributes: ['id', 'code', 'name'] }],
    order: [[sortField, sortDir]],
    offset,
    limit: pageSize
  });

  return {
    list: rows,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize)
  };
}

async function getById(id) {
  const book = await Book.findByPk(id, {
    include: [
      { model: Category, as: 'category', attributes: ['id', 'code', 'name'] },
      { model: BookCopy, as: 'copies' }
    ]
  });
  if (!book) {
    throw new NotFoundError('图书不存在', 40401);
  }
  return book;
}

async function create(data, userId, ip) {
  // Validate ISBN format
  if (!isValidISBN(data.isbn)) {
    throw new ConflictError('ISBN格式不正确', 40406);
  }

  // Check ISBN uniqueness
  const existing = await Book.findOne({ where: { isbn: data.isbn } });
  if (existing) {
    throw new ConflictError('ISBN已存在', 40402);
  }

  // Validate copyCount
  const copyCount = data.copyCount || 1;
  if (copyCount <= 0) {
    throw new ConflictError('副本数量必须大于0', 40409);
  }

  // Look up category
  const category = await Category.findOne({ where: { code: data.categoryCode } });
  if (!category) {
    throw new NotFoundError('图书分类不存在');
  }

  const t = await sequelize.transaction();
  try {
    const book = await Book.create({
      isbn: data.isbn,
      title: data.title,
      author: data.author,
      publisher: data.publisher,
      publish_date: data.publishDate,
      category_id: category.id,
      category_code: category.code,
      category_name: category.name,
      price: data.price,
      pages: data.pages || null,
      language: data.language || '中文',
      edition: data.edition || null,
      keywords: data.keywords || null,
      description: data.description || null,
      cover_url: data.coverUrl || null,
      status: 'active',
      total_copies: copyCount,
      available_copies: copyCount
    }, { transaction: t });

    // Generate barcodes and create copy records
    const barcodes = await generateBarcodes({ sequelize }, copyCount);
    const copyRecords = barcodes.map(barcode => ({
      book_id: book.id,
      barcode,
      status: 'available',
      location: data.location || null,
      condition: 'new'
    }));

    await BookCopy.bulkCreate(copyRecords, { transaction: t });

    await t.commit();

    // Log audit
    await auditService.log(userId, 'create_book', 'book', book.id, `导入新书: ${data.title} (ISBN: ${data.isbn}, 副本: ${copyCount})`, ip);

    return Book.findByPk(book.id, {
      include: [{ model: Category, as: 'category' }, { model: BookCopy, as: 'copies' }]
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async function update(id, data) {
  const book = await Book.findByPk(id);
  if (!book) {
    throw new NotFoundError('图书不存在', 40401);
  }

  // Check ISBN uniqueness if changing
  if (data.isbn && data.isbn !== book.isbn) {
    if (!isValidISBN(data.isbn)) {
      throw new ConflictError('ISBN格式不正确', 40406);
    }
    const existing = await Book.findOne({ where: { isbn: data.isbn } });
    if (existing && existing.id !== id) {
      throw new ConflictError('ISBN已存在', 40402);
    }
  }

  const updateData = {};
  if (data.isbn !== undefined) updateData.isbn = data.isbn;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.author !== undefined) updateData.author = data.author;
  if (data.publisher !== undefined) updateData.publisher = data.publisher;
  if (data.publishDate !== undefined) updateData.publish_date = data.publishDate;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.pages !== undefined) updateData.pages = data.pages;
  if (data.language !== undefined) updateData.language = data.language;
  if (data.edition !== undefined) updateData.edition = data.edition;
  if (data.keywords !== undefined) updateData.keywords = data.keywords;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.coverUrl !== undefined) updateData.cover_url = data.coverUrl;

  // Update category if changed
  if (data.categoryCode && data.categoryCode !== book.category_code) {
    const category = await Category.findOne({ where: { code: data.categoryCode } });
    if (category) {
      updateData.category_id = category.id;
      updateData.category_code = category.code;
      updateData.category_name = category.name;
    }
  }

  await book.update(updateData);

  return Book.findByPk(id, {
    include: [{ model: Category, as: 'category' }]
  });
}

async function withdraw(id, reason, remark, userId, ip) {
  const book = await Book.findByPk(id);
  if (!book) {
    throw new NotFoundError('图书不存在', 40401);
  }

  if (book.status === 'withdrawn') {
    throw new ConflictError('图书已下架', 40405);
  }

  // Check no borrowed copies
  const borrowedCount = await BookCopy.count({
    where: {
      book_id: id,
      status: 'borrowed'
    }
  });
  if (borrowedCount > 0) {
    throw new ConflictError('存在在借副本，无法下架', 40404);
  }

  const t = await sequelize.transaction();
  try {
    await book.update({ status: 'withdrawn' }, { transaction: t });
    await BookCopy.update(
      { status: 'withdrawn' },
      { where: { book_id: id }, transaction: t }
    );
    await t.commit();

    await auditService.log(userId, 'withdraw_book', 'book', id, `下架图书: ${book.title}, 原因: ${reason || '无'}`, ip);

    return Book.findByPk(id, {
      include: [{ model: Category, as: 'category' }]
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async function restore(id, userId, ip) {
  const book = await Book.findByPk(id);
  if (!book) {
    throw new NotFoundError('图书不存在', 40401);
  }

  const t = await sequelize.transaction();
  try {
    await book.update({ status: 'active' }, { transaction: t });

    // Set withdrawn copies back to available (not touching stock or borrowed copies)
    await BookCopy.update(
      { status: 'available' },
      {
        where: {
          book_id: id,
          status: 'withdrawn'
        },
        transaction: t
      }
    );

    // Recalculate available_copies
    const availableCount = await BookCopy.count({
      where: { book_id: id, status: { [Op.not]: 'stock' } }
    });
    await book.update({ available_copies: availableCount }, { transaction: t });

    await t.commit();

    await auditService.log(userId, 'restore_book', 'book', id, `恢复图书: ${book.title}`, ip);

    return Book.findByPk(id, {
      include: [{ model: Category, as: 'category' }]
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

module.exports = {
  search,
  getById,
  create,
  update,
  withdraw,
  restore
};
