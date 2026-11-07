import { Router } from 'express';
import {
  getHomeScreenData,
  updateJobStatus,
  getAvailableJobs,
  getActiveJob,
  getJobById,
  submitJobOffer,
  getProfile,
  updateProfile,
  updateAvatar,
  removeAvatar,
  getBankDetails,
  updateBankDetails,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
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

// Profile Endpoints
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

// Avatar Endpoints
router.post('/profile/avatar', authenticateToken, updateAvatar);
router.delete('/profile/avatar', authenticateToken, removeAvatar);

// Bank Details Endpoints
router.get('/bank-details', authenticateToken, getBankDetails);
router.put('/bank-details', authenticateToken, updateBankDetails);

// Notification Endpoints
router.get('/notifications', authenticateToken, getNotifications);
router.patch('/notifications/read-all', authenticateToken, markAllNotificationsRead);
router.patch('/notifications/:id/read', authenticateToken, markNotificationRead);

export default router;
