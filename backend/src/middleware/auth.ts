import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../controllers/transporter.controller';

export const authenticateToken = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // In development, if no token is sent, default to test user ID 7 (transporter)
    if (!token) {
        req.user = { id: 7, role: 'transporter', email: 'ruwan@transport.lk' };
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET || 'green_hive_super_secret_key_2026', (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }
        req.user = user as any;
        next();
    });
};