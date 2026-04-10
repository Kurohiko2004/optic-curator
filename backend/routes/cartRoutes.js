const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

// Tất cả các route giỏ hàng đều yêu cầu đăng nhập
router.use(protect);

router.post('/add', cartController.addToCart);
router.get('/', cartController.getMyCart);
router.patch('/:id', cartController.updateQuantity);
router.delete('/:id', cartController.removeFromCart);

module.exports = router;
