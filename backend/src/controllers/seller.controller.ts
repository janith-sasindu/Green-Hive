import { Request, Response } from 'express';
import { PoolConnection } from 'mysql2/promise';
import { pool } from '../config/db';

/**
 * Retail Seller module. The server owns the workflow rules (ordering, requirements,
 * transporter selection and milestone payments) and every mutation answers with the
 * seller's full, freshly read state so the mobile app never drifts from the database.
 */

export interface SellerRequest extends Request {
  sellerId?: number;
}

type Row = Record<string, any>;

const NOTIFICATION_CATEGORIES = ['orders', 'payments', 'transportation', 'fulfillment', 'promotions', 'security'] as const;
type Category = (typeof NOTIFICATION_CATEGORIES)[number];

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const num = (value: unknown): number => Number(value ?? 0);
const iso = (value: unknown): string => (value ? new Date(value as string).toISOString() : new Date().toISOString());
const dateOnly = (value: unknown): string => iso(value).slice(0, 10);
const lkr = (amount: number): string => `Rs. ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

// The database stores "Grains"; the app shows "Grains & Rice"
const toAppCategory = (category: string): string => (category === 'Grains' ? 'Grains & Rice' : category);
const toDbCategory = (category: string): string => (category === 'Grains & Rice' ? 'Grains' : category);
const EMOJI: Record<string, string> = { Vegetables: '🥬', Fruits: '🍌', Grains: '🌾', Spices: '🌶️' };
const emojiFor = (category: string): string => EMOJI[category] ?? '📦';

const stripHash = (code: string): string => String(code).replace(/^#/, '');

async function nextCode(conn: PoolConnection, table: string, column: string, prefix: string, start: number) {
  const [rows] = await conn.query(`SELECT ${column} AS code FROM ${table}`);
  const highest = (rows as Row[]).reduce((max, row) => {
    const value = Number(stripHash(row.code).replace(prefix, ''));
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, start);
  return `#${prefix}${highest + 1}`;
}

