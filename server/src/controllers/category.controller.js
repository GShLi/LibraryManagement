const { Category } = require('../models');
const { success } = require('../utils/response');

exports.getTree = async (req, res, next) => {
  try {
    const { parentCode, flat } = req.query;

    const categories = await Category.findAll({
      order: [['sort_order', 'ASC'], ['code', 'ASC']],
      raw: true
    });

    if (flat === 'true' || flat === '1') {
      return success(res, { list: categories });
    }

    const rootParentId = parentCode
      ? (await Category.findOne({ where: { code: parentCode }, attributes: ['id'], raw: true }))?.id || null
      : null;

    const buildTree = (parentId) => {
      return categories
        .filter(cat => cat.parent_id === parentId)
        .map(cat => ({
          id: cat.id,
          code: cat.code,
          name: cat.name,
          level: cat.level,
          children: buildTree(cat.id)
        }));
    };

    const tree = buildTree(rootParentId);
    success(res, { list: tree });
  } catch (err) {
    next(err);
  }
};
