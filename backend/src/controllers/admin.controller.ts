import bcrypt from 'bcryptjs';
import {Request,Response} from "express";
import {RowDataPacket, ResultSetHeader} from 'mysql2';
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

/**
 * 13. Admin Login
 * POST /api/admin/login
 * Body: { email, password }
 */
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
      return;
    }

    // 1. Find user in the database
    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, email, phone, password_hash, role, location, status
       FROM users 
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const user = users[0];

    // 2. Verify role is admin
    if (user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. You are not an admin.' });
      return;
    }

    // 3. Verify user status
    if (user.status !== 'active') {
      res.status(403).json({ success: false, message: 'Your admin account has been suspended.' });
      return;
    }

    // 4. Compare password with bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // 5. Fetch admin-specific details
    const [adminDetails] = await pool.query<RowDataPacket[]>(
      `SELECT admin_role, is_super_admin FROM admin_accounts WHERE user_id = ?`,
      [user.id]
    );

    const adminRole = adminDetails.length > 0 ? adminDetails[0].admin_role : 'Moderator';
    const isSuperAdmin = adminDetails.length > 0 ? Boolean(adminDetails[0].is_super_admin) : false;

    // 6. Generate signed JWT token (expires in 7 days)
    const secret = process.env.JWT_SECRET || 'green_hive_super_secret_key_2026';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        admin_role: adminRole,
        is_super_admin: isSuperAdmin,
      },
      secret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        admin_role: adminRole,
        is_super_admin: isSuperAdmin,
      },
    });
  } catch (error) {
    console.error('Error in adminLogin:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed due to a server error',
      error: (error as Error).message,
    });
  }
};

/**
 * 14. Get Current Logged-in Admin Profile
 * GET /api/admin/me
 * Requires: Authorization: Bearer <token>
 */
export const getAdminProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.id;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.phone, 
        u.role, 
        u.location, 
        u.created_at,
        a.admin_role, 
        a.is_super_admin
       FROM users u
       LEFT JOIN admin_accounts a ON u.id = a.user_id
       WHERE u.id = ?`,
      [adminId]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Admin profile not found' });
      return;
    }

    res.status(200).json({
      success: true,
      admin: rows[0],
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin profile',
      error: (error as Error).message,
    });
  }
};/**
 * 9. Verify Identity Document (Approve or Reject)
 * PATCH /api/admin/approvals/:id/status
 */
export const updateApprovalStatus = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"',
      });
      return;
    }

    await connection.beginTransaction();

    const [docs] = await connection.query<RowDataPacket[]>(
      `SELECT id, user_id FROM identity_documents WHERE id = ?`,
      [id]
    );

    if (docs.length === 0) {
      await connection.rollback();
      res.status(404).json({ success: false, message: 'Identity document not found' });
      return;
    }

    const userId = docs[0].user_id;

    await connection.query(
      `UPDATE identity_documents 
       SET status = ?, rejection_reason = ?, reviewed_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [status, status === 'rejected' ? (rejection_reason || 'Document does not meet requirements') : null, id]
    );

    if (status === 'approved') {
      await connection.query(
        `UPDATE users SET verified = TRUE, status = 'active' WHERE id = ?`,
        [userId]
      );
    } else {
      await connection.query(
        `UPDATE users SET verified = FALSE WHERE id = ?`,
        [userId]
      );
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      message: `Document has been ${status} successfully.`,
      documentId: id,
      userId,
      newStatus: status,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating approval status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update approval status',
      error: (error as Error).message,
    });
  } finally {
    connection.release();
  }
};

/**
 * 10. Delete an Ad (Selling or Requirement Ad)
 * DELETE /api/admin/ads/:id?type=selling (or ?type=requirement)
 */
export const deleteAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { type } = req.query; // 'selling' or 'requirement'

    const tableName = type === 'requirement' ? 'requirement_ads' : 'selling_ads';

    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM ${tableName} WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: `Ad with ID ${id} not found in ${tableName}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Ad deleted successfully from ${tableName}`,
      deletedId: id,
    });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ad',
      error: (error as Error).message,
    });
  }
};

/**
 * 11. Release Payment from Escrow
 * PATCH /api/admin/payments/:id/release
 */
export const releasePayment = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [payments] = await connection.query<RowDataPacket[]>(
      `SELECT id, order_id, amount, status FROM payments WHERE id = ?`,
      [id]
    );

    if (payments.length === 0) {
      await connection.rollback();
      res.status(404).json({ success: false, message: 'Payment record not found' });
      return;
    }

    if (payments[0].status === 'Released') {
      await connection.rollback();
      res.status(400).json({ success: false, message: 'This payment has already been released' });
      return;
    }

    await connection.query(
      `UPDATE payments SET status = 'Released', released_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    await connection.query(
      `UPDATE orders SET payment_status = 'Completed' WHERE id = ?`,
      [payments[0].order_id]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Payment released from escrow successfully',
      paymentId: id,
      orderId: payments[0].order_id,
      amount: payments[0].amount,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error releasing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to release payment',
      error: (error as Error).message,
    });
  } finally {
    connection.release();
  }
};

/**
 * 12. Create New Admin Account
 * POST /api/admin/create-admin
 */
export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const { name, email, phone, password, admin_role, location } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
      return;
    }

    const [existing] = await connection.query<RowDataPacket[]>(
      `SELECT id FROM users WHERE email = ?`,
      [email]
    );

    if (existing.length > 0) {
      res.status(409).json({
        success: false,
        message: 'A user with this email already exists',
      });
      return;
    }

    await connection.beginTransaction();

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const [userResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO users (name, email, phone, password_hash, role, location, verified, status)
       VALUES (?, ?, ?, ?, 'admin', ?, TRUE, 'active')`,
      [name, email, phone || '', passwordHash, location || 'Headquarters']
    );

    const newUserId = userResult.insertId;

    await connection.query(
      `INSERT INTO admin_accounts (user_id, admin_role, is_super_admin, status)
       VALUES (?, ?, FALSE, 'active')`,
      [newUserId, admin_role || 'Moderator']
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      admin: {
        id: newUserId,
        name,
        email,
        admin_role: admin_role || 'Moderator',
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin account',
      error: (error as Error).message,
    });
  } finally {
    connection.release();
  }
};