const router = require('express').Router();
const ctrl = require('../controllers/activityLog.controller');
const { authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { authorize } = require('../middleware/role');

router.use(authenticate, tenantMiddleware);

router.get('/', authorize('super_admin', 'tenant_admin'), ctrl.getAll);
router.get('/:entityType/:entityId', authorize('super_admin', 'tenant_admin'), ctrl.getByEntity);

module.exports = router;
