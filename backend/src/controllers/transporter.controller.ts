import { Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';
import {
  DEFAULT_TRANSPORTER_ID,
  DEFAULT_TRANSPORTER_PROFILE,
  DEFAULT_BANK_DETAILS,
  BANK_DETAILS_MESSAGES,
  POPULAR_SRI_LANKAN_BANKS,
  BANK_ACCOUNT_TYPES,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_JOB_METADATA,
  DEFAULT_STAT_FALLBACKS,
  PROFILE_VALIDATION_MESSAGES,
  OFFER_MESSAGES,
  DEFAULT_OFFER_CONSTANTS,
  OFFER_SUBMITTED_CONSTANTS,
  CONFIRM_PICKUP_MESSAGES,
  DEFAULT_PICKUP_CONSTANTS,
  CONFIRM_DELIVERY_MESSAGES,
  DEFAULT_DELIVERY_CONSTANTS,
  SUPPORT_MESSAGES,
  DEFAULT_SUPPORT_CATEGORIES,
  DEFAULT_SUPPORT_TICKETS,
  VEHICLE_LICENSE_MESSAGES,
  DEFAULT_VEHICLE_LICENSE,
  VEHICLE_TYPE_PRESETS,
  TRANSPORTER_CONTROLLER_MESSAGES,
} from '../data';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        role: string;
        email: string;
    };
}

let pickupColumnsChecked = false;
export async function ensurePickupColumnsExist(): Promise<void> {
  if (pickupColumnsChecked) return;
  try {
    const [cols] = await pool.query<RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'transport_jobs' 
         AND COLUMN_NAME IN ('pickup_timestamp', 'pickup_notes', 'proof_photo_url')`
    );
    const existing = cols.map((c) => c.COLUMN_NAME);
    if (!existing.includes('pickup_timestamp')) {
      await pool.query(`ALTER TABLE transport_jobs ADD COLUMN pickup_timestamp VARCHAR(100) DEFAULT NULL`);
    }
    if (!existing.includes('pickup_notes')) {
      await pool.query(`ALTER TABLE transport_jobs ADD COLUMN pickup_notes TEXT DEFAULT NULL`);
    }
    if (!existing.includes('proof_photo_url')) {
      await pool.query(`ALTER TABLE transport_jobs ADD COLUMN proof_photo_url TEXT DEFAULT NULL`);
    }
    pickupColumnsChecked = true;
  } catch (err) {
    console.warn('Note: Could not verify transport_jobs pickup columns:', err);
  }
}

let deliveryColumnsChecked = false;
export async function ensureDeliveryColumnsExist(): Promise<void> {
  if (deliveryColumnsChecked) return;
  try {
    const [cols] = await pool.query<RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'transport_jobs' 
         AND COLUMN_NAME IN ('delivery_timestamp', 'delivery_notes', 'delivery_proof_photo_url', 'receiver_name')`
    );
    const existing = cols.map((c) => c.COLUMN_NAME);
    if (!existing.includes('delivery_timestamp')) {
      await pool.query(`ALTER TABLE transport_jobs ADD COLUMN delivery_timestamp VARCHAR(100) DEFAULT NULL`);
    }
    if (!existing.includes('delivery_notes')) {
      await pool.query(`ALTER TABLE transport_jobs ADD COLUMN delivery_notes TEXT DEFAULT NULL`);
    }
    if (!existing.includes('delivery_proof_photo_url')) {
      await pool.query(`ALTER TABLE transport_jobs ADD COLUMN delivery_proof_photo_url TEXT DEFAULT NULL`);
    }
    if (!existing.includes('receiver_name')) {
      await pool.query(`ALTER TABLE transport_jobs ADD COLUMN receiver_name VARCHAR(150) DEFAULT NULL`);
    }
    deliveryColumnsChecked = true;
  } catch (err) {
    console.warn('Note: Could not verify transport_jobs delivery columns:', err);
  }
}

let bankDetailsTableChecked = false;
export async function ensureBankDetailsTableExists(): Promise<void> {
  if (bankDetailsTableChecked) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transporter_bank_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transporter_id INT NOT NULL UNIQUE,
        account_holder_name VARCHAR(150) NOT NULL,
        bank_name VARCHAR(100) NOT NULL,
        branch_name VARCHAR(100) NOT NULL,
        branch_code VARCHAR(20) DEFAULT '014',
        account_number VARCHAR(50) NOT NULL,
        account_type VARCHAR(30) DEFAULT 'Savings',
        is_verified TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (transporter_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    bankDetailsTableChecked = true;
  } catch (err) {
    console.warn('Note: Could not ensure transporter_bank_details table:', err);
  }
}

