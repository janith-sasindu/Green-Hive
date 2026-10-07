import { pool } from '../config/db';
import { env } from '../config/env';
import { DEMO_SELLER_EMAIL, seedDemoData } from '../database/seed';
import { setUpDatabase } from '../database/setup';

// Usage:
//   npm run db:setup   create the database and apply the schema
//   npm run db:seed    the same, then add demo data to the empty database
async function main(): Promise<void> {
  await setUpDatabase(env.db.name);
  console.log(`Database "${env.db.name}" is ready on ${env.db.host}:${env.db.port}`);

  if (process.argv.includes('--seed')) {
    const password = process.env.SEED_USER_PASSWORD;
    if (!password) {
      throw new Error('Set SEED_USER_PASSWORD in .env to choose the password of the demo accounts');
    }
    await seedDemoData(password);
    console.log(`Demo data added. Sign in as ${DEMO_SELLER_EMAIL} with the password from SEED_USER_PASSWORD.`);
  }
}

main()
  .catch((error: Error) => {
    console.error(`Database setup failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
