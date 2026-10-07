import type { Request, Response } from 'express';
import { pool } from '../config/db';
import { currentUser } from '../middleware/auth';
import { findProductById, listAvailableProducts } from '../models/advertisement.model';
import { confirmReceipt, getSellerOrder, getSellerOrders, placeOrder } from '../services/sellerOrder.service';
import { changeSellerProfile, getSellerProfile } from '../services/sellerProfile.service';
import {
  approveTransportOffer,
  getSellerTransportJob,
  getSellerTransportJobs,
  rejectTransportOffer,
} from '../services/sellerTransport.service';
import { DELIVERY_METHODS, ORDER_FILTERS, PRODUCT_SORTS, TransportRequest } from '../types/seller';
import { notFound } from '../utils/AppError';
import { roundMoney, todayDateString } from '../utils/format';
import { parseId, queryInt, queryText, Validator } from '../utils/validator';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
const MAX_ORDER_QUANTITY_KG = 100_000;

/** Reads the delivery details sent when the seller chooses transportation. */
const readTransportRequest = (transport: Validator): TransportRequest => {
  const request = {
    deliveryLocation: transport.string('deliveryLocation'),
    requiredDate: transport.date('requiredDate'),
    requiredTime: transport.time('requiredTime'),
  };
  if (request.requiredDate !== '' && request.requiredDate < todayDateString()) {
    transport.fail('requiredDate', 'Required date cannot be in the past');
  }
  return request;
};

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

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export async function createOrder(req: Request, res: Response): Promise<void> {
  const body = Validator.of(req.body);
  const deliveryMethod = body.oneOf('deliveryMethod', DELIVERY_METHODS);
  const requestedKg = body.positiveNumber('quantityKg', { max: MAX_ORDER_QUANTITY_KG });
  const input = {
    advertisementId: body.positiveInteger('advertisementId'),
    // Quantities are stored to two decimal places
    quantityKg: roundMoney(requestedKg),
    deliveryMethod,
    transport: deliveryMethod === 'TRANSPORTATION' ? readTransportRequest(body.nested('transport')) : undefined,
  };
  if (requestedKg > 0 && input.quantityKg === 0) {
    body.fail('quantityKg', 'Quantity kg must be at least 0.01');
  }
  body.assertValid();

  res.status(201).json({ order: await placeOrder(currentUser(req).id, input) });
}

export async function listOrders(req: Request, res: Response): Promise<void> {
  const filter = ORDER_FILTERS.find((item) => item === req.query.status) ?? 'all';
  res.json({ orders: await getSellerOrders(currentUser(req).id, filter) });
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  const sellerId = currentUser(req).id;
  const order = await getSellerOrder(sellerId, parseId(req.params.orderId, 'orderId'));
  // The order screen also shows the delivery, so the job comes with it
  const transportJob = order.transportJobId ? await getSellerTransportJob(sellerId, order.transportJobId) : null;
  res.json({ order, transportJob });
}

export async function confirmOrderReceipt(req: Request, res: Response): Promise<void> {
  const order = await confirmReceipt(currentUser(req).id, parseId(req.params.orderId, 'orderId'));
  res.json({ order });
}

// ---------------------------------------------------------------------------
// Transportation
// ---------------------------------------------------------------------------

export async function listTransportJobs(req: Request, res: Response): Promise<void> {
  res.json({ transportJobs: await getSellerTransportJobs(currentUser(req).id) });
}

export async function getTransportJob(req: Request, res: Response): Promise<void> {
  const transportJob = await getSellerTransportJob(currentUser(req).id, parseId(req.params.jobId, 'jobId'));
  res.json({ transportJob });
}

export async function approveOffer(req: Request, res: Response): Promise<void> {
  const transportJob = await approveTransportOffer(
    currentUser(req).id,
    parseId(req.params.jobId, 'jobId'),
    parseId(req.params.offerId, 'offerId'),
  );
  res.json({ transportJob });
}

export async function rejectOffer(req: Request, res: Response): Promise<void> {
  const transportJob = await rejectTransportOffer(
    currentUser(req).id,
    parseId(req.params.jobId, 'jobId'),
    parseId(req.params.offerId, 'offerId'),
  );
  res.json({ transportJob });
}
