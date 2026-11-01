import { Router } from "express";
import {
  getAdminHealth,
  getAllUsers,
  getApprovals,
  getAds,
  getOperations,
  getPayments,
  getDashboardStats,
  getDashboardCharts,
} from "../controllers/admin.controller";

const route = Router();

// 1. Health check
route.get('/health', getAdminHealth);

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

export default route;