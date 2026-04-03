const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PunchLog = sequelize.define('punch_logs', {
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
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('in', 'out'),
    allowNull: false,
  },
  source: {
    type: DataTypes.ENUM('biometric', 'manual', 'mobile'),
    defaultValue: 'biometric',
  },
  device_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['tenant_id', 'employee_id'] },
    { fields: ['timestamp'] },
  ],
});

module.exports = PunchLog;
