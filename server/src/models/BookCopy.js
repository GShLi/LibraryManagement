const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BookCopy = sequelize.define('BookCopy', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    book_id: { type: DataTypes.INTEGER, allowNull: false },
    barcode: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'stock', validate: { isIn: [['stock', 'available', 'borrowed', 'withdrawn']] } },
    location: { type: DataTypes.STRING(100), allowNull: true },
    condition: { type: DataTypes.STRING(20), allowNull: true, defaultValue: 'new', validate: { isIn: [['new', 'good', 'fair', 'damaged']] } }
  }, {
    tableName: 'book_copy',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  BookCopy.associate = (models) => {
    BookCopy.belongsTo(models.Book, { foreignKey: 'book_id', as: 'book' });
    BookCopy.hasMany(models.Borrow, { foreignKey: 'copy_id', as: 'borrows' });
    BookCopy.hasMany(models.Reserve, { foreignKey: 'copy_id', as: 'reserves' });
  };

  return BookCopy;
};
