process.env.NODE_ENV = 'test';
process.env.DB_STORAGE = ':memory:';

const request = require('supertest');
let app;

beforeAll(async () => {
  jest.resetModules();
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
});

afterAll(async () => {
  const { sequelize } = require('../../src/models');
  await sequelize.close();
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new reader', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'zhangsan', password: 'abc12345', name: '张三', phone: '13800138001' });
      expect(res.statusCode).toBe(201);
      expect(res.body.code).toBe(201);
      expect(res.body.data.readerNo).toBeDefined();
    });

    it('should reject duplicate username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'zhangsan', password: 'abc12345', name: '李四', phone: '13800138002' });
      expect(res.statusCode).toBe(409);
      expect(res.body.code).toBe(40111);
    });

    it('should reject weak password (no letters)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser1', password: '12345678', name: '测试', phone: '13800138003' });
      expect(res.statusCode).toBe(409);
      expect(res.body.code).toBe(40113);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('admin');
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' });
      expect(res.statusCode).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'admin123' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeAll(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });
      token = loginRes.body.data.token;
    });

    it('should return current user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.username).toBe('admin');
    });

    it('should reject without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });
  });
});
