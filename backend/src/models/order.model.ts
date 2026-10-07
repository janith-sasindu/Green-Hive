import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { Db } from '../config/db';
import type { DeliveryMethod, OrderFilter, OrderStatus, PaymentStatus, SellerOrder } from '../types/seller';

interface OrderRow extends RowDataPacket {
  id: number;
  order_number: string;
  seller_id: number;
  farmer_id: number;
  product_name: string;
  image_url: string | null;
  quantity_kg: number;
  product_price_per_kg: number;
  total_product_amount: number;
  delivery_method: DeliveryMethod;
  status: OrderStatus;
  pickup_address: string;
  requirement_id: number | null;
  created_at: Date;
  completed_at: Date | null;
  farmer_name: string;
  farmer_location: string | null;
  farmer_rating: number | null;
  farmer_is_verified: number;
  product_payment_status: 'HELD' | 'RELEASED' | 'REFUNDED' | null;
  transport_payment_status: 'HELD' | 'RELEASED' | 'REFUNDED' | null;
  transport_cost: number | null;
  transport_job_id: number | null;
}

export interface NewOrder {
  sellerId: number;
  farmerId: number;
  productName: string;
  imageUrl: string | null;
  quantityKg: number;
  pricePerKg: number;
  totalProductAmount: number;
  deliveryMethod: DeliveryMethod;
  pickupAddress: string;
  status: OrderStatus;
  advertisementId?: number;
  requirementId?: number;
  fulfillmentRequestId?: number;
}

/** The order fields the workflow rules need, read with a row lock. */
export interface LockedOrder {
  id: number;
  orderNumber: string;
  farmerId: number;
  totalProductAmount: number;
  deliveryMethod: DeliveryMethod;
  status: OrderStatus;
}

// Each order has at most one payment of each type and at most one transport job
const ORDER_SELECT = `
  SELECT o.id, o.order_number, o.seller_id, o.farmer_id, o.product_name, o.image_url, o.quantity_kg,
         o.product_price_per_kg, o.total_product_amount, o.delivery_method, o.status, o.pickup_address,
         o.requirement_id, o.created_at, o.completed_at,
         f.name AS farmer_name, f.location AS farmer_location, f.rating AS farmer_rating,
         f.is_verified AS farmer_is_verified,
         pp.status AS product_payment_status,
         tp.status AS transport_payment_status, tp.amount AS transport_cost,
         j.id AS transport_job_id
    FROM orders o
    JOIN users f ON f.id = o.farmer_id
    LEFT JOIN payments pp ON pp.order_id = o.id AND pp.payment_type = 'PRODUCT'
    LEFT JOIN payments tp ON tp.order_id = o.id AND tp.payment_type = 'TRANSPORTATION'
    LEFT JOIN transportation_jobs j ON j.order_id = o.id`;

const FILTER_CONDITIONS: Record<OrderFilter, string> = {
  all: '',
  active: "AND o.status NOT IN ('COMPLETED', 'CANCELLED')",
  inTransit: "AND o.status IN ('PICKED_UP', 'DELIVERED')",
  completed: "AND o.status = 'COMPLETED'",
};

const toTransportPaymentStatus = (row: OrderRow): PaymentStatus => {
  if (row.delivery_method === 'SELF_PICKUP') return 'NOT_REQUIRED';
  return row.transport_payment_status ?? 'PENDING';
};

const toSellerOrder = (row: OrderRow): SellerOrder => ({
  id: row.id,
  orderNumber: row.order_number,
  sellerId: row.seller_id,
  farmerId: row.farmer_id,
  productName: row.product_name,
  quantityKg: row.quantity_kg,
  productPricePerKg: row.product_price_per_kg,
  totalProductAmount: row.total_product_amount,
  deliveryMethod: row.delivery_method,
  status: row.status,
  farmer: {
    id: row.farmer_id,
    name: row.farmer_name,
    location: row.farmer_location,
    rating: row.farmer_rating,
    isVerified: row.farmer_is_verified === 1,
  },
  pickupAddress: row.pickup_address,
  imageUrl: row.image_url,
  productPaymentStatus: row.product_payment_status ?? 'PENDING',
  transportPaymentStatus: toTransportPaymentStatus(row),
  transportCost: row.transport_cost,
  transportJobId: row.transport_job_id,
  requirementId: row.requirement_id,
  createdAt: row.created_at.toISOString(),
  completedAt: row.completed_at ? row.completed_at.toISOString() : null,
});

/** "GH-2041": derived from the id, so it is unique without a separate counter. */
const toOrderNumber = (orderId: number): string => `GH-${2000 + orderId}`;

export async function insertOrder(db: Db, order: NewOrder): Promise<{ id: number; orderNumber: string }> {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO orders
       (seller_id, farmer_id, advertisement_id, requirement_id, fulfillment_request_id, product_name, image_url,
        quantity_kg, product_price_per_kg, total_product_amount, delivery_method, pickup_address, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      order.sellerId,
      order.farmerId,
      order.advertisementId ?? null,
      order.requirementId ?? null,
      order.fulfillmentRequestId ?? null,
      order.productName,
      order.imageUrl,
      order.quantityKg,
      order.pricePerKg,
      order.totalProductAmount,
      order.deliveryMethod,
      order.pickupAddress,
      order.status,
    ],
  );
  const orderNumber = toOrderNumber(result.insertId);
  await db.query<ResultSetHeader>('UPDATE orders SET order_number = ? WHERE id = ?', [orderNumber, result.insertId]);
  return { id: result.insertId, orderNumber };
}

/** Sellers only ever see their own orders: every query is scoped by seller id. */
export async function findSellerOrder(db: Db, sellerId: number, orderId: number): Promise<SellerOrder | null> {
  const [rows] = await db.query<OrderRow[]>(`${ORDER_SELECT} WHERE o.id = ? AND o.seller_id = ?`, [
    orderId,
    sellerId,
  ]);
  return rows.length > 0 ? toSellerOrder(rows[0]) : null;
}

export async function listSellerOrders(db: Db, sellerId: number, filter: OrderFilter): Promise<SellerOrder[]> {
  const [rows] = await db.query<OrderRow[]>(
    `${ORDER_SELECT} WHERE o.seller_id = ? ${FILTER_CONDITIONS[filter]} ORDER BY o.created_at DESC, o.id DESC`,
    [sellerId],
  );
  return rows.map(toSellerOrder);
}

/** Reads one of the seller's orders and locks it until the transaction ends. */
export async function lockSellerOrder(db: Db, sellerId: number, orderId: number): Promise<LockedOrder | null> {
  const [rows] = await db.query<OrderRow[]>(
    `SELECT id, order_number, farmer_id, total_product_amount, delivery_method, status
       FROM orders WHERE id = ? AND seller_id = ? FOR UPDATE`,
    [orderId, sellerId],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    orderNumber: row.order_number,
    farmerId: row.farmer_id,
    totalProductAmount: row.total_product_amount,
    deliveryMethod: row.delivery_method,
    status: row.status,
  };
}

export async function markOrderCompleted(db: Db, orderId: number): Promise<void> {
  await db.query<ResultSetHeader>(
    "UPDATE orders SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP WHERE id = ?",
    [orderId],
  );
}
