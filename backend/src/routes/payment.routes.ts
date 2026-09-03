import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Module Owner: W.A.J.S. Mihiran (22CSE0356)
// Feature Branch: feature/payment_janith

// 1. Initiate Escrow Payment for Order (Seller pays, system holds funds)
router.post('/hold', authenticateToken, requireRole(['SELLER']), (req, res) => {
  res.json({ message: 'Order funds held in Green Hive platform escrow' });
});

// 2. View Payment Status (Farmer, Seller, Transporter, Admin)
router.get('/status/:orderId', authenticateToken, (req, res) => {
  res.json({ message: 'Milestone payment status retrieved' });
});

export default router;
