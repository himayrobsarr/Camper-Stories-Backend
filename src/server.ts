import { App } from './app';
import dotenv from 'dotenv';

dotenv.config();

// Puerto diferente para la nueva versión
const port = process.env.TS_PORT ? parseInt(process.env.TS_PORT) : 4000;
const app = new App();

app.start(port); 