if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config({ override: false });
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'library-management-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    rememberMeExpiresIn: process.env.JWT_REMEMBER_ME_EXPIRES_IN || '7d'
  },
  db: {
    storage: process.env.DB_STORAGE || './data/library.db'
  }
};
