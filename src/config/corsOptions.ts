import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const whitelist = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://camper-stories.vercel.app',
      'https://camperstories.vercel.app',
      'https://admin-camper-stories.vercel.app'
    ];

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