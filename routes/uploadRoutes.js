const express = require('express');
const router = express.Router();
const { uploadController } = require('../controllers/uploadController');

// Ruta para subir la imagen
router.post('/', uploadController);

module.exports = router;
