import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import { env } from './env';

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // DECIMAL columns (prices, quantities) come back as numbers instead of strings
  decimalNumbers: true,
  // DATE columns come back as 'YYYY-MM-DD' so they are not shifted by time zone conversion
  dateStrings: ['DATE'],
});

/** The pool or a transaction connection. Models accept either so they can run inside a transaction. */
export type Db = Pool | PoolConnection;

/**
 * Runs `work` in a single transaction: commits when it resolves and rolls back when it throws,
 * so an order, its payments and its transport job are never left half written.
 */
export async function withTransaction<T>(work: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
