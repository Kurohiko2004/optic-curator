const express = require('express');
const { getAllGlasses, getGlassById, getAllShapes, getAllColors } = require('../controllers/glassesController.js');
const validate = require('../middlewares/validateMiddleware.js');
const { getGlassesSchema } = require('../validations/glassesValidation.js');

const router = express.Router();

router.get('/', validate(getGlassesSchema, 'query'), getAllGlasses);
router.get('/shapes', getAllShapes);
router.get('/colors', getAllColors);
router.get('/:id', getGlassById);

module.exports = router;
