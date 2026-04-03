const crypto = require('crypto');
const { ShiftRoster, Employee, Shift } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

exports.getAll = async (req, res, next) => {
  try {
    const where = { tenant_id: req.tenantId };
    if (req.query.date) where.date = req.query.date;

    const data = await ShiftRoster.findAll({
      where,
      include: [
        { model: Employee, as: 'employee', attributes: ['id', 'employee_code', 'first_name', 'last_name'] },
        { model: Shift, as: 'shift', attributes: ['id', 'name', 'code'] },
      ],
      order: [['date', 'ASC']],
    });
    return ApiResponse.success(res, { data });
  } catch (error) { next(error); }
};

exports.assign = async (req, res, next) => {
  try {
    const { employee_id, shift_id, date, is_override } = req.body;

    // Upsert
    const existing = await ShiftRoster.findOne({
      where: { employee_id, date, tenant_id: req.tenantId },
    });

    let record;
    if (existing) {
      await existing.update({ shift_id, is_override: true });
      record = existing;
    } else {
      record = await ShiftRoster.create({
        id: crypto.randomUUID(), tenant_id: req.tenantId,
        employee_id, shift_id, date, is_override: is_override || false,
      });
    }

    return ApiResponse.success(res, { data: record });
  } catch (error) { next(error); }
};

exports.bulkAssign = async (req, res, next) => {
  try {
    const { employee_ids, shift_id, start_date, end_date } = req.body;
    const results = [];

    const start = new Date(start_date);
    const end = new Date(end_date);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      for (const empId of employee_ids) {
        const existing = await ShiftRoster.findOne({
          where: { employee_id: empId, date: dateStr, tenant_id: req.tenantId },
        });
        if (existing) {
          await existing.update({ shift_id, is_override: true });
          results.push(existing);
        } else {
          const record = await ShiftRoster.create({
            id: crypto.randomUUID(), tenant_id: req.tenantId,
            employee_id: empId, shift_id, date: dateStr, is_override: false,
          });
          results.push(record);
        }
      }
    }

    return ApiResponse.success(res, { data: results, count: results.length }, 'Bulk roster assigned');
  } catch (error) { next(error); }
};
