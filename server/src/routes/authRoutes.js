import { register, login, me, logout } from '../controllers/authController.js';
import requireAuth from '../middleware/requireAuth.js';

import express from 'express';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.post('/logout', logout);

export default router;


