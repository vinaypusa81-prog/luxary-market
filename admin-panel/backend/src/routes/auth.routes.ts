import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { loginSchema, registerSchema } from '../utils/schemas';

const router = Router();

router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', authenticateAdmin, authController.getProfile);
router.put('/change-password', authenticateAdmin, authController.changePassword);

export default router;
