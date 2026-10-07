import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { Db } from '../config/db';
import type { SellerProfile, SellerProfileChanges } from '../types/seller';

interface SellerProfileRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string | null;
  is_verified: number;
  rating: number | null;
  avatar_url: string | null;
  business_name: string | null;
  address: string | null;
}

export async function insertSellerProfile(
  db: Db,
  userId: number,
  businessName: string,
  address?: string,
): Promise<void> {
  await db.query<ResultSetHeader>(
    'INSERT INTO seller_profiles (user_id, business_name, address) VALUES (?, ?, ?)',
    [userId, businessName, address ?? null],
  );
}

export async function findSellerProfile(db: Db, sellerId: number): Promise<SellerProfile | null> {
  const [rows] = await db.query<SellerProfileRow[]>(
    `SELECT u.id, u.name, u.email, u.phone, u.location, u.is_verified, u.rating, u.avatar_url,
            sp.business_name, sp.address
       FROM users u
       LEFT JOIN seller_profiles sp ON sp.user_id = u.id
      WHERE u.id = ? AND u.role = 'SELLER'`,
    [sellerId],
  );
  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    name: row.name,
    businessName: row.business_name ?? row.name,
    email: row.email,
    phone: row.phone,
    location: row.location,
    address: row.address,
    isVerified: row.is_verified === 1,
    rating: row.rating,
    avatarUrl: row.avatar_url,
  };
}

/** Builds "column = ?" pairs for the fields that were provided. Column names come from this file only. */
const toAssignments = (fields: Record<string, string | undefined>) => {
  const provided = Object.entries(fields).filter(([, value]) => value !== undefined);
  return {
    sql: provided.map(([column]) => `${column} = ?`).join(', '),
    values: provided.map(([, value]) => value),
  };
};

export async function updateSellerProfile(db: Db, sellerId: number, changes: SellerProfileChanges): Promise<void> {
  const user = toAssignments({
    name: changes.name,
    email: changes.email,
    phone: changes.phone,
    location: changes.location,
  });
  if (user.values.length > 0) {
    await db.query<ResultSetHeader>(`UPDATE users SET ${user.sql} WHERE id = ?`, [...user.values, sellerId]);
  }

  const profile = toAssignments({ business_name: changes.businessName, address: changes.address });
  if (profile.values.length > 0) {
    await db.query<ResultSetHeader>(`UPDATE seller_profiles SET ${profile.sql} WHERE user_id = ?`, [
      ...profile.values,
      sellerId,
    ]);
  }
}
