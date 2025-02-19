const validateSubscriptionData = (req, res, next) => {
    const { planId } = req.body;

    if (!planId) {
        return res.status(400).json({
            success: false,
            error: 'El planId es requerido'
        });
    }

    // Validar que el planId no sea el plan PIONEER (id: 4)
    if (planId === 4) {
        return res.status(400).json({
            success: false,
            error: 'No se puede suscribir al plan PIONEER'
        });
    }

    next();
};

module.exports = validateSubscriptionData; 