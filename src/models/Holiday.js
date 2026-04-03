const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Holiday = sequelize.define('holidays', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('national', 'regional', 'company'),
    defaultValue: 'national',
  },
  is_optional: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['tenant_id', 'date'] },
  ],
});

module.exports = Holiday;
