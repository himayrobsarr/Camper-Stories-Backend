const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Verificar formato del header
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ 
                message: 'Formato de autorización inválido' 
            });
        }

        // Obtener y verificar el token
        const token = authHeader.split(' ')[1];
        
        // Verificar el token con opciones adicionales
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'], // Especificar algoritmo permitido
            maxAge: process.env.JWT_EXPIRES_IN // Verificar expiración
        });

        // Verificar si el token está en la lista negra (opcional)
        // if (isTokenBlacklisted(token)) {
        //     return res.status(401).json({ message: 'Token revocado' });
        // }

        // Agregar información del usuario decodificada
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expirado' 
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Token inválido' 
            });
        }
        return res.status(500).json({ 
            message: 'Error en la autenticación' 
        });
    }
};

module.exports = authMiddleware; 