import { Router } from 'express';
import {
  getHomeScreenData,
  updateJobStatus,
  confirmJobPickup,
  confirmJobDelivery,
  getAvailableJobs,
  getActiveJob,
  getJobById,
  submitJobOffer,
  getMyOffers,
  withdrawOffer,
  getLatestOffer,
  getProfile,
  updateProfile,
  updateAvatar,
  removeAvatar,
  getBankDetails,
  updateBankDetails,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getNotificationSettings,
  updateNotificationSettings,
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

// Transporter My Offers Endpoints
router.get('/offers', authenticateToken, getMyOffers);
router.get('/offers/latest', authenticateToken, getLatestOffer);
router.delete('/offers/:id', authenticateToken, withdrawOffer);

// Update Status (Confirm pickup / Confirm delivery)
router.patch('/jobs/:id/status', authenticateToken, updateJobStatus);
router.patch('/jobs/:id/pickup', authenticateToken, confirmJobPickup);
router.post('/jobs/:id/pickup', authenticateToken, confirmJobPickup);
router.patch('/jobs/:id/delivery', authenticateToken, confirmJobDelivery);
router.post('/jobs/:id/delivery', authenticateToken, confirmJobDelivery);

// Profile Endpoints
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

// Avatar Endpoints
router.post('/profile/avatar', authenticateToken, updateAvatar);
router.delete('/profile/avatar', authenticateToken, removeAvatar);

// Bank Details Endpoints
router.get('/bank-details', authenticateToken, getBankDetails);
router.put('/bank-details', authenticateToken, updateBankDetails);
router.post('/bank-details', authenticateToken, updateBankDetails);

// Notification Endpoints
router.get('/notifications', authenticateToken, getNotifications);
router.patch('/notifications/read-all', authenticateToken, markAllNotificationsRead);
router.patch('/notifications/:id/read', authenticateToken, markNotificationRead);

// Notification Settings Endpoints
router.get('/notification-settings', authenticateToken, getNotificationSettings);
router.put('/notification-settings', authenticateToken, updateNotificationSettings);

export default router;
