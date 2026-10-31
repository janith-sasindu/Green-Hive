import {Request,Response} from "express";
import {RowDataPacket} from 'mysql2';
import {pool} from "../config/db";

export const getAdminHealth = async(
    req:Request,
    res:Response
): Promise<void>=>{
    try {
    const [result] = await pool.query('SELECT 1 + 1 AS check_status');
    res.status(200).json({
      success: true,
      message: 'Admin service is running and connected to Aiven Cloud MySQL!',
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error('Admin health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database query failed',
      error: (error as Error).message,
    });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, search, status } = req.query;
    let query = `
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        role, 
        location, 
        verified, 
        status, 
        created_at
      FROM users
      WHERE 1 = 1
    `;
    const params: (string | number)[] = [];
    // Filter by role if provided (farmer, seller, transporter)
    if (role && role !== 'all') {
      query += ` AND role = ?`;
      params.push(String(role));
    }
    // Filter by account status if provided (active, pending, suspended)
    if (status && status !== 'all') {
      query += ` AND status = ?`;
      params.push(String(status));
    }
    // Search by name, email, or phone
    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      const searchWildcard = `%${search}%`;
      params.push(searchWildcard, searchWildcard, searchWildcard);
    }
    query += ` ORDER BY created_at DESC`;
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    res.status(200).json({
      success: true,
      count: rows.length,
      users: rows,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: (error as Error).message,
    });
  }
};