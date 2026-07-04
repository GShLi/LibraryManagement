const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const sequelize = new Sequelize(dbConfig);

const User = require('./User')(sequelize);
const Reader = require('./Reader')(sequelize);
const Category = require('./Category')(sequelize);
const Book = require('./Book')(sequelize);
const BookCopy = require('./BookCopy')(sequelize);
const Borrow = require('./Borrow')(sequelize);
const Fine = require('./Fine')(sequelize);
const Reserve = require('./Reserve')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);
const SystemConfig = require('./SystemConfig')(sequelize);

const models = {
  User, Reader, Category, Book, BookCopy,
  Borrow, Fine, Reserve, AuditLog, SystemConfig
};

Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
