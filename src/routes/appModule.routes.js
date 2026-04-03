const router = require('express').Router();
const ctrl = require('../controllers/appModule.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(authenticate, authorize('super_admin'));

router.get('/', ctrl.getAll);
router.put('/:id', ctrl.update);

module.exports = router;
