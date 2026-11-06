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
        const { status } = req.body;

        const validStatuses = ['Open', 'Assigned', 'In Transit', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE transport_jobs SET status = ? WHERE (id = ? OR job_code = ?)`,
            [status, id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // If marked Delivered, automatically release payment to transporter in payments table
        if (status === 'Delivered') {
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
