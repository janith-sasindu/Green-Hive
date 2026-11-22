
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db';
import adminRoutes from './routes/admin.routes';
import transporterRoutes from './routes/transporter.routes';
import farmerRoutes from './routes/farmer.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Admin Routes
app.use('/api/admin', adminRoutes);

// Transporter Routes
app.use('/api/transporter', transporterRoutes);

// Farmer Routes
app.use('/api/farmer', farmerRoutes);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    project: 'Green Hive REST API',
    uptime: process.uptime(),
  });
});

// Legacy Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'green-hive-backend',
  });
});

// Start Server & Test Database Connection
app.listen(PORT, async () => {
  console.log(`🚀 Green Hive Backend running on http://localhost:${PORT}`);

  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to Aiven MySQL Cloud!');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error((error as Error).message);
  }
});
