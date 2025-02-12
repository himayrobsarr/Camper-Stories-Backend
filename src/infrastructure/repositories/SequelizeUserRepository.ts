import { User, UserRepository } from '@/domain/entities/User';
import { UserModel } from '../db/sequelize/models/User';
import { DatabaseError } from '@/domain/errors/DatabaseError';

export class SequelizeUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ where: { email } });
      return user ? user.toJSON() : null;
    } catch (error) {
      throw new DatabaseError('Error al buscar usuario por email');
    }
  }

  async create(userData: User): Promise<User> {
    try {
      const user = await UserModel.create(userData);
      return user.toJSON();
    } catch (error) {
      throw new DatabaseError('Error al crear usuario');
    }
  }

  // Implementar los demás métodos...
} 