import dotenv from 'dotenv';

dotenv.config();

// Tests drop and recreate their database, so they always run against "<DB_NAME>_test"
const databaseName = process.env.DB_NAME || 'green_hive_db';
process.env.DB_NAME = databaseName.endsWith('_test') ? databaseName : `${databaseName}_test`;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-used-only-by-tests';
