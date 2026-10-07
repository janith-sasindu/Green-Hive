import type { RowDataPacket } from 'mysql2';
import type { Db } from '../config/db';
import type { MarketplaceProduct, ProductFilters, ProductSort } from '../types/seller';

interface ProductRow extends RowDataPacket {
  id: number;
  farmer_id: number;
  product_name: string;
  category: string;
  quantity_available_kg: number;
  unit_price_lkr: number;
  location: string;
  description: string | null;
  image_url: string | null;
  availability_start_date: string;
  availability_end_date: string;
  status: MarketplaceProduct['status'];
  farmer_name: string;
  farmer_location: string | null;
  farmer_rating: number | null;
  farmer_is_verified: number;
  pickup_address: string;
}

const PRODUCT_SELECT = `
  SELECT a.id, a.farmer_id, a.product_name, a.category, a.quantity_available_kg, a.unit_price_lkr,
         a.location, a.description, a.image_url, a.availability_start_date, a.availability_end_date, a.status,
         u.name AS farmer_name, u.location AS farmer_location, u.rating AS farmer_rating,
         u.is_verified AS farmer_is_verified,
         COALESCE(fp.farm_address, a.location) AS pickup_address
    FROM advertisements a
    JOIN users u ON u.id = a.farmer_id
    LEFT JOIN farmer_profiles fp ON fp.user_id = a.farmer_id`;

// What a seller can buy right now: listed, in stock and not past its availability period
const AVAILABLE = "a.status = 'ACTIVE' AND a.quantity_available_kg > 0 AND a.availability_end_date >= CURDATE()";

// Fixed ORDER BY clauses; the sort value from the request only selects one of these
const ORDER_BY: Record<ProductSort, string> = {
  recommended: 'u.is_verified DESC, a.created_at DESC, a.id DESC',
  priceLow: 'a.unit_price_lkr ASC, a.id ASC',
  priceHigh: 'a.unit_price_lkr DESC, a.id ASC',
  quantity: 'a.quantity_available_kg DESC, a.id ASC',
};

const toProduct = (row: ProductRow): MarketplaceProduct => ({
  id: row.id,
  farmerId: row.farmer_id,
  productName: row.product_name,
  category: row.category,
  quantityAvailableKg: row.quantity_available_kg,
  unitPriceLkr: row.unit_price_lkr,
  location: row.location,
  description: row.description ?? '',
  availabilityStartDate: row.availability_start_date,
  availabilityEndDate: row.availability_end_date,
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
});

/** Escapes LIKE wildcards so a search for "100%" is matched literally. */
const toLikePattern = (term: string): string => `%${term.replace(/[\\%_]/g, '\\$&')}%`;

export async function listAvailableProducts(
  db: Db,
  filters: ProductFilters,
): Promise<{ products: MarketplaceProduct[]; total: number }> {
  const conditions = [AVAILABLE];
  const values: (string | number)[] = [];

  if (filters.category) {
    conditions.push('a.category = ?');
    values.push(filters.category);
  }
  if (filters.location) {
    conditions.push('a.location = ?');
    values.push(filters.location);
  }
  if (filters.verifiedOnly) {
    conditions.push('u.is_verified = TRUE');
  }
  if (filters.search) {
    const pattern = toLikePattern(filters.search);
    conditions.push('(a.product_name LIKE ? OR u.name LIKE ? OR a.location LIKE ?)');
    values.push(pattern, pattern, pattern);
  }
  const where = conditions.join(' AND ');

  const [countRows] = await db.query<(RowDataPacket & { total: number })[]>(
    `SELECT COUNT(*) AS total FROM advertisements a JOIN users u ON u.id = a.farmer_id WHERE ${where}`,
    values,
  );
  const [rows] = await db.query<ProductRow[]>(
    `${PRODUCT_SELECT} WHERE ${where} ORDER BY ${ORDER_BY[filters.sort]} LIMIT ? OFFSET ?`,
    [...values, filters.limit, filters.offset],
  );
  return { products: rows.map(toProduct), total: countRows[0].total };
}

interface LockedAdvertisementRow extends RowDataPacket {
  id: number;
  farmer_id: number;
  product_name: string;
  image_url: string | null;
  quantity_available_kg: number;
  unit_price_lkr: number;
  status: MarketplaceProduct['status'];
  within_period: number;
  pickup_address: string;
}

export interface LockedAdvertisement {
  id: number;
  farmerId: number;
  productName: string;
  imageUrl: string | null;
  quantityAvailableKg: number;
  unitPriceLkr: number;
  pickupAddress: string;
  /** Listed and not past its availability period. */
  isOpenForOrders: boolean;
}

/**
 * Reads an advertisement and locks its row until the transaction ends, so two sellers
 * ordering at the same time cannot both take the same stock.
 */
export async function lockAdvertisement(db: Db, advertisementId: number): Promise<LockedAdvertisement | null> {
  const [rows] = await db.query<LockedAdvertisementRow[]>(
    `SELECT a.id, a.farmer_id, a.product_name, a.image_url, a.quantity_available_kg, a.unit_price_lkr, a.status,
            (a.availability_end_date >= CURDATE()) AS within_period,
            COALESCE(fp.farm_address, a.location) AS pickup_address
       FROM advertisements a
       LEFT JOIN farmer_profiles fp ON fp.user_id = a.farmer_id
      WHERE a.id = ?
        FOR UPDATE OF a`,
    [advertisementId],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    farmerId: row.farmer_id,
    productName: row.product_name,
    imageUrl: row.image_url,
    quantityAvailableKg: row.quantity_available_kg,
    unitPriceLkr: row.unit_price_lkr,
    pickupAddress: row.pickup_address,
    isOpenForOrders: row.status === 'ACTIVE' && row.within_period === 1,
  };
}

/** Sets the remaining stock of a locked advertisement and marks it sold out when nothing is left. */
export async function setAdvertisementStock(db: Db, advertisementId: number, remainingKg: number): Promise<void> {
  await db.query(
    "UPDATE advertisements SET quantity_available_kg = ?, status = IF(? <= 0, 'SOLD_OUT', status) WHERE id = ?",
    [remainingKg, remainingKg, advertisementId],
  );
}

/** Returns the advertisement whatever its status, so a sold out product can still be shown. */
export async function findProductById(db: Db, productId: number): Promise<MarketplaceProduct | null> {
  const [rows] = await db.query<ProductRow[]>(`${PRODUCT_SELECT} WHERE a.id = ?`, [productId]);
  return rows.length > 0 ? toProduct(rows[0]) : null;
}
