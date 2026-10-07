import { app } from './app';
import { pool } from './config/db';
import { env } from './config/env';

if (!env.jwtSecret) {
  console.error('JWT_SECRET is not set. Copy .env.example to .env and set a secret before starting the API.');
  process.exit(1);
}

app.listen(env.port, () => {
  console.log(`Green Hive API listening on port ${env.port}`);
});

// Report database problems at startup instead of on the first request
pool
  .query('SELECT 1')
  .then(() => console.log(`Connected to MySQL database "${env.db.name}"`))
  .catch((error: Error) => console.error(`Could not connect to MySQL: ${error.message}`));
