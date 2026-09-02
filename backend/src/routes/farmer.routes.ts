import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Module Owner: B.J.S. Perera (22CSE0350)
// Feature Branch: feature/farmer_jayami

// 1. Create a Product Advertisement (Farmer)
router.post('/advertisements', authenticateToken, requireRole(['FARMER']), (req, res) => {
  res.json({ message: 'Product advertisement created successfully (Farmer Module)' });
});

// 2. Get All Advertisements of Current Farmer
router.get('/my-advertisements', authenticateToken, requireRole(['FARMER']), (req, res) => {
  res.json({ message: 'Farmer advertisements retrieved' });
});

// 3. View Open Seller Requirements (Farmers browse what buyers need)
router.get('/seller-requirements', authenticateToken, requireRole(['FARMER']), (req, res) => {
  res.json({ message: 'Open retail seller requirements listed for farmers' });
});

// 4. Submit a Fulfillment Request for a Seller Requirement
router.post('/fulfillment-requests', authenticateToken, requireRole(['FARMER']), (req, res) => {
  res.json({ message: 'Fulfillment request submitted to retail seller' });
});

export default router;
