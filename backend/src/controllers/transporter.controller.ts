import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        role: string;
        email: string;
    };
}

/**
 * GET /api/transporter/home
 * Fetches all data required by TransporterHomeScreen
 */
export const getHomeScreenData = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // If auth middleware is used, use req.user.id. Default to a test ID (e.g., 7) if testing without token.
        const transporterId = req.user?.id || 7;

        // 1. Fetch Transporter Profile Details
        const [userRows] = await pool.query<RowDataPacket[]>(
            `SELECT id, name, email, phone, location, verified FROM users WHERE id = ? AND role = 'transporter'`,
            [transporterId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Transporter profile not found' });
        }
        const user = userRows[0];

        // Helper for time-based greeting
        const currentHour = new Date().getHours();
        const greeting =
            currentHour < 12 ? 'Good morning,' : currentHour < 17 ? 'Good afternoon,' : 'Good evening,';

        // 2. Transporter Stats & Job Counts
        const [statsRows] = await pool.query<RowDataPacket[]>(
            `SELECT 
        (SELECT COUNT(*) FROM transport_jobs WHERE status = 'Open') AS openJobsCount,
        (SELECT COUNT(*) FROM transport_jobs WHERE transporter_id = ? AND status IN ('Assigned', 'In Transit')) AS activeJobsCount,
        (SELECT COUNT(*) FROM transport_jobs WHERE transporter_id = ? AND status = 'Delivered') AS completedJobsCount`,
            [transporterId, transporterId]
        );
        const statsData = statsRows[0] || { openJobsCount: 0, activeJobsCount: 0, completedJobsCount: 0 };

        // 3. Payment Summary (Pending Escrow & This Month's Earnings)
        const [paymentRows] = await pool.query<RowDataPacket[]>(
            `SELECT 
        COALESCE(SUM(CASE WHEN status = 'Held in Escrow' THEN amount ELSE 0 END), 0) AS pendingRelease,
        COALESCE(SUM(CASE WHEN status = 'Released' AND MONTH(released_at) = MONTH(CURRENT_DATE()) AND YEAR(released_at) = YEAR(CURRENT_DATE()) THEN amount ELSE 0 END), 0) AS thisMonth
       FROM payments 
       WHERE payee_id = ? AND payment_type = 'transport_fee'`,
            [transporterId]
        );
        const payments = paymentRows[0] || { pendingRelease: 0, thisMonth: 0 };

        // 4. Current Active Job (In Transit or Assigned)
        const [activeJobRows] = await pool.query<RowDataPacket[]>(
            `SELECT 
        tj.id,
        tj.job_code,
        tj.status,
        tj.pickup_location,
        tj.drop_location,
        tj.fee,
        tj.vehicle_type,
        tj.scheduled_date,
        o.product_name,
        o.quantity,
        u_farmer.name AS farmer_name,
        u_farmer.phone AS farmer_phone,
        u_seller.name AS seller_name
       FROM transport_jobs tj
       LEFT JOIN orders o ON tj.order_id = o.id
       LEFT JOIN users u_farmer ON o.farmer_id = u_farmer.id
       LEFT JOIN users u_seller ON o.seller_id = u_seller.id
       WHERE tj.transporter_id = ? AND tj.status IN ('Assigned', 'In Transit')
       ORDER BY tj.scheduled_date ASC
       LIMIT 1`,
            [transporterId]
        );

        let activeJob = null;
        if (activeJobRows.length > 0) {
            const row = activeJobRows[0];
            activeJob = {
                id: row.job_code || `#TR-${row.id}`,
                dbId: row.id,
                cropName: row.product_name || 'Agricultural Produce',
                weight: row.quantity ? `${row.quantity} kg` : 'Standard Load',
                status: row.status === 'In Transit' ? 'In Progress' : row.status,
                pickup: row.pickup_location,
                dropoff: row.drop_location,
                distance: 'Approx. 85 km',
                price: `Rs. ${Number(row.fee).toLocaleString()}`,
                farmerName: row.farmer_name || 'Farmer',
                farmerPhone: row.farmer_phone || '+94 77 000 0000',
                sellerName: row.seller_name || 'Green Hive Buyer',
                pickupDate: row.scheduled_date
                    ? new Date(row.scheduled_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })
                    : 'Today',
            };
        }

        // 5. Available Jobs (Top 2 for Home Preview)
        const [availableRows] = await pool.query<RowDataPacket[]>(
            `SELECT 
        tj.id,
        tj.job_code,
        tj.status,
        tj.pickup_location,
        tj.drop_location,
        tj.fee,
        tj.scheduled_date,
        o.product_name,
        o.quantity,
        u_farmer.name AS farmer_name,
        u_farmer.phone AS farmer_phone
       FROM transport_jobs tj
       LEFT JOIN orders o ON tj.order_id = o.id
       LEFT JOIN users u_farmer ON o.farmer_id = u_farmer.id
       WHERE tj.status = 'Open'
       ORDER BY tj.created_at DESC
       LIMIT 5`
        );

        const availableJobs = availableRows.map((row) => ({
            id: row.job_code || `#TR-${row.id}`,
            dbId: row.id,
            cropName: row.product_name || 'Fresh Produce',
            weight: row.quantity ? `${row.quantity} kg` : 'Standard Load',
            status: 'Open',
            pickup: row.pickup_location,
            dropoff: row.drop_location,
            price: `Rs. ${Number(row.fee).toLocaleString()}`,
            pickupTime: row.scheduled_date
                ? new Date(row.scheduled_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : 'Tomorrow · 07:00 AM',
            farmerName: row.farmer_name || 'Farmer',
            farmerPhone: row.farmer_phone,
        }));

        // Formatted Profile for Screen Header & Banner Card
        const profile = {
            name: user.name,
            greeting,
            avatarLetter: user.name ? user.name.charAt(0).toUpperCase() : 'T',
            email: user.email,
            phone: user.phone || '',
            vehicleType: 'Lorry - 3 Ton',
            vehiclePlate: 'WP-LH-4821',
            isVerified: Boolean(user.verified),
            rating: 4.8,
            completedJobs: Number(statsData.completedJobsCount) || 0,
            baseLocation: user.location || 'Colombo',
        };

        // 2x2 Stats Card Object
        const stats = {
            openJobsCount: Number(statsData.openJobsCount) || 0,
            myOffersCount: 2, // offers count or dynamic count
            activeJobsCount: Number(statsData.activeJobsCount) || 0,
            thisMonthEarnings: `Rs. ${(Number(payments.thisMonth) / 1000).toFixed(0)}k`,
        };

        // Payment Summary Card Object
        const paymentSummary = {
            pendingRelease: `Rs. ${Number(payments.pendingRelease).toLocaleString()}`,
            thisMonth: `Rs. ${Number(payments.thisMonth).toLocaleString()}`,
        };

        return res.status(200).json({
            success: true,
            data: {
                profile,
                stats,
                activeJob,
                availableJobs,
                paymentSummary,
            },
        });
    } catch (error: any) {
        console.error('Error fetching transporter home data:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch home screen data',
            error: error.message,
        });
    }
};

