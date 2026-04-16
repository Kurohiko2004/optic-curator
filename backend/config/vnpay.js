require('dotenv').config();

module.exports = {
    vnp_TmnCode: process.env.VNP_TMN_CODE,
    vnp_HashSecret: process.env.VNP_HASH_SECRET,
    vnp_Url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_Api: process.env.VNP_API || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
    
    // ĐÂY PHẢI LÀ URL CỦA BACKEND ĐỂ NHẬN DỮ LIỆU TỪ VNPAY
    vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:8082/api/payment/vnpay_return',
    
    // ĐÂY LÀ TRANG KẾT QUẢ TRÊN FRONTEND ĐỂ HIỂN THỊ CHO NGƯỜI DÙNG
    vnp_FrontendUrl: process.env.VNP_FRONTEND_URL || 'http://localhost:5173/payment/result'
};
