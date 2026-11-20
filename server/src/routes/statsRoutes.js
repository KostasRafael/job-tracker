import { getStats } from '../controllers/statsController.js';
import requireAuth from '../middleware/requireAuth.js';

import express from 'express';
const router = express.Router();

router.get('/', requireAuth, getStats);

export default router;
