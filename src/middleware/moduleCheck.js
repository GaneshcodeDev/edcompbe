const { AppModule, Tenant } = require('../models');
const ApiError = require('../utils/apiError');

/**
 * Module Check Middleware
 *
 * 1. Checks if the module is globally enabled (app_modules.is_active)
 * 2. Checks if the tenant has the module in their enabledModules config
 *
 * Usage: router.use(requireModule('attendance'))
 */
const requireModule = (moduleCode) => {
  return async (req, res, next) => {
    try {
      // 1. Check global module status
      const appModule = await AppModule.findOne({ where: { code: moduleCode } });
      if (!appModule || !appModule.is_active) {
        return res.status(403).json({
          success: false,
          error: 'MODULE_DISABLED',
          message: `The "${moduleCode}" module is currently disabled by the administrator. Please contact your system admin to enable it.`,
        });
      }

      // 2. Check tenant-level module access
      if (req.tenantId) {
        const tenant = req.tenant || await Tenant.findByPk(req.tenantId);
        if (tenant) {
          const enabledModules = tenant.config?.enabledModules || [];
          // Super admin bypasses tenant module check
          if (req.user?.role !== 'super_admin' && !enabledModules.includes(moduleCode)) {
            return res.status(403).json({
              success: false,
              error: 'MODULE_NOT_AVAILABLE',
              message: `The "${moduleCode}" module is not available for your organization. Please contact your administrator.`,
            });
          }
        }
      }

      // Attach module info to request
      req.activeModule = appModule;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { requireModule };
