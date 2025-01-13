const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const { uploadController } = require('../controllers/uploadController');

// Middleware para manejar la carga de archivos con límite de tamaño
router.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10 MB
    abortOnLimit: true, // Abortar si el archivo excede el límite
    responseOnLimit: 'El archivo es demasiado grande. Máximo 10 MB.', // Mensaje al exceder el límite
}));

// Ruta para subir la imagen
router.post('/', uploadController);

module.exports = router;
