const crypto = require('crypto');
const { Department } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { logAction } = require('../services/auditLogger');

exports.getAll = async (req, res, next) => {
  try {
    const data = await Department.findAll({
      where: { tenant_id: req.tenantId },
      order: [['name', 'ASC']],
    });
    return ApiResponse.success(res, { data });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, code, is_active } = req.body;
    const existing = await Department.findOne({ where: { tenant_id: req.tenantId, code } });
    if (existing) throw ApiError.conflict('Department code already exists');

    const dept = await Department.create({
      id: crypto.randomUUID(), tenant_id: req.tenantId, name, code, is_active: is_active !== false,
    });
    await logAction(req, 'create', 'masters', 'department', dept.id, dept.name, 'Created department ' + dept.name + ' (' + dept.code + ')');
    return ApiResponse.created(res, { data: dept });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const dept = await Department.findOne({ where: { id: req.params.id, tenant_id: req.tenantId } });
    if (!dept) throw ApiError.notFound('Department not found');
    await dept.update(req.body);
    await logAction(req, 'update', 'masters', 'department', dept.id, dept.name, 'Updated department ' + dept.name);
    return ApiResponse.success(res, { data: dept }, 'Department updated');
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const dept = await Department.findOne({ where: { id: req.params.id, tenant_id: req.tenantId } });
    if (!dept) throw ApiError.notFound('Department not found');
    await dept.destroy();
    await logAction(req, 'delete', 'masters', 'department', req.params.id, null, 'Deleted department');
    return ApiResponse.success(res, {}, 'Department deleted');
  } catch (error) { next(error); }
};
