import { Router } from 'express';
import {
  getHomeScreenData,
  updateJobStatus,
  getAvailableJobs,
  getJobById,
  submitJobOffer,
} from '../controllers/transporter.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Dashboard Home Screen
router.get('/home', authenticateToken, getHomeScreenData);

// Available Jobs Endpoints
router.get('/jobs/available', getAvailableJobs);
router.get('/jobs/:id', getJobById);
router.post('/jobs/:id/offers', authenticateToken, submitJobOffer);

// Update Status (Confirm pickup / Confirm delivery)
router.patch('/jobs/:id/status', authenticateToken, updateJobStatus);

export default router;