let supportTicketsTableChecked = false;
export async function ensureSupportTicketsTableExists(): Promise<void> {
  if (supportTicketsTableChecked) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transporter_support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_code VARCHAR(50) NOT NULL UNIQUE,
        transporter_id INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        related_job_code VARCHAR(50) DEFAULT NULL,
        photo_url TEXT DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        admin_reply TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (transporter_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed default support inquiries if none exist for default transporter
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM transporter_support_tickets WHERE transporter_id = ? LIMIT 1`,
      [DEFAULT_TRANSPORTER_ID]
    );

    if (existing.length === 0) {
      for (const t of DEFAULT_SUPPORT_TICKETS) {
        await pool.query(
          `INSERT INTO transporter_support_tickets 
            (ticket_code, transporter_id, category, subject, message, status, admin_reply)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE ticket_code = ticket_code`,
          [t.ticketCode, DEFAULT_TRANSPORTER_ID, t.category, t.subject, t.message, t.status, t.adminReply]
        ).catch(() => {});
      }
    }

    supportTicketsTableChecked = true;
  } catch (err) {
    console.warn('Note: Could not ensure transporter_support_tickets table:', err);
  }
}

let vehicleLicenseTableChecked = false;
export async function ensureVehicleLicenseTableExists(): Promise<void> {
  if (vehicleLicenseTableChecked) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transporter_vehicle_license (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transporter_id INT NOT NULL UNIQUE,
        license_number VARCHAR(50) NOT NULL,
        license_expiry VARCHAR(50) DEFAULT '14/03/2028',
        license_issue_date VARCHAR(50) DEFAULT '15/03/2018',
        license_categories TEXT DEFAULT NULL,
        nic_number VARCHAR(50) DEFAULT '198923401234',
        blood_group VARCHAR(10) DEFAULT 'O+',
        license_front_photo_url TEXT DEFAULT NULL,
        license_back_photo_url TEXT DEFAULT NULL,
        license_status VARCHAR(50) DEFAULT 'Verified',
        vehicle_type VARCHAR(100) DEFAULT 'Lorry - 3 Ton',
        vehicle_plate VARCHAR(50) DEFAULT 'WP-LH-4821',
        vehicle_make_model VARCHAR(100) DEFAULT 'Isuzu Elf NPR 71',
        vehicle_year VARCHAR(20) DEFAULT '2020',
        vehicle_color VARCHAR(50) DEFAULT 'Polar White',
        max_capacity_kg INT DEFAULT 3000,
        cargo_dimensions VARCHAR(100) DEFAULT '14.5 ft × 6.2 ft × 6.0 ft',
        fuel_type VARCHAR(50) DEFAULT 'Diesel',
        refrigerated TINYINT(1) DEFAULT 0,
        vehicle_photo_url TEXT DEFAULT NULL,
        revenue_license_no VARCHAR(50) DEFAULT 'RL-2025-98321',
        revenue_license_expiry VARCHAR(50) DEFAULT '30/11/2026',
        insurance_provider VARCHAR(150) DEFAULT 'Sri Lanka Insurance Corporation (SLIC)',
        insurance_policy_no VARCHAR(100) DEFAULT 'SLIC-CV-783921',
        insurance_expiry VARCHAR(50) DEFAULT '15/01/2027',
        emission_cert_status VARCHAR(50) DEFAULT 'Passed',
        emission_cert_expiry VARCHAR(50) DEFAULT '24/10/2026',
        verification_date VARCHAR(50) DEFAULT '12 Jan 2026',
        verification_status VARCHAR(50) DEFAULT 'Verified',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (transporter_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed default record for Transporter 7 if not exists
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM transporter_vehicle_license WHERE transporter_id = ? LIMIT 1`,
      [DEFAULT_TRANSPORTER_ID]
    );

    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO transporter_vehicle_license (
          transporter_id, license_number, license_expiry, license_issue_date,
          license_categories, nic_number, blood_group, license_front_photo_url,
          license_back_photo_url, license_status, vehicle_type, vehicle_plate,
          vehicle_make_model, vehicle_year, vehicle_color, max_capacity_kg,
          cargo_dimensions, fuel_type, refrigerated, vehicle_photo_url,
          revenue_license_no, revenue_license_expiry, insurance_provider,
          insurance_policy_no, insurance_expiry, emission_cert_status,
          emission_cert_expiry, verification_date, verification_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE transporter_id = transporter_id`,
        [
          DEFAULT_TRANSPORTER_ID,
          DEFAULT_VEHICLE_LICENSE.licenseNumber,
          DEFAULT_VEHICLE_LICENSE.licenseExpiry,
          DEFAULT_VEHICLE_LICENSE.licenseIssueDate,
          JSON.stringify(DEFAULT_VEHICLE_LICENSE.licenseCategories),
          DEFAULT_VEHICLE_LICENSE.nicNumber,
          DEFAULT_VEHICLE_LICENSE.bloodGroup,
          DEFAULT_VEHICLE_LICENSE.licenseFrontPhotoUri,
          DEFAULT_VEHICLE_LICENSE.licenseBackPhotoUri,
          DEFAULT_VEHICLE_LICENSE.licenseStatus,
          DEFAULT_VEHICLE_LICENSE.vehicleType,
          DEFAULT_VEHICLE_LICENSE.vehiclePlate,
          DEFAULT_VEHICLE_LICENSE.vehicleMakeModel,
          DEFAULT_VEHICLE_LICENSE.vehicleYear,
          DEFAULT_VEHICLE_LICENSE.vehicleColor,
          DEFAULT_VEHICLE_LICENSE.maxCapacityKg,
          DEFAULT_VEHICLE_LICENSE.cargoDimensions,
          DEFAULT_VEHICLE_LICENSE.fuelType,
          DEFAULT_VEHICLE_LICENSE.refrigerated ? 1 : 0,
          DEFAULT_VEHICLE_LICENSE.vehiclePhotoUri,
          DEFAULT_VEHICLE_LICENSE.revenueLicenseNo,
          DEFAULT_VEHICLE_LICENSE.revenueLicenseExpiry,
          DEFAULT_VEHICLE_LICENSE.insuranceProvider,
          DEFAULT_VEHICLE_LICENSE.insurancePolicyNo,
          DEFAULT_VEHICLE_LICENSE.insuranceExpiry,
          DEFAULT_VEHICLE_LICENSE.emissionCertificateStatus,
          DEFAULT_VEHICLE_LICENSE.emissionCertificateExpiry,
          DEFAULT_VEHICLE_LICENSE.verificationDate,
          DEFAULT_VEHICLE_LICENSE.verificationStatus,
        ]
      ).catch(() => {});
    }

    vehicleLicenseTableChecked = true;
  } catch (err) {
    console.warn('Note: Could not ensure transporter_vehicle_license table:', err);
  }
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
                    tp.avatar_url, tp.vehicle_type, tp.vehicle_plate, tp.rating, tp.on_time_rate
             FROM users u
             LEFT JOIN transporter_profiles tp ON u.id = tp.user_id
             WHERE u.id = ? AND u.role = 'transporter'`,
            [transporterId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: TRANSPORTER_CONTROLLER_MESSAGES.transporterNotFound });
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
        const myOffersCount = offersRows.length > 0
            ? Number(offersRows[0].count)
            : DEFAULT_STAT_FALLBACKS.myOffersCount;

        // 3. Fetch Payment Summary
        const [paymentRows] = await pool.query<RowDataPacket[]>(
            `SELECT 
        (SELECT COALESCE(SUM(fee), 0) FROM transport_jobs WHERE transporter_id = ? AND status IN ('Assigned', 'In Transit')) AS pendingRelease,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payee_id = ? AND payment_type = 'transport_fee' AND status = 'Released' AND MONTH(COALESCE(released_at, held_at)) = MONTH(CURRENT_DATE()) AND YEAR(COALESCE(released_at, held_at)) = YEAR(CURRENT_DATE())) AS thisMonth`,
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
            const activeSchedule = formatJobSchedule(row.scheduled_date);
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
                pickupDate: activeSchedule.combinedStr,
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
        u_farmer.phone AS farmer_phone,
        u_seller.name AS seller_name
       FROM transport_jobs tj
       LEFT JOIN orders o ON tj.order_id = o.id
       LEFT JOIN users u_farmer ON o.farmer_id = u_farmer.id
       LEFT JOIN users u_seller ON o.seller_id = u_seller.id
       WHERE tj.status = 'Open'
       ORDER BY tj.created_at DESC
       LIMIT 5`
        );

        const availableJobs = availableRows.map((row) => {
            const schedule = formatJobSchedule(row.scheduled_date);
            return {
                id: row.job_code || `#TR-${row.id}`,
                dbId: row.id,
                cropName: row.product_name || DEFAULT_JOB_METADATA.defaultCropName,
                weight: row.quantity ? `${row.quantity} kg` : DEFAULT_JOB_METADATA.defaultWeight,
                status: 'Open',
                pickup: row.pickup_location,
                pickupLocationDetail: row.pickup_location,
                dropoff: row.drop_location,
                dropoffLocationDetail: row.drop_location,
                price: `Rs. ${Number(row.fee).toLocaleString()}`,
                pickupDate: schedule.dateStr,
                pickupRequiredTime: schedule.timeStr,
                pickupTime: schedule.combinedStr,
                farmerName: row.farmer_name || DEFAULT_JOB_METADATA.defaultFarmerName,
                farmerPhone: row.farmer_phone || DEFAULT_JOB_METADATA.defaultFarmerPhone,
                sellerName: row.seller_name || DEFAULT_JOB_METADATA.defaultSellerName,
                specialInstructions: 'Handle with care. Keep covered during transport.',
            };
        });

        // Formatted Profile for Screen Header & Banner Card
        const profile = {
            name: user.name,
            greeting,
            avatarLetter: user.name ? user.name.charAt(0).toUpperCase() : 'T',
            avatarUri: user.avatar_url || undefined,
            email: user.email,
            phone: user.phone || '',
            vehicleType: user.vehicle_type || DEFAULT_TRANSPORTER_PROFILE.vehicleType,
            vehiclePlate: user.vehicle_plate || DEFAULT_TRANSPORTER_PROFILE.vehiclePlate,
            isVerified: Boolean(user.verified),
            rating: Number(user.rating) || DEFAULT_TRANSPORTER_PROFILE.rating,
            completedJobs: Number(statsData.completedJobsCount) || DEFAULT_STAT_FALLBACKS.completedJobsCount,
            onTimeDeliveryRate: user.on_time_rate || DEFAULT_TRANSPORTER_PROFILE.onTimeRate,
            baseLocation: user.location || DEFAULT_TRANSPORTER_PROFILE.baseLocation,
        };

        const thisMonthAmount = Number(payments.thisMonth) || 0;

        // 2x2 Stats Card Object
        const stats = {
            openJobsCount: Number(statsData.openJobsCount) || DEFAULT_STAT_FALLBACKS.openJobsCount,
            myOffersCount,
            activeJobsCount: Number(statsData.activeJobsCount) || DEFAULT_STAT_FALLBACKS.activeJobsCount,
            thisMonthEarnings:
                thisMonthAmount >= 1000
                    ? `Rs. ${(thisMonthAmount / 1000).toFixed(0)}k`
                    : `Rs. ${thisMonthAmount.toLocaleString()}`,
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
            message: TRANSPORTER_CONTROLLER_MESSAGES.failedFetchHome,
            error: error.message,
        });
    }
};

