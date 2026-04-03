const { Tenant, AppModule } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

exports.getTheme = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByPk(req.tenantId);
    if (!tenant) throw ApiError.notFound('Tenant not found');
    return ApiResponse.success(res, { data: tenant.config?.theme || {} });
  } catch (error) { next(error); }
};

// Get effective modules for current tenant (sidebar uses this)
exports.getActiveModules = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByPk(req.tenantId);
    if (!tenant) throw ApiError.notFound('Tenant not found');

    const allModules = await AppModule.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
    const tenantEnabled = tenant.config?.enabledModules || [];

    // Super admin sees all globally active modules
    const isSuperAdmin = req.user?.role === 'super_admin';
    const effectiveModules = isSuperAdmin
      ? allModules.map(m => m.code)
      : allModules.filter(m => tenantEnabled.includes(m.code)).map(m => m.code);

    return ApiResponse.success(res, { data: effectiveModules });
  } catch (error) { next(error); }
};

exports.updateTheme = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByPk(req.tenantId);
    if (!tenant) throw ApiError.notFound('Tenant not found');

    const config = { ...tenant.config, theme: req.body };
    await tenant.update({ config });

    return ApiResponse.success(res, { data: config.theme }, 'Theme updated');
  } catch (error) { next(error); }
};
