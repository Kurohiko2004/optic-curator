const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { addToCartSchema, updateQuantitySchema } = require('../validations/cartValidation');

// Tất cả các route giỏ hàng đều yêu cầu đăng nhập
router.use(protect);

router.post('/add', validate(addToCartSchema, 'body'), cartController.addToCart);
router.get('/', cartController.getMyCart);
router.delete('/clear', cartController.clearCart); // Phải nằm trên routes /:id để tránh bị nhầm lẫn
router.patch('/:id', validate(updateQuantitySchema, 'body'), cartController.updateQuantity);
router.delete('/:id', cartController.removeFromCart);

module.exports = router;
