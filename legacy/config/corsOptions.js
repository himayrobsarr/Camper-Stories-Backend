const corsOptions = {
    origin: (origin, callback) => {
        // Lista de orígenes permitidos
        const whitelist = [
            'http://localhost:3000',    // Frontend en desarrollo
            'http://localhost:5173',    // Frontend en Vite
            'https://camper-stories.vercel.app' ,    // Tu dominio en producción
            'https://camperstories.vercel.app',
            'https://admin-camper-stories.vercel.app'
            
        ];
        
        // Permitir peticiones sin origen (como las de Postman)
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por CORS'));
        }
    },
    
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    exposedHeaders: ['Authorization'],
    maxAge: 86400
};

module.exports = corsOptions; 

