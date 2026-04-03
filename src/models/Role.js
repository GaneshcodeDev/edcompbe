const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('roles', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
  },
  tenant_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  code: {
    type: DataTypes.ENUM('super_admin', 'tenant_admin', 'hr_manager', 'employee'),
    allowNull: false,
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  is_system: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  indexes: [{ fields: ['tenant_id'] }],
});

module.exports = Role;
