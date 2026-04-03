const router = require('express').Router();
const ctrl = require('../controllers/punchLog.controller');
const { authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { hasPermission } = require('../middleware/role');
const { requireModule } = require('../middleware/moduleCheck');

router.use(authenticate, tenantMiddleware, requireModule('attendance'));
router.get('/', hasPermission('attendance.read'), ctrl.getAll);

module.exports = router;
