const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('attendance_records', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'half_day', 'leave', 'holiday', 'weekend'),
    allowNull: false,
  },
  check_in: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  check_out: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  shift_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
  },
  work_hours: {
    type: DataTypes.DECIMAL(4, 1),
    defaultValue: 0,
  },
  overtime: {
    type: DataTypes.DECIMAL(4, 1),
    defaultValue: 0,
  },
  remarks: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  source: {
    type: DataTypes.ENUM('manual', 'biometric', 'system'),
    defaultValue: 'manual',
  },
}, {
  indexes: [
    { fields: ['tenant_id', 'date'] },
    { fields: ['employee_id', 'date'], unique: true },
    { fields: ['tenant_id', 'employee_id'] },
    { fields: ['status'] },
  ],
});

module.exports = Attendance;
