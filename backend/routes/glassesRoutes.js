const express = require('express');
const { getAllGlasses, getGlassById, createGlass, updateGlass, getAllShapes, getAllColors } = require('../controllers/glassesController.js');
const validate = require('../middlewares/validateMiddleware.js');
const { getGlassesSchema } = require('../validations/glassesValidation.js');
const { protect, admin } = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.get('/', validate(getGlassesSchema, 'query'), getAllGlasses);
router.get('/shapes', getAllShapes);
router.get('/colors', getAllColors);
router.get('/:id', getGlassById);

// Admin operations (Protected)
router.post('/', protect, admin, createGlass);
router.put('/:id', protect, admin, updateGlass);

module.exports = router;
