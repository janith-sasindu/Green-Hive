import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';
import {
  DEFAULT_TRANSPORTER_ID,
  DEFAULT_TRANSPORTER_PROFILE,
  DEFAULT_BANK_DETAILS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_JOB_METADATA,
  DEFAULT_STAT_FALLBACKS,
  PROFILE_VALIDATION_MESSAGES,
  OFFER_MESSAGES,
  DEFAULT_OFFER_CONSTANTS,
} from '../data';

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
        const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;

        // 1. Fetch Transporter Profile Details joining profile vehicle data
        const [userRows] = await pool.query<RowDataPacket[]>(
            `SELECT u.id, u.name, u.email, u.phone, u.location, u.verified,
                    tp.vehicle_type, tp.vehicle_plate, tp.rating
             FROM users u
             LEFT JOIN transporter_profiles tp ON u.id = tp.user_id
             WHERE u.id = ? AND u.role = 'transporter'`,
            [transporterId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Transporter profile not found' });
        }

        const user = userRows[0];
        const currentHour = new Date().getHours();
        const greeting =
            currentHour < 12 ? 'Good morning,' : currentHour < 17 ? 'Good afternoon,' : 'Good evening,';

        // 2. Fetch Dashboard Statistics
        const [statsRows] = await pool.query<RowDataPacket[]>(
            `SELECT 
        (SELECT COUNT(*) FROM transport_jobs WHERE status = 'Open') AS openJobsCount,
        (SELECT COUNT(*) FROM transport_jobs WHERE transporter_id = ? AND status IN ('Assigned', 'In Transit')) AS activeJobsCount,
        (SELECT COUNT(*) FROM transport_jobs WHERE transporter_id = ? AND status = 'Delivered') AS completedJobsCount`,
            [transporterId, transporterId]
        );
        const statsData = statsRows[0] || DEFAULT_STAT_FALLBACKS;

        // Query dynamic offers count
        const [offersRows] = await pool.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS count FROM transport_offers WHERE transporter_id = ?`,
            [transporterId]
        );
        const myOffersCount = Number(offersRows[0]?.count) || DEFAULT_STAT_FALLBACKS.myOffersCount;

        // 3. Fetch Payment Summary
        const [paymentRows] = await pool.query<RowDataPacket[]>(
            `SELECT 
        (SELECT COALESCE(SUM(fee), 0) FROM transport_jobs WHERE transporter_id = ? AND status IN ('Assigned', 'In Transit')) AS pendingRelease,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payee_id = ? AND payment_type = 'transport_fee' AND status = 'Released' AND MONTH(created_at) = MONTH(CURRENT_DATE())) AS thisMonth`,
            [transporterId, transporterId]
        );
        const payments = paymentRows[0] || { pendingRelease: 0, thisMonth: 0 };

        // 4. Fetch Current Active Job
        const [activeJobRows] = await pool.query<RowDataPacket[]>(
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
        u_farmer.phone AS farmer_phone,
        u_seller.name AS seller_name
       FROM transport_jobs tj
       JOIN orders o ON tj.order_id = o.id
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
                cropName: row.product_name || DEFAULT_JOB_METADATA.defaultCropName,
                weight: row.quantity ? `${row.quantity} kg` : DEFAULT_JOB_METADATA.defaultWeight,
                status: row.status === 'In Transit' ? 'In Progress' : row.status,
                pickup: row.pickup_location,
                dropoff: row.drop_location,
                distance: 'Approx. 85 km',
                price: `Rs. ${Number(row.fee).toLocaleString()}`,
                farmerName: row.farmer_name || DEFAULT_JOB_METADATA.defaultFarmerName,
                farmerPhone: row.farmer_phone || DEFAULT_JOB_METADATA.defaultFarmerPhone,
                sellerName: row.seller_name || DEFAULT_JOB_METADATA.defaultSellerName,
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

        // 5. Available Jobs (Top 5 for Home Preview)
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
            cropName: row.product_name || DEFAULT_JOB_METADATA.defaultCropName,
            weight: row.quantity ? `${row.quantity} kg` : DEFAULT_JOB_METADATA.defaultWeight,
            status: 'Open',
            pickup: row.pickup_location,
            dropoff: row.drop_location,
            price: `Rs. ${Number(row.fee).toLocaleString()}`,
            pickupTime: row.scheduled_date
                ? new Date(row.scheduled_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : DEFAULT_JOB_METADATA.defaultScheduledDate,
            farmerName: row.farmer_name || DEFAULT_JOB_METADATA.defaultFarmerName,
            farmerPhone: row.farmer_phone,
        }));

        // Formatted Profile for Screen Header & Banner Card
        const profile = {
            name: user.name,
            greeting,
            avatarLetter: user.name ? user.name.charAt(0).toUpperCase() : 'T',
            email: user.email,
            phone: user.phone || '',
            vehicleType: user.vehicle_type || DEFAULT_TRANSPORTER_PROFILE.vehicleType,
            vehiclePlate: user.vehicle_plate || DEFAULT_TRANSPORTER_PROFILE.vehiclePlate,
            isVerified: Boolean(user.verified),
            rating: Number(user.rating) || DEFAULT_TRANSPORTER_PROFILE.rating,
            completedJobs: Number(statsData.completedJobsCount) || DEFAULT_STAT_FALLBACKS.completedJobsCount,
            baseLocation: user.location || DEFAULT_TRANSPORTER_PROFILE.baseLocation,
        };

        // 2x2 Stats Card Object
        const stats = {
            openJobsCount: Number(statsData.openJobsCount) || DEFAULT_STAT_FALLBACKS.openJobsCount,
            myOffersCount,
            activeJobsCount: Number(statsData.activeJobsCount) || DEFAULT_STAT_FALLBACKS.activeJobsCount,
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

        const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;

        // Ensure the job exists and belongs to this transporter
        const [jobRows] = await pool.query<RowDataPacket[]>(
            `SELECT id, status, order_id FROM transport_jobs WHERE id = ? AND transporter_id = ?`,
            [id, transporterId]
        );

        if (jobRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transport job not found or not assigned to you',
            });
        }

        const job = jobRows[0];

        // Perform the status update
        await pool.query(
            `UPDATE transport_jobs SET status = ? WHERE id = ?`,
            [status, id]
        );

        // If job is delivered, update order delivery status and release payment
        if (status === 'Delivered' && job.order_id) {
            await pool.query(
                `UPDATE orders SET status = 'Delivered', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [job.order_id]
            );

            await pool.query(
                `UPDATE payments SET status = 'Released', updated_at = CURRENT_TIMESTAMP WHERE order_id = ? AND payment_type = 'transport_fee'`,
                [job.order_id]
            );
        }

        return res.status(200).json({
            success: true,
            message: `Transport job #${id} status updated to ${status}`,
            data: { id, status },
        });
    } catch (error: any) {
        console.error('Error updating job status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update transport job status',
            error: error.message,
        });
    }
};

