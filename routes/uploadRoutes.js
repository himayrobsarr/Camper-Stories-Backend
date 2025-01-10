const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const { uploadImage } = require('../controllers/uploadController');

// Middleware para manejar la carga de archivos
router.use(fileUpload());

// Ruta para subir la imagen
router.post('/', uploadImage);

module.exports = router;