/**
 * Syncs linked order status (and transport fee payment release on delivery) with job transitions.
 */
async function syncOrderAndPaymentOnJobStatus(orderId: number | null | undefined, jobStatus: string): Promise<void> {
    if (!orderId) return;
    try {
        if (jobStatus === 'In Transit') {
            await pool.query(
                `UPDATE orders SET order_status = 'In Transit' WHERE id = ?`,
                [orderId]
            );
        } else if (jobStatus === 'Delivered') {
            await pool.query(
                `UPDATE orders SET order_status = 'Completed' WHERE id = ?`,
                [orderId]
            );
            await pool.query(
                `UPDATE payments SET status = 'Released', released_at = CURRENT_TIMESTAMP WHERE order_id = ? AND payment_type = 'transport_fee'`,
                [orderId]
            );
        }
    } catch (err) {
        console.warn(`Note: Failed syncing order/payment for order #${orderId} on status ${jobStatus}:`, err);
    }
}

/**
 * PATCH /api/transporter/jobs/:id/status
 * Updates delivery status (e.g., 'In Transit', 'Delivered')
 */
export const updateJobStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        let { status, pickupTimestamp, timestamp, notes, pickupNotes, proofPhotoUri, proofPhotoUrl } = req.body;

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
            `SELECT id, status, order_id FROM transport_jobs WHERE (id = ? OR job_code = ?) AND transporter_id = ?`,
            [id, id, transporterId]
        );

        if (jobRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: CONFIRM_PICKUP_MESSAGES.jobNotFound,
            });
        }

        const job = jobRows[0];

        await ensurePickupColumnsExist();

        const finalTimestamp = pickupTimestamp || timestamp || null;
        const finalNotes = notes || pickupNotes || null;
        const finalPhoto = proofPhotoUri || proofPhotoUrl || null;

        // Perform the status update
        await pool.query(
            `UPDATE transport_jobs 
             SET status = ?,
                 pickup_timestamp = COALESCE(?, pickup_timestamp),
                 pickup_notes = COALESCE(?, pickup_notes),
                 proof_photo_url = COALESCE(?, proof_photo_url)
             WHERE id = ?`,
            [status, finalTimestamp, finalNotes, finalPhoto, job.id]
        );

        // Sync linked order status and payment release
        await syncOrderAndPaymentOnJobStatus(job.order_id, status);

        return res.status(200).json({
            success: true,
            message: `Transport job #${id} status updated to ${status}`,
            data: { 
                id: job.id, 
                status,
                pickupTimestamp: finalTimestamp,
                pickupNotes: finalNotes,
                proofPhotoUri: finalPhoto,
            },
        });
    } catch (error: any) {
        console.error('Error updating job status:', error);
        return res.status(500).json({
            success: false,
            message: TRANSPORTER_CONTROLLER_MESSAGES.failedUpdateJobStatus,
            error: error.message,
        });
    }
};

