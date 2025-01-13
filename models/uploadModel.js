const AWS = require('aws-sdk');

// Configuración de AWS S3
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const UploadModel = {
    uploadToS3: async (file, tipoImagen, id) => {
        // Validar tipo de imagen
        const tiposValidos = ['proyecto', 'sueño', 'camper'];
        if (!tiposValidos.includes(tipoImagen)) {
            throw new Error('Tipo de imagen no válido.');
        }

        // Generar la ruta en S3 según el tipo de imagen
        const rutaS3 = `${tipoImagen}s/${id}/${Date.now()}-${file.name}`;

        // Configuración de parámetros para S3
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: rutaS3,
            Body: file.data,
            ContentType: file.mimetype,
            ACL: 'public-read', // Hace que el archivo sea accesible públicamente
        };

        try {
            // Subir el archivo a S3
            const data = await s3.upload(params).promise();
            return data.Location; // Devuelve la URL pública de la imagen
        } catch (err) {
            console.error('Error al subir la imagen a S3:', err);
            throw new Error('Error al subir la imagen a S3.');
        }
    },
};

module.exports = UploadModel;
