const crypto = require('crypto');
const { Tenant, Employee, AppModule } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { logAction } = require('../services/auditLogger');

exports.getAll = async (req, res, next) => {
  try {
    const tenants = await Tenant.findAll({ order: [['created_at', 'DESC']] });
    return ApiResponse.success(res, { data: tenants, total: tenants.length });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) throw ApiError.notFound('Tenant not found');
    return ApiResponse.success(res, { data: tenant });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, code, domain, config, is_active } = req.body;

    const existing = await Tenant.findOne({ where: { code } });
    if (existing) throw ApiError.conflict('Tenant code already exists');

    const tenant = await Tenant.create({
      id: crypto.randomUUID(),
      name, code: code.toUpperCase(), domain, config, is_active: is_active !== false,
    });

    await logAction(req, 'create', 'configuration', 'tenant', tenant.id, tenant.name, 'Created tenant ' + tenant.name + ' (' + tenant.code + ')');
    return ApiResponse.created(res, { data: tenant });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) throw ApiError.notFound('Tenant not found');

    const { name, code, domain, config, is_active, logo } = req.body;
    await tenant.update({ name, code, domain, config, is_active, logo });
    await logAction(req, 'update', 'configuration', 'tenant', tenant.id, tenant.name, 'Updated tenant ' + tenant.name);

    return ApiResponse.success(res, { data: tenant }, 'Tenant updated');
  } catch (error) {
    next(error);
  }
};

// Get enabled modules for a tenant (intersection of global + tenant config)
exports.getModules = async (req, res, next) => {
  try {
    const tenantId = req.tenantId || req.params.id;
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) throw ApiError.notFound('Tenant not found');

    const allModules = await AppModule.findAll({ order: [['name', 'ASC']] });
    const tenantEnabled = tenant.config?.enabledModules || [];

    const data = allModules.map(m => ({
      id: m.id,
      code: m.code,
      name: m.name,
      description: m.description,
      icon: m.icon,
      globallyEnabled: m.is_active,
      enabledForTenant: tenantEnabled.includes(m.code),
      // effective = globally ON + tenant has it
      effective: m.is_active && tenantEnabled.includes(m.code),
    }));

    return ApiResponse.success(res, { data });
  } catch (error) {
    next(error);
  }
};

// Update modules for a tenant
exports.updateModules = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) throw ApiError.notFound('Tenant not found');

    const { enabledModules } = req.body;
    if (!Array.isArray(enabledModules)) throw ApiError.validation('enabledModules must be an array');

    const config = { ...tenant.config, enabledModules };
    await tenant.update({ config });
    await logAction(req, 'assign', 'configuration', 'tenant_modules', req.params.id, null, 'Updated modules for tenant: ' + enabledModules.join(', '));

    return ApiResponse.success(res, { data: { enabledModules } }, 'Tenant modules updated');
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) throw ApiError.notFound('Tenant not found');

    // Soft delete - deactivate
    await tenant.update({ is_active: false });
    await logAction(req, 'delete', 'configuration', 'tenant', tenant.id, tenant.name, 'Deactivated tenant ' + tenant.name);
    return ApiResponse.success(res, {}, 'Tenant deactivated');
  } catch (error) {
    next(error);
  }
};
