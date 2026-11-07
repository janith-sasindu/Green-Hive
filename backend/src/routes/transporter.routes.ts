import { Router } from 'express';
import {
  getHomeScreenData,
  updateJobStatus,
  getAvailableJobs,
  getActiveJob,
  getJobById,
  submitJobOffer,
} from '../controllers/transporter.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Dashboard Home Screen
router.get('/home', authenticateToken, getHomeScreenData);

// Active Job Endpoint (Must be registered before :id route)
router.get('/jobs/active', authenticateToken, getActiveJob);

// Available Jobs Endpoints
router.get('/jobs/available', getAvailableJobs);

// Single Job Details & Offers
router.get('/jobs/:id', getJobById);
router.post('/jobs/:id/offers', authenticateToken, submitJobOffer);

// Update Status (Confirm pickup / Confirm delivery)
router.patch('/jobs/:id/status', authenticateToken, updateJobStatus);

export default router;
