const router = require('express').Router();
const ctrl = require('../controllers/shift.controller');
const { authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { hasPermission } = require('../middleware/role');
const { requireModule } = require('../middleware/moduleCheck');

router.use(authenticate, tenantMiddleware, requireModule('attendance'));

router.get('/', hasPermission('attendance.read'), ctrl.getAll);
router.post('/', hasPermission('attendance.write'), ctrl.create);
router.put('/:id', hasPermission('attendance.write'), ctrl.update);
router.delete('/:id', hasPermission('attendance.write'), ctrl.delete);

module.exports = router;
