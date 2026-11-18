import { Router } from 'express';
import {
  registerFarmer,
  loginFarmer,
  getFarmerProfile,
} from '../controllers/farmer.controller';

const router = Router();

// Authentication & Registration
router.post('/register', registerFarmer);
router.post('/login', loginFarmer);

// Farmer Profile
router.get('/profile/:id', getFarmerProfile);

export default router;

