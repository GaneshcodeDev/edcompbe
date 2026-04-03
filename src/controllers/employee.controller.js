const crypto = require('crypto');
const { Op } = require('sequelize');
const { Employee, Department, Designation, Shift } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { logAction } = require('../services/auditLogger');

exports.getAll = async (req, res, next) => {
  try {
    const { search, departmentId, status, page = 1, pageSize = 20, sortBy = 'created_at', sortDir = 'DESC' } = req.query;

    const where = { tenant_id: req.tenantId };
    if (departmentId) where.department_id = departmentId;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { employee_code: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Employee.findAndCountAll({
      where,
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name', 'code'] },
        { model: Designation, as: 'designation', attributes: ['id', 'name', 'code'] },
        { model: Shift, as: 'defaultShift', attributes: ['id', 'name', 'code'] },
      ],
      order: [[sortBy, sortDir.toUpperCase()]],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
    });

    return ApiResponse.paginated(res, { data: rows, total: count, page, pageSize });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      where: { id: req.params.id, tenant_id: req.tenantId },
      include: [
        { model: Department, as: 'department' },
        { model: Designation, as: 'designation' },
        { model: Shift, as: 'defaultShift' },
      ],
    });
    if (!employee) throw ApiError.notFound('Employee not found');
    return ApiResponse.success(res, { data: employee });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = req.body;

    // Check duplicate employee_code within tenant
    const existing = await Employee.findOne({
      where: { tenant_id: req.tenantId, employee_code: data.employee_code },
    });
    if (existing) throw ApiError.conflict('Employee code already exists in this tenant');

    const employee = await Employee.create({
      id: crypto.randomUUID(),
      tenant_id: req.tenantId,
      ...data,
    });

    await logAction(req, 'create', 'employees', 'employee', employee.id,
      `${employee.first_name} ${employee.last_name}`,
      `Created employee ${employee.first_name} ${employee.last_name} (${employee.employee_code})`);

    return ApiResponse.created(res, { data: employee });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      where: { id: req.params.id, tenant_id: req.tenantId },
    });
    if (!employee) throw ApiError.notFound('Employee not found');

    const oldValues = { first_name: employee.first_name, last_name: employee.last_name, status: employee.status, department_id: employee.department_id, designation_id: employee.designation_id };
    await employee.update(req.body);
    await logAction(req, 'update', 'employees', 'employee', employee.id,
      `${employee.first_name} ${employee.last_name}`,
      `Updated employee ${employee.first_name} ${employee.last_name}`,
      oldValues, req.body);
    return ApiResponse.success(res, { data: employee }, 'Employee updated');
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      where: { id: req.params.id, tenant_id: req.tenantId },
    });
    if (!employee) throw ApiError.notFound('Employee not found');

    await employee.update({ status: 'inactive' });
    await logAction(req, 'delete', 'employees', 'employee', employee.id,
      `${employee.first_name} ${employee.last_name}`,
      `Deleted employee ${employee.first_name} ${employee.last_name} (${employee.employee_code})`);
    return ApiResponse.success(res, {}, 'Employee deactivated');
  } catch (error) {
    next(error);
  }
};

exports.getCount = async (req, res, next) => {
  try {
    const count = await Employee.count({
      where: { tenant_id: req.tenantId, status: 'active' },
    });
    return ApiResponse.success(res, { count });
  } catch (error) {
    next(error);
  }
};