/**
 * PATCH /api/transporter/jobs/:id/status
 * Updates delivery status (e.g., 'In Transit', 'Delivered')
 */
export const updateJobStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        let { status } = req.body;

        // Map mobile UI statuses to database ENUM values
        if (status === 'In Progress' || status === 'At Pickup') {
            status = 'In Transit';
        }

        const validStatuses = ['Open', 'Assigned', 'In Transit', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
            });
        }

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE transport_jobs SET status = ? WHERE (id = ? OR job_code = ?)`,
            [status, id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // If marked Delivered, complete the linked order and release escrow payment
        if (status === 'Delivered') {
            // 1. Update order status to Completed
            await pool.query(
                `UPDATE orders o
                 JOIN transport_jobs tj ON o.id = tj.order_id
                 SET o.order_status = 'Completed', o.payment_status = 'Completed'
                 WHERE (tj.id = ? OR tj.job_code = ?)`,
                [id, id]
            );

            // 2. Release transport fee escrow payment
            await pool.query(
                `UPDATE payments p
                 JOIN transport_jobs tj ON p.order_id = tj.order_id
                 SET p.status = 'Released', p.released_at = NOW()
                 WHERE (tj.id = ? OR tj.job_code = ?) AND p.payment_type = 'transport_fee'`,
                [id, id]
            );
        }

        return res.status(200).json({
            success: true,
            message: `Job status updated to ${status}`,
            data: { id, status },
        });
    } catch (error: any) {
        console.error('Error updating job status:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};


/**
 * Helper to format date nicely
 */
function formatJobSchedule(date: Date | string | null) {
  if (!date) return { dateStr: 'Today', timeStr: '07:00 AM', combinedStr: 'Today · 07:00 AM' };
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return { dateStr, timeStr, combinedStr: `${dateStr} · ${timeStr}` };
}

/**
 * GET /api/transporter/jobs/available
 * Fetches all available transport jobs open for bids/assignment
 * Query params: search, vehicle_type, sort (date_asc, date_desc, fee_desc, fee_asc)
 */
export const getAvailableJobs = async (req: Request, res: Response) => {
  try {
    const { search, vehicle_type, sort } = req.query;

    let query = `
      SELECT 
        tj.id,
        tj.job_code,
        tj.status,
        tj.pickup_location,
        tj.drop_location,
        tj.vehicle_type,
        tj.fee,
        tj.scheduled_date,
        tj.created_at,
        o.id AS order_id,
        o.order_code,
        o.product_name,
        o.quantity,
        u_farmer.name AS farmer_name,
        u_farmer.phone AS farmer_phone,
        u_seller.name AS seller_name
      FROM transport_jobs tj
      JOIN orders o ON tj.order_id = o.id
      LEFT JOIN users u_farmer ON o.farmer_id = u_farmer.id
      LEFT JOIN users u_seller ON o.seller_id = u_seller.id
      WHERE tj.status = 'Open'
    `;

    const params: any[] = [];

    if (search && typeof search === 'string' && search.trim() !== '') {
      query += ` AND (
        o.product_name LIKE ? OR 
        tj.pickup_location LIKE ? OR 
        tj.drop_location LIKE ? OR 
        tj.job_code LIKE ?
      )`;
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (vehicle_type && typeof vehicle_type === 'string' && vehicle_type.trim() !== '') {
      query += ` AND tj.vehicle_type LIKE ?`;
      params.push(`%${vehicle_type.trim()}%`);
    }

    if (sort === 'fee_desc') {
      query += ` ORDER BY tj.fee DESC`;
    } else if (sort === 'fee_asc') {
      query += ` ORDER BY tj.fee ASC`;
    } else if (sort === 'date_asc') {
      query += ` ORDER BY tj.scheduled_date ASC`;
    } else {
      query += ` ORDER BY tj.created_at DESC, tj.scheduled_date ASC`;
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    const availableJobs = rows.map((row) => {
      const schedule = formatJobSchedule(row.scheduled_date);
      return {
        id: row.job_code || `#TR-${row.id}`,
        dbId: row.id,
        orderId: row.order_id,
        cropName: row.product_name || 'Agricultural Produce',
        weight: row.quantity ? `${row.quantity} kg` : 'Standard Load',
        status: 'Open',
        pickup: row.pickup_location,
        pickupLocationDetail: row.pickup_location,
        dropoff: row.drop_location,
        dropoffLocationDetail: row.drop_location,
        pickupDate: schedule.dateStr,
        pickupRequiredTime: schedule.timeStr,
        pickupTime: schedule.combinedStr,
        price: `Rs. ${Number(row.fee).toLocaleString()}`,
        rawFee: Number(row.fee),
        distance: 'Approx. 95 km',
        vehicleType: row.vehicle_type || 'Standard Truck',
        farmerName: row.farmer_name || 'Farmer',
        farmerPhone: row.farmer_phone || '+94 77 123 4567',
        sellerName: row.seller_name || 'Market Buyer',
        specialInstructions: 'Handle with care. Keep covered during transport.',
        createdAt: row.created_at,
      };
    });

    return res.status(200).json({
      success: true,
      totalCount: availableJobs.length,
      data: availableJobs,
    });
  } catch (error: any) {
    console.error('Error fetching available jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch available transport jobs',
      error: error.message,
    });
  }
};

