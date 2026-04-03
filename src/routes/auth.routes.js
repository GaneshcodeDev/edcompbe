const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
], ctrl.login);

router.get('/me', authenticate, ctrl.me);
router.post('/refresh', ctrl.refresh);
router.post('/logout', authenticate, ctrl.logout);

module.exports = router;
