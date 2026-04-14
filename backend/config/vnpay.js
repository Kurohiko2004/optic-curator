require('dotenv').config();

module.exports = {
    // Thông tin này lấy từ Email đăng ký VNPay Sandbox.
    // Nếu bạn muốn tự test cơ bản, cứ giữ nguyên thông tin này (Đây là cặp key Test mặc định sống của VNPay).
    // Khi có tài khoản riêng, bạn chỉ việc đem 2 cái chuỗi kia bỏ vào file .env là được.
    vnp_TmnCode: process.env.VNP_TMN_CODE,
    vnp_HashSecret: process.env.VNP_HASH_SECRET,
    vnp_Url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_Api: process.env.VNP_API || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
    vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:5173/payment/result' // Đường dẫn frontend nhận kết quả
};
