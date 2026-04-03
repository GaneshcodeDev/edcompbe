const router = require('express').Router();

// All API routes - /api/v1/...
router.use('/auth',           require('./auth.routes'));
router.use('/tenants',        require('./tenant.routes'));
router.use('/employees',      require('./employee.routes'));
router.use('/attendance',     require('./attendance.routes'));
router.use('/shifts',         require('./shift.routes'));
router.use('/shift-roster',   require('./shiftRoster.routes'));
router.use('/punch-logs',     require('./punchLog.routes'));
router.use('/holidays',       require('./holiday.routes'));
router.use('/departments',    require('./department.routes'));
router.use('/designations',   require('./designation.routes'));
router.use('/reports',        require('./report.routes'));
router.use('/offboarding',    require('./offboarding.routes'));
router.use('/roles',          require('./role.routes'));
router.use('/app-modules',    require('./appModule.routes'));
router.use('/menus',          require('./menu.routes'));
router.use('/settings',       require('./settings.routes'));
router.use('/activity-logs',  require('./activityLog.routes'));

module.exports = router;
