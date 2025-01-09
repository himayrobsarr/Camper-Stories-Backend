const express = require('express');
const router = express.Router();
const CityController = require('../controllers/cityController');

// Ruta para obtener todas las ciudades
router.get('/', CityController.getAll);

module.exports = router;