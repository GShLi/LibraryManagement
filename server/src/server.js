const app = require('./app');
const config = require('./config');
const { sequelize } = require('./models');

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync models (create tables if not exist)
    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
