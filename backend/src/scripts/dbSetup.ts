import { env } from '../config/env';
import { setUpDatabase } from '../database/setup';

// Usage: npm run db:setup
async function main(): Promise<void> {
  await setUpDatabase(env.db.name);
  console.log(`Database "${env.db.name}" is ready on ${env.db.host}:${env.db.port}`);
}

main().catch((error: Error) => {
  console.error(`Database setup failed: ${error.message}`);
  process.exit(1);
});
