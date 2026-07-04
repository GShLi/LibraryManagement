const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Borrow = sequelize.define('Borrow', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    reader_id: { type: DataTypes.INTEGER, allowNull: false },
    copy_id: { type: DataTypes.INTEGER, allowNull: false },
    operator_id: { type: DataTypes.INTEGER, allowNull: false },
    borrow_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    due_date: { type: DataTypes.DATEONLY, allowNull: false },
    return_date: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'borrowing', validate: { isIn: [['borrowing', 'returned', 'overdue']] } },
    renew_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  }, {
    tableName: 'borrow',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Borrow.associate = (models) => {
    Borrow.belongsTo(models.Reader, { foreignKey: 'reader_id', as: 'reader' });
    Borrow.belongsTo(models.BookCopy, { foreignKey: 'copy_id', as: 'copy' });
    Borrow.belongsTo(models.User, { foreignKey: 'operator_id', as: 'operator' });
    Borrow.hasOne(models.Fine, { foreignKey: 'borrow_id', as: 'fine' });
  };

  return Borrow;
};
