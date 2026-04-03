const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tenant = sequelize.define('tenants', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  domain: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  logo: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  config: {
    type: DataTypes.JSON,
    defaultValue: {
      theme: { mode: 'light', primaryColor: '#4F46E5', accentColor: '#7C3AED', fontFamily: 'Inter', sidebarStyle: 'gradient' },
      enabledModules: ['employees', 'attendance', 'reports'],
      maxEmployees: 100,
    },
  },
});

module.exports = Tenant;
