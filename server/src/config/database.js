const path = require('path');
const config = require('./index');

module.exports = {
  dialect: 'sqlite',
  storage: config.db.storage === ':memory:' ? ':memory:' : path.resolve(__dirname, '../../', config.db.storage),
  logging: config.nodeEnv === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    max: 3
  }
};
