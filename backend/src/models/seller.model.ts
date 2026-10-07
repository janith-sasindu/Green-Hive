import type { ResultSetHeader } from 'mysql2';
import type { Db } from '../config/db';

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
