const orderService = require('../services/orderService');
const asyncHandler = require('../utils/asyncHandlerUtil');
const crypto = require('crypto');
const querystring = require('querystring');
const config = require('../config/vnpay');
const { sortObject, getFormatDate } = require('../utils/vnpayUtil');

const createOrder = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const orderDetails = req.body;

    const newOrder = await orderService.createOrderFromCart(userId, orderDetails);

    if (orderDetails.paymentMethod === 'VNPAY') {
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress || '127.0.0.1';
        
        if (ipAddr === '::1') ipAddr = '127.0.0.1';

        const tmnCode = config.vnp_TmnCode;
        const secretKey = config.vnp_HashSecret;
        let vnpUrl = config.vnp_Url;
        
        const returnUrl = 'http://localhost:8082/api/payment/vnpay_return';
        const date = getFormatDate();

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = String(newOrder.id);
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang giay kinh SO ' + newOrder.id;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = Math.round(newOrder.totalPrice * 100);
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = date;

        // 1. Sắp xếp các tham số (hàm này đã encodeURIComponent bên trong)
        vnp_Params = sortObject(vnp_Params);

        // 2. Tạo chuỗi ký bằng querystring.stringify (Standard Node.js)
        // Vì vnp_Params đã được encode trong sortObject, ta truyền tham số thứ 2 rỗng để tránh encode lần nữa
        const signData = querystring.stringify(vnp_Params, { encode: false });

        // 3. Ký SHA512
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");
        
        vnp_Params['vnp_SecureHash'] = signed;

        // 4. Tạo URL Redirect cuối cùng
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        console.log("SIGN DATA:", signData);
        console.log("FINAL URL:", vnpUrl);

        return res.status(201).json({
            success: true,
            message: 'Chuyển hướng đến cổng thanh toán VNPay',
            paymentUrl: vnpUrl,
            data: newOrder
        });
    }

    res.status(201).json({
        success: true,
        message: 'Đặt hàng thành công dạng COD',
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
