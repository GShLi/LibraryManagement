process.env.NODE_ENV = 'test';
process.env.DB_STORAGE = ':memory:';

const request = require('supertest');
let app;
let adminToken;

beforeAll(async () => {
  const { sequelize, User, Category, SystemConfig } = require('../../src/models');
  const bcrypt = require('bcryptjs');

  await sequelize.sync({ force: true });

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({ username: 'admin', password: hashedPassword, role: 'admin', status: 'active' });

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

describe('Users API', () => {
  describe('GET /api/users', () => {
    it('should list users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.list.length).toBeGreaterThanOrEqual(1);
    });

    it('should reject non-admin access', async () => {
      // Register reader and try
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'reader2', password: 'abc12345', name: '测试', phone: '13800138201' });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: 'reader2', password: 'abc12345' });

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${loginRes.body.data.token}`);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /api/users', () => {
    it('should create a librarian user', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'librarian1', password: 'Lib12345', role: 'librarian' });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.username).toBe('librarian1');
    });

    it('should create a reader user with reader record', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'newreader', password: 'Abc12345', role: 'reader',
          name: '新读者', phone: '13800138301', readerType: 'student'
        });
      expect(res.statusCode).toBe(201);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user detail', async () => {
      const res = await request(app)
        .get('/api/users/1')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.username).toBe('admin');
    });
  });

  describe('PUT /api/users/:id/status', () => {
    it('should disable and re-enable a user', async () => {
      const disableRes = await request(app)
        .put('/api/users/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'disabled' });
      expect(disableRes.statusCode).toBe(200);

      const enableRes = await request(app)
        .put('/api/users/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' });
      expect(enableRes.statusCode).toBe(200);
    });
  });
});
