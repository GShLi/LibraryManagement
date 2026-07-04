const path = require('path');
const { sequelize } = require('../models');

async function initDb() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Set SQLite pragmas
    await sequelize.query('PRAGMA journal_mode = WAL;');
    await sequelize.query('PRAGMA synchronous = NORMAL;');
    await sequelize.query('PRAGMA cache_size = -8000;');
    await sequelize.query('PRAGMA busy_timeout = 5000;');
    await sequelize.query('PRAGMA temp_store = MEMORY;');
    await sequelize.query('PRAGMA mmap_size = 268435456;');
    await sequelize.query('PRAGMA foreign_keys = ON;');

    // Sync all models (create tables)
    await sequelize.sync({ force: true });
    console.log('All tables created successfully.');

    await sequelize.close();
    console.log('Database initialization complete.');
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
}

initDb();
