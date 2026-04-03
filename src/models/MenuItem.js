const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuItem = sequelize.define('menu_items', {
  id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
  },
  parent_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  route: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  roles: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  module_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

// Self-referencing for parent-child
MenuItem.hasMany(MenuItem, { foreignKey: 'parent_id', as: 'children' });
MenuItem.belongsTo(MenuItem, { foreignKey: 'parent_id', as: 'parent' });

module.exports = MenuItem;