/**
 * Helper to format date strings for Available Jobs
 */
function formatJobSchedule(date: Date | string | null | undefined): {
  dateStr: string;
  timeStr: string;
  combinedStr: string;
} {
  if (!date) {
    return {
      dateStr: 'Tomorrow',
      timeStr: '07:00 AM',
      combinedStr: DEFAULT_JOB_METADATA.defaultScheduledDate,
    };
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return {
      dateStr: 'Tomorrow',
      timeStr: '07:00 AM',
      combinedStr: DEFAULT_JOB_METADATA.defaultScheduledDate,
    };
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return {
    dateStr,
    timeStr,
    combinedStr: `${dateStr} · ${timeStr}`,
  };
}

/**
 * GET /api/transporter/jobs/available
 * Fetches all available transport jobs ready for bids / assignment
 */
export const getAvailableJobs = async (req: Request, res: Response) => {
  try {
    const { search, minPrice, maxPrice, sortBy } = req.query;

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

    // Search query filter (crop, pickup, dropoff, farmer name)
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (
        o.product_name LIKE ? OR 
        tj.pickup_location LIKE ? OR 
        tj.drop_location LIKE ? OR 
        u_farmer.name LIKE ?
      )`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Min price filter
    if (minPrice && !isNaN(Number(minPrice))) {
      query += ` AND tj.fee >= ?`;
      params.push(Number(minPrice));
    }

    // Max price filter
    if (maxPrice && !isNaN(Number(maxPrice))) {
      query += ` AND tj.fee <= ?`;
      params.push(Number(maxPrice));
    }

    // Sorting
    if (sortBy === 'price_asc') {
      query += ` ORDER BY tj.fee ASC`;
    } else if (sortBy === 'price_desc') {
      query += ` ORDER BY tj.fee DESC`;
    } else if (sortBy === 'date_asc') {
      query += ` ORDER BY tj.scheduled_date ASC`;
    } else {
      query += ` ORDER BY tj.created_at DESC`;
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    const availableJobs = rows.map((row) => {
      const schedule = formatJobSchedule(row.scheduled_date);
      return {
        id: row.job_code || `#TR-${row.id}`,
        dbId: row.id,
        orderId: row.order_id,
        cropName: row.product_name || DEFAULT_JOB_METADATA.defaultCropName,
        weight: row.quantity ? `${row.quantity} kg` : DEFAULT_JOB_METADATA.defaultWeight,
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
        vehicleType: row.vehicle_type || DEFAULT_TRANSPORTER_PROFILE.vehicleType,
        farmerName: row.farmer_name || DEFAULT_JOB_METADATA.defaultFarmerName,
        farmerPhone: row.farmer_phone || DEFAULT_JOB_METADATA.defaultFarmerPhone,
        sellerName: row.seller_name || DEFAULT_JOB_METADATA.defaultSellerName,
        specialInstructions: 'Handle with care. Keep covered during transport.',
        farmerRating: DEFAULT_JOB_METADATA.farmerRating,
        urgent: DEFAULT_JOB_METADATA.urgent,
        featured: DEFAULT_JOB_METADATA.featured,
        tags: DEFAULT_JOB_METADATA.tags,
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
 * Fetches single job details including submitted offers
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
      WHERE tj.id = ? OR tj.job_code = ?`,
      [id, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transport job not found' });
    }

    const row = rows[0];
    const schedule = formatJobSchedule(row.scheduled_date);

    // Fetch offers submitted for this job
    const [offers] = await pool.query<RowDataPacket[]>(
      `SELECT 
        tof.id,
        tof.transporter_id,
        tof.quote_price,
        tof.estimated_delivery,
        tof.notes,
        tof.status,
        tof.created_at,
        u.name AS transporter_name,
        u.phone AS transporter_phone
      FROM transport_offers tof
      JOIN users u ON tof.transporter_id = u.id
      WHERE tof.job_id = ?
      ORDER BY tof.created_at DESC`,
      [row.id]
    );

    const job = {
      id: row.job_code || `#TR-${row.id}`,
      dbId: row.id,
      orderId: row.order_id,
      orderCode: row.order_code,
      cropName: row.product_name || DEFAULT_JOB_METADATA.defaultCropName,
      weight: row.quantity ? `${row.quantity} kg` : DEFAULT_JOB_METADATA.defaultWeight,
      status: row.status,
      pickup: row.pickup_location,
      dropoff: row.drop_location,
      price: `Rs. ${Number(row.fee).toLocaleString()}`,
      rawFee: Number(row.fee),
      vehicleType: row.vehicle_type || DEFAULT_TRANSPORTER_PROFILE.vehicleType,
      farmerName: row.farmer_name || DEFAULT_JOB_METADATA.defaultFarmerName,
      farmerPhone: row.farmer_phone || DEFAULT_JOB_METADATA.defaultFarmerPhone,
      farmerLocation: row.farmer_location,
      sellerName: row.seller_name || DEFAULT_JOB_METADATA.defaultSellerName,
      sellerPhone: row.seller_phone,
      sellerLocation: row.seller_location,
      pickupDate: schedule.dateStr,
      pickupRequiredTime: schedule.timeStr,
      pickupTime: schedule.combinedStr,
      specialInstructions: 'Handle with care. Keep covered during transport.',
      createdAt: row.created_at,
      offers: offers.map((o) => ({
        id: o.id,
        transporterId: o.transporter_id,
        transporterName: o.transporter_name,
        quotePrice: `Rs. ${Number(o.quote_price).toLocaleString()}`,
        estimatedDelivery: o.estimated_delivery,
        notes: o.notes,
        status: o.status,
        createdAt: o.created_at,
      })),
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
 * Transporter submits a custom quotation/bid for an available job
 */
export const submitJobOffer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;
    const { quotePrice, estimatedDelivery, notes } = req.body;

    if (!quotePrice) {
      return res.status(400).json({
        success: false,
        message: OFFER_MESSAGES.missingQuotePrice,
      });
    }

    const numericPrice = typeof quotePrice === 'number'
      ? quotePrice
      : parseFloat(String(quotePrice).replace(/[^0-9.]/g, ''));

    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: OFFER_MESSAGES.invalidQuotePrice,
      });
    }

    // 1. Verify job exists and is still open
    const [jobRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, status, job_code FROM transport_jobs WHERE id = ? OR job_code = ?`,
      [id, id]
    );

    if (jobRows.length === 0) {
      return res.status(404).json({ success: false, message: OFFER_MESSAGES.jobNotFound });
    }

    const job = jobRows[0];
    if (job.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: `${OFFER_MESSAGES.jobNotOpen} (Current status: ${job.status})`,
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
        message: OFFER_MESSAGES.duplicateActiveOffer,
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
        estimatedDelivery || DEFAULT_OFFER_CONSTANTS.defaultDeliveryWindow,
        notes || '',
      ]
    );

    return res.status(201).json({
      success: true,
      message: OFFER_MESSAGES.submitSuccess,
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
 * GET /api/transporter/offers
 * Fetches all transport offers submitted by the logged-in transporter
 */
export const getMyOffers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;
    const { status } = req.query;

    let query = `
      SELECT 
        tof.id AS offer_id,
        tof.job_id,
        tof.quote_price,
        tof.estimated_delivery,
        tof.notes,
        tof.status AS offer_status,
        tof.created_at AS offer_created_at,
        tj.id AS job_db_id,
        tj.job_code,
        tj.pickup_location,
        tj.drop_location,
        tj.vehicle_type,
        tj.fee AS job_fee,
        tj.scheduled_date,
        tj.status AS job_status,
        o.id AS order_id,
        o.product_name,
        o.quantity,
        u_farmer.name AS farmer_name,
        u_farmer.phone AS farmer_phone,
        u_seller.name AS seller_name
      FROM transport_offers tof
      JOIN transport_jobs tj ON tof.job_id = tj.id
      JOIN orders o ON tj.order_id = o.id
      LEFT JOIN users u_farmer ON o.farmer_id = u_farmer.id
      LEFT JOIN users u_seller ON o.seller_id = u_seller.id
      WHERE tof.transporter_id = ?
    `;

    const params: any[] = [transporterId];

    if (status && typeof status === 'string' && status !== 'All') {
      if (status === 'Submitted') {
        query += ` AND tof.status IN ('Submitted', 'Under Review', 'Pending Farmer Approval')`;
      } else if (status === 'Accepted') {
        query += ` AND tof.status = 'Accepted'`;
      } else {
        query += ` AND tof.status = ?`;
        params.push(status);
      }
    }

    query += ` ORDER BY tof.created_at DESC`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    const offers = rows.map((row) => {
      const schedule = formatJobSchedule(row.scheduled_date);
      const createdAtDate = row.offer_created_at ? new Date(row.offer_created_at) : new Date();
      const submittedDate = `${createdAtDate.getFullYear()}-${String(createdAtDate.getMonth() + 1).padStart(2, '0')}-${String(createdAtDate.getDate()).padStart(2, '0')}`;

      return {
        id: row.job_code || `Job #${row.job_id}`,
        offerId: row.offer_id,
        jobId: row.job_id,
        jobCode: row.job_code,
        title: DEFAULT_OFFER_CONSTANTS.defaultTitle,
        cropName: row.product_name || DEFAULT_JOB_METADATA.defaultCropName,
        weight: row.quantity ? `${row.quantity} kg` : DEFAULT_JOB_METADATA.defaultWeight,
        route: `${row.pickup_location} → ${row.drop_location}`,
        quotePrice: `Rs. ${Number(row.quote_price).toLocaleString()}`,
        rawPrice: Number(row.quote_price),
        estimatedDelivery: row.estimated_delivery || schedule.combinedStr,
        notes: row.notes || DEFAULT_OFFER_CONSTANTS.defaultOfferNote,
        submittedDate,
        status: row.offer_status,
        sellerName: row.seller_name || DEFAULT_JOB_METADATA.defaultSellerName,
        farmerName: row.farmer_name || DEFAULT_JOB_METADATA.defaultFarmerName,
        farmerPhone: row.farmer_phone || DEFAULT_JOB_METADATA.defaultFarmerPhone,
        pickupLocation: row.pickup_location,
        dropoffLocation: row.drop_location,
        jobStatus: row.job_status,
      };
    });

    return res.status(200).json({
      success: true,
      data: offers,
      count: offers.length,
    });
  } catch (error: any) {
    console.error('Error fetching transporter offers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transport offers',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/transporter/offers/:id
 * Transporter withdraws a submitted offer
 */
export const withdrawOffer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;

    // Search by offer id or matching job_id or job_code
    let [rows] = await pool.query<RowDataPacket[]>(
      `SELECT tof.id, tof.status, tof.job_id, tj.job_code 
       FROM transport_offers tof
       JOIN transport_jobs tj ON tof.job_id = tj.id
       WHERE tof.id = ? AND tof.transporter_id = ?`,
      [id, transporterId]
    );

    // If not found by direct offer id, try by job_id or job_code
    if (rows.length === 0) {
      const cleanId = String(id).replace(/[^0-9]/g, '');
      const jobCode = String(id).trim();

      [rows] = await pool.query<RowDataPacket[]>(
        `SELECT tof.id, tof.status, tof.job_id, tj.job_code 
         FROM transport_offers tof
         JOIN transport_jobs tj ON tof.job_id = tj.id
         WHERE (tof.job_id = ? OR tj.job_code = ? OR tj.id = ?) AND tof.transporter_id = ?`,
        [cleanId || id, jobCode, cleanId || id, transporterId]
      );
    }

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: OFFER_MESSAGES.notFound,
      });
    }

    const offer = rows[0];

    if (offer.status === 'Accepted') {
      return res.status(400).json({
        success: false,
        message: OFFER_MESSAGES.cannotWithdrawAccepted,
      });
    }

    // Delete the offer record
    await pool.query(
      `DELETE FROM transport_offers WHERE id = ? AND transporter_id = ?`,
      [offer.id, transporterId]
    );

    return res.status(200).json({
      success: true,
      message: OFFER_MESSAGES.withdrawSuccess,
      data: {
        offerId: offer.id,
        jobId: offer.job_id,
        jobCode: offer.job_code,
      },
    });
  } catch (error: any) {
    console.error('Error withdrawing transport offer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to withdraw transport offer',
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
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;

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
        message: 'No active transport trip in progress',
      });
    }

    const row = rows[0];
    const schedule = formatJobSchedule(row.scheduled_date);

    const activeJob = {
      id: row.job_code || `#TR-${row.id}`,
      dbId: row.id,
      orderId: row.order_id,
      orderCode: row.order_code,
      cropName: row.product_name || DEFAULT_JOB_METADATA.defaultCropName,
      weight: row.quantity ? `${row.quantity} kg` : DEFAULT_JOB_METADATA.defaultWeight,
      status: row.status === 'In Transit' ? 'In Progress' : row.status,
      rawStatus: row.status,
      pickup: row.pickup_location,
      dropoff: row.drop_location,
      distance: 'Approx. 85 km',
      price: `Rs. ${Number(row.fee).toLocaleString()}`,
      rawFee: Number(row.fee),
      vehicleType: row.vehicle_type || DEFAULT_TRANSPORTER_PROFILE.vehicleType,
      farmerName: row.farmer_name || DEFAULT_JOB_METADATA.defaultFarmerName,
      farmerPhone: row.farmer_phone || DEFAULT_JOB_METADATA.defaultFarmerPhone,
      farmerLocation: row.farmer_location,
      sellerName: row.seller_name || DEFAULT_JOB_METADATA.defaultSellerName,
      sellerPhone: row.seller_phone,
      sellerLocation: row.seller_location,
      pickupDate: schedule.combinedStr,
      specialInstructions: 'Handle with care. Keep cool. Arrive on schedule for market opening.',
      farmerRating: DEFAULT_JOB_METADATA.activeFarmerRating,
      eta: DEFAULT_JOB_METADATA.defaultEta,
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
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;

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
      baseLocation: row.location || DEFAULT_TRANSPORTER_PROFILE.baseLocation,
      vehicleType: row.vehicle_type || DEFAULT_TRANSPORTER_PROFILE.vehicleType,
      vehiclePlate: row.vehicle_plate || DEFAULT_TRANSPORTER_PROFILE.vehiclePlate,
      isVerified: Boolean(row.verified),
      rating: Number(row.rating) || DEFAULT_TRANSPORTER_PROFILE.rating,
      completedJobs: Number(row.completed_jobs) || 0,
      totalEarnings: formattedEarnings,
      onTimeDeliveryRate: row.on_time_rate || DEFAULT_TRANSPORTER_PROFILE.onTimeRate,
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
 * Updates transporter profile contact details, vehicle specifications, and optional avatar
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;
    const {
      name,
      phone,
      email,
      baseLocation,
      vehicleType,
      vehiclePlate,
      avatarUrl,
      avatarUri,
    } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: PROFILE_VALIDATION_MESSAGES.missingName });
    }

    if (phone && phone.trim().length < 9) {
      return res.status(400).json({ success: false, message: PROFILE_VALIDATION_MESSAGES.invalidPhone });
    }

    if (email && (!email.includes('@') || !email.includes('.'))) {
      return res.status(400).json({ success: false, message: PROFILE_VALIDATION_MESSAGES.invalidEmail });
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone ? phone.trim() : '';
    const trimmedEmail = email ? email.trim() : '';
    const trimmedLocation = baseLocation ? baseLocation.trim() : DEFAULT_TRANSPORTER_PROFILE.baseLocation;
    const trimmedVehicle = vehicleType ? vehicleType.trim() : DEFAULT_TRANSPORTER_PROFILE.vehicleType;
    const trimmedPlate = vehiclePlate ? vehiclePlate.trim().toUpperCase() : DEFAULT_TRANSPORTER_PROFILE.vehiclePlate;

    // 1. Update basic user details in users table
    await pool.query(
      `UPDATE users 
       SET name = ?, phone = COALESCE(?, phone), email = COALESCE(?, email), location = COALESCE(?, location)
       WHERE id = ? AND role = 'transporter'`,
      [trimmedName, trimmedPhone || null, trimmedEmail || null, trimmedLocation, transporterId]
    );

    // 2. Update vehicle specifications & avatar in transporter_profiles table
    const targetAvatar = avatarUrl !== undefined ? avatarUrl : avatarUri;
    if (targetAvatar !== undefined) {
      await pool.query(
        `INSERT INTO transporter_profiles (user_id, avatar_url, vehicle_type, vehicle_plate)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           avatar_url = VALUES(avatar_url),
           vehicle_type = COALESCE(?, vehicle_type),
           vehicle_plate = COALESCE(?, vehicle_plate)`,
        [
          transporterId,
          targetAvatar || null,
          trimmedVehicle,
          trimmedPlate,
          trimmedVehicle,
          trimmedPlate,
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO transporter_profiles (user_id, vehicle_type, vehicle_plate)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           vehicle_type = COALESCE(?, vehicle_type),
           vehicle_plate = COALESCE(?, vehicle_plate)`,
        [
          transporterId,
          trimmedVehicle,
          trimmedPlate,
          trimmedVehicle,
          trimmedPlate,
        ]
      );
    }

    // Fetch the final avatar_url to return in the response
    const [profRows] = await pool.query<RowDataPacket[]>(
      `SELECT avatar_url, rating, on_time_rate FROM transporter_profiles WHERE user_id = ?`,
      [transporterId]
    );
    const finalProf = profRows[0] || {};

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        name: trimmedName,
        greeting: 'Good morning,',
        avatarLetter: trimmedName.charAt(0).toUpperCase(),
        avatarUri: finalProf.avatar_url || undefined,
        email: trimmedEmail,
        phone: trimmedPhone,
        baseLocation: trimmedLocation,
        vehicleType: trimmedVehicle,
        vehiclePlate: trimmedPlate,
        rating: Number(finalProf.rating) || DEFAULT_TRANSPORTER_PROFILE.rating,
        onTimeDeliveryRate: finalProf.on_time_rate || DEFAULT_TRANSPORTER_PROFILE.onTimeRate,
      },
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update transporter profile',
      error: error.message,
    });
  }
};

/**
 * POST /api/transporter/profile/avatar
 * Uploads/updates the avatar photo URL for the logged-in transporter
 */
export const updateAvatar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;
    const { avatarUrl } = req.body;

    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid avatar URL is required' });
    }

    await pool.query(
      `INSERT INTO transporter_profiles (user_id, avatar_url)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE avatar_url = ?`,
      [transporterId, avatarUrl, avatarUrl]
    );

    return res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: { avatarUrl },
    });
  } catch (error: any) {
    console.error('Error updating avatar:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update avatar photo',
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
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;

    await pool.query(
      `UPDATE transporter_profiles SET avatar_url = NULL WHERE user_id = ?`,
      [transporterId]
    );

    return res.status(200).json({
      success: true,
      message: 'Avatar photo removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing avatar:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove avatar photo',
      error: error.message,
    });
  }
};

/**
 * GET /api/transporter/bank-details
 * Fetches payout bank account details of the logged-in transporter
 */
export const getBankDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        tbd.account_holder_name,
        tbd.bank_name,
        tbd.branch_name,
        tbd.branch_code,
        tbd.account_number,
        tbd.account_type,
        tbd.is_verified,
        u.name AS user_name
      FROM users u
      LEFT JOIN transporter_bank_details tbd ON u.id = tbd.transporter_id
      WHERE u.id = ?`,
      [transporterId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transporter not found' });
    }

    const row = rows[0];

    const bankAccount = {
      accountHolderName: row.account_holder_name || row.user_name || DEFAULT_BANK_DETAILS.accountHolderName,
      bankName: row.bank_name || DEFAULT_BANK_DETAILS.bankName,
      branchName: row.branch_name || DEFAULT_BANK_DETAILS.branchName,
      branchCode: row.branch_code || DEFAULT_BANK_DETAILS.branchCode,
      accountNumber: row.account_number || DEFAULT_BANK_DETAILS.accountNumber,
      accountType: row.account_type || DEFAULT_BANK_DETAILS.accountType,
      isVerified: Boolean(row.is_verified ?? DEFAULT_BANK_DETAILS.isVerified),
    };

    return res.status(200).json({
      success: true,
      data: bankAccount,
    });
  } catch (error: any) {
    console.error('Error fetching bank details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bank account details',
      error: error.message,
    });
  }
};

/**
 * PUT /api/transporter/bank-details
 * Updates payout bank account details of the logged-in transporter
 */
export const updateBankDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;
    const {
      accountHolderName,
      bankName,
      branchName,
      branchCode,
      accountNumber,
      accountType,
    } = req.body;

    if (!accountHolderName || !bankName || !accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Account holder name, bank name, and account number are required',
      });
    }

    await pool.query(
      `INSERT INTO transporter_bank_details (
        transporter_id, account_holder_name, bank_name, branch_name, branch_code, account_number, account_type, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE
        account_holder_name = VALUES(account_holder_name),
        bank_name = VALUES(bank_name),
        branch_name = VALUES(branch_name),
        branch_code = VALUES(branch_code),
        account_number = VALUES(account_number),
        account_type = VALUES(account_type),
        is_verified = 1`,
      [
        transporterId,
        accountHolderName.trim(),
        bankName.trim(),
        branchName ? branchName.trim() : DEFAULT_BANK_DETAILS.branchName,
        branchCode ? branchCode.trim() : DEFAULT_BANK_DETAILS.branchCode,
        accountNumber.trim(),
        accountType || DEFAULT_BANK_DETAILS.accountType,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Bank details saved successfully',
      data: {
        accountHolderName: accountHolderName.trim(),
        bankName: bankName.trim(),
        branchName: branchName ? branchName.trim() : DEFAULT_BANK_DETAILS.branchName,
        branchCode: branchCode ? branchCode.trim() : DEFAULT_BANK_DETAILS.branchCode,
        accountNumber: accountNumber.trim(),
        accountType: accountType || DEFAULT_BANK_DETAILS.accountType,
        isVerified: true,
      },
    });
  } catch (error: any) {
    console.error('Error updating bank details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update bank details',
      error: error.message,
    });
  }
};

