const qs = require('querystring');
const crypto = require('crypto');
const { sortObject } = require('../utils/vnpayUtil');
const config = require('../config/vnpay');
const db = require('../models/index');
const asyncHandler = require('../utils/asyncHandlerUtil');

/**
 * Hàm này dùng để đón lượt Redirect của User TỪ VNPay văng về.
 * Tại đây Backend sẽ Checksum kiểm tra, đồng thời do chưa có IPN Webhooks, 
 * ta cập nhật Status đơn hàng ở đây luôn rồi văng lại cho Frontend dạng Giao diện.
 */
const vnpayReturn = asyncHandler(async (req, res) => {
    let vnp_Params = req.query;

    const secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa Hash tham gia chữ ký mới
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = config.vnp_HashSecret;
    const signData = qs.stringify(vnp_Params, { encode: false });
    
    // Sinh chữ ký để đối chiếu
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");    

    if(secureHash === signed){
        // Chữ ký HỢP LỆ
        const orderId = vnp_Params['vnp_TxnRef'];
        const rspCode = vnp_Params['vnp_ResponseCode'];

        // Cập nhật Database trực tiếp do yêu cầu test cơ bản (Thay thế nhiệm vụ của IPN)
        const order = await db.Order.findByPk(orderId);
        if (order) {
            if (rspCode === '00') {
               // Thanh toán thành công
               order.paymentStatus = 'PAID';
               order.paidAt = new Date();
            } else {
               order.paymentStatus = 'FAILED';
            }
            order.transactionId = vnp_Params['vnp_TransactionNo'];
            await order.save();
        }

        // Chuyển hướng trình duyệt người dùng VỀ GIAO DIỆN REACT (Kèm status)
        if (rspCode === '00') {
            res.redirect(`${config.vnp_ReturnUrl}?status=success&orderId=${orderId}`);
        } else {
            res.redirect(`${config.vnp_ReturnUrl}?status=failed&orderId=${orderId}`);
        }
    } else {
        // Chữ ký KHÔNG HỢP LỆ (Có dấu hiệu bị hack link)
        res.redirect(`${config.vnp_ReturnUrl}?status=invalid`);
    }
});

module.exports = {
    vnpayReturn
};
