import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

/**
 * Creates the seller tables and adds the seller columns to the shared `orders` table.
 * Idempotent: run `npm run db:seller` as often as needed.
 */
async function addColumnIfMissing(table: string, column: string, definition: string) {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [table, column],
  );
  if ((rows as unknown[]).length === 0) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`  + ${table}.${column}`);
  }
}

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, '../../database/seller_schema.sql'), 'utf8');
  for (const statement of sql.split(';').map((s) => s.replace(/^\s*--.*$/gm, '').trim()).filter(Boolean)) {
    await pool.query(statement);
  }
  await addColumnIfMissing('orders', 'delivery_method', "ENUM('SELF_PICKUP','TRANSPORTATION') NOT NULL DEFAULT 'SELF_PICKUP'");
  await addColumnIfMissing('orders', 'requirement_id', 'INT DEFAULT NULL');
  console.log('✅ Seller tables are ready.');
  await pool.end();
}

main().catch((error) => {
  console.error('❌ Seller DB setup failed:', error.message);
  process.exit(1);
});