/**
 * GET /api/transporter/notifications
 * Retrieves all notification alerts for the logged-in transporter
 */
export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, title, message, type, is_read, icon_emoji, job_id, created_at
       FROM transporter_notifications
       WHERE transporter_id = ?
       ORDER BY created_at DESC`,
      [transporterId]
    );

    const notifications = rows.map((row) => ({
      id: String(row.id),
      title: row.title,
      message: row.message,
      type: row.type,
      isRead: Boolean(row.is_read),
      iconEmoji:
        row.icon_emoji ||
        (row.type === 'payment'
          ? '💰'
          : row.type === 'pickup'
          ? '📦'
          : row.type === 'request'
          ? '🔔'
          : '🚚'),
      jobId: row.job_id || undefined,
      timestamp: new Date(row.created_at).toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
    }));

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/transporter/notifications/:id/read
 * Marks a specific notification as read
 */
export const markNotificationRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE transporter_notifications
       SET is_read = 1
       WHERE id = ? AND transporter_id = ?`,
      [id, transporterId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or unauthorized',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { id, isRead: true },
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/transporter/notifications/read-all
 * Marks all notifications for the logged-in transporter as read
 */
export const markAllNotificationsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE transporter_notifications
       SET is_read = 1
       WHERE transporter_id = ? AND is_read = 0`,
      [transporterId]
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: { updatedCount: result.affectedRows },
    });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: error.message,
    });
  }
};

/**
 * GET /api/transporter/notification-settings
 * Fetches the push notification and sound preferences for the logged-in transporter
 */
export const getNotificationSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT new_jobs_push, current_job_updates_push, offer_status_push, payment_push, sound_and_vibration
       FROM transporter_notification_settings
       WHERE transporter_id = ?`,
      [transporterId]
    );

    if (rows.length === 0) {
      // Return default preferences if not yet configured
      return res.status(200).json({
        success: true,
        data: { ...DEFAULT_NOTIFICATION_SETTINGS },
      });
    }

    const row = rows[0];
    const settings = {
      newJobsPush: Boolean(row.new_jobs_push),
      currentJobUpdatesPush: Boolean(row.current_job_updates_push),
      offerStatusPush: Boolean(row.offer_status_push),
      paymentPush: Boolean(row.payment_push),
      soundAndVibration: Boolean(row.sound_and_vibration),
    };

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error('Error fetching notification settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notification settings',
      error: error.message,
    });
  }
};

