import { createApplication, listApplications } from '../controllers/applicationController.js';
import requireAuth from '../middleware/requireAuth.js';

import express from 'express';
const router = express.Router();

router.use(requireAuth);

router.get('/', listApplications);
router.post('/', createApplication);

export default router;
