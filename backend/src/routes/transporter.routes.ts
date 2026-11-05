import { Router } from 'express';
import { getHomeScreenData, updateJobStatus } from '../controllers/transporter.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Dashboard Home Screen (Protected or optional auth for dev)
router.get('/home', authenticateToken, getHomeScreenData);

// Update Status (Confirm pickup / Confirm delivery)
router.patch('/jobs/:id/status', authenticateToken, updateJobStatus);

export default router;