/**
 * GET /api/transporter/jobs/:id
 * Fetches complete details of a single transport job
 */
export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        tj.id,
        tj.job_code,
        tj.status,
        tj.pickup_location,
        tj.drop_location,
        tj.vehicle_type,
        tj.fee,
        tj.scheduled_date,
        tj.created_at,
        o.id AS order_id,
        o.order_code,
        o.product_name,
        o.quantity,
        o.unit_price,
        o.total_amount,
        u_farmer.name AS farmer_name,
        u_farmer.phone AS farmer_phone,
        u_farmer.location AS farmer_location,
        u_seller.name AS seller_name,
        u_seller.phone AS seller_phone,
        u_seller.location AS seller_location
      FROM transport_jobs tj
      JOIN orders o ON tj.order_id = o.id
      LEFT JOIN users u_farmer ON o.farmer_id = u_farmer.id
      LEFT JOIN users u_seller ON o.seller_id = u_seller.id
      WHERE tj.id = ? OR tj.job_code = ?
      LIMIT 1`,
      [id, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transport job not found',
      });
    }

    const row = rows[0];
    const schedule = formatJobSchedule(row.scheduled_date);

    const job = {
      id: row.job_code || `#TR-${row.id}`,
      dbId: row.id,
      orderId: row.order_id,
      orderCode: row.order_code,
      cropName: row.product_name,
      weight: row.quantity ? `${row.quantity} kg` : 'Standard Load',
      status: row.status,
      pickup: row.pickup_location,
      pickupLocationDetail: row.pickup_location,
      dropoff: row.drop_location,
      dropoffLocationDetail: row.drop_location,
      pickupDate: schedule.dateStr,
      pickupRequiredTime: schedule.timeStr,
      pickupTime: schedule.combinedStr,
      price: `Rs. ${Number(row.fee).toLocaleString()}`,
      rawFee: Number(row.fee),
      vehicleType: row.vehicle_type,
      distance: 'Approx. 95 km',
      farmerName: row.farmer_name || 'Farmer',
      farmerPhone: row.farmer_phone || '+94 77 123 4567',
      farmerLocation: row.farmer_location,
      sellerName: row.seller_name || 'Green Hive Buyer',
      sellerPhone: row.seller_phone,
      sellerLocation: row.seller_location,
      specialInstructions: 'Handle with care. Keep covered during transport.',
      createdAt: row.created_at,
    };

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    console.error('Error fetching job details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch job details',
      error: error.message,
    });
  }
};


