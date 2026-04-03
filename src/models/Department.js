const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('departments', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
  },
  tenant_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['tenant_id', 'code'], unique: true },
  ],
});

module.exports = Department;
