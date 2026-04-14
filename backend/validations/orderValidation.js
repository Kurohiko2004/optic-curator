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

module.exports = {
    createOrderSchema
};
