import bcrypt from 'bcryptjs';
import {Request,Response} from "express";
import {RowDataPacket} from 'mysql2';
import {pool} from "../config/db";
import jwt from "jsonwebtoken";
import { AuthRequest } from '../middleware/auth.middleware';

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

// Approvals

export const getApprovals = async (req: Request, res:Response):Promise<void> =>{
  try{
    const {status} = req.query;

    let query = `
      SELECT 
        d.id,
        d.user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        u.role AS user_role,
        u.location AS user_location,
        d.doc_type,
        d.id_number,
        d.document_image_url,
        d.status,
        d.rejection_reason,
        d.submitted_at,
        d.reviewed_at
      FROM identity_documents d
      JOIN users u ON d.user_id = u.id
      WHERE 1 = 1
    `;

    const params: string[] = [];
    if (status && status !== 'all'){
      query += 'AND d.status = ?';
      params.push(String(status));
    }

    query += ` ORDER BY d.submitted_at DESC`;
    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    res.status(200).json({
       success: true,
      count: rows.length,
      approvals: rows,
    })
  }
  catch(error){
    console.error('Error fetching approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve approvals',
      error: (error as Error).message,
    });
  }
}
  // Ads Management

export const getAds = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Fetch Selling Ads (posted by farmers)
    const [sellingAds] = await pool.query<RowDataPacket[]>(`
      SELECT 
        s.id,
        s.farmer_id,
        u.name AS farmer_name,
        u.phone AS farmer_phone,
        s.title,
        s.category,
        s.price_per_kg,
        s.quantity_available,
        s.unit,
        s.location,
        s.valid_until,
        s.image_url,
        s.status,
        s.created_at
      FROM selling_ads s
      JOIN users u ON s.farmer_id = u.id
      ORDER BY s.created_at DESC
    `);
    // 2. Fetch Requirement Ads (posted by sellers)
    const [requirementAds] = await pool.query<RowDataPacket[]>(`
      SELECT 
        r.id,
        r.seller_id,
        u.name AS seller_name,
        u.phone AS seller_phone,
        r.title,
        r.category,
        r.offered_price_per_kg,
        r.quantity_needed,
        r.unit,
        r.location,
        r.deadline,
        r.description,
        r.status,
        r.created_at
      FROM requirement_ads r
      JOIN users u ON r.seller_id = u.id
      ORDER BY r.created_at DESC
    `);
    res.status(200).json({
      success: true,
      totalSellingAds: sellingAds.length,
      totalRequirementAds: requirementAds.length,
      sellingAds,
      requirementAds,
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ads',
      error: (error as Error).message,
    });
  }
};

// Operations 

export const getOperations = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Products listed
    const [products] = await pool.query<RowDataPacket[]>(`
      SELECT 
        s.id,
        s.title AS name,
        'Product' AS operation_type,
        u.name AS farmer_name,
        s.category,
        s.price_per_kg AS price,
        s.quantity_available AS quantity,
        s.status,
        s.created_at
      FROM selling_ads s
      JOIN users u ON s.farmer_id = u.id
      ORDER BY s.created_at DESC
    `);
    // 2. Orders placed
    const [orders] = await pool.query<RowDataPacket[]>(`
      SELECT 
        o.id,
        o.order_code,
        'Order' AS operation_type,
        o.product_name,
        f.name AS farmer_name,
        s.name AS seller_name,
        o.quantity,
        o.total_amount,
        o.order_status AS status,
        o.payment_status,
        o.created_at
      FROM orders o
      JOIN users f ON o.farmer_id = f.id
      JOIN users s ON o.seller_id = s.id
      ORDER BY o.created_at DESC
    `);
    // 3. Transport Jobs
    const [transports] = await pool.query<RowDataPacket[]>(`
      SELECT 
        t.id,
        t.job_code,
        'Transport' AS operation_type,
        t.order_id,
        COALESCE(u.name, 'Unassigned') AS transporter_name,
        t.pickup_location,
        t.drop_location,
        t.vehicle_type,
        t.fee,
        t.status,
        t.scheduled_date,
        t.created_at
      FROM transport_jobs t
      LEFT JOIN users u ON t.transporter_id = u.id
      ORDER BY t.created_at DESC
    `);
    res.status(200).json({
      success: true,
      counts: {
        all: products.length + orders.length + transports.length,
        products: products.length,
        orders: orders.length,
        transport: transports.length,
      },
      products,
      orders,
      transports,
    });
  } catch (error) {
    console.error('Error fetching operations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve operations data',
      error: (error as Error).message,
    });
  }
};

