const corsOptions = {
    origin: function (origin, callback) {
        // Lista de orígenes permitidos
        const whitelist = [
            'http://localhost:3000',    // Frontend en desarrollo
            'http://localhost:5173',    // Frontend en Vite
            'https://camper-stories.vercel.app' ,    // Tu dominio en producción
            'https://camperstories.vercel.app'
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
    origin: whitelist,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    exposedHeaders: ['Authorization'],
    maxAge: 86400
};

module.exports = corsOptions; 

