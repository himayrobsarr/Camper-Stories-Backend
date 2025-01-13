const { uploadToS3 } = require('../models/uploadModel');

const uploadController = async (req, res) => {
    try {
        // Verificar que se envió un archivo
        if (!req.files || !req.files.archivo) {
            return res.status(400).json({ error: 'No se subió ningún archivo.' });
        }

        const archivo = req.files.archivo; // Archivo a subir
        const { tipo, id } = req.body; // Datos del tipo de imagen y el ID asociado

        // Subir la imagen a S3
        const imageUrl = await uploadToS3(archivo, tipo, id);

        // Responder con la URL generada
        res.status(200).json({ message: 'Imagen subida con éxito.', imageUrl });
    } catch (err) {
        console.error('Error al subir la imagen:', err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { uploadController };
