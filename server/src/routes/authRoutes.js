import { register, login, me, logout } from '../controllers/authController.js';
import requireAuth from '../middleware/requireAuth.js';
import { authLimiter } from '../middleware/rateLimit.js';

import express from 'express';
const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', requireAuth, me);
router.post('/logout', logout);

export default router;


