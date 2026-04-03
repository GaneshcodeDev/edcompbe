/**
 * Database Seeder - Creates demo data for AttendEase
 *
 * Run: cd backend && node src/seeders/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sequelize, Tenant, User, Employee, Department, Designation, Shift, Holiday, Attendance, PunchLog, ShiftRoster, Role, Offboarding, OffboardingChecklist, AppModule, MenuItem } = require('../models');

const uuid = () => crypto.randomUUID();

async function seed() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected\n');

    // Force sync - drops and recreates all tables
    await sequelize.sync({ force: true });
    console.log('✅ Tables created\n');

    const salt = await bcrypt.genSalt(12);
    const adminHash = await bcrypt.hash('admin123', salt);
    const userHash = await bcrypt.hash('user123', salt);

    // ─── TENANTS ───
    console.log('📦 Seeding tenants...');
    const tenants = await Tenant.bulkCreate([
      { id: 't1', name: 'Acme Corp', code: 'ACME', domain: 'acme.attendease.com', is_active: true, config: { theme: { mode: 'light', primaryColor: '#4F46E5', accentColor: '#7C3AED', fontFamily: 'Inter', sidebarStyle: 'gradient' }, enabledModules: ['employees', 'attendance', 'reports', 'offboarding', 'masters', 'configuration'], maxEmployees: 500 } },
      { id: 't2', name: 'TechVista Solutions', code: 'TVST', domain: 'techvista.attendease.com', is_active: true, config: { theme: { mode: 'light', primaryColor: '#0EA5E9', accentColor: '#8B5CF6', fontFamily: 'Inter', sidebarStyle: 'default' }, enabledModules: ['employees', 'attendance', 'reports'], maxEmployees: 200 } },
      { id: 't3', name: 'Global Industries', code: 'GIND', domain: 'global.attendease.com', is_active: false, config: { theme: { mode: 'light', primaryColor: '#059669', accentColor: '#D97706', fontFamily: 'Roboto', sidebarStyle: 'compact' }, enabledModules: ['employees', 'attendance'], maxEmployees: 100 } },
    ]);

    // ─── USERS ───
    console.log('👤 Seeding users...');
    await User.bulkCreate([
      { id: 'U1', tenant_id: 't1', username: 'superadmin', password_hash: adminHash, email: 'super@attendease.com', full_name: 'Super Admin', role: 'super_admin', is_active: true },
      { id: 'U2', tenant_id: 't1', username: 'acmeadmin', password_hash: adminHash, email: 'admin@acme.com', full_name: 'Acme Admin', role: 'tenant_admin', is_active: true },
      { id: 'U3', tenant_id: 't2', username: 'techadmin', password_hash: adminHash, email: 'admin@techvista.com', full_name: 'Tech Admin', role: 'tenant_admin', is_active: true },
      { id: 'U4', tenant_id: 't1', username: 'hrmanager', password_hash: adminHash, email: 'hr@acme.com', full_name: 'Priya Sharma', role: 'hr_manager', is_active: true },
      { id: 'U5', tenant_id: 't1', username: 'john.doe', password_hash: userHash, email: 'john@acme.com', full_name: 'John Doe', role: 'employee', is_active: true },
      { id: 'U6', tenant_id: 't2', username: 'jane.smith', password_hash: userHash, email: 'jane@techvista.com', full_name: 'Jane Smith', role: 'employee', is_active: true },
    ]);

    // ─── DEPARTMENTS ───
    console.log('🏢 Seeding departments...');
    await Department.bulkCreate([
      { id: 'D1', tenant_id: 't1', name: 'Engineering', code: 'ENG', is_active: true },
      { id: 'D2', tenant_id: 't1', name: 'Human Resources', code: 'HR', is_active: true },
      { id: 'D3', tenant_id: 't1', name: 'Finance', code: 'FIN', is_active: true },
      { id: 'D4', tenant_id: 't1', name: 'Operations', code: 'OPS', is_active: true },
      { id: 'D5', tenant_id: 't1', name: 'Sales & Marketing', code: 'SAL', is_active: true },
      { id: 'D6', tenant_id: 't2', name: 'Engineering', code: 'ENG', is_active: true },
      { id: 'D7', tenant_id: 't2', name: 'Human Resources', code: 'HR', is_active: true },
      { id: 'D8', tenant_id: 't2', name: 'Finance', code: 'FIN', is_active: true },
      { id: 'D9', tenant_id: 't2', name: 'Operations', code: 'OPS', is_active: true },
      { id: 'D10', tenant_id: 't2', name: 'Product', code: 'PRD', is_active: true },
    ]);

    // ─── DESIGNATIONS ───
    console.log('🎯 Seeding designations...');
    await Designation.bulkCreate([
      { id: 'DG1', tenant_id: 't1', name: 'Director', code: 'DIR', level: 1, is_active: true },
      { id: 'DG2', tenant_id: 't1', name: 'Manager', code: 'MGR', level: 2, is_active: true },
      { id: 'DG3', tenant_id: 't1', name: 'Senior Engineer', code: 'SE', level: 3, is_active: true },
      { id: 'DG4', tenant_id: 't1', name: 'Junior Engineer', code: 'JE', level: 4, is_active: true },
      { id: 'DG5', tenant_id: 't1', name: 'Intern', code: 'INT', level: 5, is_active: true },
      { id: 'DG6', tenant_id: 't2', name: 'Director', code: 'DIR', level: 1, is_active: true },
      { id: 'DG7', tenant_id: 't2', name: 'Manager', code: 'MGR', level: 2, is_active: true },
      { id: 'DG8', tenant_id: 't2', name: 'Senior Engineer', code: 'SE', level: 3, is_active: true },
      { id: 'DG9', tenant_id: 't2', name: 'Junior Engineer', code: 'JE', level: 4, is_active: true },
      { id: 'DG10', tenant_id: 't2', name: 'Intern', code: 'INT', level: 5, is_active: true },
    ]);

    // ─── SHIFTS ───
    console.log('⏰ Seeding shifts...');
    await Shift.bulkCreate([
      { id: 'S1', tenant_id: 't1', name: 'General', code: 'GEN', start_time: '09:00', end_time: '18:00', grace_minutes: 15, is_default: true },
      { id: 'S2', tenant_id: 't1', name: 'Morning', code: 'MRN', start_time: '06:00', end_time: '14:00', grace_minutes: 10, is_default: false },
      { id: 'S3', tenant_id: 't1', name: 'Afternoon', code: 'AFT', start_time: '14:00', end_time: '22:00', grace_minutes: 10, is_default: false },
      { id: 'S4', tenant_id: 't1', name: 'Night', code: 'NGT', start_time: '22:00', end_time: '06:00', grace_minutes: 15, is_default: false },
    ]);

    // ─── EMPLOYEES ───
    console.log('👥 Seeding employees...');
    const employees = [
      { id: 'E1', tenant_id: 't1', employee_code: 'ACM001', first_name: 'John', last_name: 'Doe', email: 'john.e@acme.com', phone: '555-0101', department_id: 'D1', designation_id: 'DG3', date_of_joining: '2023-03-15', date_of_birth: '1990-05-20', gender: 'male', address: '123 Main St', city: 'New York', state: 'NY', status: 'active', shift_id: 'S1' },
      { id: 'E2', tenant_id: 't1', employee_code: 'ACM002', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@acme.com', phone: '555-0102', department_id: 'D1', designation_id: 'DG2', date_of_joining: '2022-07-01', date_of_birth: '1988-11-15', gender: 'female', address: '456 Oak Ave', city: 'New York', state: 'NY', status: 'active', shift_id: 'S1' },
      { id: 'E3', tenant_id: 't1', employee_code: 'ACM003', first_name: 'Michael', last_name: 'Brown', email: 'michael@acme.com', phone: '555-0103', department_id: 'D2', designation_id: 'DG2', date_of_joining: '2021-01-10', date_of_birth: '1985-03-22', gender: 'male', address: '789 Pine Rd', city: 'Boston', state: 'MA', status: 'active', shift_id: 'S1' },
      { id: 'E4', tenant_id: 't1', employee_code: 'ACM004', first_name: 'Emily', last_name: 'Davis', email: 'emily@acme.com', phone: '555-0104', department_id: 'D3', designation_id: 'DG3', date_of_joining: '2023-09-20', date_of_birth: '1992-08-10', gender: 'female', address: '321 Elm St', city: 'Chicago', state: 'IL', status: 'active', shift_id: 'S1' },
      { id: 'E5', tenant_id: 't1', employee_code: 'ACM005', first_name: 'David', last_name: 'Wilson', email: 'david@acme.com', phone: '555-0105', department_id: 'D4', designation_id: 'DG1', date_of_joining: '2020-02-14', date_of_birth: '1980-12-05', gender: 'male', address: '654 Maple Dr', city: 'New York', state: 'NY', status: 'active', shift_id: 'S2' },
      { id: 'E6', tenant_id: 't1', employee_code: 'ACM006', first_name: 'Jessica', last_name: 'Martinez', email: 'jessica@acme.com', phone: '555-0106', department_id: 'D5', designation_id: 'DG3', date_of_joining: '2024-01-08', date_of_birth: '1993-06-18', gender: 'female', address: '987 Cedar Ln', city: 'New York', state: 'NY', status: 'active', shift_id: 'S1' },
      { id: 'E7', tenant_id: 't1', employee_code: 'ACM007', first_name: 'Robert', last_name: 'Anderson', email: 'robert@acme.com', phone: '555-0107', department_id: 'D1', designation_id: 'DG4', date_of_joining: '2024-06-01', date_of_birth: '1995-09-30', gender: 'male', address: '147 Birch Ave', city: 'Boston', state: 'MA', status: 'active', shift_id: 'S1' },
      { id: 'E8', tenant_id: 't1', employee_code: 'ACM008', first_name: 'Amanda', last_name: 'Taylor', email: 'amanda@acme.com', phone: '555-0108', department_id: 'D1', designation_id: 'DG3', date_of_joining: '2023-04-12', date_of_birth: '1991-02-28', gender: 'female', address: '258 Walnut St', city: 'New York', state: 'NY', status: 'active', shift_id: 'S1' },
      { id: 'E9', tenant_id: 't1', employee_code: 'ACM009', first_name: 'Daniel', last_name: 'Thomas', email: 'daniel@acme.com', phone: '555-0109', department_id: 'D3', designation_id: 'DG4', date_of_joining: '2024-08-15', date_of_birth: '1996-04-12', gender: 'male', address: '369 Spruce Ct', city: 'Chicago', state: 'IL', status: 'active', shift_id: 'S1' },
      { id: 'E10', tenant_id: 't1', employee_code: 'ACM010', first_name: 'Olivia', last_name: 'Garcia', email: 'olivia@acme.com', phone: '555-0110', department_id: 'D5', designation_id: 'DG2', date_of_joining: '2022-11-01', date_of_birth: '1987-07-25', gender: 'female', address: '741 Ash Blvd', city: 'New York', state: 'NY', status: 'active', shift_id: 'S1' },
      { id: 'E15', tenant_id: 't2', employee_code: 'TVS001', first_name: 'Jane', last_name: 'Smith', email: 'jane.e@techvista.com', phone: '555-0201', department_id: 'D6', designation_id: 'DG8', date_of_joining: '2023-05-10', date_of_birth: '1991-04-15', gender: 'female', address: '100 Tech Blvd', city: 'San Francisco', state: 'CA', status: 'active', shift_id: 'S1' },
      { id: 'E16', tenant_id: 't2', employee_code: 'TVS002', first_name: 'Alex', last_name: 'Kim', email: 'alex@techvista.com', phone: '555-0202', department_id: 'D6', designation_id: 'DG7', date_of_joining: '2022-08-20', date_of_birth: '1986-09-03', gender: 'male', address: '200 Innovation Dr', city: 'San Francisco', state: 'CA', status: 'active', shift_id: 'S1' },
      { id: 'E17', tenant_id: 't2', employee_code: 'TVS003', first_name: 'Priya', last_name: 'Patel', email: 'priya@techvista.com', phone: '555-0203', department_id: 'D7', designation_id: 'DG7', date_of_joining: '2023-01-15', date_of_birth: '1990-12-20', gender: 'female', address: '300 Startup Ln', city: 'San Jose', state: 'CA', status: 'active', shift_id: 'S1' },
    ];
    await Employee.bulkCreate(employees);

    // ─── HOLIDAYS ───
    console.log('🎉 Seeding holidays...');
    await Holiday.bulkCreate([
      { id: 'H1', tenant_id: 't1', name: "New Year's Day", date: '2026-01-01', type: 'national', is_optional: false },
      { id: 'H2', tenant_id: 't1', name: "Republic Day", date: '2026-01-26', type: 'national', is_optional: false },
      { id: 'H3', tenant_id: 't1', name: 'Good Friday', date: '2026-04-03', type: 'regional', is_optional: true },
      { id: 'H4', tenant_id: 't1', name: 'Independence Day', date: '2026-08-15', type: 'national', is_optional: false },
      { id: 'H5', tenant_id: 't1', name: 'Company Foundation Day', date: '2026-03-15', type: 'company', is_optional: false },
      { id: 'H6', tenant_id: 't1', name: 'Diwali', date: '2026-10-20', type: 'national', is_optional: false },
      { id: 'H7', tenant_id: 't1', name: 'Christmas', date: '2026-12-25', type: 'national', is_optional: false },
    ]);

    // ─── ATTENDANCE (generate for last 7 days) ───
    console.log('📋 Seeding attendance records...');
    const activeEmps = employees.filter(e => e.status === 'active');
    const statuses = ['present', 'present', 'present', 'present', 'present', 'late', 'absent', 'leave'];
    const attendanceRecords = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dow = d.getDay();

      for (const emp of activeEmps) {
        if (dow === 0 || dow === 6) {
          attendanceRecords.push({ id: uuid(), tenant_id: emp.tenant_id, employee_id: emp.id, date: dateStr, status: 'weekend', source: 'system' });
          continue;
        }
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const checkIn = status === 'present' ? `09:0${Math.floor(Math.random() * 9)}` : status === 'late' ? `09:${15 + Math.floor(Math.random() * 30)}` : null;
        const checkOut = checkIn ? `18:0${Math.floor(Math.random() * 9)}` : null;
        const workHours = status === 'present' ? 8.5 : status === 'late' ? 7.5 : 0;

        attendanceRecords.push({
          id: uuid(), tenant_id: emp.tenant_id, employee_id: emp.id, date: dateStr,
          status, check_in: checkIn, check_out: checkOut, shift_id: emp.shift_id,
          work_hours: workHours, overtime: 0, source: 'biometric',
        });
      }
    }
    await Attendance.bulkCreate(attendanceRecords);

    // ─── PUNCH LOGS ───
    console.log('🔔 Seeding punch logs...');
    const todayStr = today.toISOString().split('T')[0];
    const punchLogs = [];
    for (const emp of activeEmps.slice(0, 8)) {
      punchLogs.push(
        { id: uuid(), tenant_id: emp.tenant_id, employee_id: emp.id, timestamp: `${todayStr}T09:0${Math.floor(Math.random() * 9)}:00`, type: 'in', source: 'biometric', device_id: 'BIO-01', location: 'Main Entrance' },
        { id: uuid(), tenant_id: emp.tenant_id, employee_id: emp.id, timestamp: `${todayStr}T18:0${Math.floor(Math.random() * 9)}:00`, type: 'out', source: 'biometric', device_id: 'BIO-01', location: 'Main Entrance' },
      );
    }
    await PunchLog.bulkCreate(punchLogs);

    // ─── ROLES ───
    console.log('🔐 Seeding roles...');
    await Role.bulkCreate([
      { id: 'R1', tenant_id: 't1', name: 'Super Administrator', code: 'super_admin', is_system: true, permissions: ['employee.read', 'employee.write', 'attendance.read', 'attendance.write', 'config.manage', 'reports.view', 'reports.export', 'masters.manage', 'offboarding.manage'] },
      { id: 'R2', tenant_id: 't1', name: 'Tenant Administrator', code: 'tenant_admin', is_system: true, permissions: ['employee.read', 'employee.write', 'attendance.read', 'attendance.write', 'reports.view', 'reports.export', 'masters.manage', 'offboarding.manage'] },
      { id: 'R3', tenant_id: 't1', name: 'HR Manager', code: 'hr_manager', is_system: false, permissions: ['employee.read', 'employee.write', 'attendance.read', 'attendance.write', 'reports.view', 'offboarding.manage'] },
      { id: 'R4', tenant_id: 't1', name: 'Employee', code: 'employee', is_system: true, permissions: ['attendance.read'] },
    ]);

    // ─── APP MODULES ───
    console.log('📦 Seeding app modules...');
    await AppModule.bulkCreate([
      { id: 'MOD1', name: 'Employee Management', code: 'employees', description: 'Manage employee records and profiles', is_active: true, icon: 'bi-people' },
      { id: 'MOD2', name: 'Attendance Management', code: 'attendance', description: 'Track daily attendance and shifts', is_active: true, icon: 'bi-calendar-check' },
      { id: 'MOD3', name: 'Configuration', code: 'configuration', description: 'System settings and tenant management', is_active: true, icon: 'bi-gear' },
      { id: 'MOD4', name: 'Reports & Analytics', code: 'reports', description: 'Generate reports and analytics', is_active: true, icon: 'bi-file-earmark-bar-graph' },
      { id: 'MOD5', name: 'Offboarding', code: 'offboarding', description: 'Employee exit workflow', is_active: true, icon: 'bi-box-arrow-right' },
      { id: 'MOD6', name: 'Master Data', code: 'masters', description: 'Departments and designations', is_active: true, icon: 'bi-database' },
    ]);

    // ─── MENU ITEMS ───
    console.log('📋 Seeding menu items...');
    await MenuItem.bulkCreate([
      { id: 'M1', parent_id: null, label: 'Dashboard', icon: 'bi-speedometer2', route: '/dashboard', roles: ['super_admin', 'tenant_admin', 'hr_manager', 'employee'], sort_order: 1, is_active: true },
      { id: 'M2', parent_id: null, label: 'Employees', icon: 'bi-people', route: null, roles: ['super_admin', 'tenant_admin', 'hr_manager'], sort_order: 2, is_active: true },
      { id: 'M2a', parent_id: 'M2', label: 'Employee List', icon: '', route: '/employees/list', roles: ['super_admin', 'tenant_admin', 'hr_manager'], sort_order: 1, is_active: true },
      { id: 'M2b', parent_id: 'M2', label: 'Add Employee', icon: '', route: '/employees/add', roles: ['super_admin', 'tenant_admin', 'hr_manager'], sort_order: 2, is_active: true },
      { id: 'M3', parent_id: null, label: 'Attendance', icon: 'bi-calendar-check', route: null, roles: ['super_admin', 'tenant_admin', 'hr_manager', 'employee'], sort_order: 3, is_active: true },
      { id: 'M3a', parent_id: 'M3', label: 'Daily Monitoring', icon: '', route: '/attendance/daily-monitoring', roles: ['super_admin', 'tenant_admin', 'hr_manager'], sort_order: 1, is_active: true },
      { id: 'M3b', parent_id: 'M3', label: 'Manual Entry', icon: '', route: '/attendance/manual-entry', roles: ['super_admin', 'tenant_admin', 'hr_manager'], sort_order: 2, is_active: true },
      { id: 'M4', parent_id: null, label: 'Reports', icon: 'bi-file-earmark-bar-graph', route: '/reports', roles: ['super_admin', 'tenant_admin', 'hr_manager'], sort_order: 7, is_active: true },
      { id: 'M5', parent_id: null, label: 'Settings', icon: 'bi-palette', route: '/settings', roles: ['super_admin', 'tenant_admin', 'hr_manager', 'employee'], sort_order: 9, is_active: true },
    ]);

    console.log('\n✅ ══════════════════════════════════════');
    console.log('   Database seeded successfully!');
    console.log('══════════════════════════════════════\n');
    console.log('Demo Credentials:');
    console.log('─────────────────────────────────────');
    console.log('  superadmin  / admin123  (Super Admin)');
    console.log('  acmeadmin   / admin123  (Tenant Admin)');
    console.log('  techadmin   / admin123  (Tenant Admin)');
    console.log('  hrmanager   / admin123  (HR Manager)');
    console.log('  john.doe    / user123   (Employee)');
    console.log('  jane.smith  / user123   (Employee)');
    console.log('─────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
