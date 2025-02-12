import { Request, Response, NextFunction } from 'express';
import { DatabaseError } from '@/domain/errors/DatabaseError';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error instanceof DatabaseError) {
    return res.status(500).json({
      message: 'Error de base de datos',
      error: error.message
    });
  }

  return res.status(500).json({
    message: 'Error interno del servidor',
    error: error.message
  });
}; 