const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('employees', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
  },
  tenant_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  employee_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  department_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  designation_id: {
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  plant_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
  },
  date_of_joining: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    defaultValue: 'male',
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'offboarded'),
    defaultValue: 'active',
  },
  shift_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['tenant_id', 'employee_code'], unique: true },
    { fields: ['tenant_id', 'department_id'] },
    { fields: ['status'] },
  ],
});

module.exports = Employee;
