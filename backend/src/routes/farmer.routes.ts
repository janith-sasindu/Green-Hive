import { Router } from 'express';
import {
  registerFarmer,
  loginFarmer,
  getFarmerProfile,
  getFarmerRequirements,
  submitFulfillmentRequest,
  getFarmerFulfillments,
} from '../controllers/farmer.controller';

const router = Router();

// Authentication & Registration
router.post('/register', registerFarmer);
router.post('/login', loginFarmer);

// Farmer Profile
router.get('/profile/:id', getFarmerProfile);

// Buyer Requirements & Fulfillment Offers
router.get('/requirements', getFarmerRequirements);
router.post('/requirements/:id/fulfill', submitFulfillmentRequest);
router.get('/fulfillments', getFarmerFulfillments);

export default router;

