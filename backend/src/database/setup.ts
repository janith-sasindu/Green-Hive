import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from '../config/env';

const SCHEMA_FILE = path.join(__dirname, '../../database/schema.sql');
// The name is placed in SQL as an identifier, so only plain names are accepted
const SAFE_DATABASE_NAME = /^[A-Za-z0-9_]+$/;

interface SetupOptions {
  /** Drops the database first. Only allowed for databases whose name ends in "_test". */
  reset?: boolean;
}

/** Creates the database if it does not exist and applies database/schema.sql to it. */
export async function setUpDatabase(databaseName: string, { reset = false }: SetupOptions = {}): Promise<void> {
  if (!SAFE_DATABASE_NAME.test(databaseName)) {
    throw new Error(`"${databaseName}" is not a valid database name`);
  }
  if (reset && !databaseName.endsWith('_test')) {
    throw new Error(`Refusing to drop "${databaseName}": only databases ending in "_test" can be reset`);
  }

  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: true,
  });
  try {
    if (reset) await connection.query(`DROP DATABASE IF EXISTS \`${databaseName}\``);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await connection.query(`USE \`${databaseName}\``);
    await connection.query(fs.readFileSync(SCHEMA_FILE, 'utf8'));
  } finally {
    await connection.end();
  }
}
