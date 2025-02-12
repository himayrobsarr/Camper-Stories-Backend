const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado: se requieren permisos de administrador' });
    }
    next();
};

module.exports = { isAdmin }; 