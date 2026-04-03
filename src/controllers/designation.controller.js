const crypto = require('crypto');
const { Designation } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { logAction } = require('../services/auditLogger');

exports.getAll = async (req, res, next) => {
  try {
    const data = await Designation.findAll({
      where: { tenant_id: req.tenantId },
      order: [['level', 'ASC']],
    });
    return ApiResponse.success(res, { data });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, code, level, is_active } = req.body;
    const desg = await Designation.create({
      id: crypto.randomUUID(), tenant_id: req.tenantId, name, code, level: level || 1, is_active: is_active !== false,
    });
    await logAction(req, 'create', 'masters', 'designation', desg.id, desg.name, 'Created designation ' + desg.name);
    return ApiResponse.created(res, { data: desg });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const desg = await Designation.findOne({ where: { id: req.params.id, tenant_id: req.tenantId } });
    if (!desg) throw ApiError.notFound('Designation not found');
    await desg.update(req.body);
    await logAction(req, 'update', 'masters', 'designation', desg.id, desg.name, 'Updated designation ' + desg.name);
    return ApiResponse.success(res, { data: desg }, 'Designation updated');
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const desg = await Designation.findOne({ where: { id: req.params.id, tenant_id: req.tenantId } });
    if (!desg) throw ApiError.notFound('Designation not found');
    await desg.destroy();
    await logAction(req, 'delete', 'masters', 'designation', req.params.id, null, 'Deleted designation');
    return ApiResponse.success(res, {}, 'Designation deleted');
  } catch (error) { next(error); }
};
