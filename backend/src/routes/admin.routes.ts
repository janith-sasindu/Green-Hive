import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Module Owner: W.G.M. Geewinda (22CSE0386)
// Feature Branch: feature/admin_malith

// 1. Get System Statistics & Dashboard Summary
router.get('/dashboard-stats', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  res.json({
    totalUsers: 142,
    totalFarmers: 65,
    totalSellers: 50,
    totalTransporters: 27,
    activeOrders: 18,
    totalEscrowHeldLKR: 450000,
  });
});

// 2. User Management (Verify/Suspend users)
router.get('/users', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  res.json({ message: 'User list retrieved for admin verification' });
});

router.put('/users/:id/verify', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  res.json({ message: 'User account verified by admin' });
});

// 3. Monitor All Transactions & Payments
router.get('/transactions', authenticateToken, requireRole(['ADMIN']), (req, res) => {
  res.json({ message: 'All platform transaction logs retrieved' });
});

export default router;
