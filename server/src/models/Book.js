const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Book = sequelize.define('Book', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    isbn: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    author: { type: DataTypes.STRING(100), allowNull: false },
    publisher: { type: DataTypes.STRING(100), allowNull: false },
    publish_date: { type: DataTypes.DATEONLY, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    category_code: { type: DataTypes.STRING(20), allowNull: false },
    category_name: { type: DataTypes.STRING(100), allowNull: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    pages: { type: DataTypes.INTEGER, allowNull: true },
    language: { type: DataTypes.STRING(20), allowNull: true, defaultValue: '中文' },
    edition: { type: DataTypes.STRING(50), allowNull: true },
    keywords: { type: DataTypes.TEXT, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    cover_url: { type: DataTypes.STRING(500), allowNull: true },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active', validate: { isIn: [['active', 'withdrawn']] } },
    total_copies: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    available_copies: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  }, {
    tableName: 'books',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Book.associate = (models) => {
    Book.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
    Book.hasMany(models.BookCopy, { foreignKey: 'book_id', as: 'copies' });
    Book.hasMany(models.Reserve, { foreignKey: 'book_id', as: 'reserves' });
  };

  return Book;
};
