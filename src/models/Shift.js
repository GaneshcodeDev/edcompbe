const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Shift = sequelize.define('shifts', {
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
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  start_time: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  end_time: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  grace_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['tenant_id', 'code'], unique: true },
  ],
});

module.exports = Shift;
