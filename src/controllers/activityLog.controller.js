const { Op } = require('sequelize');
const { ActivityLog } = require('../models');
const ApiResponse = require('../utils/apiResponse');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 25, module, action, entity_type, user_id, startDate, endDate, search } = req.query;
    const where = {};

    // Super admin sees all (including system-level logs); others see only their tenant
    if (req.user.role !== 'super_admin') {
      where.tenant_id = req.tenantId;
    } else if (req.tenantId) {
      // Super admin: show tenant-specific + system-level (null tenant) logs
      where.tenant_id = { [Op.or]: [req.tenantId, null] };
    }

    if (module) where.module = module;
    if (action) where.action = action;
    if (entity_type) where.entity_type = entity_type;
    if (user_id) where.user_id = user_id;
    if (startDate && endDate) {
      where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')] };
    } else if (startDate) {
      where.created_at = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.created_at = { [Op.lte]: new Date(endDate + 'T23:59:59') };
    }
    if (search) {
      where[Op.or] = [
        { description: { [Op.like]: `%${search}%` } },
        { entity_name: { [Op.like]: `%${search}%` } },
        { user_name: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset,
    });

    return ApiResponse.paginated(res, { data: rows, total: count, page, pageSize });
  } catch (error) {
    next(error);
  }
};

exports.getByEntity = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    const logs = await ActivityLog.findAll({
      where: { entity_type: entityType, entity_id: entityId },
      order: [['created_at', 'DESC']],
      limit: 50,
    });
    return ApiResponse.success(res, { data: logs });
  } catch (error) {
    next(error);
  }
};
