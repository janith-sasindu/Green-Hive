import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Module Owner: R. Renujaan (22CSE0395)
// Feature Branch: feature/retail_seller_renujaan

// 1. Browse & Search Farmer Advertisements
router.get('/advertisements', authenticateToken, requireRole(['SELLER']), (req, res) => {
  res.json({ message: 'Available farmer produce listed for seller' });
});

// 2. Post a New Product Requirement (Demand)
router.post('/requirements', authenticateToken, requireRole(['SELLER']), (req, res) => {
  res.json({ message: 'Product requirement posted by seller' });
});

// 3. View Fulfillment Requests from Farmers
router.get('/requirements/:id/requests', authenticateToken, requireRole(['SELLER']), (req, res) => {
  res.json({ message: 'Farmer fulfillment responses for seller requirement' });
});

// 4. Place an Order for Farmer Produce
router.post('/orders', authenticateToken, requireRole(['SELLER']), (req, res) => {
  res.json({ message: 'Order created by retail seller' });
});

// 5. Select/Approve Transporter for Order
router.post('/orders/:id/select-transporter', authenticateToken, requireRole(['SELLER']), (req, res) => {
  res.json({ message: 'Transporter offer selected by retail seller' });
});

// 6. Confirm Receipt of Goods (Triggers Transporter Payment Release)
router.post('/orders/:id/confirm-delivery', authenticateToken, requireRole(['SELLER']), (req, res) => {
  res.json({ message: 'Receipt of goods confirmed by seller. Transporter payment released!' });
});

export default router;