/**
 * POST /api/transporter/jobs/:id/offers
 * Submits a bid/quote for an available transport job
 */
export const submitJobOffer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const transporterId = req.user?.id || 7;
    const { quotePrice, estimatedDelivery, notes } = req.body;

    const numericPrice = Number(quotePrice);
    if (!quotePrice || isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quote price (greater than 0) is required',
      });
    }

    // 1. Verify that job exists and is Open
    const [jobRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, job_code, status FROM transport_jobs WHERE (id = ? OR job_code = ?)`,
      [id, id]
    );

    if (jobRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transport job not found' });
    }

    const job = jobRows[0];
    if (job.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: `Job is no longer open for offers (Current status: ${job.status})`,
      });
    }

    // 2. Check for duplicate pending offer
    const [existingOffer] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM transport_offers WHERE job_id = ? AND transporter_id = ? AND status IN ('Submitted', 'Accepted', 'Under Review')`,
      [job.id, transporterId]
    );

    if (existingOffer.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an active offer for this job',
      });
    }

    // 3. Insert offer record
    const [insertResult] = await pool.query<ResultSetHeader>(
      `INSERT INTO transport_offers (job_id, transporter_id, quote_price, estimated_delivery, notes, status)
       VALUES (?, ?, ?, ?, ?, 'Submitted')`,
      [
        job.id,
        transporterId,
        numericPrice,
        estimatedDelivery || 'Standard Delivery Window',
        notes || '',
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Transport offer submitted successfully to farmer',
      data: {
        offerId: insertResult.insertId,
        jobId: job.job_code || `#TR-${job.id}`,
        quotePrice: `Rs. ${numericPrice.toLocaleString()}`,
        status: 'Submitted',
      },
    });
  } catch (error: any) {
    console.error('Error submitting transport offer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit transport offer',
      error: error.message,
    });
  }
};


