import { pool } from '../config/db';
import { findSellerProfile, updateSellerProfile } from '../models/seller.model';
import { findUserByEmail } from '../models/user.model';
import type { SellerProfile, SellerProfileChanges } from '../types/seller';
import { conflict, notFound } from '../utils/AppError';

export async function getSellerProfile(sellerId: number): Promise<SellerProfile> {
  const profile = await findSellerProfile(pool, sellerId);
  if (!profile) throw notFound('Seller profile not found');
  return profile;
}

export async function changeSellerProfile(sellerId: number, changes: SellerProfileChanges): Promise<SellerProfile> {
  if (changes.email) {
    const owner = await findUserByEmail(pool, changes.email);
    if (owner && owner.id !== sellerId) {
      throw conflict('Another account already uses this email');
    }
  }
  await updateSellerProfile(pool, sellerId, changes);
  return getSellerProfile(sellerId);
}
