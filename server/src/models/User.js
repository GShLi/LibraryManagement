const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true, validate: { len: [3, 50] } },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'reader', validate: { isIn: [['admin', 'librarian', 'reader']] } },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active', validate: { isIn: [['active', 'disabled', 'locked']] } },
    login_attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    locked_until: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    defaultScope: { where: { deleted_at: null } }
  });

  User.associate = (models) => {
    User.hasOne(models.Reader, { foreignKey: 'user_id', as: 'reader' });
    User.hasMany(models.AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
    User.hasMany(models.Borrow, { foreignKey: 'operator_id', as: 'operatedBorrows' });
    User.hasMany(models.SystemConfig, { foreignKey: 'updated_by', as: 'systemConfigs' });
  };

  return User;
};
