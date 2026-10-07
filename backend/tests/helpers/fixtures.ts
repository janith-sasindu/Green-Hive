import type { ResultSetHeader } from 'mysql2';
import { pool, withTransaction } from '../../src/config/db';
import { releasePayment } from '../../src/services/payment.service';
import type { UserRole } from '../../src/types/auth';
import { signToken } from '../../src/utils/jwt';

/**
 * Creates records directly in the test database. Farmers, transporters and their
 * advertisements, requests and offers belong to other modules, so tests insert them here
 * instead of going through endpoints the seller API does not own.
 */

export interface TestUser {
  id: number;
  email: string;
  /** A valid bearer token for this user. */
  token: string;
}

let sequence = 0;
const nextSequence = (): number => {
  sequence += 1;
  return sequence;
};

const insert = async (sql: string, values: unknown[]): Promise<number> => {
  const [result] = await pool.query<ResultSetHeader>(sql, values);
  return result.insertId;
};

interface UserOptions {
  name?: string;
  location?: string;
  isVerified?: boolean;
  rating?: number;
}

async function createUser(role: UserRole, options: UserOptions = {}): Promise<TestUser> {
  const n = nextSequence();
  const email = `${role.toLowerCase()}${n}@greenhive.test`;
  const id = await insert(
    `INSERT INTO users (name, email, phone, password_hash, role, location, is_verified, rating)
     VALUES (?, ?, ?, 'fixture-accounts-cannot-log-in', ?, ?, ?, ?)`,
    [
      options.name ?? `Test ${role} ${n}`,
      email,
      `071${String(1000000 + n)}`,
      role,
      options.location ?? null,
      options.isVerified ?? false,
      options.rating ?? null,
    ],
  );
  return { id, email, token: signToken({ id, role }) };
}

export async function createSeller(options: UserOptions & { businessName?: string; address?: string } = {}) {
  const seller = await createUser('SELLER', options);
  await insert('INSERT INTO seller_profiles (user_id, business_name, address) VALUES (?, ?, ?)', [
    seller.id,
    options.businessName ?? 'Test Market',
    options.address ?? 'Test Market, Colombo 07',
  ]);
  return seller;
}

export async function createFarmer(options: UserOptions & { farmAddress?: string } = {}) {
  const farmer = await createUser('FARMER', options);
  if (options.farmAddress) {
    await insert('INSERT INTO farmer_profiles (user_id, farm_address) VALUES (?, ?)', [farmer.id, options.farmAddress]);
  }
  return farmer;
}

export async function createTransporter(options: UserOptions & { vehicleType?: string } = {}) {
  const transporter = await createUser('TRANSPORTER', options);
  await insert('INSERT INTO transporter_profiles (user_id, vehicle_type) VALUES (?, ?)', [
    transporter.id,
    options.vehicleType ?? 'Isuzu Elf lorry',
  ]);
  return transporter;
}

interface AdvertisementOptions {
  productName?: string;
  category?: string;
  quantityKg?: number;
  pricePerKg?: number;
  location?: string;
  status?: 'ACTIVE' | 'SOLD_OUT' | 'CANCELLED';
  /** Days from today until the advertisement stops being available; negative means it has ended. */
  availableForDays?: number;
}

export async function createAdvertisement(farmerId: number, options: AdvertisementOptions = {}): Promise<number> {
  return insert(
    `INSERT INTO advertisements
       (farmer_id, product_name, category, quantity_available_kg, unit_price_lkr, location, description,
        availability_start_date, availability_end_date, status)
     VALUES (?, ?, ?, ?, ?, ?, 'Test produce', CURDATE() - INTERVAL 30 DAY, CURDATE() + INTERVAL ? DAY, ?)`,
    [
      farmerId,
      options.productName ?? 'Fresh Cabbage',
      options.category ?? 'Vegetables',
      options.quantityKg ?? 500,
      options.pricePerKg ?? 80,
      options.location ?? 'Nuwara Eliya',
      options.availableForDays ?? 10,
      options.status ?? 'ACTIVE',
    ],
  );
}

/** A transporter's cost submission for a job, as the transporter module will create it. */
export async function createTransportOffer(
  jobId: number,
  transporterId: number,
  proposedCost: number,
  estimatedDeliveryTime = '4 hours',
): Promise<number> {
  return insert(
    `INSERT INTO transportation_offers (job_id, transporter_id, proposed_cost, estimated_delivery_time)
     VALUES (?, ?, ?, ?)`,
    [jobId, transporterId, proposedCost, estimatedDeliveryTime],
  );
}

/** A farmer's response to a seller requirement, as the farmer module will create it. */
export async function createFulfillmentRequest(
  requirementId: number,
  farmerId: number,
  offeredQuantityKg: number,
  offeredPricePerKg: number,
  notes = 'Can supply this week',
): Promise<number> {
  return insert(
    `INSERT INTO fulfillment_requests (requirement_id, farmer_id, offered_quantity_kg, offered_price_per_kg, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [requirementId, farmerId, offeredQuantityKg, offeredPricePerKg, notes],
  );
}

/**
 * Stands in for the transporter module's pickup confirmation: the goods are collected,
 * so the order is in transit and the farmer's product payment is released.
 */
export async function simulatePickupConfirmation(orderId: number): Promise<void> {
  await withTransaction(async (connection) => {
    await releasePayment(connection, orderId, 'PRODUCT');
    await connection.query("UPDATE orders SET status = 'PICKED_UP' WHERE id = ?", [orderId]);
    await connection.query("UPDATE transportation_jobs SET status = 'GOODS_PICKED_UP' WHERE order_id = ?", [orderId]);
  });
}

export const authHeader = (user: TestUser): Record<string, string> => ({ Authorization: `Bearer ${user.token}` });

/** Reads rows straight from the test database to check what an endpoint stored. */
export async function selectRows<T = Record<string, unknown>>(sql: string, values: unknown[] = []): Promise<T[]> {
  const [rows] = await pool.query(sql, values);
  return rows as T[];
}

/** A date `days` from today as YYYY-MM-DD, in the same time zone the API uses. */
export const dateFromToday = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const pad = (value: number): string => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
