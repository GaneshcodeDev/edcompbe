const crypto = require('crypto');
const { Offboarding, OffboardingChecklist, Employee } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { logAction } = require('../services/auditLogger');

exports.getAll = async (req, res, next) => {
  try {
    const data = await Offboarding.findAll({
      where: { tenant_id: req.tenantId },
      include: [
        { model: OffboardingChecklist, as: 'checklist' },
        { model: Employee, as: 'employee', attributes: ['id', 'employee_code', 'first_name', 'last_name'] },
      ],
      order: [['initiated_date', 'DESC']],
    });
    return ApiResponse.success(res, { data });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const record = await Offboarding.findOne({
      where: { id: req.params.id, tenant_id: req.tenantId },
      include: [
        { model: OffboardingChecklist, as: 'checklist' },
        { model: Employee, as: 'employee' },
      ],
    });
    if (!record) throw ApiError.notFound('Offboarding record not found');
    return ApiResponse.success(res, { data: record });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { employee_id, last_working_date, reason, checklist } = req.body;
    const obId = crypto.randomUUID();

    const offboarding = await Offboarding.create({
      id: obId, tenant_id: req.tenantId,
      employee_id, initiated_date: new Date().toISOString().split('T')[0],
      last_working_date, reason, status: 'initiated',
    });

    // Create checklist items
    if (checklist && checklist.length) {
      for (const item of checklist) {
        await OffboardingChecklist.create({
          id: crypto.randomUUID(),
          offboarding_id: obId,
          task: item.task,
          assignee: item.assignee,
          is_completed: false,
        });
      }
    }

    // Update employee status
    await Employee.update({ status: 'offboarded' }, { where: { id: employee_id } });

    const result = await Offboarding.findByPk(obId, {
      include: [{ model: OffboardingChecklist, as: 'checklist' }],
    });

    await logAction(req, 'create', 'offboarding', 'offboarding', obId, null, 'Initiated offboarding for employee ' + employee_id);
    return ApiResponse.created(res, { data: result });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const record = await Offboarding.findOne({ where: { id: req.params.id, tenant_id: req.tenantId } });
    if (!record) throw ApiError.notFound('Offboarding record not found');
    await record.update(req.body);
    await logAction(req, 'update', 'offboarding', 'offboarding', record.id, null, 'Updated offboarding status to ' + (req.body.status || 'updated'));
    return ApiResponse.success(res, { data: record }, 'Updated');
  } catch (error) { next(error); }
};

exports.updateChecklistItem = async (req, res, next) => {
  try {
    const item = await OffboardingChecklist.findByPk(req.params.checklistId);
    if (!item) throw ApiError.notFound('Checklist item not found');

    await item.update({
      is_completed: req.body.is_completed,
      completed_date: req.body.is_completed ? new Date().toISOString().split('T')[0] : null,
    });

    await logAction(req, 'update', 'offboarding', 'checklist_item', item.id, item.task, (req.body.is_completed ? 'Completed' : 'Unchecked') + ' checklist item: ' + item.task);
    return ApiResponse.success(res, { data: item }, 'Checklist updated');
  } catch (error) { next(error); }
};
