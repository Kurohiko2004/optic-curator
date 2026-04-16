const qs = require('qs');
const crypto = require('crypto');
const { sortObject, getFormatDate } = require('../utils/vnpayUtil');
const config = require('../config/vnpay');
const db = require('../models/index');
const asyncHandler = require('../utils/asyncHandlerUtil');

/**
 * [TEST ONLY] Tạo nhanh 1 link thanh toán để thử nghiệm
 * URL: http://localhost:8082/api/payment/test-pay
 */
const createTestPayment = asyncHandler(async (req, res) => {
    // 1. Giả lập hoặc lấy 1 đơn hàng có sẵn trong DB (để có ID hợp lệ)
    let order = await db.Order.findOne({ order: [['createdAt', 'DESC']] });
    
    if (!order) {
        // Nếu chưa có đơn hàng nào, tạo đại 1 cái để test
        order = await db.Order.create({
            totalPrice: 50000,
            status: 'PENDING',
            paymentMethod: 'VNPAY',
            paymentStatus: 'PENDING',
            recipientName: 'Tester',
            phoneNumber: '0123456789',
            shippingAddress: 'HCM'
        });
    }

    // 2. Cấu hình các tham số VNPay (Copy logic từ orderController)
    const tmnCode = config.vnp_TmnCode;
    const secretKey = config.vnp_HashSecret;
    let vnpUrl = config.vnp_Url;
    const returnUrl = config.vnp_ReturnUrl;
    const date = getFormatDate();
    const amount = Math.floor(parseFloat(order.totalPrice) * 100);

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = String(order.id);
    vnp_Params['vnp_OrderInfo'] = 'Test thanh toan don hang ' + order.id;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = '127.0.0.1';
    vnp_Params['vnp_CreateDate'] = date;

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");
    
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    // 3. Chuyển hướng trình duyệt ĐI LUÔN tới VNPay
    res.redirect(vnpUrl);
});

const vnpayReturn = asyncHandler(async (req, res) => {
    console.log("--- VNPAY RETURN HIT ---");
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const secretKey = config.vnp_HashSecret;
    const signData = qs.stringify(vnp_Params, { encode: false });
    
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");    

    if(secureHash === signed){
        const orderId = vnp_Params['vnp_TxnRef'];
        const rspCode = vnp_Params['vnp_ResponseCode'];

        const order = await db.Order.findByPk(orderId);
        if (order) {
            if (rspCode === '00') {
               order.paymentStatus = 'PAID';
               order.status = 'COMPLETED';
               order.paidAt = new Date();
            } else {
               order.paymentStatus = 'FAILED';
               order.status = 'CANCELLED';
            }
            order.transactionId = vnp_Params['vnp_TransactionNo'];
            await order.save();
        }

        if (rspCode === '00') {
            res.redirect(`${config.vnp_FrontendUrl}?status=success&orderId=${orderId}`);
        } else {
            res.redirect(`${config.vnp_FrontendUrl}?status=failed&orderId=${orderId}`);
        }
    } else {
        console.error("❌ VNPAY HASH MISMATCH!");
        res.redirect(`${config.vnp_FrontendUrl}?status=invalid`);
    }
});

module.exports = {
    vnpayReturn,
    createTestPayment
};
