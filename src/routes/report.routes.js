const router = require('express').Router();
const ctrl = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { hasPermission } = require('../middleware/role');
const { requireModule } = require('../middleware/moduleCheck');

router.use(authenticate, tenantMiddleware, requireModule('reports'));

router.get('/attendance', hasPermission('reports.view'), ctrl.attendanceReport);
router.get('/employees', hasPermission('reports.view'), ctrl.employeeReport);

module.exports = router;
