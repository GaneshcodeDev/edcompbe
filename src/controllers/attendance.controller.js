const crypto = require('crypto');
const { Op } = require('sequelize');
const { Attendance, Employee, Department, Shift, sequelize } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { logAction } = require('../services/auditLogger');

exports.getByDate = async (req, res, next) => {
  try {
    const { date, employeeId, status } = req.query;
    if (!date) throw ApiError.validation('Date parameter is required');

    const where = { tenant_id: req.tenantId, date };
    if (employeeId) where.employee_id = employeeId;
    if (status) where.status = status;

    const records = await Attendance.findAll({
      where,
      include: [
        { model: Employee, as: 'employee', attributes: ['id', 'employee_code', 'first_name', 'last_name', 'department_id'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return ApiResponse.success(res, { data: records });
  } catch (error) {
    next(error);
  }
};

exports.getByEmployee = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { employee_id: req.params.employeeId, tenant_id: req.tenantId };
    if (startDate) where.date = { ...where.date, [Op.gte]: startDate };
    if (endDate) where.date = { ...where.date, [Op.lte]: endDate };

    const records = await Attendance.findAll({ where, order: [['date', 'DESC']] });
    return ApiResponse.success(res, { data: records });
  } catch (error) {
    next(error);
  }
};

exports.markAttendance = async (req, res, next) => {
  try {
    const { employee_id, date, status, check_in, check_out, remarks, source } = req.body;

    // Upsert - update if exists for same employee+date
    const existing = await Attendance.findOne({
      where: { employee_id, date, tenant_id: req.tenantId },
    });

    let record;
    if (existing) {
      await existing.update({ status, check_in, check_out, remarks, source: source || 'manual' });
      record = existing;
    } else {
      // Calculate work hours
      let workHours = 0;
      if (check_in && check_out) {
        const [inH, inM] = check_in.split(':').map(Number);
        const [outH, outM] = check_out.split(':').map(Number);
        workHours = Math.round(((outH * 60 + outM) - (inH * 60 + inM)) / 60 * 10) / 10;
      }

      record = await Attendance.create({
        id: crypto.randomUUID(),
        tenant_id: req.tenantId,
        employee_id, date, status, check_in, check_out,
        work_hours: workHours,
        overtime: workHours > 8.5 ? Math.round((workHours - 8.5) * 10) / 10 : 0,
        remarks,
        source: source || 'manual',
      });
    }

    await logAction(req, existing ? 'update' : 'create', 'attendance', 'attendance', record.id,
      null, `${existing ? 'Updated' : 'Marked'} attendance for employee ${employee_id} on ${date} as ${status}`);

    return ApiResponse.success(res, { data: record }, existing ? 'Attendance updated' : 'Attendance recorded');
  } catch (error) {
    next(error);
  }
};

exports.bulkMark = async (req, res, next) => {
  try {
    const { date, records } = req.body;
    if (!date || !records || !records.length) throw ApiError.validation('Date and records required');

    const results = [];
    for (const rec of records) {
      const existing = await Attendance.findOne({
        where: { employee_id: rec.employee_id, date, tenant_id: req.tenantId },
      });

      if (existing) {
        await existing.update({ status: rec.status, check_in: rec.check_in, check_out: rec.check_out });
        results.push(existing);
      } else {
        const created = await Attendance.create({
          id: crypto.randomUUID(),
          tenant_id: req.tenantId,
          employee_id: rec.employee_id,
          date, status: rec.status,
          check_in: rec.check_in, check_out: rec.check_out,
          source: 'manual',
        });
        results.push(created);
      }
    }

    await logAction(req, 'bulk_create', 'attendance', 'attendance', null,
      null, `Bulk marked attendance for ${results.length} employees on ${date}`);

    return ApiResponse.success(res, { data: results, count: results.length }, 'Bulk attendance saved');
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = req.query.date || new Date().toISOString().split('T')[0];
    const tenantId = req.tenantId;

    const totalEmployees = await Employee.count({ where: { tenant_id: tenantId, status: 'active' } });
    const records = await Attendance.findAll({ where: { tenant_id: tenantId, date: today } });

    const presentToday = records.filter(r => r.status === 'present').length;
    const absentToday = records.filter(r => r.status === 'absent').length;
    const lateToday = records.filter(r => r.status === 'late').length;
    const onLeave = records.filter(r => ['leave', 'half_day'].includes(r.status)).length;
    const attendanceRate = totalEmployees > 0 ? Math.round(((presentToday + lateToday) / totalEmployees) * 100) : 0;

    // --- Trends: compare today vs same day last week ---
    const lastWeekDate = new Date(today);
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const lwDateStr = lastWeekDate.toISOString().split('T')[0];
    const lwRecords = await Attendance.findAll({ where: { tenant_id: tenantId, date: lwDateStr } });
    const lwPresent = lwRecords.filter(r => r.status === 'present').length;
    const lwAbsent = lwRecords.filter(r => r.status === 'absent').length;
    const lwLate = lwRecords.filter(r => r.status === 'late').length;

    const calcTrend = (curr, prev) => prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100 * 10) / 10;

    // --- Quick Stats ---
    // Avg work hours (from today's records with actual hours)
    const workedRecords = records.filter(r => r.work_hours > 0);
    const avgWorkHours = workedRecords.length > 0
      ? Math.round((workedRecords.reduce((sum, r) => sum + parseFloat(r.work_hours || 0), 0) / workedRecords.length) * 10) / 10
      : 0;

    // On-time rate (present / (present + late)) * 100
    const onTimeRate = (presentToday + lateToday) > 0
      ? Math.round((presentToday / (presentToday + lateToday)) * 100)
      : 0;

    // Upcoming holidays (next 30 days)
    const { Holiday } = require('../models');
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 30);
    const upcomingHolidays = await Holiday.count({
      where: { tenant_id: tenantId, date: { [Op.between]: [today, futureDate.toISOString().split('T')[0]] } },
    });

    // Pending offboarding
    const { Offboarding } = require('../models');
    const pendingOffboarding = await Offboarding.count({
      where: { tenant_id: tenantId, status: { [Op.in]: ['initiated', 'in_progress'] } },
    });

    return ApiResponse.success(res, {
      data: {
        totalEmployees, presentToday, absentToday, lateToday, onLeave, attendanceRate,
        trends: {
          employees: 0, // employees don't have a weekly trend
          present: calcTrend(presentToday, lwPresent),
          absent: calcTrend(absentToday, lwAbsent),
          late: calcTrend(lateToday, lwLate),
        },
        quickStats: {
          avgWorkHours,
          onTimeRate,
          upcomingHolidays,
          pendingOffboarding,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getWeeklyTrend = async (req, res, next) => {
  try {
    const labels = [];
    const presentData = [];
    const absentData = [];
    const lateData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));

      const records = await Attendance.findAll({
        where: { tenant_id: req.tenantId, date: dateStr },
      });

      presentData.push(records.filter(r => r.status === 'present').length);
      absentData.push(records.filter(r => r.status === 'absent').length);
      lateData.push(records.filter(r => r.status === 'late').length);
    }

    return ApiResponse.success(res, {
      data: {
        labels,
        datasets: [
          { label: 'Present', data: presentData, borderColor: '#10B981' },
          { label: 'Absent', data: absentData, borderColor: '#EF4444' },
          { label: 'Late', data: lateData, borderColor: '#F59E0B' },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getDepartmentWise = async (req, res, next) => {
  try {
    const departments = await Department.findAll({ where: { tenant_id: req.tenantId, is_active: true } });
    const labels = [];
    const data = [];

    for (const dept of departments) {
      const count = await Employee.count({
        where: { tenant_id: req.tenantId, department_id: dept.id, status: 'active' },
      });
      if (count > 0) {
        labels.push(dept.name);
        data.push(count);
      }
    }

    return ApiResponse.success(res, {
      data: {
        labels,
        datasets: [{
          label: 'Employees',
          data,
          backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6'],
        }],
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlyData = async (req, res, next) => {
  try {
    const today = new Date();
    const labels = [];
    const presentData = [];
    const absentData = [];

    // Last 8 days
    for (let i = 7; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      labels.push(dayLabel);

      const records = await Attendance.findAll({
        where: { tenant_id: req.tenantId, date: dateStr },
      });

      presentData.push(records.filter(r => ['present', 'late'].includes(r.status)).length);
      absentData.push(records.filter(r => r.status === 'absent').length);
    }

    return ApiResponse.success(res, {
      data: {
        labels,
        datasets: [
          { label: 'Present', data: presentData, backgroundColor: '#4F46E5' },
          { label: 'Absent', data: absentData, backgroundColor: '#EF4444' },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};
