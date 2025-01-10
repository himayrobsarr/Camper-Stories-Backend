// * Configuración de variables de entorno y dependencias principales
require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const fs = require("fs");
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const corsOptions = require('./config/corsOptions');

// * Importación de la conexión a la base de datos
const db = require("./helpers/conexion");

// * Inicialización de la aplicación Express y el servidor HTTP
const app = express();
const server = http.createServer(app);

// * Middleware para procesar datos JSON en las peticiones
app.use(express.json());
app.use(cors(corsOptions));


// ! Middleware para manejar errores de JWT
app.use((err, req, res, next) => {
    if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Token inválido' });
    }
    next(err);
});

// * Importación de rutas de la aplicación
const userRoutes = require("./routes/userRoutes");
const camperRoutes = require("./routes/camperRoutes");
const sponsorRoutes = require("./routes/sponsorRoutes");
const dreamsRoutes = require("./routes/dreamRoutes");
const meritRoutes = require("./routes/meritRoutes");
const projectRoutes = require("./routes/projectRoutes");
const cityRoutes = require('./routes/cityRoutes');

// * Configuración de los endpoints principales
app.use("/users", userRoutes);
app.use("/campers", camperRoutes);
app.use("/sponsors", sponsorRoutes);
app.use("/dreams", dreamsRoutes);
app.use("/merits", meritRoutes);
app.use("/projects", projectRoutes);
app.use('/cities', cityRoutes);

// ? Configuración del rate limiting global
// @param windowMs: Ventana de tiempo en milisegundos
// @param max: Número máximo de solicitudes permitidas
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 solicitudes por ventana por IP
});

// ! Configuración de rate limiting específico para autenticación
// @param windowMs: Ventana de tiempo para intentos de autenticación
// @param max: Número máximo de intentos permitidos
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // 5 intentos por hora
    message: {
        error: 'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 1 hora'
    }
});

// * Aplicación del rate limiting global
app.use(limiter);

// ! Aplicación del rate limiting específico para rutas de autenticación
app.use("/users/login", authLimiter);
app.use("/users/register", authLimiter);

// * Configuración de AWS
const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();


// Middleware para manejar la carga de archivos
const fileUpload = require('express-fileupload');
app.use(fileUpload());

// Ruta para subir la imagen
app.post('/upload', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No se subió ningún archivo.');
    }

    const archivo = req.files.archivo;
    const nombreArchivo = archivo.name;
    const tipoImagen = req.body.tipo; // 'perfil', 'proyecto', 'sueño'
    const id = req.body.id; // El ID que corresponde al usuario, proyecto o sueño

    // Genera el nombre de la ruta en S3 según el tipo de imagen
    let rutaS3;
    switch(tipoImagen) {
        case 'perfil':
            rutaS3 = `profiles/${id}/${nombreArchivo}`;
            break;
        case 'proyecto':
            rutaS3 = `projects/${id}/${nombreArchivo}`;
            break;
        case 'sueño':
            rutaS3 = `dreams/${id}/${nombreArchivo}`;
            break;
        default:
            return res.status(400).send('Tipo de imagen no válido.');
    }

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: rutaS3,
        Body: archivo.data,
        ContentType: archivo.mimetype,
        ACL: 'public-read',  // Hace la imagen pública
    };

    try {
        // Subir la imagen a S3
        const data = await s3.upload(params).promise();
        const imageUrl = data.Location;  // URL de la imagen subida a S3

        // Guardar la URL en la base de datos dependiendo del tipo de imagen
        let query;
        if (tipoImagen === 'perfil') {
            query = 'UPDATE users SET profile_picture = ? WHERE id = ?';
        } else if (tipoImagen === 'proyecto') {
            query = 'INSERT INTO projects (image_url, project_name) VALUES (?, ?)';
        } else if (tipoImagen === 'sueño') {
            query = 'INSERT INTO dreams (image_url, dream_name) VALUES (?, ?)';
        }

        // Ejecutar la consulta de base de datos
        await db.query(query, [imageUrl, id]); // Asegúrate de pasar el ID correcto

        res.send('Imagen subida con éxito y URL guardada en la base de datos.');
    } catch (err) {
        console.error('Error al subir la imagen:', err);
        res.status(500).send('Error al subir la imagen.');
    }
});


// * Verificación inicial de la conexión a la base de datos
(async () => {
    try {
        const connection = await db.getConexion();
        console.log(connection.message);
    } catch (error) {
        // ! Error crítico si no se puede conectar a la base de datos
        console.error("Error al conectar con la base de datos:", error);
    }
})();

// * Configuración específica para el entorno de producción
if (process.env.NODE_ENV === "production") {
    // TODO: Considerar implementar compresión gzip para archivos estáticos
    app.use(express.static(path.join(__dirname, "dist", "client")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "dist", "client", "index.html"));
    });
}

// * Inicialización del servidor en el puerto especificado
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

