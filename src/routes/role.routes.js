const router = require('express').Router();
const ctrl = require('../controllers/role.controller');
const { authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { authorize } = require('../middleware/role');

router.use(authenticate, tenantMiddleware, authorize('super_admin', 'tenant_admin'));

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
