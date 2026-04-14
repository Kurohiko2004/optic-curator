const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { createOrderSchema } = require('../validations/orderValidation');

// Yêu cầu đăng nhập cho mọi tính năng của order
router.use(protect);

router.post('/', validate(createOrderSchema, 'body'), orderController.createOrder);
router.get('/me', orderController.getMyOrders);

module.exports = router;
