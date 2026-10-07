import type { Request, Response } from 'express';
import { pool } from '../config/db';
import { currentUser } from '../middleware/auth';
import { findProductById, listAvailableProducts } from '../models/advertisement.model';
import { changeSellerProfile, getSellerProfile } from '../services/sellerProfile.service';
import { PRODUCT_SORTS } from '../types/seller';
import { notFound } from '../utils/AppError';
import { parseId, queryInt, queryText, Validator } from '../utils/validator';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

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

// ---------------------------------------------------------------------------
// Marketplace: farmer advertisements
// ---------------------------------------------------------------------------

export async function listProducts(req: Request, res: Response): Promise<void> {
  const result = await listAvailableProducts(pool, {
    search: queryText(req.query.search),
    category: queryText(req.query.category),
    location: queryText(req.query.location),
    verifiedOnly: req.query.verifiedOnly === 'true',
    // An unknown sort falls back to the default order instead of failing the request
    sort: PRODUCT_SORTS.find((sort) => sort === req.query.sort) ?? 'recommended',
    limit: queryInt(req.query.limit, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE),
    offset: queryInt(req.query.offset, 0, 0, Number.MAX_SAFE_INTEGER),
  });
  res.json(result);
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  const product = await findProductById(pool, parseId(req.params.productId, 'productId'));
  if (!product) throw notFound('Product not found');
  res.json({ product });
}
