const { Op } = require('sequelize');
const { PunchLog, Employee } = require('../models');
const ApiResponse = require('../utils/apiResponse');

exports.getAll = async (req, res, next) => {
  try {
    const { date, employeeId, source } = req.query;
    const where = { tenant_id: req.tenantId };

    if (date) {
      where.timestamp = {
        [Op.between]: [`${date}T00:00:00`, `${date}T23:59:59`],
      };
    }
    if (employeeId) where.employee_id = employeeId;
    if (source) where.source = source;

    const data = await PunchLog.findAll({
      where,
      include: [{ model: Employee, as: 'employee', attributes: ['id', 'employee_code', 'first_name', 'last_name'] }],
      order: [['timestamp', 'DESC']],
    });

    return ApiResponse.success(res, { data });
  } catch (error) { next(error); }
};
