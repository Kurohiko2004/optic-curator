const db = require('../models/index.js');

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {number} userId ID người dùng
 * @param {number} glassesId ID kính
 * @param {number} quantity Số lượng
 */
const addItemToCart = async (userId, glassesId, quantity = 1) => {
    // 1. Tìm giỏ hàng của user
    const cart = await db.Cart.findOne({ where: { userId } });
    if (!cart) {
        throw new Error('Không tìm thấy giỏ hàng của người dùng');
    }

    // 2. Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    let cartItem = await db.CartItem.findOne({
        where: {
            cartId: cart.id,
            glassesId: glassesId
        }
    });

    if (cartItem) {
        // Nếu đã có thì cộng dồn số lượng
        cartItem.quantity += quantity;
        await cartItem.save();
    } else {
        // Nếu chưa có thì tạo mới
        cartItem = await db.CartItem.create({
            cartId: cart.id,
            glassesId: glassesId,
            quantity: quantity
        });
    }

    return cartItem;
};

/**
 * Lấy nội dung giỏ hàng của user
 */
const getCartByUserId = async (userId) => {
    return await db.Cart.findOne({
        where: { userId },
        include: [
            {
                model: db.CartItem,
                as: 'cartItems',
                include: [
                    {
                        model: db.Glasses,
                        as: 'glasses',
                        attributes: ['id', 'name', 'price', 'image']
                    }
                ]
            }
        ]
    });
};

module.exports = {
    addItemToCart,
    getCartByUserId
};
