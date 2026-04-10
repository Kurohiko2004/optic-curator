const express = require('express');
const { signup, login } = require('../controllers/authController.js');
const validate = require('../middlewares/validateMiddleware.js');
const { protect } = require('../middlewares/authMiddleware.js');
const { signupSchema, loginSchema } = require('../validations/authValidation.js');

const router = express.Router();

router.post('/signup', validate(signupSchema, 'body'), signup);
router.post('/login', validate(loginSchema, 'body'), login);

module.exports = router;
