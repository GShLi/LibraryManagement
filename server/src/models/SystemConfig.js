const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SystemConfig = sequelize.define('SystemConfig', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    config_key: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    config_value: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.STRING(200), allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: 'system_config',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at'
  });

  SystemConfig.associate = (models) => {
    SystemConfig.belongsTo(models.User, { foreignKey: 'updated_by', as: 'updater' });
  };

  return SystemConfig;
};
