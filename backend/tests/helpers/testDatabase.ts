import { pool } from '../../src/config/db';
import { env } from '../../src/config/env';
import { setUpDatabase } from '../../src/database/setup';

/** Recreates the test database with an empty schema. Call in beforeAll. */
export async function resetTestDatabase(): Promise<void> {
  await setUpDatabase(env.db.name, { reset: true });
}

/** Closes the connection pool so Jest can exit. Call in afterAll. */
export async function closeTestDatabase(): Promise<void> {
  await pool.end();
}
