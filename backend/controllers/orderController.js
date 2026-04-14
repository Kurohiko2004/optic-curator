const orderService = require('../services/orderService');
const asyncHandler = require('../utils/asyncHandlerUtil');

const createOrder = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const orderDetails = req.body;

    const newOrder = await orderService.createOrderFromCart(userId, orderDetails);

    // Kế hoạch tương lai cho VNPAY có thể để ở đây:
    // Nếu orderDetails.paymentMethod === 'VNPAY', ta sẽ 
    // tạo url thanh toán và trả về trong response này.

    res.status(201).json({
        success: true,
        message: 'Đặt hàng thành công',
        data: newOrder
    });
});

const getMyOrders = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const orders = await orderService.getUserOrders(userId);

    res.status(200).json({
        success: true,
        data: orders
    });
});

module.exports = {
    createOrder,
    getMyOrders
};
