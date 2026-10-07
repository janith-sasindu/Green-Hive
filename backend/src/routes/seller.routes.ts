import { Router } from 'express';
import * as seller from '../controllers/seller.controller';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Every seller route needs a signed-in user with the SELLER role
router.use(authenticate, authorize('SELLER'));

router.get('/profile', asyncHandler(seller.getProfile));
router.patch('/profile', asyncHandler(seller.updateProfile));

export default router;
