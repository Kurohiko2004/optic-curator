const Joi = require('joi');

const getGlassesSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    items: Joi.number().integer().valid(12, 24, 60).default(12),
    
    // Tìm kiếm theo tên kính
    search: Joi.string().max(100).optional().allow('', null),
    
    // Lọc theo hình dạng và giá
    glassesShapeId: Joi.number().integer().optional(),
    colorIds: Joi.string().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    
    // Sắp xếp
    sortBy: Joi.string().valid('id', 'price', 'name', 'createdAt').default('id'),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('ASC')
});

module.exports = { getGlassesSchema };
