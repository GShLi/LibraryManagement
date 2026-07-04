const bcrypt = require('bcryptjs');
const {
  sequelize, User, Reader, Category, Book, BookCopy,
  SystemConfig
} = require('../models');

const DEFAULT_CATEGORIES = [
  // Level 1
  { code: 'A', name: '马克思主义、列宁主义、毛泽东思想、邓小平理论', parent_id: null, level: 1, sort_order: 1 },
  { code: 'B', name: '哲学、宗教', parent_id: null, level: 1, sort_order: 2 },
  { code: 'C', name: '社会科学总论', parent_id: null, level: 1, sort_order: 3 },
  { code: 'D', name: '政治、法律', parent_id: null, level: 1, sort_order: 4 },
  { code: 'E', name: '军事', parent_id: null, level: 1, sort_order: 5 },
  { code: 'F', name: '经济', parent_id: null, level: 1, sort_order: 6 },
  { code: 'G', name: '文化、科学、教育、体育', parent_id: null, level: 1, sort_order: 7 },
  { code: 'H', name: '语言、文字', parent_id: null, level: 1, sort_order: 8 },
  { code: 'I', name: '文学', parent_id: null, level: 1, sort_order: 9 },
  { code: 'J', name: '艺术', parent_id: null, level: 1, sort_order: 10 },
  { code: 'K', name: '历史、地理', parent_id: null, level: 1, sort_order: 11 },
  { code: 'N', name: '自然科学总论', parent_id: null, level: 1, sort_order: 12 },
  { code: 'O', name: '数理科学和化学', parent_id: null, level: 1, sort_order: 13 },
  { code: 'P', name: '天文学、地球科学', parent_id: null, level: 1, sort_order: 14 },
  { code: 'Q', name: '生物科学', parent_id: null, level: 1, sort_order: 15 },
  { code: 'R', name: '医药、卫生', parent_id: null, level: 1, sort_order: 16 },
  { code: 'S', name: '农业科学', parent_id: null, level: 1, sort_order: 17 },
  { code: 'T', name: '工业技术', parent_id: null, level: 1, sort_order: 18 },
  { code: 'U', name: '交通运输', parent_id: null, level: 1, sort_order: 19 },
  { code: 'V', name: '航空、航天', parent_id: null, level: 1, sort_order: 20 },
  { code: 'X', name: '环境科学、安全科学', parent_id: null, level: 1, sort_order: 21 },
  { code: 'Z', name: '综合性图书', parent_id: null, level: 1, sort_order: 22 },
];

const T_SUB_CATEGORIES = [
  { code: 'TB', name: '一般工业技术', level: 2, sort_order: 1 },
  { code: 'TD', name: '矿业工程', level: 2, sort_order: 2 },
  { code: 'TE', name: '石油、天然气工业', level: 2, sort_order: 3 },
  { code: 'TF', name: '冶金工业', level: 2, sort_order: 4 },
  { code: 'TG', name: '金属学与金属工艺', level: 2, sort_order: 5 },
  { code: 'TH', name: '机械、仪表工业', level: 2, sort_order: 6 },
  { code: 'TJ', name: '武器工业', level: 2, sort_order: 7 },
  { code: 'TK', name: '能源与动力工程', level: 2, sort_order: 8 },
  { code: 'TL', name: '原子能技术', level: 2, sort_order: 9 },
  { code: 'TM', name: '电工技术', level: 2, sort_order: 10 },
  { code: 'TN', name: '电子技术、通信技术', level: 2, sort_order: 11 },
  { code: 'TP', name: '自动化技术、计算机技术', level: 2, sort_order: 12 },
  { code: 'TQ', name: '化学工业', level: 2, sort_order: 13 },
  { code: 'TS', name: '轻工业、手工业', level: 2, sort_order: 14 },
  { code: 'TU', name: '建筑科学', level: 2, sort_order: 15 },
  { code: 'TV', name: '水利工程', level: 2, sort_order: 16 },
];

const DEFAULT_CONFIGS = [
  { config_key: 'max_borrow_count_student', config_value: '5', description: '学生最大借阅册数' },
  { config_key: 'max_borrow_count_teacher', config_value: '10', description: '教师最大借阅册数' },
  { config_key: 'max_borrow_count_staff', config_value: '5', description: '职工最大借阅册数' },
  { config_key: 'max_borrow_count_external', config_value: '3', description: '外部读者最大借阅册数' },
  { config_key: 'borrow_duration_days', config_value: '30', description: '单次借阅天数' },
  { config_key: 'max_renew_count', config_value: '2', description: '最大续借次数' },
  { config_key: 'renew_duration_days', config_value: '30', description: '续借天数' },
  { config_key: 'overdue_fine_rate', config_value: '0.1', description: '逾期费率（元/天）' },
  { config_key: 'fine_max_multiple', config_value: '2.0', description: '罚款上限（定价倍数）' },
  { config_key: 'reserve_expire_days', config_value: '3', description: '预约保留天数' },
  { config_key: 'login_max_attempts', config_value: '5', description: '连续登录失败锁定次数' },
  { config_key: 'login_lock_minutes', config_value: '15', description: '锁定持续分钟数' },
  { config_key: 'overdue_freeze_days', config_value: '30', description: '逾期自动冻结天数' },
];

