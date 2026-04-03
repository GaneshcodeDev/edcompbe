const router = require('express').Router();
const ctrl = require('../controllers/department.controller');
const { authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { hasPermission } = require('../middleware/role');
const { requireModule } = require('../middleware/moduleCheck');

router.use(authenticate, tenantMiddleware, requireModule('masters'));

router.get('/', hasPermission('masters.manage'), ctrl.getAll);
router.post('/', hasPermission('masters.manage'), ctrl.create);
router.put('/:id', hasPermission('masters.manage'), ctrl.update);
router.delete('/:id', hasPermission('masters.manage'), ctrl.delete);

module.exports = router;
