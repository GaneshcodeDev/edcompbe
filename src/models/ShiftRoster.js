const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShiftRoster = sequelize.define('shift_roster', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
  },
  tenant_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  employee_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  shift_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  is_override: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  indexes: [
    { fields: ['tenant_id', 'date'] },
    { fields: ['employee_id', 'date'], unique: true },
  ],
});

module.exports = ShiftRoster;
