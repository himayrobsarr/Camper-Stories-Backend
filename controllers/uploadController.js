const AWS = require('aws-sdk');
const db = require('../helpers/conexion');

// Configuración de AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const uploadImage = async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No se subió ningún archivo.');
    }

    const archivo = req.files.archivo;
    const tipoImagen = req.body.tipo; // 'proyecto', 'sueño', 'camper'
    const id = req.body.id; // El ID correspondiente al proyecto, sueño o camper

    // Validación para asegurarse de que el tipo de imagen es válido
    const tiposValidos = ['proyecto', 'sueño', 'camper'];
    if (!tiposValidos.includes(tipoImagen)) {
        return res.status(400).send('Tipo de imagen no válido.');
    }

    // Genera el nombre de la ruta en S3 según el tipo de imagen
    let rutaS3;
    switch (tipoImagen) {
        case 'proyecto':
            rutaS3 = `projects/${id}`;
            break;
        case 'sueño':
            rutaS3 = `dreams/${id}`;
            break;
        case 'camper':
            rutaS3 = `campers/${id}`;
            break;
        default:
            return res.status(400).send('Tipo de imagen no válido.');
    }

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: rutaS3,
        Body: archivo.data,
        ContentType: archivo.mimetype, // Hace la imagen pública
    };

    try {
        // Subir la imagen a S3
        const data = await s3.upload(params).promise();
        const imageUrl = data.Location; // URL de la imagen subida a S3

        // Guardar solo la URL en la base de datos dependiendo del tipo de imagen
        let query;

        if (tipoImagen === 'proyecto') {
            query = 'UPDATE PROJECT SET image = ? WHERE id = ?';
        } else if (tipoImagen === 'sueño') {
            query = 'UPDATE DREAMS SET image_url = ? WHERE id = ?';
        } else if (tipoImagen === 'camper') {
            query = 'UPDATE CAMPER SET image_url = ? WHERE id = ?';
        }

        // Ejecutar la consulta de base de datos
        await db.query(query, [imageUrl, id]);

        res.send('Imagen subida con éxito y URL guardada en la base de datos.');
    } catch (err) {
        console.error('Error al subir la imagen:', err);
        res.status(500).send('Error al subir la imagen.');
    }
};

module.exports = { uploadImage };
