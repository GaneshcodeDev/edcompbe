const router = require('express').Router();
const ctrl = require('../controllers/tenant.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All tenant routes require super_admin
router.use(authenticate, authorize('super_admin'));

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/modules', ctrl.getModules);
router.put('/:id/modules', ctrl.updateModules);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
