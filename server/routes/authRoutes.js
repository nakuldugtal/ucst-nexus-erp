import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { changePassword, login, logout, verifyAuth } from '../controllers/authController.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/verify-token', verifyAuth);
router.post('/change-password', authenticate, changePassword);

export default router;