/**
 * PATCH or POST /api/transporter/jobs/:id/pickup
 * Confirms cargo pickup at the farm and transitions status to 'In Transit'
 */
export const confirmJobPickup = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;
        const { timestamp, pickupTimestamp, notes, pickupNotes, proofPhotoUri, proofPhotoUrl } = req.body;

        const finalTimestamp = timestamp || pickupTimestamp || new Date().toISOString();
        const finalNotes = notes || pickupNotes || '';
        const finalProofPhoto = proofPhotoUri || proofPhotoUrl || null;

        await ensurePickupColumnsExist();

        // 1. Fetch the target job
        const [jobRows] = await pool.query<RowDataPacket[]>(
            `SELECT 
                tj.id,
                tj.job_code,
                tj.status,
                tj.order_id,
                tj.pickup_location,
                tj.drop_location,
                tj.vehicle_type,
                tj.fee,
                tj.scheduled_date,
                tj.created_at,
                tj.pickup_timestamp,
                tj.pickup_notes,
                tj.proof_photo_url,
                o.order_code,
                o.product_name,
                o.quantity,
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
            WHERE (tj.id = ? OR tj.job_code = ?) AND tj.transporter_id = ?`,
            [id, id, transporterId]
        );

        if (jobRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: CONFIRM_PICKUP_MESSAGES.jobNotFound,
            });
        }

        const job = jobRows[0];

        // Check if status is invalid for pickup (e.g. Delivered or Cancelled)
        if (job.status === 'Delivered' || job.status === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: `${CONFIRM_PICKUP_MESSAGES.invalidStatus} (Current: ${job.status})`,
            });
        }

        // 2. Update status to 'In Transit' and store pickup details
        await pool.query(
            `UPDATE transport_jobs
             SET status = 'In Transit',
                 pickup_timestamp = ?,
                 pickup_notes = ?,
                 proof_photo_url = ?
             WHERE id = ?`,
            [finalTimestamp, finalNotes, finalProofPhoto, job.id]
        );

        // Also update order status to In Transit if linked
        await syncOrderAndPaymentOnJobStatus(job.order_id, 'In Transit');

        const schedule = formatJobSchedule(job.scheduled_date);

        const updatedJob = {
            id: job.job_code || `#TR-${job.id}`,
            dbId: job.id,
            orderId: job.order_id,
            orderCode: job.order_code,
            cropName: job.product_name || DEFAULT_JOB_METADATA.defaultCropName,
            weight: job.quantity ? `${job.quantity} kg` : DEFAULT_JOB_METADATA.defaultWeight,
            status: 'In Progress',
            rawStatus: 'In Transit',
            pickup: job.pickup_location,
            dropoff: job.drop_location,
            distance: 'Approx. 85 km',
            price: `Rs. ${Number(job.fee).toLocaleString()}`,
            rawFee: Number(job.fee),
            vehicleType: job.vehicle_type || DEFAULT_TRANSPORTER_PROFILE.vehicleType,
            farmerName: job.farmer_name || DEFAULT_JOB_METADATA.defaultFarmerName,
            farmerPhone: job.farmer_phone || DEFAULT_JOB_METADATA.defaultFarmerPhone,
            farmerLocation: job.farmer_location,
            sellerName: job.seller_name || DEFAULT_JOB_METADATA.defaultSellerName,
            sellerPhone: job.seller_phone,
            sellerLocation: job.seller_location,
            pickupDate: schedule.combinedStr,
            pickupTimestamp: finalTimestamp,
            pickupNotes: finalNotes || undefined,
            proofPhotoUri: finalProofPhoto || undefined,
            specialInstructions: 'Handle with care. Keep cool. Arrive on schedule for market opening.',
            farmerRating: DEFAULT_JOB_METADATA.activeFarmerRating,
            eta: DEFAULT_JOB_METADATA.defaultEta,
            createdAt: job.created_at,
        };

        return res.status(200).json({
            success: true,
            message: CONFIRM_PICKUP_MESSAGES.success,
            data: updatedJob,
        });
    } catch (error: any) {
        console.error('Error confirming job pickup:', error);
        return res.status(500).json({
            success: false,
            message: CONFIRM_PICKUP_MESSAGES.failedUpdate,
            error: error.message,
        });
    }
};

/**
 * PATCH or POST /api/transporter/jobs/:id/delivery
 * Confirms cargo delivery at the destination, releases payment, and updates status to 'Delivered'
 */
