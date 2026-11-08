import { Router } from "express";
import {
  adminLogin,
  getAdminProfile,
  getAdminHealth,
  getAllUsers,
  getApprovals,
  getAds,
  getOperations,
  getPayments,
  getDashboardStats,
  getDashboardCharts,
  updateApprovalStatus,
  deleteAd,
  releasePayment,
  createAdmin,
  getAllAdmins,
  updateUserStatus,
  createUserManually,
} from "../controllers/admin.controller";
import { verifyAdmin } from "../middleware/auth.middleware";

const route = Router();

// ==========================================
// 1. PUBLIC ROUTES
// ==========================================
route.get('/health', getAdminHealth);
route.post('/login', adminLogin);
route.post('/create-admin', createAdmin);

// ==========================================
// 2. PROTECTED ROUTES (Requires Admin Token)
// ==========================================
route.use(verifyAdmin);

// Admin Profile & Manage Admins
route.get('/me', getAdminProfile);
route.get('/admins', getAllAdmins);

// Users Management
route.get('/users', getAllUsers);
route.post('/users', createUserManually);
route.patch('/users/:id/status', updateUserStatus);

// Approvals
route.get('/approvals', getApprovals);
route.patch('/approvals/:id/status', updateApprovalStatus);

// Ads & Moderation
route.get('/ads', getAds);
route.delete('/ads/:id', deleteAd);

// Operations
route.get('/operations', getOperations);

// Payments & Escrow
route.get('/payments', getPayments);
route.patch('/payments/:id/release', releasePayment);

// Dashboard Metrics & Charts
route.get('/dashboard/stats', getDashboardStats);
route.get('/dashboard/charts', getDashboardCharts);

export default route;