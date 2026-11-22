import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

/**
 * Register a new Farmer in the database.
 * Creates records across:
 * 1. users
 * 2. farmer_profiles
 * 3. farmer_bank_details
 * 4. farmer_notification_settings
 */
export const registerFarmer = async (req: Request, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const { fullName, name, email, phone, password, location } = req.body;
    const farmerName = (fullName || name || '').trim();
    const farmerEmail = (email || '').trim().toLowerCase();
    const farmerPhone = (phone || '').trim();
    const farmerLocation = (location || 'Nuwara Eliya').trim();

    if (!farmerName || !farmerEmail || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
      return;
    }

    // Check if email already exists
    const [existingUsers] = await connection.query<RowDataPacket[]>(
      'SELECT id, email, role FROM users WHERE email = ?',
      [farmerEmail]
    );

    if (existingUsers.length > 0) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Begin transaction
    await connection.beginTransaction();

    // 1. Insert into users table
    const [userResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO users (name, email, phone, password_hash, role, location, verified, status)
       VALUES (?, ?, ?, ?, 'farmer', ?, 1, 'active')`,
      [farmerName, farmerEmail, farmerPhone, passwordHash, farmerLocation]
    );

    const userId = userResult.insertId;
    const avatarLetter = (farmerName[0] || 'F').toUpperCase();

    // 2. Insert into farmer_profiles table
    await connection.query(
      `INSERT INTO farmer_profiles (user_id, farm_name, farm_location, avatar_letter, rating, completed_sales, total_earnings, member_since)
       VALUES (?, ?, ?, ?, 5.0, 0, 0.00, DATE_FORMAT(NOW(), '%M %Y'))
       ON DUPLICATE KEY UPDATE farm_location = VALUES(farm_location)`,
      [userId, `${farmerName}'s Farm`, farmerLocation, avatarLetter]
    );

    // 3. Insert into farmer_bank_details table (pending verification placeholder)
    await connection.query(
      `INSERT INTO farmer_bank_details (farmer_id, account_holder_name, bank_name, branch_name, branch_code, account_number, account_type, is_verified)
       VALUES (?, ?, 'Pending Verification', 'Main Branch', '001', '00000000', 'Savings Account', 0)
       ON DUPLICATE KEY UPDATE account_holder_name = VALUES(account_holder_name)`,
      [userId, farmerName]
    );

    // 4. Insert into farmer_notification_settings table
    await connection.query(
      `INSERT INTO farmer_notification_settings (farmer_id, orders, payments, transportation, fulfillment, promotions, security)
       VALUES (?, 1, 1, 1, 1, 1, 1)
       ON DUPLICATE KEY UPDATE orders = 1`,
      [userId]
    );

    // Commit transaction
    await connection.commit();

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'green_hive_super_secret_key_2026';
    const token = jwt.sign(
      {
        id: userId,
        email: farmerEmail,
        role: 'farmer',
      },
      jwtSecret,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Farmer account created successfully in Green-Hive database!',
      token,
      user: {
        id: userId,
        name: farmerName,
        email: farmerEmail,
        phone: farmerPhone,
        role: 'FARMER',
        location: farmerLocation,
        avatarLetter,
        isVerified: true,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error in registerFarmer:', error);
    res.status(500).json({
      success: false,
      message: 'Database error occurred while creating farmer profile.',
      error: (error as Error).message,
    });
  } finally {
    connection.release();
  }
};

/**
 * Farmer Login Endpoint
 */
export const loginFarmer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const farmerEmail = (email || '').trim().toLowerCase();

    if (!farmerEmail || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.name, u.email, u.phone, u.password_hash, u.role, u.location, u.verified,
              fp.farm_name, fp.farm_location, fp.avatar_letter, fp.rating, fp.completed_sales, fp.total_earnings
       FROM users u
       LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
       WHERE u.email = ? AND u.role = 'farmer'`,
      [farmerEmail]
    );

    if (rows.length === 0) {
      res.status(401).json({ success: false, message: 'Invalid farmer credentials or user not found' });
      return;
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'green_hive_super_secret_key_2026';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'farmer' },
      jwtSecret,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      message: 'Farmer logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: 'FARMER',
        location: user.farm_location || user.location,
        avatarLetter: user.avatar_letter || (user.name[0] || 'F').toUpperCase(),
        rating: user.rating,
        completedSales: user.completed_sales,
        totalEarnings: user.total_earnings,
        isVerified: Boolean(user.verified),
      },
    });
  } catch (error) {
    console.error('Error in loginFarmer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate farmer',
      error: (error as Error).message,
    });
  }
};

/**
 * Get Farmer Profile by user ID
 */
export const getFarmerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const farmerId = req.params.id;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.name, u.email, u.phone, u.location, u.verified, u.created_at,
              fp.farm_name, fp.farm_location, fp.avatar_letter, fp.rating, fp.completed_sales, fp.total_earnings, fp.member_since,
              fbd.bank_name, fbd.account_number, fbd.branch_name, fbd.is_verified AS bank_verified
       FROM users u
       LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
       LEFT JOIN farmer_bank_details fbd ON u.id = fbd.farmer_id
       WHERE u.id = ? AND u.role = 'farmer'`,
      [farmerId]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Farmer profile not found' });
      return;
    }

    res.status(200).json({
      success: true,
      farmer: rows[0],
    });
  } catch (error) {
    console.error('Error in getFarmerProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve farmer profile',
      error: (error as Error).message,
    });
  }
};