export const confirmJobDelivery = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;
        const {
            timestamp,
            deliveryTimestamp,
            receiverName,
            notes,
            deliveryNotes,
            proofPhotoUri,
            deliveryProofPhotoUri,
            proofPhotoUrl,
        } = req.body;

        const finalTimestamp = timestamp || deliveryTimestamp || new Date().toISOString();
        const finalReceiverName = receiverName || DEFAULT_DELIVERY_CONSTANTS.defaultReceiver;
        const finalNotes = notes || deliveryNotes || '';
        const finalProofPhoto = proofPhotoUri || deliveryProofPhotoUri || proofPhotoUrl || null;

        await ensureDeliveryColumnsExist();

        // 1. Fetch the target job
        const [jobRows] = await pool.query<RowDataPacket[]>(
            `SELECT 
                tj.id,
                tj.job_code,
                tj.status,
                tj.order_id,
                tj.pickup_location,
                tj.drop_location,
                tj.vehicle_type,
                tj.fee,
                tj.scheduled_date,
                tj.created_at,
                tj.pickup_timestamp,
                tj.pickup_notes,
                tj.proof_photo_url,
                o.order_code,
                o.product_name,
                o.quantity,
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
            WHERE (tj.id = ? OR tj.job_code = ?) AND tj.transporter_id = ?`,
            [id, id, transporterId]
        );

        if (jobRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: CONFIRM_DELIVERY_MESSAGES.jobNotFound,
            });
        }

        const job = jobRows[0];

        // 2. Update status to 'Delivered' and store delivery details
        await pool.query(
            `UPDATE transport_jobs
             SET status = 'Delivered',
                 delivery_timestamp = ?,
                 delivery_notes = ?,
                 delivery_proof_photo_url = ?,
                 receiver_name = ?
             WHERE id = ?`,
            [finalTimestamp, finalNotes, finalProofPhoto, finalReceiverName, job.id]
        );

        // 3. Update linked order to 'Completed' and release transport fee payment
        await syncOrderAndPaymentOnJobStatus(job.order_id, 'Delivered');

        const schedule = formatJobSchedule(job.scheduled_date);

        const updatedJob = {
            id: job.job_code || `#TR-${job.id}`,
            dbId: job.id,
            orderId: job.order_id,
            orderCode: job.order_code,
            cropName: job.product_name || DEFAULT_JOB_METADATA.defaultCropName,
            weight: job.quantity ? `${job.quantity} kg` : DEFAULT_JOB_METADATA.defaultWeight,
            status: 'Delivered',
            rawStatus: 'Delivered',
            pickup: job.pickup_location,
            dropoff: job.drop_location,
            distance: 'Approx. 85 km',
            price: `Rs. ${Number(job.fee).toLocaleString()}`,
            rawFee: Number(job.fee),
            vehicleType: job.vehicle_type || DEFAULT_TRANSPORTER_PROFILE.vehicleType,
            farmerName: job.farmer_name || DEFAULT_JOB_METADATA.defaultFarmerName,
            farmerPhone: job.farmer_phone || DEFAULT_JOB_METADATA.defaultFarmerPhone,
            farmerLocation: job.farmer_location,
            sellerName: job.seller_name || DEFAULT_JOB_METADATA.defaultSellerName,
            sellerPhone: job.seller_phone,
            sellerLocation: job.seller_location,
            receiverName: finalReceiverName,
            pickupDate: schedule.combinedStr,
            pickupTimestamp: job.pickup_timestamp || schedule.combinedStr,
            pickupNotes: job.pickup_notes || undefined,
            proofPhotoUri: job.proof_photo_url || undefined,
            deliveryTimestamp: finalTimestamp,
            deliveryNotes: finalNotes || undefined,
            deliveryProofPhotoUri: finalProofPhoto || undefined,
            specialInstructions: 'Handle with care. Keep cool. Arrive on schedule for market opening.',
            farmerRating: DEFAULT_JOB_METADATA.activeFarmerRating,
            eta: 'Delivered',
            createdAt: job.created_at,
        };

        return res.status(200).json({
            success: true,
            message: CONFIRM_DELIVERY_MESSAGES.success,
            data: updatedJob,
        });
    } catch (error: any) {
        console.error('Error confirming job delivery:', error);
        return res.status(500).json({
            success: false,
            message: CONFIRM_DELIVERY_MESSAGES.failedUpdate,
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
      message: TRANSPORTER_CONTROLLER_MESSAGES.failedFetchAvailableJobs,
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
      return res.status(404).json({ success: false, message: TRANSPORTER_CONTROLLER_MESSAGES.jobNotFound });
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
      message: TRANSPORTER_CONTROLLER_MESSAGES.failedFetchJobDetails,
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
      message: TRANSPORTER_CONTROLLER_MESSAGES.failedSubmitOffer,
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
      message: TRANSPORTER_CONTROLLER_MESSAGES.failedFetchOffers,
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
      message: TRANSPORTER_CONTROLLER_MESSAGES.failedWithdrawOffer,
      error: error.message,
    });
  }
};

/**
 * GET /api/transporter/offers/latest
 * Fetches the latest submitted offer for the logged-in transporter (or for a specific job via ?jobId=...)
 */
