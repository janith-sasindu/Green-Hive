import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { Db } from '../config/db';
import type {
  FulfillmentRequestView,
  NewRequirement,
  RequirementStatus,
  ResponseStatus,
  SellerRequirement,
} from '../types/seller';

interface RequirementRow extends RowDataPacket {
  id: number;
  seller_id: number;
  product_name: string;
  category: string;
  quantity_needed_kg: number;
  max_budget_per_kg: number;
  delivery_location: string;
  description: string | null;
  deadline_date: string;
  status: RequirementStatus;
  created_at: Date;
  pending_requests: number;
  order_id: number | null;
}

interface FulfillmentRow extends RowDataPacket {
  id: number;
  requirement_id: number;
  farmer_id: number;
  offered_quantity_kg: number;
  offered_price_per_kg: number;
  notes: string | null;
  status: ResponseStatus;
  created_at: Date;
  farmer_name: string;
  farmer_location: string | null;
  farmer_rating: number | null;
  farmer_is_verified: number;
  pickup_address: string;
}

/** A fulfillment request with the requirement it answers, read with row locks. */
export interface LockedFulfillmentRequest {
  id: number;
  farmerId: number;
  offeredQuantityKg: number;
  offeredPricePerKg: number;
  status: ResponseStatus;
  pickupAddress: string;
  requirement: {
    id: number;
    productName: string;
    status: RequirementStatus;
  };
}

// An OPEN requirement past its deadline no longer accepts requests, so it is reported as EXPIRED
const EFFECTIVE_STATUS = "CASE WHEN r.status = 'OPEN' AND r.deadline_date < CURDATE() THEN 'EXPIRED' ELSE r.status END";

const PICKUP_ADDRESS = "COALESCE(fp.farm_address, u.location, 'To be confirmed with the farmer')";

const REQUIREMENT_SELECT = `
  SELECT r.id, r.seller_id, r.product_name, r.category, r.quantity_needed_kg, r.max_budget_per_kg,
         r.delivery_location, r.description, r.deadline_date, r.created_at,
         ${EFFECTIVE_STATUS} AS status,
         (SELECT COUNT(*) FROM fulfillment_requests fr
           WHERE fr.requirement_id = r.id AND fr.status = 'PENDING') AS pending_requests,
         (SELECT o.id FROM orders o WHERE o.requirement_id = r.id LIMIT 1) AS order_id
    FROM requirements r`;

const toRequirement = (row: RequirementRow): SellerRequirement => ({
  id: row.id,
  sellerId: row.seller_id,
  productName: row.product_name,
  category: row.category,
  quantityNeededKg: row.quantity_needed_kg,
  maxBudgetPerKg: row.max_budget_per_kg,
  deliveryLocation: row.delivery_location,
  description: row.description ?? '',
  deadlineDate: row.deadline_date,
  status: row.status,
  createdAt: row.created_at.toISOString(),
  pendingRequests: row.pending_requests,
  orderId: row.order_id,
});

const toFulfillmentRequest = (row: FulfillmentRow): FulfillmentRequestView => ({
  id: row.id,
  requirementId: row.requirement_id,
  farmerId: row.farmer_id,
  offeredQuantityKg: row.offered_quantity_kg,
  offeredPricePerKg: row.offered_price_per_kg,
  notes: row.notes,
  status: row.status,
  submittedAt: row.created_at.toISOString(),
  farmer: {
    id: row.farmer_id,
    name: row.farmer_name,
    location: row.farmer_location,
    rating: row.farmer_rating,
    isVerified: row.farmer_is_verified === 1,
  },
  pickupAddress: row.pickup_address,
});

export async function insertRequirement(db: Db, sellerId: number, requirement: NewRequirement): Promise<number> {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO requirements
       (seller_id, product_name, category, quantity_needed_kg, max_budget_per_kg, delivery_location,
        description, deadline_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sellerId,
      requirement.productName,
      requirement.category,
      requirement.quantityNeededKg,
      requirement.maxBudgetPerKg,
      requirement.deliveryLocation,
      requirement.description,
      requirement.deadlineDate,
    ],
  );
  return result.insertId;
}

export async function listSellerRequirements(db: Db, sellerId: number): Promise<SellerRequirement[]> {
  const [rows] = await db.query<RequirementRow[]>(
    `${REQUIREMENT_SELECT} WHERE r.seller_id = ? ORDER BY r.created_at DESC, r.id DESC`,
    [sellerId],
  );
  return rows.map(toRequirement);
}