async function seedDb() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      status: 'active'
    });
    console.log(`Admin user created: admin (id: ${admin.id})`);

    // Create categories
    const level1Categories = await Category.bulkCreate(DEFAULT_CATEGORIES);
    console.log(`${level1Categories.length} level-1 categories created.`);

    const tCategory = await Category.findOne({ where: { code: 'T' } });
    const level2Categories = await Category.bulkCreate(
      T_SUB_CATEGORIES.map(c => ({ ...c, parent_id: tCategory.id }))
    );
    console.log(`${level2Categories.length} level-2 categories created.`);

    // Create system configs
    await SystemConfig.bulkCreate(
      DEFAULT_CONFIGS.map(c => ({ ...c, updated_by: admin.id }))
    );
    console.log('System configs created.');

    // Create sample books
    const tpCategory = await Category.findOne({ where: { code: 'TP' } });
    const iCategory = await Category.findOne({ where: { code: 'I' } });

    const sampleBooks = [
      {
        isbn: '9787115487561', title: 'JavaScript 高级程序设计（第4版）', author: 'Matt Frisbie',
        publisher: '人民邮电出版社', publish_date: '2020-12-01', category_id: tpCategory.id,
        category_code: 'TP', category_name: '自动化技术、计算机技术', price: 129.00, pages: 900,
        language: '中文', edition: '第4版',
        keywords: JSON.stringify(['JavaScript', 'Web开发', '前端']),
        description: '本书是JavaScript经典图书的第4版，全面深入地介绍了JavaScript的核心概念与高级特性。',
        status: 'active', total_copies: 5, available_copies: 5
      },
      {
        isbn: '9787115546086', title: '深入浅出 Node.js', author: '朴灵',
        publisher: '人民邮电出版社', publish_date: '2023-06-01', category_id: tpCategory.id,
        category_code: 'TP', category_name: '自动化技术、计算机技术', price: 89.00, pages: 450,
        language: '中文', edition: '第1版',
        keywords: JSON.stringify(['Node.js', '后端开发', 'JavaScript']),
        description: '本书详细介绍了Node.js的核心技术原理与应用实践。',
        status: 'active', total_copies: 3, available_copies: 3
      },
      {
        isbn: '9787020002207', title: '红楼梦', author: '曹雪芹',
        publisher: '人民文学出版社', publish_date: '1996-12-01', category_id: iCategory.id,
        category_code: 'I', category_name: '文学', price: 59.70, pages: 1606,
        language: '中文', edition: '第3版',
        keywords: JSON.stringify(['古典文学', '四大名著', '小说']),
        description: '中国古典四大名著之一，以贾宝玉、林黛玉、薛宝钗的爱情婚姻悲剧为主线。',
        status: 'active', total_copies: 8, available_copies: 8
      }
    ];

    const books = await Book.bulkCreate(sampleBooks);
    console.log(`${books.length} sample books created.`);

    // Create sample copies (16 total)
    const copiesData = [];
    let barcodeSeq = 1;
    // Book 1: 5 copies
    for (let i = 0; i < 5; i++) {
      copiesData.push({
        book_id: books[0].id,
        barcode: `BC-20260704-${String(barcodeSeq++).padStart(5, '0')}`,
        status: 'available',
        location: 'A区-3排-5层',
        condition: 'new'
      });
    }
    // Book 2: 3 copies
    for (let i = 0; i < 3; i++) {
      copiesData.push({
        book_id: books[1].id,
        barcode: `BC-20260704-${String(barcodeSeq++).padStart(5, '0')}`,
        status: 'available',
        location: 'A区-3排-6层',
        condition: i < 2 ? 'new' : 'good'
      });
    }
    // Book 3: 8 copies
    for (let i = 0; i < 8; i++) {
      copiesData.push({
        book_id: books[2].id,
        barcode: `BC-20260704-${String(barcodeSeq++).padStart(5, '0')}`,
        status: 'available',
        location: 'B区-1排-2层',
        condition: i < 6 ? 'new' : 'good'
      });
    }
    await BookCopy.bulkCreate(copiesData);
    console.log(`${copiesData.length} sample book copies created.`);

    await sequelize.close();
    console.log('Seed data complete.');
  } catch (err) {
    console.error('Seed data failed:', err);
    process.exit(1);
  }
}

seedDb();
