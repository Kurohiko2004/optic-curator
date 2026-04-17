const Joi = require('joi');

const createOrderSchema = Joi.object({
    recipientName: Joi.string().required().messages({
        'string.empty': 'Tên người nhận không được để trống',
        'any.required': 'Tên người nhận là bắt buộc'
    }),
    phoneNumber: Joi.string().pattern(/^[0-9]+$/).min(10).max(11).required().messages({
        'string.empty': 'Số điện thoại không được để trống',
        'string.pattern.base': 'Số điện thoại không hợp lệ',
        'string.min': 'Số điện thoại phải từ 10 đến 11 số',
        'string.max': 'Số điện thoại phải từ 10 đến 11 số',
        'any.required': 'Số điện thoại là bắt buộc'
    }),
    shippingAddress: Joi.string().required().messages({
        'string.empty': 'Địa chỉ giao hàng không được để trống',
        'any.required': 'Địa chỉ giao hàng là bắt buộc'
    }),
    paymentMethod: Joi.string().valid('COD', 'VNPAY').default('COD').messages({
        'any.only': 'Phương thức thanh toán hỗ trợ COD hoặc VNPAY'
    })
});

const getMyOrdersSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
        'number.base': 'Trang phải là số',
        'number.min': 'Số trang tối thiểu là 1'
    }),
    limit: Joi.number().integer().valid(10, 20, 30).default(10).messages({
        'any.only': 'Số lượng item mỗi trang phải là 10, 20 hoặc 30'
    })
});

module.exports = {
    createOrderSchema,
    getMyOrdersSchema
};
