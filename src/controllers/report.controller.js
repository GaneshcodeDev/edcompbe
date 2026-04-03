const { Op } = require('sequelize');
const { Attendance, Employee, Department, Designation } = require('../models');
const ApiResponse = require('../utils/apiResponse');

exports.attendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, departmentId, status } = req.query;
    const where = { tenant_id: req.tenantId };
    if (startDate && endDate) where.date = { [Op.between]: [startDate, endDate] };
    if (status) where.status = status;

    const empWhere = { tenant_id: req.tenantId };
    if (departmentId) empWhere.department_id = departmentId;

    const records = await Attendance.findAll({
      where,
      include: [{
        model: Employee, as: 'employee', where: empWhere,
        attributes: ['employee_code', 'first_name', 'last_name', 'department_id'],
        include: [{ model: Department, as: 'department', attributes: ['name'] }],
      }],
      order: [['date', 'DESC']],
    });

    const data = records.map(r => ({
      date: r.date,
      employeeCode: r.employee.employee_code,
      employeeName: `${r.employee.first_name} ${r.employee.last_name}`,
      department: r.employee.department?.name || '',
      status: r.status,
      checkIn: r.check_in || '-',
      checkOut: r.check_out || '-',
      workHours: r.work_hours || 0,
    }));

    return ApiResponse.success(res, { data });
  } catch (error) { next(error); }
};

exports.employeeReport = async (req, res, next) => {
  try {
    const { departmentId, status } = req.query;
    const where = { tenant_id: req.tenantId };
    if (departmentId) where.department_id = departmentId;
    if (status) where.status = status;

    const employees = await Employee.findAll({
      where,
      include: [
        { model: Department, as: 'department', attributes: ['name'] },
        { model: Designation, as: 'designation', attributes: ['name'] },
      ],
      order: [['first_name', 'ASC']],
    });

    const data = employees.map(e => ({
      employeeCode: e.employee_code,
      name: `${e.first_name} ${e.last_name}`,
      department: e.department?.name || '',
      designation: e.designation?.name || '',
      dateOfJoining: e.date_of_joining,
      status: e.status,
      email: e.email,
      phone: e.phone,
    }));

    return ApiResponse.success(res, { data });
  } catch (error) { next(error); }
};
