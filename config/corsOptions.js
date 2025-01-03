const corsOptions = {
    origin: function (origin, callback) {
        // Lista de orígenes permitidos
        const whitelist = [
            'http://localhost:3000',    // Frontend en desarrollo
            'http://localhost:5173',    // Frontend en Vite
            'http://tu-dominio.com'     // Tu dominio en producción
        ];
        
        // Permitir peticiones sin origen (como las de Postman)
        if (!origin) {
            return callback(null, true);
        }

        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,  // Permite cookies en las peticiones
    maxAge: 86400  // Tiempo de cache para preflight requests (24 horas)
};

module.exports = corsOptions; 