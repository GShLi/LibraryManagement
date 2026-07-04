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
});

afterAll(async () => {
  const { sequelize } = require('../../src/models');
  await sequelize.close();
});

describe('Books API', () => {
  let bookId;

  describe('POST /api/books', () => {
    it('should create a book with copies', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isbn: '9787115487561',
          title: 'JavaScript 高级程序设计',
          author: 'Matt Frisbie',
          publisher: '人民邮电出版社',
          publishDate: '2020-12-01',
          categoryCode: 'TP',
          price: 129.00,
          copyCount: 3,
          location: 'A区-3排-5层'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.copies).toHaveLength(3);
      bookId = res.body.data.id;
    });

    it('should reject duplicate ISBN', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isbn: '9787115487561',
          title: 'Another Book',
          author: 'Author',
          publisher: 'Publisher',
          publishDate: '2020-01-01',
          categoryCode: 'TP',
          price: 50.00,
          copyCount: 1
        });
      expect(res.statusCode).toBe(409);
    });
  });

  describe('GET /api/books', () => {
    it('should list books without auth', async () => {
      const res = await request(app).get('/api/books');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    });

    it('should search by keyword', async () => {
      const res = await request(app).get('/api/books?keyword=' + encodeURIComponent('高级程序设计'));
      expect(res.statusCode).toBe(200);
      expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/books/:id', () => {
    it('should return book detail', async () => {
      const res = await request(app).get(`/api/books/${bookId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe('JavaScript 高级程序设计');
      const copies = res.body.data.total_copies !== undefined ? res.body.data.total_copies : res.body.data.totalCopies;
      expect(copies).toBe(3);
    });

    it('should return 404 for non-existent book', async () => {
      const res = await request(app).get('/api/books/99999');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/books/:id', () => {
    it('should update book info', async () => {
      const res = await request(app)
        .put(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Updated description', pages: 900 });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /api/books/:id', () => {
    it('should withdraw a book', async () => {
      const res = await request(app)
        .delete(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'other', remark: 'test' });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('POST /api/books/:id/restore', () => {
    it('should restore a withdrawn book', async () => {
      const res = await request(app)
        .post(`/api/books/${bookId}/restore`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
    });
  });
});
