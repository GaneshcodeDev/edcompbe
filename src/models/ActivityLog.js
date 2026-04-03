const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
  },
  tenant_id: {
    type: DataTypes.STRING(36),
    allowNull: true, // null for system-level actions (login, global module toggle)
  },
  user_id: {
    type: DataTypes.STRING(36),
    allowNull: true, // null for machine/system actions
  },
  user_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  user_role: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  action: {
    type: DataTypes.ENUM('create', 'update', 'delete', 'login', 'logout', 'login_failed',
      'approve', 'reject', 'process', 'toggle', 'assign', 'bulk_create', 'export', 'regularize'),
    allowNull: false,
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false, // 'auth', 'employees', 'attendance', 'shifts', 'holidays', etc.
  },
  entity_type: {
    type: DataTypes.STRING(50),
    allowNull: false, // 'employee', 'attendance', 'shift', 'department', etc.
  },
  entity_id: {
    type: DataTypes.STRING(36),
    allowNull: true, // null for bulk/login actions
  },
  entity_name: {
    type: DataTypes.STRING(255),
    allowNull: true, // human-readable: "John Doe", "General Shift", etc.
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false, // "Created employee John Doe (EMP001)"
  },
  previous_values: {
    type: DataTypes.TEXT, // JSON string of old values (for updates)
    allowNull: true,
  },
  new_values: {
    type: DataTypes.TEXT, // JSON string of new values
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  user_agent: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'activity_logs',
  indexes: [
    { fields: ['tenant_id', 'created_at'] },
    { fields: ['user_id'] },
    { fields: ['module'] },
    { fields: ['entity_type', 'entity_id'] },
    { fields: ['action'] },
    { fields: ['created_at'] },
  ],
});

module.exports = ActivityLog;
