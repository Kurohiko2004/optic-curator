const express = require('express');
const { getAllGlasses } = require('../controllers/glassesController.js');
const validate = require('../middlewares/validateMiddleware.js');
const { getGlassesSchema } = require('../validations/glassesValidation.js');

const router = express.Router();

router.get('/', validate(getGlassesSchema, 'query'), getAllGlasses);

module.exports = router;