/**
 * GET /api/transporter/jobs/active
 * Fetches the current active job assigned to the logged-in transporter (status: 'Assigned' or 'In Transit')
 */
export const getActiveJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || 7;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        tj.id,
        tj.job_code,
        tj.status,
        tj.pickup_location,
        tj.drop_location,
        tj.vehicle_type,
        tj.fee,
        tj.scheduled_date,
        tj.created_at,
        o.id AS order_id,
        o.order_code,
        o.product_name,
        o.quantity,
        o.unit_price,
        o.total_amount,
        u_farmer.name AS farmer_name,
        u_farmer.phone AS farmer_phone,
        u_farmer.location AS farmer_location,
        u_seller.name AS seller_name,
        u_seller.phone AS seller_phone,
        u_seller.location AS seller_location
      FROM transport_jobs tj
      JOIN orders o ON tj.order_id = o.id
      LEFT JOIN users u_farmer ON o.farmer_id = u_farmer.id
      LEFT JOIN users u_seller ON o.seller_id = u_seller.id
      WHERE tj.transporter_id = ? AND tj.status IN ('Assigned', 'In Transit')
      ORDER BY tj.scheduled_date ASC
      LIMIT 1`,
      [transporterId]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active job currently assigned',
      });
    }

    const row = rows[0];
    const schedule = formatJobSchedule(row.scheduled_date);

    const activeJob = {
      id: row.job_code || `#TR-${row.id}`,
      dbId: row.id,
      orderId: row.order_id,
      orderCode: row.order_code,
      cropName: row.product_name || 'Agricultural Produce',
      weight: row.quantity ? `${row.quantity} kg` : 'Standard Load',
      status: row.status === 'In Transit' ? 'In Progress' : row.status,
      rawStatus: row.status,
      pickup: row.pickup_location,
      dropoff: row.drop_location,
      distance: 'Approx. 85 km',
      price: `Rs. ${Number(row.fee).toLocaleString()}`,
      rawFee: Number(row.fee),
      vehicleType: row.vehicle_type || 'Light Truck (1.5T)',
      farmerName: row.farmer_name || 'Sunil Perera',
      farmerPhone: row.farmer_phone || '+94 77 123 4567',
      farmerLocation: row.farmer_location,
      sellerName: row.seller_name || 'Colombo Fresh Market',
      sellerPhone: row.seller_phone,
      sellerLocation: row.seller_location,
      pickupDate: schedule.combinedStr,
      specialInstructions: 'Handle with care. Keep cool. Arrive on schedule for market opening.',
      createdAt: row.created_at,
    };

    return res.status(200).json({
      success: true,
      data: activeJob,
    });
  } catch (error: any) {
    console.error('Error fetching active job:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch active job',
      error: error.message,
    });
  }
};


