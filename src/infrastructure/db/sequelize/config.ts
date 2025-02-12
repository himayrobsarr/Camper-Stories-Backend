import { Sequelize } from 'sequelize-typescript';
import { UserModel } from './models/User';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false,
  models: [UserModel], // Aquí registramos todos nuestros modelos
});

export const configureSequelize = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // En desarrollo. En producción usar migrations
  } catch (error) {
    throw new Error('Error al configurar la base de datos');
  }
};

export default sequelize; 