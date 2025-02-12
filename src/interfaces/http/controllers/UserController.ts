import { Request, Response } from 'express';
import { CreateUserUseCase } from '@/application/use-cases/user/CreateUserUseCase';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { HashService } from '@/domain/services/HashService';

export class UserController {
  constructor(
    private createUserUseCase: CreateUserUseCase
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.createUserUseCase.execute(req.body);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error interno del servidor' });
      }
    }
  };
} 