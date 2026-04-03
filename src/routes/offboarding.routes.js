const router = require('express').Router();
const ctrl = require('../controllers/offboarding.controller');
const { authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { hasPermission } = require('../middleware/role');
const { requireModule } = require('../middleware/moduleCheck');

router.use(authenticate, tenantMiddleware, requireModule('offboarding'));

router.get('/', hasPermission('offboarding.manage'), ctrl.getAll);
router.get('/:id', hasPermission('offboarding.manage'), ctrl.getById);
router.post('/', hasPermission('offboarding.manage'), ctrl.create);
router.put('/:id', hasPermission('offboarding.manage'), ctrl.update);
router.patch('/:id/checklist/:checklistId', hasPermission('offboarding.manage'), ctrl.updateChecklistItem);

module.exports = router;