/**
 * GET /api/farmer/requirements
 * Fetches all active buyer requirements matching farmer crops,
 * including any fulfillment status if the farmer has already submitted an offer.
 */
export const getFarmerRequirements = async (req: Request, res: Response): Promise<void> => {
  try {
    const farmerId = Number(req.query.farmerId) || 0;

    // Check which columns exist in requirement_ads to prevent ER_BAD_FIELD_ERROR
    const [cols]: any = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'requirement_ads'`
    );
    const colList = cols.map((c: any) => c.COLUMN_NAME);

    const priceCol = colList.includes('target_price_per_kg')
      ? 'r.target_price_per_kg'
      : colList.includes('offered_price_per_kg')
      ? 'r.offered_price_per_kg'
      : '0';

    const qtyCol = colList.includes('quantity_required')
      ? 'r.quantity_required'
      : colList.includes('quantity_needed')
      ? 'r.quantity_needed'
      : '0';

    const query = `
      SELECT 
        r.id,
        r.seller_id,
        COALESCE(u.name, 'Wholesale Buyer') AS buyer_name,
        COALESCE(u.phone, '') AS buyer_phone,
        r.title AS crop_name,
        r.category,
        ${qtyCol} AS quantity_required,
        ${priceCol} AS target_price,
        COALESCE(r.unit, 'kg') AS unit,
        r.location,
        COALESCE(r.deadline, 'Within 3 days') AS deadline,
        r.description,
        r.status,
        r.created_at,
        fr.id AS fulfillment_id,
        fr.status AS my_offer_status,
        fr.offered_quantity_kg,
        fr.offered_price_per_kg
      FROM requirement_ads r
      LEFT JOIN users u ON r.seller_id = u.id
      LEFT JOIN fulfillment_requests fr ON r.id = fr.requirement_id AND fr.farmer_id = ?
      WHERE r.status = 'active'
      ORDER BY r.created_at DESC
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query, [farmerId]);

    // Format for easy consumption by mobile app
    const formatted = rows.map((r: any) => ({
      id: `REQ-${r.id}`,
      rawId: r.id,
      buyerName: r.buyer_name,
      buyerPhone: r.buyer_phone,
      cropName: r.crop_name,
      category: r.category,
      requiredQuantity: `${Number(r.quantity_required)} ${r.unit}`,
      quantityValue: Number(r.quantity_required),
      targetPrice: `Rs. ${Number(r.target_price)} / ${r.unit}`,
      targetPriceValue: Number(r.target_price),
      unit: r.unit,
      location: r.location,
      deadline: r.deadline,
      description: r.description,
      status: r.status,
      myOfferStatus: r.my_offer_status || null,
      offeredQuantityKg: r.offered_quantity_kg ? Number(r.offered_quantity_kg) : null,
      offeredPricePerKg: r.offered_price_per_kg ? Number(r.offered_price_per_kg) : null,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      requirements: formatted,
    });
  } catch (error) {
    console.error('Error in getFarmerRequirements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve buyer requirements',
      error: (error as Error).message,
    });
  }
};

