require('dotenv').config()
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandlerUtil.js');
const authService = require('../services/authService.js');

const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        const error = new Error('Bạn chưa đăng nhập!');
        error.statusCode = 401;
        return next(error);
    }

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra User còn tồn tại không qua service
    const currentUser = await authService.findUserById(decoded.id);
    if (!currentUser) {
        const error = new Error('Người dùng không còn tồn tại!');
        error.statusCode = 401;
        return next(error);
    }

    // Gán user vào request để các API sau sử dụng
    req.user = currentUser;
    next();
});

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Quyền truy cập bị từ chối. Chỉ dành cho quản trị viên.' });
    }
};

module.exports = { protect, admin };
