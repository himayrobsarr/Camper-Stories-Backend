import { Express } from 'express';
import userRoutes from './userRoutes';

export const configureRoutes = (app: Express): void => {
  app.use('/api/users', userRoutes);
  // Aquí agregaremos más rutas según sea necesario
}; 