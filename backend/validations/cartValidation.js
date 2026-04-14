const Joi = require('joi');

const addToCartSchema = Joi.object({
    glassesId: Joi.number().integer().required().messages({
        'number.base': 'glassesId phải là một số',
        'any.required': 'glassesId là bắt buộc'
    }),
    quantity: Joi.number().integer().min(1).default(1).messages({
        'number.base': 'quantity phải là một số',
        'number.min': 'Số lượng (quantity) phải lớn hơn 0'
    })
});

const updateQuantitySchema = Joi.object({
    quantity: Joi.number().integer().min(1).required().messages({
        'number.base': 'quantity phải là một số',
        'number.min': 'Số lượng (quantity) phải lớn hơn 0',
        'any.required': 'quantity là bắt buộc để cập nhật'
    })
});

module.exports = {
    addToCartSchema,
    updateQuantitySchema
};