// Payments 
export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    // Payments list with payer (seller) and payee (farmer) details
    const [payments] = await pool.query<RowDataPacket[]>(`
      SELECT 
        p.id,
        p.tx_code,
        p.order_id,
        o.order_code,
        o.product_name,
        payer.name AS payer_name,
        payee.name AS payee_name,
        p.amount,
        p.payment_type,
        p.status,
        p.held_at,
        p.released_at
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN users payer ON p.payer_id = payer.id
      JOIN users payee ON p.payee_id = payee.id
      ORDER BY p.held_at DESC
    `);
    // Categorize payments into held vs completed
    const holdingPayments = payments.filter((p) => p.status === 'Held in Escrow');
    const completedPayments = payments.filter((p) => p.status === 'Released');
    // Summary calculations
    const totalHeldAmount = holdingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalCompletedAmount = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    res.status(200).json({
      success: true,
      summary: {
        totalHeldAmount: `Rs. ${totalHeldAmount.toLocaleString()}`,
        totalCompletedAmount: `Rs. ${totalCompletedAmount.toLocaleString()}`,
        totalTransactionsCount: payments.length,
      },
      holdingPayments,
      completedPayments,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payments',
      error: (error as Error).message,
    });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Total platform users count
    const [userCountRow] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM users WHERE role != 'admin'`
    );
    // 2. Active orders count
    const [orderCountRow] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM orders WHERE order_status NOT IN ('Completed', 'Cancelled')`
    );
    // 3. Held escrow sum
    const [escrowRow] = await pool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'Held in Escrow'`
    );
    // 4. Active transport jobs count
    const [transportCountRow] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM transport_jobs WHERE status IN ('Open', 'Assigned', 'In Transit')`
    );
    // 5. Role distribution counts
    const [roleRows] = await pool.query<RowDataPacket[]>(
      `SELECT role, COUNT(*) AS count FROM users GROUP BY role`
    );
    const roles = {
      farmers: 0,
      sellers: 0,
      transporters: 0,
    };
    roleRows.forEach((r) => {
      if (r.role === 'farmer') roles.farmers = r.count;
      if (r.role === 'seller') roles.sellers = r.count;
      if (r.role === 'transporter') roles.transporters = r.count;
    });
    // 6. Recent Orders (Top 5)
    const [recentOrders] = await pool.query<RowDataPacket[]>(`
      SELECT 
        o.id,
        o.order_code,
        o.product_name AS product,
        f.name AS farmer,
        s.name AS seller,
        o.total_amount AS amount,
        o.order_status AS status,
        o.payment_status AS payment
      FROM orders o
      JOIN users f ON o.farmer_id = f.id
      JOIN users s ON o.seller_id = s.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    res.status(200).json({
      success: true,
      stats: {
        totalUsers: userCountRow[0].total.toLocaleString(),
        activeOrders: orderCountRow[0].total.toString(),
        heldPayments: `Rs. ${Number(escrowRow[0].total).toLocaleString()}`,
        transportJobs: transportCountRow[0].total.toString(),
      },
      roleCounts: roles,
      recentOrders,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard stats',
      error: (error as Error).message,
    });
  }
};
/**
 * 8. Dashboard 12-Month Charts
 * GET /api/admin/dashboard/charts
 */
export const getDashboardCharts = async (req: Request, res: Response): Promise<void> => {
  try {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    // 1. Orders Over Time by Month
    const [orderRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        MONTH(created_at) AS month_num,
        COUNT(*) AS orders
      FROM orders
      WHERE YEAR(created_at) = ?
      GROUP BY MONTH(created_at)
    `, [currentYear]);
    // 2. User Growth by Month & Role
    const [userRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        MONTH(created_at) AS month_num,
        SUM(CASE WHEN role = 'farmer' THEN 1 ELSE 0 END) AS farmers,
        SUM(CASE WHEN role = 'seller' THEN 1 ELSE 0 END) AS sellers,
        SUM(CASE WHEN role = 'transporter' THEN 1 ELSE 0 END) AS transporters
      FROM users
      WHERE YEAR(created_at) = ?
      GROUP BY MONTH(created_at)
    `, [currentYear]);
    // 3. Transaction Volume (Millions) by Month
    const [paymentRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        MONTH(held_at) AS month_num,
        COALESCE(SUM(CASE WHEN payment_type = 'product_purchase' THEN amount ELSE 0 END), 0) / 1000000 AS product,
        COALESCE(SUM(CASE WHEN payment_type = 'transport_fee' THEN amount ELSE 0 END), 0) / 1000000 AS transport
      FROM payments
      WHERE YEAR(held_at) = ?
      GROUP BY MONTH(held_at)
    `, [currentYear]);
    // Build complete 12-month array (Jan–Dec) ensuring no month is missing
    const ordersOverTime = monthNames.map((name, index) => {
      const row = orderRows.find((r) => r.month_num === index + 1);
      return { month: name, orders: row ? Number(row.orders) : 0 };
    });
    const userGrowth = monthNames.map((name, index) => {
      const row = userRows.find((r) => r.month_num === index + 1);
      return {
        month: name,
        farmers: row ? Number(row.farmers) : 0,
        sellers: row ? Number(row.sellers) : 0,
        transporters: row ? Number(row.transporters) : 0,
      };
    });
    const transactionVolume = monthNames.map((name, index) => {
      const row = paymentRows.find((r) => r.month_num === index + 1);
      return {
        month: name,
        product: row ? parseFloat(Number(row.product).toFixed(2)) : 0,
        transport: row ? parseFloat(Number(row.transport).toFixed(2)) : 0,
      };
    });
    res.status(200).json({
      success: true,
      ordersOverTime,
      userGrowth,
      transactionVolume,
    });
  } catch (error) {
    console.error('Error fetching dashboard charts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard chart data',
      error: (error as Error).message,
    });
  }
};

export const adminLogin = async (req: Request, res: Response):
Promise<void> => {
  try {
    const {email, password} = req.body;

    if (!email || !password){
      res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
      return;
    }
  }
}