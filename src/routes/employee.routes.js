const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/employee.controller');
const { authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { authorize, hasPermission } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { requireModule } = require('../middleware/moduleCheck');

router.use(authenticate, tenantMiddleware, requireModule('employees'));

router.get('/', hasPermission('employee.read'), ctrl.getAll);
router.get('/count', hasPermission('employee.read'), ctrl.getCount);
router.get('/:id', hasPermission('employee.read'), ctrl.getById);

router.post('/', hasPermission('employee.write'), [
  body('employee_code').notEmpty().withMessage('Employee code is required'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('department_id').notEmpty().withMessage('Department is required'),
  body('designation_id').notEmpty().withMessage('Designation is required'),
  body('date_of_joining').notEmpty().withMessage('Date of joining is required'),
  validate,
], ctrl.create);

router.put('/:id', hasPermission('employee.write'), ctrl.update);
router.delete('/:id', hasPermission('employee.write'), ctrl.delete);

module.exports = router;