export const getLatestOffer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;
    const { jobId } = req.query;

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

    if (jobId) {
      const cleanJobId = String(jobId).replace(/[^0-9]/g, '');
      const jobCode = String(jobId).trim();
      query += ` AND (tof.job_id = ? OR tj.job_code = ? OR tj.id = ?)`;
      params.push(cleanJobId || jobId, jobCode, cleanJobId || jobId);
    }

    query += ` ORDER BY tof.created_at DESC LIMIT 1`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
        message: OFFER_SUBMITTED_CONSTANTS.noOfferFound,
      });
    }

    const row = rows[0];
    const schedule = formatJobSchedule(row.scheduled_date);
    const createdAtDate = row.offer_created_at ? new Date(row.offer_created_at) : new Date();
    const submittedDate = `${createdAtDate.getFullYear()}-${String(createdAtDate.getMonth() + 1).padStart(2, '0')}-${String(createdAtDate.getDate()).padStart(2, '0')}`;

    const offer = {
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
      statusLabel: `Offer Status: ${row.offer_status === 'Submitted' ? 'Under Review' : row.offer_status}`,
      statusDescription: OFFER_SUBMITTED_CONSTANTS.defaultStatusDescription,
      sellerName: row.seller_name || DEFAULT_JOB_METADATA.defaultSellerName,
      farmerName: row.farmer_name || DEFAULT_JOB_METADATA.defaultFarmerName,
      farmerPhone: row.farmer_phone || DEFAULT_JOB_METADATA.defaultFarmerPhone,
      pickupLocation: row.pickup_location,
      dropoffLocation: row.drop_location,
      jobStatus: row.job_status,
    };

    return res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error: any) {
    console.error('Error fetching latest offer:', error);
    return res.status(500).json({
      success: false,
      message: TRANSPORTER_CONTROLLER_MESSAGES.failedFetchLatestOffer,
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

    await ensurePickupColumnsExist();
    await ensureDeliveryColumnsExist();

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
        tj.pickup_timestamp,
        tj.pickup_notes,
        tj.proof_photo_url,
        tj.delivery_timestamp,
        tj.delivery_notes,
        tj.delivery_proof_photo_url,
        tj.receiver_name,
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
        message: TRANSPORTER_CONTROLLER_MESSAGES.noActiveTrip,
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
      receiverName: row.receiver_name || row.seller_name || undefined,
      pickupDate: schedule.combinedStr,
      pickupTimestamp: row.pickup_timestamp || schedule.combinedStr,
      pickupNotes: row.pickup_notes || undefined,
      proofPhotoUri: row.proof_photo_url || undefined,
      deliveryTimestamp: row.delivery_timestamp || undefined,
      deliveryNotes: row.delivery_notes || undefined,
      deliveryProofPhotoUri: row.delivery_proof_photo_url || undefined,
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
      message: TRANSPORTER_CONTROLLER_MESSAGES.failedFetchActiveJob,
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
      return res.status(404).json({ success: false, message: TRANSPORTER_CONTROLLER_MESSAGES.transporterNotFound });
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
      message: TRANSPORTER_CONTROLLER_MESSAGES.failedFetchProfile,
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
      message: TRANSPORTER_CONTROLLER_MESSAGES.profileUpdateSuccess,
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
      message: TRANSPORTER_CONTROLLER_MESSAGES.failedUpdateProfile,
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
      return res.status(400).json({ success: false, message: TRANSPORTER_CONTROLLER_MESSAGES.avatarUrlRequired });
    }

    await pool.query(
      `INSERT INTO transporter_profiles (user_id, avatar_url)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE avatar_url = ?`,
      [transporterId, avatarUrl, avatarUrl]
    );

    return res.status(200).json({
      success: true,
      message: TRANSPORTER_CONTROLLER_MESSAGES.avatarUpdateSuccess,
      data: { avatarUrl },
    });
  } catch (error: any) {
    console.error('Error updating avatar:', error);
    return res.status(500).json({
      success: false,
      message: TRANSPORTER_CONTROLLER_MESSAGES.failedUpdateAvatar,
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
      message: TRANSPORTER_CONTROLLER_MESSAGES.avatarRemovedSuccess,
    });
  } catch (error: any) {
    console.error('Error removing avatar:', error);
    return res.status(500).json({
      success: false,
      message: TRANSPORTER_CONTROLLER_MESSAGES.failedRemoveAvatar,
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

    await ensureBankDetailsTableExists();

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
      return res.status(404).json({ success: false, message: BANK_DETAILS_MESSAGES.notFound });
    }

    const row = rows[0];
    const isVerified = Boolean(row.is_verified ?? DEFAULT_BANK_DETAILS.isVerified);

    const bankAccount = {
      accountHolderName: row.account_holder_name || row.user_name || DEFAULT_BANK_DETAILS.accountHolderName,
      bankName: row.bank_name || DEFAULT_BANK_DETAILS.bankName,
      branchName: row.branch_name || DEFAULT_BANK_DETAILS.branchName,
      branchCode: row.branch_code || DEFAULT_BANK_DETAILS.branchCode,
      accountNumber: row.account_number || DEFAULT_BANK_DETAILS.accountNumber,
      accountType: row.account_type || DEFAULT_BANK_DETAILS.accountType,
      isVerified: isVerified,
      verificationStatus: isVerified ? 'Verified' : 'Pending',
      payoutMethod: DEFAULT_BANK_DETAILS.payoutMethod,
      notes: DEFAULT_BANK_DETAILS.notes,
    };

    return res.status(200).json({
      success: true,
      message: BANK_DETAILS_MESSAGES.fetchSuccess,
      data: bankAccount,
    });
  } catch (error: any) {
    console.error('Error fetching bank details:', error);
    return res.status(500).json({
      success: false,
      message: BANK_DETAILS_MESSAGES.fetchFailed,
      error: error.message,
    });
  }
};

/**
 * PUT or POST /api/transporter/bank-details
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
        message: BANK_DETAILS_MESSAGES.validationError,
      });
    }

    const trimmedAccountNo = accountNumber.toString().trim().replace(/\s+/g, '');
    if (trimmedAccountNo.length < 6) {
      return res.status(400).json({
        success: false,
        message: BANK_DETAILS_MESSAGES.invalidAccountNumber,
      });
    }

    await ensureBankDetailsTableExists();

    const finalBranchName = branchName ? branchName.trim() : DEFAULT_BANK_DETAILS.branchName;
    const finalBranchCode = branchCode ? branchCode.trim() : DEFAULT_BANK_DETAILS.branchCode;
    const finalAccountType = accountType || DEFAULT_BANK_DETAILS.accountType;

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
        finalBranchName,
        finalBranchCode,
        trimmedAccountNo,
        finalAccountType,
      ]
    );

    return res.status(200).json({
      success: true,
      message: BANK_DETAILS_MESSAGES.updateSuccess,
      data: {
        accountHolderName: accountHolderName.trim(),
        bankName: bankName.trim(),
        branchName: finalBranchName,
        branchCode: finalBranchCode,
        accountNumber: trimmedAccountNo,
        accountType: finalAccountType,
        isVerified: true,
        verificationStatus: 'Verified',
        payoutMethod: DEFAULT_BANK_DETAILS.payoutMethod,
        notes: DEFAULT_BANK_DETAILS.notes,
      },
    });
  } catch (error: any) {
    console.error('Error updating bank details:', error);
    return res.status(500).json({
      success: false,
      message: BANK_DETAILS_MESSAGES.updateFailed,
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
      message: TRANSPORTER_CONTROLLER_MESSAGES.failedFetchNotifications,
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
        message: TRANSPORTER_CONTROLLER_MESSAGES.notificationNotFound,
      });
    }

    return res.status(200).json({
      success: true,
      message: TRANSPORTER_CONTROLLER_MESSAGES.notificationMarkedRead,
      data: { id, isRead: true },
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({
      success: false,
      message: TRANSPORTER_CONTROLLER_MESSAGES.failedUpdateNotification,
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
      message: TRANSPORTER_CONTROLLER_MESSAGES.allNotificationsMarkedRead,
      data: { updatedCount: result.affectedRows },
    });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({
      success: false,
      message: TRANSPORTER_CONTROLLER_MESSAGES.failedMarkAllNotificationsRead,
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
      message: TRANSPORTER_CONTROLLER_MESSAGES.failedFetchNotificationSettings,
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
      message: TRANSPORTER_CONTROLLER_MESSAGES.notificationSettingsUpdateSuccess,
      data: updatedSettings,
    });
  } catch (error: any) {
    console.error('Error updating notification settings:', error);
    return res.status(500).json({
      success: false,
      message: TRANSPORTER_CONTROLLER_MESSAGES.failedUpdateNotificationSettings,
      error: error.message,
    });
  }
};

/**
 * GET /api/transporter/support/tickets
 * Fetches all support tickets/inquiries for the logged-in transporter
 */
export const getSupportTickets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;
    await ensureSupportTicketsTableExists();

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        id,
        ticket_code,
        category,
        subject,
        message,
        related_job_code,
        photo_url,
        status,
        admin_reply,
        created_at
      FROM transporter_support_tickets
      WHERE transporter_id = ?
      ORDER BY created_at DESC`,
      [transporterId]
    );

    const tickets = rows.map((row) => {
      const now = new Date(row.created_at);
      const submittedAt = `${now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })} · ${now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;

      return {
        id: row.ticket_code || `#SUP-${row.id}`,
        dbId: row.id,
        category: row.category,
        subject: row.subject,
        message: row.message,
        relatedJobId: row.related_job_code || undefined,
        imageUri: row.photo_url || undefined,
        status: row.status,
        submittedAt,
        adminReply: row.admin_reply || undefined,
      };
    });

    return res.status(200).json({
      success: true,
      message: SUPPORT_MESSAGES.fetchSuccess,
      data: tickets,
    });
  } catch (err: any) {
    console.error('Error fetching support tickets:', err);
    return res.status(500).json({
      success: false,
      message: SUPPORT_MESSAGES.failedFetch,
      error: err.message,
    });
  }
};

