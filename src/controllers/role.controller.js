const crypto = require('crypto');
const { Role } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

exports.getAll = async (req, res, next) => {
  try {
    const data = await Role.findAll({ where: { tenant_id: req.tenantId }, order: [['name', 'ASC']] });
    return ApiResponse.success(res, { data });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const role = await Role.create({
      id: crypto.randomUUID(), tenant_id: req.tenantId, ...req.body, is_system: false,
    });
    return ApiResponse.created(res, { data: role });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const role = await Role.findOne({ where: { id: req.params.id, tenant_id: req.tenantId } });
    if (!role) throw ApiError.notFound('Role not found');
    await role.update(req.body);
    return ApiResponse.success(res, { data: role }, 'Role updated');
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const role = await Role.findOne({ where: { id: req.params.id, tenant_id: req.tenantId } });
    if (!role) throw ApiError.notFound('Role not found');
    if (role.is_system) throw ApiError.forbidden('Cannot delete system roles');
    await role.destroy();
    return ApiResponse.success(res, {}, 'Role deleted');
  } catch (error) { next(error); }
};
