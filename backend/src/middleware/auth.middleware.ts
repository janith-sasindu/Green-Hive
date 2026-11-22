import { Request, Response, NextFunction } from "express";
import  jwt  from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        id: number,
        email: string,
        role: string,
        admin_role?: string
    };
}

export const verifyAdmin = (
    req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    // Check if Authorization header exists and follows "Bearer <token>" format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No authorization token provided.',
      });
      return;
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'green_hive_super_secret_key_2026';
    // Verify token signature and expiration
    const decoded = jwt.verify(token, secret) as {
      id: number;
      email: string;
      role: string;
      admin_role?: string;
    };
    // Ensure the token owner is an admin
    if (decoded.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access forbidden. Requires admin privileges.',
      });
      return;
    }
    // Attach decoded admin info to request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: (error as Error).message,
    });
  }
};