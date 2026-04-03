const router = require('express').Router();
const ctrl = require('../controllers/attendance.controller');
const { authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { hasPermission } = require('../middleware/role');
const { requireModule } = require('../middleware/moduleCheck');

router.use(authenticate, tenantMiddleware, requireModule('attendance'));

router.get('/', hasPermission('attendance.read'), ctrl.getByDate);
router.get('/employee/:employeeId', hasPermission('attendance.read'), ctrl.getByEmployee);
router.get('/dashboard-stats', hasPermission('attendance.read'), ctrl.getDashboardStats);
router.get('/weekly-trend', hasPermission('attendance.read'), ctrl.getWeeklyTrend);
router.get('/department-wise', hasPermission('attendance.read'), ctrl.getDepartmentWise);
router.get('/monthly', hasPermission('attendance.read'), ctrl.getMonthlyData);

router.post('/', hasPermission('attendance.write'), ctrl.markAttendance);
router.post('/bulk', hasPermission('attendance.write'), ctrl.bulkMark);

module.exports = router;
