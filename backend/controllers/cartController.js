const cartService = require('../services/cartService');
const asyncHandler = require('../utils/asyncHandlerUtil');

const addToCart = asyncHandler(async (req, res) => {
    const { glassesId, quantity } = req.body;
    const userId = req.user.id; // Lấy từ authMiddleware

    if (!glassesId) {
        return res.status(400).json({ success: false, message: 'glassesId là bắt buộc' });
    }

    const cartItem = await cartService.addItemToCart(userId, glassesId, quantity);

    res.status(200).json({
        success: true,
        message: 'Đã thêm vào giỏ hàng',
        data: cartItem
    });
});

const getMyCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const cart = await cartService.getCartByUserId(userId);

    res.status(200).json({
        success: true,
        data: cart
    });
});

const updateQuantity = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const cartItemId = req.params.id;
    const userId = req.user.id;

    const item = await cartService.updateItemQuantity(userId, cartItemId, quantity);

    res.status(200).json({
        success: true,
        message: 'Đã cập nhật số lượng',
        data: item
    });
});

const removeFromCart = asyncHandler(async (req, res) => {
    const cartItemId = req.params.id;
    const userId = req.user.id;

    await cartService.removeItemFromCart(userId, cartItemId);

    res.status(200).json({
        success: true,
        message: 'Đã xóa sản phẩm khỏi giỏ hàng'
    });
});

module.exports = {
    addToCart,
    getMyCart,
    updateQuantity,
    removeFromCart
};
