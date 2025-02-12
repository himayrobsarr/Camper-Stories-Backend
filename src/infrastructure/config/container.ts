import { CreateUserUseCase } from '@/application/use-cases/user/CreateUserUseCase';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { HashService } from '@/domain/services/HashService';
import { SequelizeUserRepository } from '@/infrastructure/repositories/SequelizeUserRepository';
import { BcryptHashService } from '@/infrastructure/services/BcryptHashService';
import { UserController } from '@/interfaces/http/controllers/UserController';

export const configureContainer = () => {
  // Servicios
  const hashService: HashService = new BcryptHashService();
  const userRepository: UserRepository = new SequelizeUserRepository();

  // Casos de uso
  const createUserUseCase = new CreateUserUseCase(userRepository, hashService);

  // Controladores
  const userController = new UserController(createUserUseCase);

  return {
    userController
  };
}; 