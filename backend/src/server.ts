import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transporterRoutes from './routes/transporter.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/transporter', transporterRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'green-hive-backend' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Green Hive Backend running on http://localhost:${PORT}`);
});