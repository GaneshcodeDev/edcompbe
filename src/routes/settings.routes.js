const router = require('express').Router();
const ctrl = require('../controllers/settings.controller');
const { authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');

router.use(authenticate, tenantMiddleware);

router.get('/theme', ctrl.getTheme);
router.put('/theme', ctrl.updateTheme);
router.get('/active-modules', ctrl.getActiveModules);

module.exports = router;
