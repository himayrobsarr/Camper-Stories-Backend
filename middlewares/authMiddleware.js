const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Verificar formato del header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Formato de autorización inválido' });
        }

        // Obtener el token del header
        const token = authHeader.split(' ')[1];

        // Verificar el token con opciones adicionales
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'],  // Especificar algoritmo permitido
            maxAge: process.env.JWT_EXPIRES_IN // Verificar expiración
        });

        // (Opcional) Verificar si el token está en la lista negra
        // if (isTokenBlacklisted(token)) {
        //     return res.status(401).json({ message: 'Token revocado' });
        // }

        // Agregar información del usuario decodificada a la solicitud
        req.user = decoded;

        // Continuar con la ejecución de la siguiente función middleware
        next();
    } catch (error) {
        // Manejo de errores específicos
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido' });
        }

        // Error genérico de autenticación
        return res.status(500).json({ message: 'Error en la autenticación', error: error.message });
    }
};

module.exports = authMiddleware;
