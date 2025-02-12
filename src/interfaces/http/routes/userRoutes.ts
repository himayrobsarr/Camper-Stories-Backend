import { Router } from 'express';
import { configureContainer } from '@/infrastructure/config/container';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const { userController } = configureContainer();

router.post('/v2/register', userController.create);
router.post('/login', userController.login);
router.get('/:id', authMiddleware, userController.getById);

export default router; 