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