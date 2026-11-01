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

// Approvals

export const getApprovels = async (req: Request, res:Response):Promise<void> =>{
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