/**
 * POST /api/farmer/requirements/:id/fulfill
 * Submit a fulfillment offer for a buyer requirement
 */
export const submitFulfillmentRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const requirementId = Number(req.params.id || req.body.requirementId);
    const { farmerId, offeredQuantityKg, offeredPricePerKg, notes } = req.body;

    if (!requirementId || !farmerId || !offeredQuantityKg || !offeredPricePerKg) {
      res.status(400).json({
        success: false,
        message: 'requirementId, farmerId, offeredQuantityKg, and offeredPricePerKg are required',
      });
      return;
    }

    // Verify requirement exists
    const [reqRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, title, seller_id, status FROM requirement_ads WHERE id = ?',
      [requirementId]
    );

    if (reqRows.length === 0) {
      res.status(404).json({ success: false, message: 'Requirement ad not found' });
      return;
    }

    const requirement = reqRows[0];

    // Insert or update fulfillment request
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO fulfillment_requests 
        (requirement_id, farmer_id, offered_quantity_kg, offered_price_per_kg, notes, status)
       VALUES (?, ?, ?, ?, ?, 'PENDING')
       ON DUPLICATE KEY UPDATE 
         offered_quantity_kg = VALUES(offered_quantity_kg),
         offered_price_per_kg = VALUES(offered_price_per_kg),
         notes = VALUES(notes),
         status = 'PENDING'`,
      [requirementId, farmerId, offeredQuantityKg, offeredPricePerKg, notes || '']
    );

    // Add confirmation notification to farmer
    await pool.query(
      `INSERT INTO farmer_notifications (farmer_id, title, message, type, is_read, icon_emoji, order_id)
       VALUES (?, 'Offer Submitted', ?, 'system', 0, '📋', ?)`,
      [
        farmerId,
        `Your offer of ${offeredQuantityKg} kg @ Rs. ${offeredPricePerKg}/kg for ${requirement.title} has been submitted to the buyer.`,
        `#REQ-${requirementId}`,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Fulfillment offer submitted successfully! The buyer has been notified.',
      fulfillmentId: result.insertId || requirementId,
      status: 'PENDING',
    });
  } catch (error) {
    console.error('Error in submitFulfillmentRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit fulfillment offer',
      error: (error as Error).message,
    });
  }
};

/**
 * GET /api/farmer/fulfillments
 * Get all fulfillment requests submitted by a farmer
 */
export const getFarmerFulfillments = async (req: Request, res: Response): Promise<void> => {
  try {
    const farmerId = Number(req.query.farmerId || req.params.farmerId);

    if (!farmerId) {
      res.status(400).json({ success: false, message: 'farmerId query param is required' });
      return;
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        fr.id,
        fr.requirement_id,
        r.title AS crop_name,
        r.category,
        COALESCE(u.name, 'Wholesale Buyer') AS buyer_name,
        fr.offered_quantity_kg,
        fr.offered_price_per_kg,
        fr.notes,
        fr.status,
        fr.created_at
       FROM fulfillment_requests fr
       JOIN requirement_ads r ON fr.requirement_id = r.id
       LEFT JOIN users u ON r.seller_id = u.id
       WHERE fr.farmer_id = ?
       ORDER BY fr.created_at DESC`,
      [farmerId]
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      fulfillments: rows,
    });
  } catch (error) {
    console.error('Error in getFarmerFulfillments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve fulfillment history',
      error: (error as Error).message,
    });
  }
};