async function notify(
  conn: PoolConnection,
  sellerId: number,
  category: Category,
  title: string,
  message: string,
  link?: { screen: string; id: number },
) {
  await conn.query(`INSERT IGNORE INTO seller_notification_settings (seller_id) VALUES (?)`, [sellerId]);
  const [settings] = await conn.query(`SELECT ${category} AS enabled FROM seller_notification_settings WHERE seller_id = ?`, [sellerId]);
  if (!(settings as Row[])[0]?.enabled) return;
  await conn.query(
    `INSERT INTO seller_notifications (seller_id, category, title, message, link_screen, link_id) VALUES (?, ?, ?, ?, ?, ?)`,
    [sellerId, category, title, message, link?.screen ?? null, link?.id ?? null],
  );
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const ORDER_STATUS: Record<string, string> = {
  Pending: 'CREATED',
  'Payment Held': 'PAYMENT_HELD',
  'In Transit': 'PICKED_UP',
  Completed: 'COMPLETED',
  Cancelled: 'CANCELLED',
};
const JOB_STATUS: Record<string, string> = {
  Open: 'OPEN_FOR_BIDS',
  Assigned: 'TRANSPORTER_ASSIGNED',
  'In Transit': 'GOODS_PICKED_UP',
  Delivered: 'GOODS_DELIVERED',
  Cancelled: 'OPEN_FOR_BIDS',
};
const OFFER_STATUS: Record<string, string> = {
  Submitted: 'PENDING',
  'Under Review': 'PENDING',
  Accepted: 'ACCEPTED',
  Declined: 'REJECTED',
};

const farmerSummary = (row: Row) => ({
  id: num(row.farmer_id),
  name: row.farmer_name ?? 'Farmer',
  location: row.farmer_location ?? '',
  rating: num(row.farmer_rating) || 5,
  isVerified: Boolean(row.farmer_verified),
});

async function buildState(sellerId: number) {
  const [userRows] = await pool.query(`SELECT * FROM users WHERE id = ? AND role = 'seller'`, [sellerId]);
  const user = (userRows as Row[])[0];
  if (!user) throw new HttpError(404, 'Seller account not found.');
  const [profileRows] = await pool.query(`SELECT * FROM seller_profiles WHERE seller_id = ?`, [sellerId]);
  const extra = (profileRows as Row[])[0] ?? {};

  const FARMER_COLS = `u.name AS farmer_name, u.location AS farmer_location, u.verified AS farmer_verified,
    COALESCE(fp.rating, 5) AS farmer_rating, COALESCE(fp.farm_location, u.location, '') AS farm_address`;
  const FARMER_JOIN = `LEFT JOIN users u ON u.id = %ID% LEFT JOIN farmer_profiles fp ON fp.user_id = u.id`;

  // Marketplace
  const [adRows] = await pool.query(
    `SELECT a.*, a.farmer_id AS farmer_id, ${FARMER_COLS}
     FROM selling_ads a ${FARMER_JOIN.replace('%ID%', 'a.farmer_id')}
     WHERE a.status IN ('active', 'sold') ORDER BY a.created_at DESC`,
  );
  const products = (adRows as Row[]).map((r) => ({
    id: r.id,
    farmerId: r.farmer_id,
    farmer: farmerSummary(r),
    productName: r.title,
    category: toAppCategory(r.category),
    quantityAvailableKg: num(r.quantity_available),
    unitPriceLkr: num(r.price_per_kg),
    location: r.location,
    pickupAddress: r.farm_address || r.location,
    description: r.description ?? '',
    availabilityStartDate: dateOnly(r.created_at),
    availabilityEndDate: r.valid_until ? dateOnly(r.valid_until) : dateOnly(r.created_at),
    status: r.status === 'active' && num(r.quantity_available) > 0 ? 'ACTIVE' : 'SOLD_OUT',
    emoji: emojiFor(r.category),
    imageUrl: r.image_url || undefined,
  }));

  // Orders, jobs and payments
  const [orderRows] = await pool.query(
    `SELECT o.*, ${FARMER_COLS}, a.location AS ad_location, a.image_url AS ad_image, a.category AS ad_category
     FROM orders o
     ${FARMER_JOIN.replace('%ID%', 'o.farmer_id')}
     LEFT JOIN selling_ads a ON a.id = o.selling_ad_id
     WHERE o.seller_id = ? ORDER BY o.created_at DESC, o.id DESC`,
    [sellerId],
  );
  const orderIds = (orderRows as Row[]).map((o) => o.id);
  const inList = orderIds.length ? orderIds : [0];
  const [jobRows] = await pool.query(`SELECT * FROM transport_jobs WHERE order_id IN (?) ORDER BY id DESC`, [inList]);
  const jobs = jobRows as Row[];
  const jobIds = jobs.map((j) => j.id);
  const [offerRows] = await pool.query(
    `SELECT t.*, u.name AS transporter_name,
            COALESCE(tp.vehicle_type, '') AS vehicle, COALESCE(tp.rating, 5) AS rating
     FROM transport_offers t
     LEFT JOIN users u ON u.id = t.transporter_id
     LEFT JOIN transporter_profiles tp ON tp.user_id = t.transporter_id
     WHERE t.job_id IN (?) ORDER BY t.created_at ASC, t.id ASC`,
    [jobIds.length ? jobIds : [0]],
  ).catch(async () => {
    // transporter_profiles layout differs between environments; fall back to the user row only
    return pool.query(
      `SELECT t.*, u.name AS transporter_name, '' AS vehicle, 5 AS rating
       FROM transport_offers t LEFT JOIN users u ON u.id = t.transporter_id
       WHERE t.job_id IN (?) ORDER BY t.created_at ASC, t.id ASC`,
      [jobIds.length ? jobIds : [0]],
    );
  });
  const [paymentRows] = await pool.query(`SELECT * FROM payments WHERE order_id IN (?)`, [inList]);
  const payments = paymentRows as Row[];

  const jobByOrder = new Map<number, Row>(jobs.map((j) => [j.order_id, j]));
  const orders = (orderRows as Row[]).map((o) => {
    const job = jobByOrder.get(o.id);
    const transported = Boolean(job) || o.delivery_method === 'TRANSPORTATION';
    let status = ORDER_STATUS[o.order_status] ?? 'CREATED';
    if (status === 'PICKED_UP' && job?.status === 'Delivered') status = 'DELIVERED';
    const productPaid = o.payment_status === 'Held by Green Hive' ? 'HELD' : 'RELEASED';
    const feePayment = payments.find((p) => p.order_id === o.id && p.payment_type === 'transport_fee');
    const assigned = job && job.transporter_id && ['Assigned', 'In Transit', 'Delivered'].includes(job.status);
    let transportPayment = 'NOT_REQUIRED';
    if (transported) {
      if (status === 'COMPLETED' || feePayment?.status === 'Released') transportPayment = 'RELEASED';
      else if (feePayment || assigned) transportPayment = 'HELD';
      else transportPayment = 'PENDING';
    }
    return {
      id: o.id,
      orderNumber: stripHash(o.order_code),
      sellerId,
      farmerId: o.farmer_id,
      productName: o.product_name,
      quantityKg: num(o.quantity),
      productPricePerKg: num(o.unit_price),
      totalProductAmount: num(o.total_amount),
      deliveryMethod: transported ? 'TRANSPORTATION' : 'SELF_PICKUP',
      status,
      farmer: farmerSummary(o),
      pickupAddress: o.farm_address || o.ad_location || '',
      emoji: emojiFor(o.ad_category ?? 'Vegetables'),
      imageUrl: o.ad_image || undefined,
      productPaymentStatus: productPaid,
      transportPaymentStatus: transportPayment,
      transportCost: assigned ? num(job!.fee) : undefined,
      transportJobId: job?.id,
      requirementId: o.requirement_id ?? undefined,
      createdAt: iso(o.created_at),
      completedAt: status === 'COMPLETED' ? iso(o.created_at) : undefined,
    };
  });

  const orderById = new Map(orders.map((o) => [o.id, o]));
  const transportJobs = jobs.map((j) => {
    const order = orderById.get(j.order_id)!;
    const when = new Date(j.scheduled_date ?? Date.now());
    const offers = (offerRows as Row[])
      .filter((t) => t.job_id === j.id)
      .map((t) => ({
        id: t.id,
        jobId: j.id,
        transporterId: t.transporter_id,
        transporter: {
          id: t.transporter_id,
          name: t.transporter_name ?? 'Transporter',
          vehicle: t.vehicle || 'Vehicle on request',
          rating: num(t.rating) || 5,
          completedJobs: 0,
        },
        proposedCost: num(t.quote_price),
        estimatedDeliveryTime: t.estimated_delivery ?? '',
        status: OFFER_STATUS[t.status] ?? 'PENDING',
        submittedAt: iso(t.created_at),
      }));
    const assigned = j.transporter_id && ['Assigned', 'In Transit', 'Delivered'].includes(j.status);
    return {
      id: j.id,
      jobNumber: stripHash(j.job_code),
      orderId: j.order_id,
      productName: order.productName,
      pickupLocation: j.pickup_location,
      deliveryLocation: j.drop_location,
      quantityKg: order.quantityKg,
      requiredDate: dateOnly(when),
      requiredTime: when.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' }),
      assignedTransporterId: assigned ? j.transporter_id : undefined,
      agreedTransportCost: assigned ? num(j.fee) : undefined,
      status: JOB_STATUS[j.status] ?? 'OPEN_FOR_BIDS',
      offers,
    };
  });

  // Requirements and the farmers' responses
  const [reqRows] = await pool.query(`SELECT * FROM requirement_ads WHERE seller_id = ? ORDER BY created_at DESC, id DESC`, [sellerId]);
  const requirements = (reqRows as Row[]).map((r) => ({
    id: r.id,
    sellerId,
    productName: r.title,
    category: toAppCategory(r.category),
    quantityNeededKg: num(r.quantity_needed),
    maxBudgetPerKg: num(r.offered_price_per_kg),
    deliveryLocation: r.location,
    description: r.description ?? '',
    deadlineDate: dateOnly(r.deadline),
    status: r.status === 'fulfilled' ? 'FULFILLED' : r.status === 'cancelled' ? 'EXPIRED' : 'OPEN',
    createdAt: iso(r.created_at),
  }));
  const reqIds = requirements.map((r) => r.id);
  const [frRows] = await pool.query(
    `SELECT f.*, ${FARMER_COLS} FROM fulfillment_requests f
     ${FARMER_JOIN.replace('%ID%', 'f.farmer_id')}
     WHERE f.requirement_id IN (?) ORDER BY f.created_at DESC, f.id DESC`,
    [reqIds.length ? reqIds : [0]],
  );
  const fulfillmentRequests = (frRows as Row[]).map((f) => ({
    id: f.id,
    requirementId: f.requirement_id,
    farmerId: f.farmer_id,
    farmer: farmerSummary(f),
    offeredQuantityKg: num(f.offered_quantity_kg),
    offeredPricePerKg: num(f.offered_price_per_kg),
    notes: f.notes ?? undefined,
    status: f.status,
    pickupAddress: f.farm_address || f.farmer_location || '',
    submittedAt: iso(f.created_at),
  }));

  // Notifications
  await pool.query(`INSERT IGNORE INTO seller_notification_settings (seller_id) VALUES (?)`, [sellerId]);
  const [noteRows] = await pool.query(`SELECT * FROM seller_notifications WHERE seller_id = ? ORDER BY created_at DESC, id DESC LIMIT 100`, [sellerId]);
  const linkKey: Record<string, string> = { OrderDetail: 'orderId', TransportJobDetail: 'jobId', RequirementDetail: 'requirementId' };
  const notifications = (noteRows as Row[]).map((n) => ({
    id: n.id,
    category: n.category,
    title: n.title,
    message: n.message,
    createdAt: iso(n.created_at),
    isRead: Boolean(n.is_read),
    link: n.link_screen && linkKey[n.link_screen] ? { screen: n.link_screen, [linkKey[n.link_screen]]: n.link_id } : undefined,
  }));
  const [settingRows] = await pool.query(`SELECT * FROM seller_notification_settings WHERE seller_id = ?`, [sellerId]);
  const notificationSettings = Object.fromEntries(
    NOTIFICATION_CATEGORIES.map((c) => [c, Boolean((settingRows as Row[])[0]?.[c])]),
  );

  return {
    profile: {
      id: user.id,
      name: user.name,
      businessName: extra.business_name || user.name,
      email: user.email,
      phone: user.phone ?? '',
      location: user.location ?? '',
      address: extra.address || user.location || '',
      isVerified: Boolean(user.verified),
      rating: 5,
      avatarUri: extra.avatar_url || undefined,
    },
    products,
    orders,
    requirements,
    fulfillmentRequests,
    transportJobs,
    notifications,
    notificationSettings,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function withTransaction<T>(work: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

const handler =
  (action: (req: SellerRequest) => Promise<Record<string, unknown> | void>) =>
  async (req: SellerRequest, res: Response) => {
    try {
      const extra = (await action(req)) ?? {};
      res.json({ success: true, data: { ...extra, state: await buildState(req.sellerId!) } });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      console.error('Seller API error:', error);
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
  };

const getOwnOrder = async (conn: PoolConnection, sellerId: number, orderId: number) => {
  const [rows] = await conn.query(`SELECT * FROM orders WHERE id = ? AND seller_id = ? FOR UPDATE`, [orderId, sellerId]);
  const order = (rows as Row[])[0];
  if (!order) throw new HttpError(404, 'Order not found.');
  return order;
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export const getState = handler(async () => undefined);

export const updateProfile = handler(async (req) => {
  const { phone, email, location, avatarUri } = req.body ?? {};
  const sellerId = req.sellerId!;
  await withTransaction(async (conn) => {
    if (phone !== undefined || email !== undefined || location !== undefined) {
      await conn.query(
        `UPDATE users SET phone = COALESCE(?, phone), email = COALESCE(?, email), location = COALESCE(?, location) WHERE id = ?`,
        [phone ?? null, email ?? null, location ?? null, sellerId],
      );
    }
    if (avatarUri !== undefined) {
      await conn.query(
        `INSERT INTO seller_profiles (seller_id, avatar_url) VALUES (?, ?) ON DUPLICATE KEY UPDATE avatar_url = VALUES(avatar_url)`,
        [sellerId, avatarUri],
      );
    }
  });
});

export const createRequirement = handler(async (req) => {
  const b = req.body ?? {};
  const productName = String(b.productName ?? '').trim();
  const quantity = Number(b.quantityNeededKg);
  const budget = Number(b.maxBudgetPerKg);
  const location = String(b.deliveryLocation ?? '').trim();
  if (!productName) throw new HttpError(400, 'Enter the product you need.');
  if (!(quantity > 0)) throw new HttpError(400, 'Enter the quantity you need.');
  if (!(budget > 0)) throw new HttpError(400, 'Enter your maximum price per kg.');
  if (!location) throw new HttpError(400, 'Enter a delivery location.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(b.deadlineDate ?? ''))) throw new HttpError(400, 'Enter a valid deadline date.');

  const [result] = await pool.query(
    `INSERT INTO requirement_ads (seller_id, title, category, offered_price_per_kg, quantity_needed, unit, location, deadline, description, status)
     VALUES (?, ?, ?, ?, ?, 'kg', ?, ?, ?, 'active')`,
    [req.sellerId, productName, toDbCategory(String(b.category ?? 'Vegetables')), budget, quantity, location, b.deadlineDate, String(b.description ?? '').trim()],
  );
  return { requirementId: (result as any).insertId };
});

export const rejectFulfillmentRequest = handler(async (req) => {
  const id = Number(req.params.id);
  const [result] = await pool.query(
    `UPDATE fulfillment_requests f JOIN requirement_ads r ON r.id = f.requirement_id
     SET f.status = 'REJECTED' WHERE f.id = ? AND r.seller_id = ? AND f.status = 'PENDING'`,
    [id, req.sellerId],
  );
  if (!(result as any).affectedRows) throw new HttpError(409, 'Only pending fulfillment requests can be rejected.');
});

export const placeOrder = handler(async (req) => {
  const { source, deliveryMethod, transport } = req.body ?? {};
  const sellerId = req.sellerId!;
  if (deliveryMethod !== 'SELF_PICKUP' && deliveryMethod !== 'TRANSPORTATION') {
    throw new HttpError(400, 'Choose a delivery method.');
  }
  if (deliveryMethod === 'TRANSPORTATION' && !String(transport?.deliveryLocation ?? '').trim()) {
    throw new HttpError(400, 'A delivery location is required when transportation is requested.');
  }

  const orderId = await withTransaction(async (conn) => {
    let line: { farmerId: number; productName: string; quantityKg: number; pricePerKg: number; adId: number | null; requirementId: number | null; pickup: string };

    if (source?.kind === 'product') {
      const quantityKg = Number(source.quantityKg);
      const [rows] = await conn.query(
        `SELECT a.*, COALESCE(fp.farm_location, a.location) AS pickup FROM selling_ads a
         LEFT JOIN farmer_profiles fp ON fp.user_id = a.farmer_id WHERE a.id = ? FOR UPDATE`,
        [Number(source.productId)],
      );
      const ad = (rows as Row[])[0];
      if (!ad || ad.status !== 'active' || num(ad.quantity_available) <= 0) throw new HttpError(409, 'This product is no longer available.');
      if (!Number.isFinite(quantityKg) || quantityKg <= 0) throw new HttpError(400, 'Enter a quantity greater than zero.');
      if (quantityKg > num(ad.quantity_available)) {
        throw new HttpError(409, `Only ${num(ad.quantity_available)} kg available from this farmer.`);
      }
      const remaining = num(ad.quantity_available) - quantityKg;
      await conn.query(`UPDATE selling_ads SET quantity_available = ?, status = ? WHERE id = ?`, [remaining, remaining === 0 ? 'sold' : 'active', ad.id]);
      line = { farmerId: ad.farmer_id, productName: ad.title, quantityKg, pricePerKg: num(ad.price_per_kg), adId: ad.id, requirementId: null, pickup: ad.pickup };
    } else if (source?.kind === 'fulfillment') {
      const [rows] = await conn.query(
        `SELECT f.*, r.title, r.status AS req_status, r.deadline, COALESCE(fp.farm_location, u.location, '') AS pickup
         FROM fulfillment_requests f JOIN requirement_ads r ON r.id = f.requirement_id
         LEFT JOIN users u ON u.id = f.farmer_id LEFT JOIN farmer_profiles fp ON fp.user_id = f.farmer_id
         WHERE f.id = ? AND r.seller_id = ? FOR UPDATE`,
        [Number(source.requestId), sellerId],
      );
      const fr = (rows as Row[])[0];
      if (!fr || fr.status !== 'PENDING') throw new HttpError(409, 'This fulfillment request is no longer available.');
      if (fr.req_status !== 'active' || dateOnly(fr.deadline) < new Date().toISOString().slice(0, 10)) {
        throw new HttpError(409, 'This requirement is no longer open.');
      }
      await conn.query(`UPDATE fulfillment_requests SET status = 'ACCEPTED' WHERE id = ?`, [fr.id]);
      await conn.query(`UPDATE fulfillment_requests SET status = 'REJECTED' WHERE requirement_id = ? AND id <> ? AND status = 'PENDING'`, [fr.requirement_id, fr.id]);
      await conn.query(`UPDATE requirement_ads SET status = 'fulfilled' WHERE id = ?`, [fr.requirement_id]);
      line = { farmerId: fr.farmer_id, productName: fr.title, quantityKg: num(fr.offered_quantity_kg), pricePerKg: num(fr.offered_price_per_kg), adId: null, requirementId: fr.requirement_id, pickup: fr.pickup };
    } else {
      throw new HttpError(400, 'Choose what to order.');
    }

    const total = line.quantityKg * line.pricePerKg;
    const orderCode = await nextCode(conn, 'orders', 'order_code', 'GH-', 2000);
    const [orderResult] = await conn.query(
      `INSERT INTO orders (order_code, selling_ad_id, seller_id, farmer_id, product_name, quantity, unit_price, total_amount, order_status, payment_status, delivery_method, requirement_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Payment Held', 'Held by Green Hive', ?, ?)`,
      [orderCode, line.adId, sellerId, line.farmerId, line.productName, line.quantityKg, line.pricePerKg, total, deliveryMethod, line.requirementId],
    );
    const newOrderId = (orderResult as any).insertId as number;
    const txCode = await nextCode(conn, 'payments', 'tx_code', 'TX-', 9000);
    await conn.query(
      `INSERT INTO payments (tx_code, order_id, payer_id, payee_id, amount, payment_type, status) VALUES (?, ?, ?, ?, ?, 'product_purchase', 'Held in Escrow')`,
      [txCode, newOrderId, sellerId, line.farmerId, total],
    );

    let jobId: number | null = null;
    if (deliveryMethod === 'TRANSPORTATION') {
      const jobCode = await nextCode(conn, 'transport_jobs', 'job_code', 'TR-', 1000);
      const parsed = new Date(`${transport.requiredDate} ${transport.requiredTime ?? '08:00 AM'}`);
      const [jobResult] = await conn.query(
        `INSERT INTO transport_jobs (job_code, order_id, pickup_location, drop_location, vehicle_type, fee, scheduled_date, status)
         VALUES (?, ?, ?, ?, 'Any', 0, ?, 'Open')`,
        [jobCode, newOrderId, line.pickup || 'Farm pickup', String(transport.deliveryLocation).trim(), Number.isNaN(parsed.getTime()) ? new Date() : parsed],
      );
      jobId = (jobResult as any).insertId;
    }

    await notify(
      conn,
      sellerId,
      'payments',
      'Payment Held Securely',
      `${lkr(total)} for Order ${stripHash(orderCode)} is held by Green Hive until ${jobId ? 'the transporter confirms pickup' : 'you confirm receipt'}.`,
      { screen: 'OrderDetail', id: newOrderId },
    );
    return newOrderId;
  });
  return { orderId };
});

export const approveTransportOffer = handler(async (req) => {
  const jobId = Number(req.params.jobId);
  const offerId = Number(req.params.offerId);
  const sellerId = req.sellerId!;
  await withTransaction(async (conn) => {
    const [jobRows] = await conn.query(
      `SELECT j.*, o.seller_id, o.farmer_id, o.order_code FROM transport_jobs j JOIN orders o ON o.id = j.order_id WHERE j.id = ? AND o.seller_id = ? FOR UPDATE`,
      [jobId, sellerId],
    );
    const job = (jobRows as Row[])[0];
    if (!job) throw new HttpError(404, 'Transport job not found.');
    if (job.status !== 'Open') throw new HttpError(409, 'A transporter has already been selected for this job.');
    const [offerRows] = await conn.query(`SELECT * FROM transport_offers WHERE id = ? AND job_id = ? FOR UPDATE`, [offerId, jobId]);
    const offer = (offerRows as Row[])[0];
    if (!offer || !['Submitted', 'Under Review'].includes(offer.status)) throw new HttpError(409, 'This offer is no longer available.');

    await conn.query(`UPDATE transport_offers SET status = 'Accepted' WHERE id = ?`, [offerId]);
    await conn.query(`UPDATE transport_offers SET status = 'Declined' WHERE job_id = ? AND id <> ? AND status IN ('Submitted', 'Under Review')`, [jobId, offerId]);
    await conn.query(`UPDATE transport_jobs SET status = 'Assigned', transporter_id = ?, fee = ? WHERE id = ?`, [offer.transporter_id, offer.quote_price, jobId]);
    const txCode = await nextCode(conn, 'payments', 'tx_code', 'TX-', 9000);
    await conn.query(
      `INSERT INTO payments (tx_code, order_id, payer_id, payee_id, amount, payment_type, status) VALUES (?, ?, ?, ?, ?, 'transport_fee', 'Held in Escrow')`,
      [txCode, job.order_id, sellerId, offer.transporter_id, offer.quote_price],
    );
    await notify(
      conn,
      sellerId,
      'payments',
      'Transportation Payment Held',
      `${lkr(num(offer.quote_price))} for Job ${stripHash(job.job_code)} is held by Green Hive until you confirm delivery.`,
      { screen: 'TransportJobDetail', id: jobId },
    );
  });
});

export const rejectTransportOffer = handler(async (req) => {
  const [result] = await pool.query(
    `UPDATE transport_offers t
     JOIN transport_jobs j ON j.id = t.job_id JOIN orders o ON o.id = j.order_id
     SET t.status = 'Declined'
     WHERE t.id = ? AND t.job_id = ? AND o.seller_id = ? AND t.status IN ('Submitted', 'Under Review')`,
    [Number(req.params.offerId), Number(req.params.jobId), req.sellerId],
  );
  if (!(result as any).affectedRows) throw new HttpError(409, 'Only pending offers can be rejected.');
});

export const confirmReceipt = handler(async (req) => {
  const orderId = Number(req.params.id);
  const sellerId = req.sellerId!;
  await withTransaction(async (conn) => {
    const order = await getOwnOrder(conn, sellerId, orderId);
    const [jobRows] = await conn.query(`SELECT * FROM transport_jobs WHERE order_id = ? FOR UPDATE`, [orderId]);
    const job = (jobRows as Row[])[0];
    const transported = Boolean(job) || order.delivery_method === 'TRANSPORTATION';
    const ok = transported ? order.order_status === 'In Transit' : order.order_status === 'Payment Held';
    if (!ok) throw new HttpError(409, 'Receipt cannot be confirmed for this order yet.');

    await conn.query(`UPDATE orders SET order_status = 'Completed', payment_status = 'Completed' WHERE id = ?`, [orderId]);
    await conn.query(`UPDATE payments SET status = 'Released', released_at = CURRENT_TIMESTAMP WHERE order_id = ? AND status = 'Held in Escrow'`, [orderId]);
    if (job) await conn.query(`UPDATE transport_jobs SET status = 'Delivered' WHERE id = ?`, [job.id]);

    const [feeRows] = await conn.query(`SELECT amount FROM payments WHERE order_id = ? AND payment_type = 'transport_fee'`, [orderId]);
    const fee = num((feeRows as Row[])[0]?.amount);
    await notify(
      conn,
      sellerId,
      'payments',
      transported ? 'Transportation Payment Released' : 'Product Payment Released',
      transported
        ? `${lkr(fee)} was released to the transporter after you confirmed delivery of Order ${stripHash(order.order_code)}.`
        : `${lkr(num(order.total_amount))} was released to the farmer after you confirmed receipt of Order ${stripHash(order.order_code)}.`,
      { screen: 'OrderDetail', id: orderId },
    );
  });
});

export const markNotificationRead = handler(async (req) => {
  await pool.query(`UPDATE seller_notifications SET is_read = 1 WHERE id = ? AND seller_id = ?`, [Number(req.params.id), req.sellerId]);
});

export const markAllNotificationsRead = handler(async (req) => {
  await pool.query(`UPDATE seller_notifications SET is_read = 1 WHERE seller_id = ?`, [req.sellerId]);
});

export const saveNotificationSettings = handler(async (req) => {
  const body = req.body ?? {};
  const values = NOTIFICATION_CATEGORIES.map((c) => (body[c] ? 1 : 0));
  await pool.query(
    `INSERT INTO seller_notification_settings (seller_id, ${NOTIFICATION_CATEGORIES.join(', ')}) VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE ${NOTIFICATION_CATEGORIES.map((c) => `${c} = VALUES(${c})`).join(', ')}`,
    [req.sellerId, ...values],
  );
});
