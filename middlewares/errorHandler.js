const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    if (err.message.includes('permiso')) {
        return res.status(403).json({ message: err.message });
    }

    res.status(500).json({ 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

module.exports = errorHandler; 