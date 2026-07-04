const { Book, BookCopy, Borrow, Fine, Reader, sequelize } = require('../models');
const { Op } = require('sequelize');

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

async function overview() {
  const todayDate = formatDate(new Date());
  const todayStart = todayDate + 'T00:00:00';
  const todayEnd = todayDate + 'T23:59:59';

  const [
    totalBooks,
    totalCopies,
    totalBorrowed,
    totalOverdue,
    totalReaders,
    totalFinesUnpaid,
    todayBorrows,
    todayReturns
  ] = await Promise.all([
    Book.count({ where: { status: 'active' } }),
    BookCopy.count(),
    Borrow.count({ where: { status: { [Op.in]: ['borrowing', 'overdue'] } } }),
    Borrow.count({
      where: {
        status: { [Op.in]: ['borrowing', 'overdue'] },
        due_date: { [Op.lt]: todayDate }
      }
    }),
    Reader.count(),
    Fine.count({ where: { status: 'unpaid' } }),
    Borrow.count({
      where: {
        borrow_date: {
          [Op.gte]: new Date(todayStart),
          [Op.lte]: new Date(todayEnd)
        }
      }
    }),
    Borrow.count({
      where: {
        return_date: {
          [Op.gte]: new Date(todayStart),
          [Op.lte]: new Date(todayEnd)
        }
      }
    })
  ]);

  return {
    totalBooks,
    totalCopies,
    totalBorrowed,
    totalOverdue,
    totalReaders,
    totalFinesUnpaid,
    todayBorrows,
    todayReturns
  };
}

async function borrowRanking({ startDate, endDate, categoryCode, topN = 10 }) {
  const where = {};
  if (startDate || endDate) {
    where.borrow_date = {};
    if (startDate) where.borrow_date[Op.gte] = new Date(startDate);
    if (endDate) where.borrow_date[Op.lte] = new Date(endDate + 'T23:59:59');
  }

  const include = [{
    model: BookCopy,
    as: 'copy',
    required: true,
    attributes: [],
    include: [{
      model: Book,
      as: 'book',
      required: true,
      attributes: [],
      where: categoryCode ? { category_code: { [Op.like]: `${categoryCode}%` } } : {}
    }]
  }];

  const rankings = await Borrow.findAll({
    where,
    include,
    attributes: [
      [sequelize.col('copy.book.id'), 'bookId'],
      [sequelize.col('copy.book.title'), 'bookTitle'],
      [sequelize.col('copy.book.isbn'), 'isbn'],
      [sequelize.col('copy.book.author'), 'author'],
      [sequelize.fn('COUNT', sequelize.col('Borrow.id')), 'borrowCount']
    ],
    group: ['copy->book.id'],
    order: [[sequelize.fn('COUNT', sequelize.col('Borrow.id')), 'DESC']],
    limit: topN,
    raw: true
  });

  const result = rankings.map((r, index) => ({
    rank: index + 1,
    bookId: r.bookId,
    bookTitle: r.bookTitle,
    isbn: r.isbn,
    author: r.author,
    borrowCount: parseInt(r.borrowCount, 10)
  }));

  return { startDate, endDate, list: result };
}

async function overdueStats({ startDate, endDate, dimension = 'reader' }) {
  const fineWhere = {};
  if (startDate || endDate) {
    fineWhere.created_at = {};
    if (startDate) fineWhere.created_at[Op.gte] = new Date(startDate);
    if (endDate) fineWhere.created_at[Op.lte] = new Date(endDate + 'T23:59:59');
  }

  if (dimension === 'reader') {
    const stats = await Fine.findAll({
      where: fineWhere,
      attributes: [
        'reader_id',
        [sequelize.col('reader.reader_no'), 'readerNo'],
        [sequelize.col('reader.name'), 'readerName'],
        [sequelize.fn('COUNT', sequelize.col('Fine.id')), 'overdueCount'],
        [sequelize.fn('SUM', sequelize.col('Fine.amount')), 'totalFineAmount']
      ],
      include: [{
        model: Reader,
        as: 'reader',
        attributes: [],
        required: true
      }],
      group: ['reader_id'],
      order: [[sequelize.fn('SUM', sequelize.col('Fine.amount')), 'DESC']],
      raw: true
    });

    const list = stats.map((s, i) => ({
      rank: i + 1,
      readerId: s.reader_id,
      readerNo: s.readerNo,
      readerName: s.readerName,
      overdueCount: parseInt(s.overdueCount, 10),
      totalFineAmount: parseFloat(Number(s.totalFineAmount).toFixed(2))
    }));

    const totalOverdueRecords = list.reduce((sum, r) => sum + r.overdueCount, 0);
    const totalFinesAmount = list.reduce((sum, r) => sum + r.totalFineAmount, 0);

    return { totalOverdueRecords, totalFinesAmount: parseFloat(totalFinesAmount.toFixed(2)), list };
  }

  if (dimension === 'book') {
    const stats = await Fine.findAll({
      where: fineWhere,
      attributes: [
        [sequelize.col('borrow.copy.book.id'), 'bookId'],
        [sequelize.col('borrow.copy.book.title'), 'bookTitle'],
        [sequelize.col('borrow.copy.book.isbn'), 'isbn'],
        [sequelize.col('borrow.copy.book.author'), 'author'],
        [sequelize.fn('COUNT', sequelize.col('Fine.id')), 'overdueCount'],
        [sequelize.fn('SUM', sequelize.col('Fine.amount')), 'totalFineAmount']
      ],
      include: [{
        model: Borrow,
        as: 'borrow',
        required: true,
        attributes: [],
        include: [{
          model: BookCopy,
          as: 'copy',
          required: true,
          attributes: [],
          include: [{
            model: Book,
            as: 'book',
            required: true,
            attributes: []
          }]
        }]
      }],
      group: ['borrow->copy->book.id'],
      order: [[sequelize.fn('SUM', sequelize.col('Fine.amount')), 'DESC']],
      raw: true
    });

    const list = stats.map((s, i) => ({
      rank: i + 1,
      bookId: s.bookId,
      bookTitle: s.bookTitle,
      isbn: s.isbn,
      author: s.author,
      overdueCount: parseInt(s.overdueCount, 10),
      totalFineAmount: parseFloat(Number(s.totalFineAmount).toFixed(2))
    }));

    const totalOverdueRecords = list.reduce((sum, r) => sum + r.overdueCount, 0);
    const totalFinesAmount = list.reduce((sum, r) => sum + r.totalFineAmount, 0);

    return { totalOverdueRecords, totalFinesAmount: parseFloat(totalFinesAmount.toFixed(2)), list };
  }

  return { totalOverdueRecords: 0, totalFinesAmount: 0, list: [] };
}

module.exports = {
  overview,
  borrowRanking,
  overdueStats
};
