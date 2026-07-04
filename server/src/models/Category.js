const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    parent_id: { type: DataTypes.INTEGER, allowNull: true },
    level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  }, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  Category.associate = (models) => {
    Category.belongsTo(models.Category, { foreignKey: 'parent_id', as: 'parent' });
    Category.hasMany(models.Category, { foreignKey: 'parent_id', as: 'children' });
    Category.hasMany(models.Book, { foreignKey: 'category_id', as: 'books' });
  };

  return Category;
};
