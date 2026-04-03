const crypto = require('crypto');
const { Shift } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { logAction } = require('../services/auditLogger');

exports.getAll = async (req, res, next) => {
  try {
    const data = await Shift.findAll({ where: { tenant_id: req.tenantId }, order: [['name', 'ASC']] });
    return ApiResponse.success(res, { data });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, code, start_time, end_time, grace_minutes, is_default } = req.body;
    const shift = await Shift.create({
      id: crypto.randomUUID(), tenant_id: req.tenantId, name, code, start_time, end_time, grace_minutes: grace_minutes || 15, is_default: is_default || false,
    });
    await logAction(req, 'create', 'attendance', 'shift', shift.id, shift.name,
      `Created shift ${shift.name} (${shift.code})`);
    return ApiResponse.created(res, { data: shift });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const shift = await Shift.findOne({ where: { id: req.params.id, tenant_id: req.tenantId } });
    if (!shift) throw ApiError.notFound('Shift not found');
    const oldName = shift.name;
    await shift.update(req.body);
    await logAction(req, 'update', 'attendance', 'shift', shift.id, shift.name,
      `Updated shift ${oldName}`, { name: oldName }, req.body);
    return ApiResponse.success(res, { data: shift }, 'Shift updated');
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const shift = await Shift.findOne({ where: { id: req.params.id, tenant_id: req.tenantId } });
    if (!shift) throw ApiError.notFound('Shift not found');
    await shift.destroy();
    await logAction(req, 'delete', 'attendance', 'shift', req.params.id, shift.name,
      `Deleted shift ${shift.name} (${shift.code})`);
    return ApiResponse.success(res, {}, 'Shift deleted');
  } catch (error) { next(error); }
};