/**
 * POST /api/transporter/support/tickets
 * Creates a new support ticket / inquiry sent to administrators
 */
export const createSupportTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;
    const {
      category,
      subject,
      message,
      relatedJobId,
      imageUri,
      photoUrl,
    } = req.body;

    if (!subject || !subject.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: SUPPORT_MESSAGES.missingSubject,
      });
    }

    if (!message || !message.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: SUPPORT_MESSAGES.missingMessage,
      });
    }

    await ensureSupportTicketsTableExists();

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketCode = `#SUP-${randomSuffix}`;
    const finalCategory = category?.trim() || DEFAULT_SUPPORT_CATEGORIES[0].label;
    const finalSubject = subject.trim();
    const finalMessage = message.trim();
    const finalJobCode = relatedJobId?.trim() || null;
    const finalPhoto = imageUri?.trim() || photoUrl?.trim() || null;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO transporter_support_tickets 
        (ticket_code, transporter_id, category, subject, message, related_job_code, photo_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [ticketCode, transporterId, finalCategory, finalSubject, finalMessage, finalJobCode, finalPhoto]
    );

    const now = new Date();
    const submittedAt = `${now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} · ${now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const createdTicket = {
      id: ticketCode,
      dbId: result.insertId,
      category: finalCategory,
      subject: finalSubject,
      message: finalMessage,
      relatedJobId: finalJobCode || undefined,
      imageUri: finalPhoto || undefined,
      status: 'Pending',
      submittedAt,
    };

    return res.status(201).json({
      success: true,
      message: SUPPORT_MESSAGES.submitSuccess,
      data: createdTicket,
    });
  } catch (err: any) {
    console.error('Error submitting support ticket:', err);
    return res.status(500).json({
      success: false,
      message: SUPPORT_MESSAGES.failedSubmit,
      error: err.message,
    });
  }
};

/**
 * GET /api/transporter/vehicle-license
 * Fetches vehicle specifications, license details, and permits for the transporter
 */
export const getVehicleLicense = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;
    await ensureVehicleLicenseTableExists();

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        tvl.*,
        u.name AS user_name,
        tp.vehicle_type AS profile_vehicle_type,
        tp.vehicle_plate AS profile_vehicle_plate
       FROM users u
       LEFT JOIN transporter_vehicle_license tvl ON u.id = tvl.transporter_id
       LEFT JOIN transporter_profiles tp ON u.id = tp.user_id
       WHERE u.id = ?`,
      [transporterId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: VEHICLE_LICENSE_MESSAGES.transporterNotFound,
      });
    }

    const row = rows[0];

    let categories = DEFAULT_VEHICLE_LICENSE.licenseCategories;
    if (row.license_categories) {
      try {
        categories = typeof row.license_categories === 'string'
          ? JSON.parse(row.license_categories)
          : row.license_categories;
      } catch {
        categories = DEFAULT_VEHICLE_LICENSE.licenseCategories;
      }
    }

    const vehicleLicenseData = {
      driverName: row.user_name || DEFAULT_VEHICLE_LICENSE.driverName,
      licenseNumber: row.license_number || DEFAULT_VEHICLE_LICENSE.licenseNumber,
      licenseExpiry: row.license_expiry || DEFAULT_VEHICLE_LICENSE.licenseExpiry,
      licenseIssueDate: row.license_issue_date || DEFAULT_VEHICLE_LICENSE.licenseIssueDate,
      licenseCategories: categories,
      nicNumber: row.nic_number || DEFAULT_VEHICLE_LICENSE.nicNumber,
      bloodGroup: row.blood_group || DEFAULT_VEHICLE_LICENSE.bloodGroup,
      licenseFrontPhotoUri: row.license_front_photo_url || DEFAULT_VEHICLE_LICENSE.licenseFrontPhotoUri,
      licenseBackPhotoUri: row.license_back_photo_url || DEFAULT_VEHICLE_LICENSE.licenseBackPhotoUri,
      licenseStatus: row.license_status || DEFAULT_VEHICLE_LICENSE.licenseStatus,

      vehicleType: row.vehicle_type || row.profile_vehicle_type || DEFAULT_VEHICLE_LICENSE.vehicleType,
      vehiclePlate: row.vehicle_plate || row.profile_vehicle_plate || DEFAULT_VEHICLE_LICENSE.vehiclePlate,
      vehicleMakeModel: row.vehicle_make_model || DEFAULT_VEHICLE_LICENSE.vehicleMakeModel,
      vehicleYear: row.vehicle_year || DEFAULT_VEHICLE_LICENSE.vehicleYear,
      vehicleColor: row.vehicle_color || DEFAULT_VEHICLE_LICENSE.vehicleColor,
      maxCapacityKg: Number(row.max_capacity_kg) || DEFAULT_VEHICLE_LICENSE.maxCapacityKg,
      cargoDimensions: row.cargo_dimensions || DEFAULT_VEHICLE_LICENSE.cargoDimensions,
      fuelType: row.fuel_type || DEFAULT_VEHICLE_LICENSE.fuelType,
      refrigerated: Boolean(row.refrigerated),
      vehiclePhotoUri: row.vehicle_photo_url || DEFAULT_VEHICLE_LICENSE.vehiclePhotoUri,

      revenueLicenseNo: row.revenue_license_no || DEFAULT_VEHICLE_LICENSE.revenueLicenseNo,
      revenueLicenseExpiry: row.revenue_license_expiry || DEFAULT_VEHICLE_LICENSE.revenueLicenseExpiry,
      insuranceProvider: row.insurance_provider || DEFAULT_VEHICLE_LICENSE.insuranceProvider,
      insurancePolicyNo: row.insurance_policy_no || DEFAULT_VEHICLE_LICENSE.insurancePolicyNo,
      insuranceExpiry: row.insurance_expiry || DEFAULT_VEHICLE_LICENSE.insuranceExpiry,
      emissionCertificateStatus: row.emission_cert_status || DEFAULT_VEHICLE_LICENSE.emissionCertificateStatus,
      emissionCertificateExpiry: row.emission_cert_expiry || DEFAULT_VEHICLE_LICENSE.emissionCertificateExpiry,
      verificationDate: row.verification_date || DEFAULT_VEHICLE_LICENSE.verificationDate,
      verificationStatus: row.verification_status || DEFAULT_VEHICLE_LICENSE.verificationStatus,
    };

    return res.status(200).json({
      success: true,
      message: VEHICLE_LICENSE_MESSAGES.fetchSuccess,
      data: vehicleLicenseData,
    });
  } catch (err: any) {
    console.error('Error fetching vehicle and license details:', err);
    return res.status(500).json({
      success: false,
      message: VEHICLE_LICENSE_MESSAGES.failedFetch,
      error: err.message,
    });
  }
};

