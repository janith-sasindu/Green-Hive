import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Module Owner: W.A.J.S. Mihiran (22CSE0356) & W.G.M. Geewinda
// Feature Branch: feature/payment_janith

// 1. View Available Transportation Jobs
router.get('/jobs', authenticateToken, requireRole(['TRANSPORTER']), (req, res) => {
  res.json({ message: 'Available transportation jobs listed for transporters' });
});

// 2. Submit Transportation Cost Offer (Bid)
router.post('/jobs/:id/offers', authenticateToken, requireRole(['TRANSPORTER']), (req, res) => {
  res.json({ message: 'Transportation cost bid submitted' });
});

// 3. Confirm Pickup of Goods (Triggers Farmer Payment Release)
router.post('/jobs/:id/confirm-pickup', authenticateToken, requireRole(['TRANSPORTER']), (req, res) => {
  res.json({ message: 'Goods pickup confirmed by transporter. Farmer product payment released!' });
});

// 4. Update Delivery Status
router.put('/jobs/:id/status', authenticateToken, requireRole(['TRANSPORTER']), (req, res) => {
  res.json({ message: 'Transportation status updated (e.g. IN_TRANSIT)' });
});

export default router;
