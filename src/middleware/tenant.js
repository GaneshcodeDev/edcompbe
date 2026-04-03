const ApiError = require('../utils/apiError');
const { Tenant } = require('../models');

/**
 * Multi-Tenant Isolation Middleware
 *
 * - Super admin can switch tenants via X-Tenant-Id header
 * - Other users are locked to their own tenant
 * - Validates tenant exists and is active
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    let tenantId;

    if (req.user.role === 'super_admin') {
      // Super admin can access any tenant via header
      tenantId = req.headers['x-tenant-id'] || req.user.tenantId;
    } else {
      // Other roles are restricted to their own tenant
      tenantId = req.user.tenantId;

      // Prevent tenant spoofing
      if (req.headers['x-tenant-id'] && req.headers['x-tenant-id'] !== tenantId) {
        return next(ApiError.forbidden('Cannot access another tenant\'s data'));
      }
    }

    if (!tenantId) {
      return next(ApiError.badRequest('Tenant ID is required'));
    }

    // Validate tenant exists and is active
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      return next(ApiError.notFound('Tenant not found'));
    }
    if (!tenant.is_active && req.user.role !== 'super_admin') {
      return next(new ApiError('Tenant account is inactive', 403, 'TENANT_INACTIVE'));
    }

    // Attach tenant context
    req.tenantId = tenantId;
    req.tenant = tenant;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { tenantMiddleware };