/**
 * PUT /api/transporter/vehicle-license
 * Updates vehicle specifications and driving license information
 */
export const updateVehicleLicense = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;
    const {
      licenseNumber,
      licenseExpiry,
      vehiclePlate,
      vehicleType,
      vehicleMakeModel,
      maxCapacityKg,
    } = req.body;

    if (!vehiclePlate || !licenseNumber || !vehicleType) {
      return res.status(400).json({
        success: false,
        message: VEHICLE_LICENSE_MESSAGES.missingRequiredSpecs,
      });
    }

    await ensureVehicleLicenseTableExists();

    const finalPlate = vehiclePlate.trim().toUpperCase();
    const finalLicenseNo = licenseNumber.trim().toUpperCase();
    const finalVehicleType = vehicleType.trim();
    const finalLicenseExpiry = licenseExpiry ? licenseExpiry.trim() : DEFAULT_VEHICLE_LICENSE.licenseExpiry;
    const finalMakeModel = vehicleMakeModel ? vehicleMakeModel.trim() : DEFAULT_VEHICLE_LICENSE.vehicleMakeModel;
    const finalCapacity = parseInt(String(maxCapacityKg), 10) || DEFAULT_VEHICLE_LICENSE.maxCapacityKg;

    // 1. Upsert into transporter_vehicle_license
    await pool.query(
      `INSERT INTO transporter_vehicle_license (
        transporter_id, license_number, license_expiry, vehicle_plate, vehicle_type, vehicle_make_model, max_capacity_kg
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        license_number = VALUES(license_number),
        license_expiry = VALUES(license_expiry),
        vehicle_plate = VALUES(vehicle_plate),
        vehicle_type = VALUES(vehicle_type),
        vehicle_make_model = VALUES(vehicle_make_model),
        max_capacity_kg = VALUES(max_capacity_kg)`,
      [transporterId, finalLicenseNo, finalLicenseExpiry, finalPlate, finalVehicleType, finalMakeModel, finalCapacity]
    );

    // 2. Keep transporter_profiles vehicle_type and vehicle_plate in sync
    await pool.query(
      `INSERT INTO transporter_profiles (user_id, vehicle_type, vehicle_plate)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         vehicle_type = VALUES(vehicle_type),
         vehicle_plate = VALUES(vehicle_plate)`,
      [transporterId, finalVehicleType, finalPlate]
    ).catch(() => {});

    return res.status(200).json({
      success: true,
      message: VEHICLE_LICENSE_MESSAGES.updateSuccess,
      data: {
        licenseNumber: finalLicenseNo,
        licenseExpiry: finalLicenseExpiry,
        vehiclePlate: finalPlate,
        vehicleType: finalVehicleType,
        vehicleMakeModel: finalMakeModel,
        maxCapacityKg: finalCapacity,
      },
    });
  } catch (err: any) {
    console.error('Error updating vehicle and license details:', err);
    return res.status(500).json({
      success: false,
      message: VEHICLE_LICENSE_MESSAGES.failedUpdate,
      error: err.message,
    });
  }
};

/**
 * POST or PATCH /api/transporter/vehicle-license/documents
 * Updates document photo URIs (licenseFront, licenseBack, or vehicle)
 */
export const updateVehicleLicenseDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const transporterId = req.user?.id || DEFAULT_TRANSPORTER_ID;
    const { target, uri, photoUri, photoUrl } = req.body;

    const finalPhoto = uri || photoUri || photoUrl;
    if (!finalPhoto || !finalPhoto.trim()) {
      return res.status(400).json({
        success: false,
        message: VEHICLE_LICENSE_MESSAGES.missingDocumentPhoto,
      });
    }

    if (!['licenseFront', 'licenseBack', 'vehicle'].includes(target)) {
      return res.status(400).json({
        success: false,
        message: VEHICLE_LICENSE_MESSAGES.invalidTarget,
      });
    }

    await ensureVehicleLicenseTableExists();

    let column = 'vehicle_photo_url';
    if (target === 'licenseFront') column = 'license_front_photo_url';
    if (target === 'licenseBack') column = 'license_back_photo_url';

    await pool.query(
      `UPDATE transporter_vehicle_license 
       SET ${column} = ?
       WHERE transporter_id = ?`,
      [finalPhoto.trim(), transporterId]
    );

    return res.status(200).json({
      success: true,
      message: VEHICLE_LICENSE_MESSAGES.documentUploadSuccess,
      data: {
        target,
        uri: finalPhoto.trim(),
      },
    });
  } catch (err: any) {
    console.error('Error updating document photo:', err);
    return res.status(500).json({
      success: false,
      message: VEHICLE_LICENSE_MESSAGES.failedDocUpload,
      error: err.message,
    });
  }
};
