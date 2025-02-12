import { User } from '@/domain/entities/User';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { HashService } from '@/domain/services/HashService';

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private hashService: HashService
  ) {}

  async execute(userData: Omit<User, 'id'>): Promise<User> {
    // Validar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Encriptar contraseña
    const hashedPassword = await this.hashService.hash(userData.password);

    // Crear usuario
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword
    });

    return user;
  }
} 