const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    action: { type: DataTypes.STRING(50), allowNull: false },
    target_type: { type: DataTypes.STRING(50), allowNull: false },
    target_id: { type: DataTypes.STRING(100), allowNull: false },
    detail: { type: DataTypes.TEXT, allowNull: true },
    ip_address: { type: DataTypes.STRING(45), allowNull: false }
  }, {
    tableName: 'audit_log',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return AuditLog;
};
