const { AppModule } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const { logAction } = require('../services/auditLogger');

exports.getAll = async (req, res, next) => {
  try {
    const data = await AppModule.findAll({ order: [['name', 'ASC']] });
    return ApiResponse.success(res, { data });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const mod = await AppModule.findByPk(req.params.id);
    if (!mod) throw ApiError.notFound('Module not found');
    await mod.update(req.body);
    const wasToggled = req.body.is_active !== undefined;
    await logAction(req, wasToggled ? 'toggle' : 'update', 'configuration', 'app_module', mod.id, mod.name,
      wasToggled ? `${mod.is_active ? 'Enabled' : 'Disabled'} module ${mod.name} globally` : `Updated module ${mod.name}`);
    return ApiResponse.success(res, { data: mod }, 'Module updated');
  } catch (error) { next(error); }
};
