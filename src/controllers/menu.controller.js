const { MenuItem } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

exports.getAll = async (req, res, next) => {
  try {
    const data = await MenuItem.findAll({
      where: { parent_id: null, is_active: true },
      include: [{
        model: MenuItem, as: 'children',
        where: { is_active: true },
        required: false,
        order: [['sort_order', 'ASC']],
      }],
      order: [['sort_order', 'ASC']],
    });

    // Filter by user role
    const role = req.user?.role;
    const filtered = data
      .filter(item => !role || item.roles.includes(role))
      .map(item => ({
        ...item.toJSON(),
        children: item.children?.filter(c => !role || c.roles.includes(role)) || [],
      }));

    return ApiResponse.success(res, { data: filtered });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) throw ApiError.notFound('Menu item not found');
    await item.update(req.body);
    return ApiResponse.success(res, { data: item }, 'Menu updated');
  } catch (error) { next(error); }
};
