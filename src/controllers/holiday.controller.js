const crypto = require('crypto');
const { Holiday } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { logAction } = require('../services/auditLogger');

exports.getAll = async (req, res, next) => {
  try {
    const where = { tenant_id: req.tenantId };
    if (req.query.year) {
      const { Op } = require('sequelize');
      where.date = { [Op.between]: [`${req.query.year}-01-01`, `${req.query.year}-12-31`] };
    }
    const data = await Holiday.findAll({ where, order: [['date', 'ASC']] });
    return ApiResponse.success(res, { data });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const holiday = await Holiday.create({
      id: crypto.randomUUID(), tenant_id: req.tenantId, ...req.body,
    });
    await logAction(req, 'create', 'attendance', 'holiday', holiday.id, holiday.name,
      `Created holiday ${holiday.name} on ${holiday.date}`);
    return ApiResponse.created(res, { data: holiday });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const holiday = await Holiday.findOne({ where: { id: req.params.id, tenant_id: req.tenantId } });
    if (!holiday) throw ApiError.notFound('Holiday not found');
    await holiday.update(req.body);
    await logAction(req, 'update', 'attendance', 'holiday', holiday.id, holiday.name,
      `Updated holiday ${holiday.name}`);
    return ApiResponse.success(res, { data: holiday }, 'Holiday updated');
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const holiday = await Holiday.findOne({ where: { id: req.params.id, tenant_id: req.tenantId } });
    if (!holiday) throw ApiError.notFound('Holiday not found');
    await holiday.destroy();
    await logAction(req, 'delete', 'attendance', 'holiday', req.params.id, holiday.name,
      `Deleted holiday ${holiday.name}`);
    return ApiResponse.success(res, {}, 'Holiday deleted');
  } catch (error) { next(error); }
};
