import type { Request, Response } from 'express';
import { pool } from '../config/db';
import { currentUser } from '../middleware/auth';
import { findProductById, listAvailableProducts } from '../models/advertisement.model';
import {
  countUnreadNotifications,
  findNotificationSettings,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  saveNotificationSettings,
} from '../models/notification.model';
import { confirmReceipt, getSellerOrder, getSellerOrders, placeOrder } from '../services/sellerOrder.service';
import { changeSellerProfile, getSellerProfile } from '../services/sellerProfile.service';
import {
  acceptFulfillmentRequest,
  createRequirement,
  declineFulfillmentRequest,
  getSellerRequirement,
  getSellerRequirements,
} from '../services/sellerRequirement.service';
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

/** Reads how the seller wants to receive the goods: self pickup, or transportation with its details. */
const readDeliveryChoice = (body: Validator) => {
  const deliveryMethod = body.oneOf('deliveryMethod', DELIVERY_METHODS);
  return {
    deliveryMethod,
    transport: deliveryMethod === 'TRANSPORTATION' ? readTransportRequest(body.nested('transport')) : undefined,
  };
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
  const requestedKg = body.positiveNumber('quantityKg', { max: MAX_ORDER_QUANTITY_KG });
  const input = {
    advertisementId: body.positiveInteger('advertisementId'),
    // Quantities are stored to two decimal places
    quantityKg: roundMoney(requestedKg),
    ...readDeliveryChoice(body),
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

// ---------------------------------------------------------------------------
// Requirements and farmer fulfillment requests
// ---------------------------------------------------------------------------

export async function listRequirements(req: Request, res: Response): Promise<void> {
  res.json({ requirements: await getSellerRequirements(currentUser(req).id) });
}

export async function getRequirement(req: Request, res: Response): Promise<void> {
  const requirement = await getSellerRequirement(
    currentUser(req).id,
    parseId(req.params.requirementId, 'requirementId'),
  );
  res.json({ requirement });
}

export async function postRequirement(req: Request, res: Response): Promise<void> {
  const body = Validator.of(req.body);
  const requirement = {
    productName: body.string('productName', { max: 120 }),
    category: body.string('category', { max: 60 }),
    quantityNeededKg: roundMoney(body.positiveNumber('quantityNeededKg', { max: MAX_ORDER_QUANTITY_KG })),
    maxBudgetPerKg: roundMoney(body.positiveNumber('maxBudgetPerKg')),
    deliveryLocation: body.string('deliveryLocation'),
    description: body.optionalString('description', { max: 1000 }) ?? '',
    deadlineDate: body.date('deadlineDate'),
  };
  if (requirement.deadlineDate !== '' && requirement.deadlineDate < todayDateString()) {
    body.fail('deadlineDate', 'Deadline date cannot be in the past');
  }
  body.assertValid();

  res.status(201).json({ requirement: await createRequirement(currentUser(req).id, requirement) });
}

export async function acceptRequest(req: Request, res: Response): Promise<void> {
  const body = Validator.of(req.body);
  const reservation = readDeliveryChoice(body);
  body.assertValid();

  const order = await acceptFulfillmentRequest(
    currentUser(req).id,
    parseId(req.params.requestId, 'requestId'),
    reservation,
  );
  res.status(201).json({ order });
}

export async function rejectRequest(req: Request, res: Response): Promise<void> {
  const requirement = await declineFulfillmentRequest(
    currentUser(req).id,
    parseId(req.params.requestId, 'requestId'),
  );
  res.json({ requirement });
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function getNotifications(req: Request, res: Response): Promise<void> {
  const userId = currentUser(req).id;
  const limit = queryInt(req.query.limit, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  res.json({
    notifications: await listNotifications(pool, userId, limit),
    unreadCount: await countUnreadNotifications(pool, userId),
  });
}

export async function readNotification(req: Request, res: Response): Promise<void> {
  const userId = currentUser(req).id;
  const found = await markNotificationRead(pool, userId, parseId(req.params.notificationId, 'notificationId'));
  if (!found) throw notFound('Notification not found');
  res.json({ unreadCount: await countUnreadNotifications(pool, userId) });
}

export async function readAllNotifications(req: Request, res: Response): Promise<void> {
  await markAllNotificationsRead(pool, currentUser(req).id);
  res.json({ unreadCount: 0 });
}

export async function getNotificationSettings(req: Request, res: Response): Promise<void> {
  res.json({ settings: await findNotificationSettings(pool, currentUser(req).id) });
}

export async function updateNotificationSettings(req: Request, res: Response): Promise<void> {
  const body = Validator.of(req.body);
  const settings = {
    orders: body.boolean('orders'),
    payments: body.boolean('payments'),
    transportation: body.boolean('transportation'),
    fulfillment: body.boolean('fulfillment'),
    promotions: body.boolean('promotions'),
    security: body.boolean('security'),
  };
  body.assertValid();

  await saveNotificationSettings(pool, currentUser(req).id, settings);
  res.json({ settings });
}
