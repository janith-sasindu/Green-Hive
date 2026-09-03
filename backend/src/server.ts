import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import farmerRoutes from './routes/farmer.routes';
import sellerRoutes from './routes/seller.routes';
import transporterRoutes from './routes/transporter.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'Green Hive REST API Backend is running' });
});

// Module API Routes
app.use('/api/farmer', farmerRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/transporter', transporterRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌿 Green Hive Backend running on http://localhost:${PORT}`);
  console.log(`====================================================`);
});
