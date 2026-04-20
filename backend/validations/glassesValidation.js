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

const createGlassSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().integer().min(0).required(),
    glassesShapeId: Joi.number().integer().required(),
    description: Joi.string().optional().allow(''),
    materialFrame: Joi.string().optional().allow(''),
    lensType: Joi.string().optional().allow(''),
    image: Joi.string().optional().allow(''),
    modelPath: Joi.string().optional().allow(''),
    colorIds: Joi.array().items(Joi.number().integer()).optional()
});

const updateGlassSchema = Joi.object({
    name: Joi.string().optional(),
    price: Joi.number().min(0).optional(),
    stock: Joi.number().integer().min(0).optional(),
    glassesShapeId: Joi.number().integer().optional(),
    description: Joi.string().optional().allow(''),
    materialFrame: Joi.string().optional().allow(''),
    lensType: Joi.string().optional().allow(''),
    image: Joi.string().optional().allow(''),
    modelPath: Joi.string().optional().allow(''),
    colorIds: Joi.array().items(Joi.number().integer()).optional()
});

module.exports = { getGlassesSchema, createGlassSchema, updateGlassSchema };
