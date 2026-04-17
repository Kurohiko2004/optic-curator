const orderService = require('../services/orderService');
const asyncHandler = require('../utils/asyncHandlerUtil');
const crypto = require('crypto');
const qs = require('qs');
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

        const returnUrl = config.vnp_ReturnUrl || 'http://localhost:5173/payment/result';
        const date = getFormatDate();
        const amount = Math.floor(parseFloat(newOrder.totalPrice) * 100);

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = String(newOrder.id);
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + newOrder.id;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = date;

        // 1. Sắp xếp tham số (hàm sortObject trong vnpayUtil đã encode sẵn từng cặp key/value)
        vnp_Params = sortObject(vnp_Params);

        // 2. Tạo chuỗi ký (signData) 
        // Dùng qs.stringify với { encode: false } để nối các tham số bằng dấu & một cách chính xác
        const signData = qs.stringify(vnp_Params, { encode: false });

        // 3. Ký SHA512
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

        vnp_Params['vnp_SecureHash'] = signed;

        // 4. Tạo URL Redirect cuối cùng
        // Dùng dấu & chuẩn thay vì [object Object]
        vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

        console.log("--- VNPAY DEBUG ---");
        console.log("SIGN DATA (RAW):", signData);
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
    const { page, limit } = req.query;

    const result = await orderService.getUserOrders(userId, page, limit);

    res.status(200).json({
        success: true,
        ...result
    });
});

module.exports = {
    createOrder,
    getMyOrders
};
