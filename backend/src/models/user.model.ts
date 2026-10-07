import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { Db } from '../config/db';
import type { PublicUser, UserRole } from '../types/auth';

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: UserRole;
  is_verified: number;
}

export interface UserRecord extends PublicUser {
  passwordHash: string;
}

export interface NewUser {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  location?: string;
}

const USER_COLUMNS = 'id, name, email, phone, password_hash, role, is_verified';

const toUserRecord = (row: UserRow): UserRecord => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  role: row.role,
  isVerified: row.is_verified === 1,
  passwordHash: row.password_hash,
});

export const toPublicUser = ({ passwordHash: _passwordHash, ...user }: UserRecord): PublicUser => user;

export async function findUserByEmail(db: Db, email: string): Promise<UserRecord | null> {
  const [rows] = await db.query<UserRow[]>(`SELECT ${USER_COLUMNS} FROM users WHERE email = ?`, [email]);
  return rows.length > 0 ? toUserRecord(rows[0]) : null;
}

export async function findUserById(db: Db, id: number): Promise<UserRecord | null> {
  const [rows] = await db.query<UserRow[]>(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`, [id]);
  return rows.length > 0 ? toUserRecord(rows[0]) : null;
}

export async function insertUser(db: Db, user: NewUser): Promise<number> {
  const [result] = await db.query<ResultSetHeader>(
    'INSERT INTO users (name, email, phone, password_hash, role, location) VALUES (?, ?, ?, ?, ?, ?)',
    [user.name, user.email, user.phone, user.passwordHash, user.role, user.location ?? null],
  );
  return result.insertId;
}
