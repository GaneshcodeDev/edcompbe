const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Offboarding = sequelize.define('offboarding_records', {
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
  initiated_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  last_working_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('initiated', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'initiated',
  },
}, {
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['employee_id'] },
  ],
});

const OffboardingChecklist = sequelize.define('offboarding_checklist', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
  },
  offboarding_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  task: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  is_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  completed_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  assignee: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
});

// Associations
Offboarding.hasMany(OffboardingChecklist, { foreignKey: 'offboarding_id', as: 'checklist' });
OffboardingChecklist.belongsTo(Offboarding, { foreignKey: 'offboarding_id' });

module.exports = { Offboarding, OffboardingChecklist };
