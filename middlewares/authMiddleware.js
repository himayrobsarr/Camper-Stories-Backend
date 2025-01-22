const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Verificar formato del header
        const authHeader = req.headers.authorization;
         // console.log('Authorization Header:', authHeader); // Log para verificar el header

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
             // console.log('Formato de autorización inválido');
            return res.status(401).json({ message: 'Formato de autorización inválido' });
        }

        // Obtener el token del header
        const token = authHeader.split(' ')[1];
         // console.log('Token recibido:', token); // Log para verificar el token

        // Verificar el token con opciones adicionales
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'],  // Especificar algoritmo permitido
            maxAge: process.env.JWT_EXPIRES_IN // Verificar expiración
        });
        
         // console.log('Token decodificado:', decoded); // Log para verificar la decodificación del token

        // (Opcional) Verificar si el token está en la lista negra
        // if (isTokenBlacklisted(token)) {
        //     return res.status(401).json({ message: 'Token revocado' });
        // }

        // Agregar información del usuario decodificada a la solicitud
        req.user = decoded;
         // console.log('Información del usuario en req.user:', req.user); // Log para verificar los datos del usuario

        // Continuar con la ejecución de la siguiente función middleware
        next();
    } catch (error) {
        // Manejo de errores específicos
        if (error.name === 'TokenExpiredError') {
             // console.log('Token expirado');
            return res.status(401).json({ message: 'Token expirado' });
        }

        if (error.name === 'JsonWebTokenError') {
             // console.log('Token inválido');
            return res.status(401).json({ message: 'Token inválido' });
        }

        // Error genérico de autenticación
         // console.log('Error de autenticación:', error.message);
        return res.status(500).json({ message: 'Error en la autenticación', error: error.message });
    }
};

module.exports = authMiddleware;
