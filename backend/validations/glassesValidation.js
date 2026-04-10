const Joi = require('joi');

const getGlassesSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    items: Joi.number().integer().valid(5, 10, 15, 20).default(10),
    
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
