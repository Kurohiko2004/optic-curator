const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Route này KHÔNG dùng middleware Protect (Auth) vì VNPay là máy chủ riêng, không có token đăng nhập của bạn!
router.get('/vnpay_return', paymentController.vnpayReturn);

module.exports = router;
