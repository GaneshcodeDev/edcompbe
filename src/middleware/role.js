const ApiError = require('../utils/apiError');

/**
 * Role-Based Access Control (RBAC) Middleware Factory
 *
 * Usage: authorize('super_admin', 'tenant_admin')
 * Only users with the specified roles can proceed
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(
        `Role '${req.user.role}' is not authorized. Required: ${allowedRoles.join(', ')}`
      ));
    }

    next();
  };
};

/**
 * Permission-Based Access Control Middleware Factory
 *
 * Usage: hasPermission('employee.write')
 * Checks user role against permission matrix
 */
const PERMISSION_MATRIX = {
  super_admin: [
    'employee.read', 'employee.write',
    'attendance.read', 'attendance.write',
    'config.manage',
    'reports.view', 'reports.export',
    'masters.manage',
    'offboarding.manage',
  ],
  tenant_admin: [
    'employee.read', 'employee.write',
    'attendance.read', 'attendance.write',
    'reports.view', 'reports.export',
    'masters.manage',
    'offboarding.manage',
  ],
  hr_manager: [
    'employee.read', 'employee.write',
    'attendance.read', 'attendance.write',
    'reports.view',
    'offboarding.manage',
  ],
  employee: [
    'attendance.read',
  ],
};

const hasPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const userPermissions = PERMISSION_MATRIX[req.user.role] || [];
    const hasAll = requiredPermissions.every(p => userPermissions.includes(p));

    if (!hasAll) {
      return next(ApiError.forbidden(
        `Missing permissions: ${requiredPermissions.filter(p => !userPermissions.includes(p)).join(', ')}`
      ));
    }

    next();
  };
};

module.exports = { authorize, hasPermission };
