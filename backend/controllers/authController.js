const jwt = require('jsonwebtoken');
const authService = require('../services/authService.js');
const asyncHandler = require('../utils/asyncHandlerUtil.js');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

const filterUser = (user) => ({
    id: user.id,
    username: user.username,
    email: user.email
});

const signup = asyncHandler(async (req, res, next) => {
    const { username, email, password, roleId } = req.body;

    // Sử dụng service để tạo User và Giỏ hàng
    const newUser = await authService.createUser({
        username,
        email,
        password,
        roleId
    });

    const token = signToken(newUser.id);

    res.status(201).json({
        success: true,
        token,
        data: {
            user: filterUser(newUser)
        }
    });
});

const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Tìm user qua service
    const user = await authService.findUserByEmail(email);

    // Kiểm tra mật khẩu qua service
    if (!user || !(await authService.comparePasswords(password, user.password))) {
        const error = new Error('Email hoặc mật khẩu không chính xác!');
        error.statusCode = 401;
        return next(error);
    }

    const token = signToken(user.id);

    res.status(200).json({
        success: true,
        token,
        data: {
            user: { id: user.id, username: user.username, email: user.email }
        }
    });
});

module.exports = { signup, login };
