process.env.NODE_ENV = 'test';
process.env.DB_STORAGE = ':memory:';

jest.resetModules();

const request = require('supertest');
let app;
let adminToken;

beforeAll(async () => {
  const { sequelize, User, Category, SystemConfig } = require('../../src/models');
  const bcrypt = require('bcryptjs');

  await sequelize.sync({ force: true });

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({ username: 'admin', password: hashedPassword, role: 'admin', status: 'active' });

  const cats = await Category.bulkCreate([
    { code: 'T', name: '工业技术', level: 1, sort_order: 18 },
    { code: 'TP', name: '自动化技术、计算机技术', parent_id: null, level: 2, sort_order: 12 },
    { code: 'I', name: '文学', level: 1, sort_order: 9 }
  ]);
  await cats[1].update({ parent_id: cats[0].id });

  await SystemConfig.bulkCreate([
    { config_key: 'borrow_duration_days', config_value: '30', description: '', updated_by: 1 },
    { config_key: 'max_renew_count', config_value: '2', description: '', updated_by: 1 },
    { config_key: 'renew_duration_days', config_value: '30', description: '', updated_by: 1 },
    { config_key: 'overdue_fine_rate', config_value: '0.1', description: '', updated_by: 1 },
    { config_key: 'fine_max_multiple', config_value: '2.0', description: '', updated_by: 1 },
    { config_key: 'reserve_expire_days', config_value: '3', description: '', updated_by: 1 },
    { config_key: 'login_max_attempts', config_value: '5', description: '', updated_by: 1 },
    { config_key: 'login_lock_minutes', config_value: '15', description: '', updated_by: 1 },
    { config_key: 'overdue_freeze_days', config_value: '30', description: '', updated_by: 1 }
  ]);

  await require('../../src/services/system.service').loadConfigs();

  app = require('../../src/app');

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'admin123' });
  adminToken = loginRes.body.data.token;

  // Register a reader
  await request(app)
    .post('/api/auth/register')
    .send({ username: 'reader1', password: 'abc12345', name: '借阅测试', phone: '13800138101' });
});

afterAll(async () => {
  const { sequelize } = require('../../src/models');
  await sequelize.close();
});

describe('Borrow API', () => {
  let barcode;
  let readerNo;

  beforeAll(async () => {
    // Create a book
    const bookRes = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        isbn: '9787201102701',
        title: '测试图书',
        author: '测试作者',
        publisher: '测试出版社',
        publishDate: '2024-01-01',
        categoryCode: 'TP',
        price: 50.00,
        copyCount: 2,
        location: 'A区-1排-1层'
      });

    // Get reader info
    const readerLogin = await request(app)
      .post('/api/auth/login')
      .send({ username: 'reader1', password: 'abc12345' });
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${readerLogin.body.data.token}`);
    const reader = meRes.body.data.reader || {};
    readerNo = reader.reader_no || reader.readerNo;
    // Fallback: use phone number since borrow API accepts both
    if (!readerNo) readerNo = '13800138101';

    // Get a barcode
    const copyRes = await request(app)
      .get(`/api/book-copies?bookId=${bookRes.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const copies = copyRes.body.data.list || copyRes.body.data;
    barcode = Array.isArray(copies) ? copies[0]?.barcode : copies[0]?.barcode;
  });

  describe('POST /api/borrows', () => {
    it('should borrow a book', async () => {
      expect(barcode).toBeDefined();
      expect(readerNo).toBeDefined();

      const res = await request(app)
        .post('/api/borrows')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ readerNo, barcodes: [barcode] });
      expect(res.statusCode).toBe(201);
    });

    it('should reject already borrowed copy', async () => {
      const res = await request(app)
        .post('/api/borrows')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ readerNo, barcodes: [barcode] });
      expect(res.statusCode).not.toBe(201);
    });
  });

  describe('GET /api/borrows', () => {
    it('should list borrows', async () => {
      const res = await request(app)
        .get('/api/borrows')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('PUT /api/borrows/:id/return', () => {
    it('should return a book', async () => {
      const borrowsRes = await request(app)
        .get('/api/borrows')
        .set('Authorization', `Bearer ${adminToken}`);
      const borrowId = borrowsRes.body.data.list[0]?.id;
      if (borrowId) {
        const res = await request(app)
          .put(`/api/borrows/${borrowId}/return`)
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
      }
    });
  });
});