/** The seller's newest requirements that farmers can still respond to. */
export async function listOpenRequirements(db: Db, sellerId: number, limit: number): Promise<SellerRequirement[]> {
  const [rows] = await db.query<RequirementRow[]>(
    `${REQUIREMENT_SELECT}
      WHERE r.seller_id = ? AND r.status = 'OPEN' AND r.deadline_date >= CURDATE()
      ORDER BY r.created_at DESC, r.id DESC LIMIT ?`,
    [sellerId, limit],
  );
  return rows.map(toRequirement);
}

export async function findSellerRequirement(
  db: Db,
  sellerId: number,
  requirementId: number,
): Promise<SellerRequirement | null> {
  const [rows] = await db.query<RequirementRow[]>(`${REQUIREMENT_SELECT} WHERE r.id = ? AND r.seller_id = ?`, [
    requirementId,
    sellerId,
  ]);
  return rows.length > 0 ? toRequirement(rows[0]) : null;
}

export async function listFulfillmentRequests(db: Db, requirementId: number): Promise<FulfillmentRequestView[]> {
  const [rows] = await db.query<FulfillmentRow[]>(
    `SELECT fr.id, fr.requirement_id, fr.farmer_id, fr.offered_quantity_kg, fr.offered_price_per_kg, fr.notes,
            fr.status, fr.created_at,
            u.name AS farmer_name, u.location AS farmer_location, u.rating AS farmer_rating,
            u.is_verified AS farmer_is_verified,
            ${PICKUP_ADDRESS} AS pickup_address
       FROM fulfillment_requests fr
       JOIN users u ON u.id = fr.farmer_id
       LEFT JOIN farmer_profiles fp ON fp.user_id = fr.farmer_id
      WHERE fr.requirement_id = ?
      ORDER BY fr.created_at ASC, fr.id ASC`,
    [requirementId],
  );
  return rows.map(toFulfillmentRequest);
}

/**
 * Reads a fulfillment request on one of the seller's requirements and locks both rows
 * until the transaction ends, so a requirement cannot be reserved twice.
 */
export async function lockFulfillmentRequest(
  db: Db,
  sellerId: number,
  requestId: number,
): Promise<LockedFulfillmentRequest | null> {
  const [rows] = await db.query<(FulfillmentRow & { product_name: string; requirement_status: RequirementStatus })[]>(
    `SELECT fr.id, fr.requirement_id, fr.farmer_id, fr.offered_quantity_kg, fr.offered_price_per_kg, fr.status,
            ${PICKUP_ADDRESS} AS pickup_address,
            r.product_name, ${EFFECTIVE_STATUS} AS requirement_status
       FROM fulfillment_requests fr
       JOIN requirements r ON r.id = fr.requirement_id
       JOIN users u ON u.id = fr.farmer_id
       LEFT JOIN farmer_profiles fp ON fp.user_id = fr.farmer_id
      WHERE fr.id = ? AND r.seller_id = ?
        FOR UPDATE OF fr, r`,
    [requestId, sellerId],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    farmerId: row.farmer_id,
    offeredQuantityKg: row.offered_quantity_kg,
    offeredPricePerKg: row.offered_price_per_kg,
    status: row.status,
    pickupAddress: row.pickup_address,
    requirement: { id: row.requirement_id, productName: row.product_name, status: row.requirement_status },
  };
}

/** Farmers whose requests on the requirement are still pending, other than the given request. */
export async function findOtherPendingFarmers(db: Db, requirementId: number, exceptRequestId: number): Promise<number[]> {
  const [rows] = await db.query<(RowDataPacket & { farmer_id: number })[]>(
    `SELECT farmer_id FROM fulfillment_requests
      WHERE requirement_id = ? AND id <> ? AND status = 'PENDING' FOR UPDATE`,
    [requirementId, exceptRequestId],
  );
  return rows.map((row) => row.farmer_id);
}

/** Accepts one request, declines the other pending ones and closes the requirement. */
export async function reserveRequirement(db: Db, requirementId: number, acceptedRequestId: number): Promise<void> {
  await db.query<ResultSetHeader>(
    "UPDATE fulfillment_requests SET status = IF(id = ?, 'ACCEPTED', 'REJECTED') WHERE requirement_id = ? AND status = 'PENDING'",
    [acceptedRequestId, requirementId],
  );
  await db.query<ResultSetHeader>("UPDATE requirements SET status = 'FULFILLED' WHERE id = ?", [requirementId]);
}

export async function rejectFulfillmentRequest(db: Db, requestId: number): Promise<void> {
  await db.query<ResultSetHeader>("UPDATE fulfillment_requests SET status = 'REJECTED' WHERE id = ?", [requestId]);
}
