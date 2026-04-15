const bcrypt = require('bcrypt');
const db = require('../models/index.js');
const { User, Cart, Role } = db;

const findUserByEmail = async (email) => {
    return await User.findOne({ 
        where: { email },
        include: [{ model: Role, as: 'role' }]
    });
};

const findUserById = async (id) => {
    return await User.findByPk(id, {
        include: [{ model: Role, as: 'role' }]
    });
};

const comparePasswords = async (candidatePassword, userPassword) => {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const createUser = async (userData) => {
    const { username, email, password, roleId } = userData;

    // Kiểm tra xem email đã tồn tại chưa
    if (await findUserByEmail(email)) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
    }

    // 1. Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 12);

    // 2. Tạo User mới
    const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        roleId: roleId || 2 // Mặc định là khách hàng
    });

    // 3. TẠO GIỎ HÀNG TRỐNG
    await Cart.create({ userId: newUser.id });
    return newUser;
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    comparePasswords
};
