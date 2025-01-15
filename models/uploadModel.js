const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const sanitizeFileName = (fileName) => {
    return fileName.replace(/\s+/g, '-'); // Reemplaza espacios por guiones
};

const UploadModel = {
    uploadToS3: async (file, tipoImagen, id) => {
        // Validar tipo de imagen
        console.log("datos recibidos",file, tipoImagen, id)
        const tiposValidos = ['proyecto', 'sueño', 'camper'];
        if (!tiposValidos.includes(tipoImagen)) {
            throw new Error('Tipo de imagen no válido.');
        }   

        // Sanitizar el nombre del archivo
        const sanitizedFileName = sanitizeFileName(file.name);

        // Generar la ruta en S3 según el tipo de imagen
        const rutaS3 = `${tipoImagen}s/${id}/${Date.now()}-${sanitizedFileName}`;
            console.log(rutaS3);

        // Configuración de parámetros para S3
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: rutaS3,
            Body: file.data,
            ContentType: file.mimetype
        };

        try {
            // Subir el archivo a S3
            await s3.upload(params).promise();
            const finalurl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${rutaS3}`;
            console.log("url AWS:", finalurl);
            
            // Construir y retornar la URL
            return finalurl
            
        } catch (err) {
            console.error('Error al subir la imagen a S3:', err);
            throw new Error('Error al subir la imagen a S3.');
        }
    },
};

module.exports = UploadModel;