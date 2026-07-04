const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Reserve = sequelize.define('Reserve', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    reader_id: { type: DataTypes.INTEGER, allowNull: false },
    book_id: { type: DataTypes.INTEGER, allowNull: false },
    copy_id: { type: DataTypes.INTEGER, allowNull: true },
    reserve_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    expire_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'waiting', validate: { isIn: [['waiting', 'fulfilled', 'cancelled', 'expired']] } }
  }, {
    tableName: 'reserve',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  Reserve.associate = (models) => {
    Reserve.belongsTo(models.Reader, { foreignKey: 'reader_id', as: 'reader' });
    Reserve.belongsTo(models.Book, { foreignKey: 'book_id', as: 'book' });
    Reserve.belongsTo(models.BookCopy, { foreignKey: 'copy_id', as: 'copy' });
  };

  return Reserve;
};
