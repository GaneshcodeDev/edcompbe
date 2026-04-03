const sequelize = require('../config/database');

// Import all models
const Tenant = require('./Tenant');
const User = require('./User');
const Employee = require('./Employee');
const Department = require('./Department');
const Designation = require('./Designation');
const Attendance = require('./Attendance');
const Shift = require('./Shift');
const ShiftRoster = require('./ShiftRoster');
const PunchLog = require('./PunchLog');
const Holiday = require('./Holiday');
const Role = require('./Role');
const { Offboarding, OffboardingChecklist } = require('./Offboarding');
const AppModule = require('./AppModule');
const MenuItem = require('./MenuItem');
const ActivityLog = require('./ActivityLog');

// ─── Associations ───

// Tenant -> Users
Tenant.hasMany(User, { foreignKey: 'tenant_id', as: 'users' });
User.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

// Tenant -> Employees
Tenant.hasMany(Employee, { foreignKey: 'tenant_id', as: 'employees' });
Employee.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

// Department -> Employees
Department.hasMany(Employee, { foreignKey: 'department_id', as: 'employees' });
Employee.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// Designation -> Employees
Designation.hasMany(Employee, { foreignKey: 'designation_id', as: 'employees' });
Employee.belongsTo(Designation, { foreignKey: 'designation_id', as: 'designation' });

// Employee -> Attendance
Employee.hasMany(Attendance, { foreignKey: 'employee_id', as: 'attendanceRecords' });
Attendance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// Shift -> Attendance
Shift.hasMany(Attendance, { foreignKey: 'shift_id', as: 'attendanceRecords' });
Attendance.belongsTo(Shift, { foreignKey: 'shift_id', as: 'shift' });

// Employee -> Shift (default shift)
Shift.hasMany(Employee, { foreignKey: 'shift_id', as: 'employees' });
Employee.belongsTo(Shift, { foreignKey: 'shift_id', as: 'defaultShift' });

// Employee -> PunchLogs
Employee.hasMany(PunchLog, { foreignKey: 'employee_id', as: 'punchLogs' });
PunchLog.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// Employee -> ShiftRoster
Employee.hasMany(ShiftRoster, { foreignKey: 'employee_id', as: 'shiftRosters' });
ShiftRoster.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
Shift.hasMany(ShiftRoster, { foreignKey: 'shift_id', as: 'rosters' });
ShiftRoster.belongsTo(Shift, { foreignKey: 'shift_id', as: 'shift' });

// Employee -> Offboarding
Employee.hasMany(Offboarding, { foreignKey: 'employee_id', as: 'offboardings' });
Offboarding.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// Tenant -> Departments, Designations, Shifts, Holidays, Roles
Tenant.hasMany(Department, { foreignKey: 'tenant_id' });
Tenant.hasMany(Designation, { foreignKey: 'tenant_id' });
Tenant.hasMany(Shift, { foreignKey: 'tenant_id' });
Tenant.hasMany(Holiday, { foreignKey: 'tenant_id' });
Tenant.hasMany(Role, { foreignKey: 'tenant_id' });
Tenant.hasMany(Offboarding, { foreignKey: 'tenant_id' });

module.exports = {
  sequelize,
  Tenant,
  User,
  Employee,
  Department,
  Designation,
  Attendance,
  Shift,
  ShiftRoster,
  PunchLog,
  Holiday,
  Role,
  Offboarding,
  OffboardingChecklist,
  AppModule,
  MenuItem,
  ActivityLog,
};
