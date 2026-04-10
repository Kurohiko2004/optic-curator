const Joi = require('joi');

const signupSchema = Joi.object({
    username: Joi.string().required().messages({
        'string.empty': 'Username không được để trống',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email không hợp lệ',
        'string.empty': 'Email không được để trống',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
        'string.empty': 'Mật khẩu không được để trống',
    }),
    roleId: Joi.number().integer().optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email không hợp lệ',
        'string.empty': 'Email không được để trống',
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Mật khẩu không được để trống',
    })
});

module.exports = {
    signupSchema,
    loginSchema
};
