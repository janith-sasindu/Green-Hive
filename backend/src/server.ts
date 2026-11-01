import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db';
import adminRoutes from './routes/admin.routes';

// Load environment variables from .env
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Middleware
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Base Routes
// ==========================================
// General Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    project: 'Green Hive REST API',
    uptime: process.uptime(),
  });
});

// Mount Admin Routes under /api/admin
app.use('/api/admin', adminRoutes);

// ==========================================
// Start Server & Test Aiven DB Connection
// ==========================================
app.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Green Hive Backend Server running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`==================================================`);

  try {
    const connection = await pool.getConnection();
    console.log(`✅ [Database]: Successfully connected to Aiven MySQL Cloud!`);
    connection.release();
  } catch (error) {
    console.error(`❌ [Database]: Connection failed! Check .env credentials.`);
    console.error(`   Error Details: ${(error as Error).message}`);
  }
});
