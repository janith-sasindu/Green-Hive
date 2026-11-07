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
} from "../controllers/admin.controller";
import { verifyAdmin } from "../middleware/auth.middleware";

const route = Router();

// 1. Health check
route.get('/health', getAdminHealth);
route.post('/login', adminLogin);

route.use(verifyAdmin);
route.get('/me', getAdminProfile);

// 2. All Users
route.get('/users', getAllUsers);

// 3. Approvals (Verification Documents)
route.get('/approvals', getApprovals);

// 4. Ads Management (Selling & Requirements)
route.get('/ads', getAds);

// 5. Operations (Products, Orders, Transport)
route.get('/operations', getOperations);

// 6. Payments (Escrow Held & Completed)
route.get('/payments', getPayments);

// 7. Dashboard Metrics & Charts
route.get('/dashboard/stats', getDashboardStats);
route.get('/dashboard/charts', getDashboardCharts);

//action endpoints
route.patch('/approvals/:id/status', updateApprovalStatus);
route.delete('/ads/:id', deleteAd);
route.patch('/payments/:id/release', releasePayment);
route.post('/create-admin', createAdmin);

export default route;