const db = require('../models/index.js');

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {number} userId ID người dùng
 * @param {number} glassesId ID kính
 * @param {number} quantity Số lượng
 */
const addItemToCart = async (userId, glassesId, quantity = 1) => {
    // 1. Tìm Kính và check hàng tồn kho
    const glasses = await db.Glasses.findByPk(glassesId);
    if (!glasses) {
        let error = new Error('Không tìm thấy sản phẩm');
        error.statusCode = 404;
        throw error;
    }

    // 2. Tìm giỏ hàng của user
    const cart = await db.Cart.findOne({ where: { userId } });
    if (!cart) {
        throw new Error('Không tìm thấy giỏ hàng của người dùng');
    }

    // 3. Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    let cartItem = await db.CartItem.findOne({
        where: {
            cartId: cart.id,
            glassesId: glassesId
        }
    });

    if (cartItem) {
        // Kiểm tra tồn kho khi cộng dồn
        if (cartItem.quantity + quantity > glasses.stock) {
            let error = new Error(`Số lượng vượt quá hàng tồn kho (${glasses.stock} sản phẩm có sẵn)`);
            error.statusCode = 400;
            throw error;
        }
        
        cartItem.quantity += quantity;
        await cartItem.save();
    } else {
        // Kiểm tra tồn kho khi thêm mới
        if (quantity > glasses.stock) {
            let error = new Error(`Số lượng vượt quá hàng tồn kho (${glasses.stock} sản phẩm có sẵn)`);
            error.statusCode = 400;
            throw error;
        }

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
    const cart = await db.Cart.findOne({
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

    if (!cart) return null;

    let totalPrice = 0;
    cart.cartItems.forEach(item => {
        totalPrice += (parseFloat(item.glasses.price) * item.quantity);
    });

    return {
        id: cart.id,
        userId: cart.userId,
        cartItems: cart.cartItems,
        totalPrice: totalPrice,     // Bổ sung Tổng Tiền
        totalItems: cart.cartItems.length
    };
};

const updateItemQuantity = async (userId, cartItemId, quantity) => {
    const item = await db.CartItem.findOne({
        where: { id: cartItemId },
        include: [
            { model: db.Cart, as: 'cart', where: { userId } },
            { model: db.Glasses, as: 'glasses' } // Join để lấy tồn kho
        ]
    });

    if (!item) {
        let error = new Error('Không tìm thấy sản phẩm trong giỏ hàng');
        error.statusCode = 404;
        throw error;
    }

    // Kiểm tra hàng tồn kho
    if (quantity > item.glasses.stock) {
        let error = new Error(`Số lượng vượt quá hàng tồn kho (${item.glasses.stock} sản phẩm có sẵn)`);
        error.statusCode = 400;
        throw error;
    }

    item.quantity = quantity;
    await item.save();
    return item;
};

const removeItemFromCart = async (userId, cartItemId) => {
    const item = await db.CartItem.findOne({
        where: { id: cartItemId },
        include: [{ model: db.Cart, as: 'cart', where: { userId } }]
    });

    if (!item) {
        let error = new Error('Không tìm thấy sản phẩm trong giỏ hàng');
        error.statusCode = 404;
        throw error;
    }

    await item.destroy();
    return true;
};

/**
 * Xóa toàn bộ giỏ hàng
 */
const clearCart = async (userId) => {
    const cart = await db.Cart.findOne({ where: { userId } });
    if (!cart) {
        throw new Error('Không tìm thấy giỏ hàng của người dùng');
    }

    await db.CartItem.destroy({
        where: { cartId: cart.id }
    });

    return true;
};

module.exports = {
    addItemToCart,
    getCartByUserId,
    updateItemQuantity,
    removeItemFromCart,
    clearCart
};
