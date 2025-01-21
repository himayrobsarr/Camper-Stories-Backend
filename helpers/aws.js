const AWS = require('aws-sdk');

// Configurar AWS con las variables de entorno
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

/**
 * Eliminar un archivo de S3
 * @param {string} imageUrl - URL completa de la imagen en S3
 */
const deleteFromS3 = async (imageUrl) => {
    const bucketName = process.env.AWS_BUCKET_NAME;
    console.log("URL de imagen recibida:", imageUrl);

    // Extraer el key usando un enfoque confiable
    const baseUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
    if (!imageUrl.startsWith(baseUrl)) {
        throw new Error("La URL no corresponde al bucket configurado.");
    }

    // Extraer el key eliminando la base URL
    const key = imageUrl.replace(baseUrl, "");
    if (!key) {
        throw new Error("No se pudo extraer el key de la URL.");
    }

    console.log("Key extraída:", key);

    const params = {
        Bucket: bucketName,
        Key: key,
    };

    try {
        await s3.deleteObject(params).promise();
        console.log(`Imagen eliminada exitosamente: ${key}`);
    } catch (error) {
        console.error("Error al eliminar la imagen de S3:", error);
        throw new Error("No se pudo eliminar la imagen anterior.");
    }
};

module.exports = {
    deleteFromS3,
};
