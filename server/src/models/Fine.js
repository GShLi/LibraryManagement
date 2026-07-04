const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Fine = sequelize.define('Fine', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    borrow_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    reader_id: { type: DataTypes.INTEGER, allowNull: false },
    overdue_days: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    reason: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'overdue', validate: { isIn: [['overdue', 'lost', 'damaged']] } },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'unpaid', validate: { isIn: [['unpaid', 'paid']] } },
    paid_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'fine',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  Fine.associate = (models) => {
    Fine.belongsTo(models.Borrow, { foreignKey: 'borrow_id', as: 'borrow' });
    Fine.belongsTo(models.Reader, { foreignKey: 'reader_id', as: 'reader' });
  };

  return Fine;
};
