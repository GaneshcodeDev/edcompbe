const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppModule = sequelize.define('app_modules', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  icon: {
    type: DataTypes.STRING(50),
    defaultValue: 'bi-puzzle',
  },
});

module.exports = AppModule;
