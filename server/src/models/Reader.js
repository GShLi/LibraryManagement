const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Reader = sequelize.define('Reader', {
    user_id: { type: DataTypes.INTEGER, primaryKey: true },
    reader_no: { type: DataTypes.STRING(25), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(100), allowNull: true },
    reader_type: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'student', validate: { isIn: [['student', 'teacher', 'staff', 'external']] } },
    borrow_limit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
    current_borrowed: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active', validate: { isIn: [['active', 'frozen', 'lost', 'disabled']] } }
  }, {
    tableName: 'readers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Reader.associate = (models) => {
    Reader.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Reader.hasMany(models.Borrow, { foreignKey: 'reader_id', as: 'borrows' });
    Reader.hasMany(models.Reserve, { foreignKey: 'reader_id', as: 'reserves' });
    Reader.hasMany(models.Fine, { foreignKey: 'reader_id', as: 'fines' });
  };

  return Reader;
};