/**
 * PUT /api/transporter/notification-settings
 * Updates the push notification and sound preferences for the logged-in transporter
 */
export const updateNotificationSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;
    const {
      newJobsPush = DEFAULT_NOTIFICATION_SETTINGS.newJobsPush,
      currentJobUpdatesPush = DEFAULT_NOTIFICATION_SETTINGS.currentJobUpdatesPush,
      offerStatusPush = DEFAULT_NOTIFICATION_SETTINGS.offerStatusPush,
      paymentPush = DEFAULT_NOTIFICATION_SETTINGS.paymentPush,
      soundAndVibration = DEFAULT_NOTIFICATION_SETTINGS.soundAndVibration,
    } = req.body;

    await pool.query(
      `INSERT INTO transporter_notification_settings (
        transporter_id,
        new_jobs_push,
        current_job_updates_push,
        offer_status_push,
        payment_push,
        sound_and_vibration
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        new_jobs_push = VALUES(new_jobs_push),
        current_job_updates_push = VALUES(current_job_updates_push),
        offer_status_push = VALUES(offer_status_push),
        payment_push = VALUES(payment_push),
        sound_and_vibration = VALUES(sound_and_vibration)`,
      [
        transporterId,
        newJobsPush ? 1 : 0,
        currentJobUpdatesPush ? 1 : 0,
        offerStatusPush ? 1 : 0,
        paymentPush ? 1 : 0,
        soundAndVibration ? 1 : 0,
      ]
    );

    const updatedSettings = {
      newJobsPush: Boolean(newJobsPush),
      currentJobUpdatesPush: Boolean(currentJobUpdatesPush),
      offerStatusPush: Boolean(offerStatusPush),
      paymentPush: Boolean(paymentPush),
      soundAndVibration: Boolean(soundAndVibration),
    };

    return res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: updatedSettings,
    });
  } catch (error: any) {
    console.error('Error updating notification settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification settings',
      error: error.message,
    });
  }
};
