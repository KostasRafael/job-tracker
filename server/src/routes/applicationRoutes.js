import {
  createApplication,
  listApplications,
  getApplication,
  updateApplication,
  deleteApplication,
  moveApplication,
} from '../controllers/applicationController.js';
import requireAuth from '../middleware/requireAuth.js';
import validateObjectId from '../middleware/validateObjectId.js';

import express from 'express';
const router = express.Router();

router.use(requireAuth);

router.get('/', listApplications);
router.post('/', createApplication);
router.get('/:id', validateObjectId, getApplication);
router.patch('/:id', validateObjectId, updateApplication);
router.delete('/:id', validateObjectId, deleteApplication);
router.patch('/:id/move', validateObjectId, moveApplication);

export default router;
