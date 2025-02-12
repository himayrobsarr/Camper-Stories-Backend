import express, { Express } from 'express';
import cors from 'cors';
import { configureSequelize } from './infrastructure/db/sequelize/config';
import { errorHandler } from './interfaces/http/middlewares/errorHandler';
import { configureRoutes } from './interfaces/http/routes';

export class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupDatabase();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private async setupDatabase(): Promise<void> {
    try {
      await configureSequelize();
      console.log('Base de datos conectada exitosamente');
    } catch (error) {
      console.error('Error al conectar con la base de datos:', error);
      process.exit(1);
    }
  }

  private setupRoutes(): void {
    configureRoutes(this.app);
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      console.log(`Servidor corriendo en el puerto ${port}`);
    });
  }
} 