/**
 * GET /api/transporter/profile
 * Fetches the full profile of the logged-in transporter including vehicle and performance stats
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || 7;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.location,
        u.verified,
        tp.avatar_url,
        tp.vehicle_type,
        tp.vehicle_plate,
        tp.rating,
        tp.on_time_rate,
        (SELECT COUNT(*) FROM transport_jobs WHERE transporter_id = u.id AND status = 'Delivered') AS completed_jobs,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payee_id = u.id AND payment_type = 'transport_fee' AND status = 'Released') AS total_earnings
      FROM users u
      LEFT JOIN transporter_profiles tp ON u.id = tp.user_id
      WHERE u.id = ? AND u.role = 'transporter'`,
      [transporterId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transporter profile not found' });
    }

    const row = rows[0];
    const currentHour = new Date().getHours();
    const greeting =
      currentHour < 12 ? 'Good morning,' : currentHour < 17 ? 'Good afternoon,' : 'Good evening,';

    const rawEarnings = Number(row.total_earnings) || 0;
    const formattedEarnings =
      rawEarnings >= 1000 ? `Rs. ${(rawEarnings / 1000).toFixed(0)}k` : `Rs. ${rawEarnings.toLocaleString()}`;

    const profile = {
      name: row.name,
      greeting,
      avatarLetter: row.name ? row.name.charAt(0).toUpperCase() : 'T',
      avatarUri: row.avatar_url || undefined,
      email: row.email,
      phone: row.phone || '',
      baseLocation: row.location || 'Colombo',
      vehicleType: row.vehicle_type || 'Lorry - 3 Ton',
      vehiclePlate: row.vehicle_plate || 'WP-LH-4821',
      isVerified: Boolean(row.verified),
      rating: Number(row.rating) || 4.8,
      completedJobs: Number(row.completed_jobs) || 0,
      totalEarnings: formattedEarnings,
      onTimeDeliveryRate: row.on_time_rate || '98%',
    };

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transporter profile',
      error: error.message,
    });
  }
};

/**
 * PUT /api/transporter/profile
 * Updates transporter profile contact details and vehicle specifications
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || 7;
    const { name, phone, email, baseLocation, vehicleType, vehiclePlate } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    // 1. Update basic user details in users table
    await pool.query(
      `UPDATE users 
       SET name = ?, phone = COALESCE(?, phone), email = COALESCE(?, email), location = COALESCE(?, location)
       WHERE id = ? AND role = 'transporter'`,
      [name.trim(), phone, email, baseLocation, transporterId]
    );

    // 2. Update vehicle specifications in transporter_profiles table
    await pool.query(
      `INSERT INTO transporter_profiles (user_id, vehicle_type, vehicle_plate)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         vehicle_type = COALESCE(VALUES(vehicle_type), vehicle_type),
         vehicle_plate = COALESCE(VALUES(vehicle_plate), vehicle_plate)`,
      [transporterId, vehicleType || 'Lorry - 3 Ton', vehiclePlate || 'WP-LH-4821']
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        name: name.trim(),
        phone,
        email,
        baseLocation,
        vehicleType,
        vehiclePlate,
      },
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};


/**
 * POST /api/transporter/profile/avatar
 * Updates or sets the profile picture avatar URL
 */
export const updateAvatar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || 7;
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ success: false, message: 'avatarUrl is required' });
    }

    await pool.query(
      `INSERT INTO transporter_profiles (user_id, avatar_url)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE avatar_url = VALUES(avatar_url)`,
      [transporterId, avatarUrl]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: { avatarUrl },
    });
  } catch (error: any) {
    console.error('Error updating avatar:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update avatar',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/transporter/profile/avatar
 * Removes the profile picture and restores the default letter avatar
 */
export const removeAvatar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || 7;

    await pool.query(
      `UPDATE transporter_profiles SET avatar_url = NULL WHERE user_id = ?`,
      [transporterId]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile picture removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing avatar:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove avatar',
      error: error.message,
    });
  }
};
