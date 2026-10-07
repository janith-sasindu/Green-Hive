import type { Request, Response } from 'express';
import { currentUser } from '../middleware/auth';
import { changeSellerProfile, getSellerProfile } from '../services/sellerProfile.service';
import { Validator } from '../utils/validator';

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function getProfile(req: Request, res: Response): Promise<void> {
  res.json({ profile: await getSellerProfile(currentUser(req).id) });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const body = Validator.of(req.body);
  // Every field is optional, but a field that is sent must be valid
  const changes = {
    name: body.has('name') ? body.string('name', { max: 120 }) : undefined,
    businessName: body.has('businessName') ? body.string('businessName', { max: 150 }) : undefined,
    email: body.has('email') ? body.email('email') : undefined,
    phone: body.has('phone') ? body.phone('phone') : undefined,
    location: body.has('location') ? body.string('location', { max: 120 }) : undefined,
    address: body.has('address') ? body.string('address') : undefined,
  };
  body.assertValid();

  res.json({ profile: await changeSellerProfile(currentUser(req).id, changes) });
}
