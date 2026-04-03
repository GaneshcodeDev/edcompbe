const router = require('express').Router();
const ctrl = require('../controllers/menu.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', authenticate, ctrl.getAll);
router.put('/:id', authenticate, authorize('super_admin'), ctrl.update);

module.exports = router;
