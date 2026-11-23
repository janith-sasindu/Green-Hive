import { NextFunction, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import * as seller from '../controllers/seller.controller';
import { SellerRequest } from '../controllers/seller.controller';

const router = Router();

// Development fallback seller (Amara Wickramasinghe) when the app has no login token yet
const DEV_SELLER_ID = Number(process.env.DEV_SELLER_ID) || 5;

const authenticateSeller = (req: SellerRequest, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    req.sellerId = DEV_SELLER_ID;
    return next();
  }
  jwt.verify(token, process.env.JWT_SECRET || 'green_hive_super_secret_key_2026', (err, payload) => {
    const user = payload as { id?: number; role?: string } | undefined;
    if (err || !user?.id || user.role !== 'seller') {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.sellerId = user.id;
    next();
  });
};

router.use(authenticateSeller);

router.get('/state', seller.getState);
router.put('/profile', seller.updateProfile);
router.post('/requirements', seller.createRequirement);
router.post('/fulfillment-requests/:id/reject', seller.rejectFulfillmentRequest);
router.post('/orders', seller.placeOrder);
router.post('/orders/:id/confirm-receipt', seller.confirmReceipt);
router.post('/transport-jobs/:jobId/offers/:offerId/approve', seller.approveTransportOffer);
router.post('/transport-jobs/:jobId/offers/:offerId/reject', seller.rejectTransportOffer);
router.post('/notifications/read-all', seller.markAllNotificationsRead);
router.post('/notifications/:id/read', seller.markNotificationRead);
router.put('/notification-settings', seller.saveNotificationSettings);

export default router;
