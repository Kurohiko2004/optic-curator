const Joi = require('joi');

const getGlassesSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    // Update to match requested values: 9, 18, 27
    items: Joi.number().integer().valid(9, 18, 27).default(9),
    
    // Tìm kiếm theo tên kính
    search: Joi.string().max(100).optional().allow('', null),
    
    // Lọc theo hình dạng và giá
    glassesShapeId: Joi.number().integer().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    
    // Sắp xếp
    sortBy: Joi.string().valid('price', 'name', 'createdAt').default('price'),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('ASC')
});

module.exports = { getGlassesSchema };
