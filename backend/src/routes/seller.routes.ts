import { Router } from 'express';
import * as seller from '../controllers/seller.controller';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Every seller route needs a signed-in user with the SELLER role
router.use(authenticate, authorize('SELLER'));

router.get('/profile', asyncHandler(seller.getProfile));
router.patch('/profile', asyncHandler(seller.updateProfile));

router.get('/products', asyncHandler(seller.listProducts));
router.get('/products/:productId', asyncHandler(seller.getProduct));

router.post('/orders', asyncHandler(seller.createOrder));
router.get('/orders', asyncHandler(seller.listOrders));
router.get('/orders/:orderId', asyncHandler(seller.getOrder));

router.get('/transport-jobs', asyncHandler(seller.listTransportJobs));
router.get('/transport-jobs/:jobId', asyncHandler(seller.getTransportJob));
router.post('/transport-jobs/:jobId/offers/:offerId/approve', asyncHandler(seller.approveOffer));
router.post('/transport-jobs/:jobId/offers/:offerId/reject', asyncHandler(seller.rejectOffer));

export default router;
