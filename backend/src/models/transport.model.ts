import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { Db } from '../config/db';
import type {
  ResponseStatus,
  TransportJob,
  TransportJobStatus,
  TransportOffer,
  TransportRequest,
} from '../types/seller';

interface JobRow extends RowDataPacket {
  id: number;
  job_number: string;
  order_id: number;
  order_number: string;
  product_name: string;
  pickup_location: string;
  delivery_location: string;
  quantity_kg: number;
  required_date: string;
  required_time: string;
  assigned_transporter_id: number | null;
  agreed_transport_cost: number | null;
  status: TransportJobStatus;
}

interface OfferRow extends RowDataPacket {
  id: number;
  job_id: number;
  transporter_id: number;
  proposed_cost: number;
  estimated_delivery_time: string | null;
  status: ResponseStatus;
  created_at: Date;
  transporter_name: string;
  transporter_rating: number | null;
  vehicle_type: string | null;
  completed_jobs: number;
}

export interface NewTransportJob extends TransportRequest {
  orderId: number;
  pickupLocation: string;
  quantityKg: number;
}

/** The job fields the workflow rules need, read with a row lock. */
export interface LockedJob {
  id: number;
  jobNumber: string;
  orderId: number;
  status: TransportJobStatus;
}

export interface LockedOffer {
  id: number;
  transporterId: number;
  proposedCost: number;
  status: ResponseStatus;
}

// A job belongs to the seller who placed its order, so every read joins through orders
const JOB_SELECT = `
  SELECT j.id, j.job_number, j.order_id, j.pickup_location, j.delivery_location, j.quantity_kg,
         j.required_date, j.required_time, j.assigned_transporter_id, j.agreed_transport_cost, j.status,
         o.order_number, o.product_name
    FROM transportation_jobs j
    JOIN orders o ON o.id = j.order_id`;

/** "GH-T1024": derived from the id, so it is unique without a separate counter. */
const toJobNumber = (jobId: number): string => `GH-T${1000 + jobId}`;

const toOffer = (row: OfferRow): TransportOffer => ({
  id: row.id,
  jobId: row.job_id,
  transporterId: row.transporter_id,
  proposedCost: row.proposed_cost,
  estimatedDeliveryTime: row.estimated_delivery_time,
  status: row.status,
  submittedAt: row.created_at.toISOString(),
  transporter: {
    id: row.transporter_id,
    name: row.transporter_name,
    vehicle: row.vehicle_type,
    rating: row.transporter_rating,
    completedJobs: row.completed_jobs,
  },
});

const toJob = (row: JobRow, offers: TransportOffer[]): TransportJob => ({
  id: row.id,
  jobNumber: row.job_number,
  orderId: row.order_id,
  orderNumber: row.order_number,
  productName: row.product_name,
  pickupLocation: row.pickup_location,
  deliveryLocation: row.delivery_location,
  quantityKg: row.quantity_kg,
  requiredDate: row.required_date,
  // TIME comes back as HH:mm:ss; the API uses HH:mm
  requiredTime: row.required_time.slice(0, 5),
  assignedTransporterId: row.assigned_transporter_id,
  agreedTransportCost: row.agreed_transport_cost,
  status: row.status,
  offers,
});

async function findOffers(db: Db, jobIds: number[]): Promise<TransportOffer[]> {
  if (jobIds.length === 0) return [];
  const [rows] = await db.query<OfferRow[]>(
    `SELECT f.id, f.job_id, f.transporter_id, f.proposed_cost, f.estimated_delivery_time, f.status, f.created_at,
            u.name AS transporter_name, u.rating AS transporter_rating, tp.vehicle_type,
            (SELECT COUNT(*) FROM transportation_jobs done
              WHERE done.assigned_transporter_id = f.transporter_id AND done.status = 'GOODS_DELIVERED') AS completed_jobs
       FROM transportation_offers f
       JOIN users u ON u.id = f.transporter_id
       LEFT JOIN transporter_profiles tp ON tp.user_id = f.transporter_id
      WHERE f.job_id IN (?)
      ORDER BY f.proposed_cost ASC, f.id ASC`,
    [jobIds],
  );
  return rows.map(toOffer);
}

async function withOffers(db: Db, rows: JobRow[]): Promise<TransportJob[]> {
  const offers = await findOffers(
    db,
    rows.map((row) => row.id),
  );
  return rows.map((row) =>
    toJob(
      row,
      offers.filter((offer) => offer.jobId === row.id),
    ),
  );
}

/** Creates a job that transporters can submit their costs for. */
export async function insertTransportJob(db: Db, job: NewTransportJob): Promise<{ id: number; jobNumber: string }> {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO transportation_jobs
       (order_id, pickup_location, delivery_location, quantity_kg, required_date, required_time, status)
     VALUES (?, ?, ?, ?, ?, ?, 'OPEN_FOR_BIDS')`,
    [job.orderId, job.pickupLocation, job.deliveryLocation, job.quantityKg, job.requiredDate, job.requiredTime],
  );
  const jobNumber = toJobNumber(result.insertId);
  await db.query<ResultSetHeader>('UPDATE transportation_jobs SET job_number = ? WHERE id = ?', [
    jobNumber,
    result.insertId,
  ]);
  return { id: result.insertId, jobNumber };
}

export async function listSellerJobs(db: Db, sellerId: number): Promise<TransportJob[]> {
  const [rows] = await db.query<JobRow[]>(
    `${JOB_SELECT} WHERE o.seller_id = ? ORDER BY j.created_at DESC, j.id DESC`,
    [sellerId],
  );
  return withOffers(db, rows);
}

export async function findSellerJob(db: Db, sellerId: number, jobId: number): Promise<TransportJob | null> {
  const [rows] = await db.query<JobRow[]>(`${JOB_SELECT} WHERE j.id = ? AND o.seller_id = ?`, [jobId, sellerId]);
  const jobs = await withOffers(db, rows);
  return jobs[0] ?? null;
}

/** Reads one of the seller's jobs and locks it until the transaction ends. */
export async function lockSellerJob(db: Db, sellerId: number, jobId: number): Promise<LockedJob | null> {
  const [rows] = await db.query<JobRow[]>(
    `SELECT j.id, j.job_number, j.order_id, j.status
       FROM transportation_jobs j
       JOIN orders o ON o.id = j.order_id
      WHERE j.id = ? AND o.seller_id = ?
        FOR UPDATE OF j`,
    [jobId, sellerId],
  );
  const row = rows[0];
  return row ? { id: row.id, jobNumber: row.job_number, orderId: row.order_id, status: row.status } : null;
}

/** Reads every offer on a job and locks them until the transaction ends. */
export async function lockJobOffers(db: Db, jobId: number): Promise<LockedOffer[]> {
  const [rows] = await db.query<OfferRow[]>(
    'SELECT id, transporter_id, proposed_cost, status FROM transportation_offers WHERE job_id = ? FOR UPDATE',
    [jobId],
  );
  return rows.map((row) => ({
    id: row.id,
    transporterId: row.transporter_id,
    proposedCost: row.proposed_cost,
    status: row.status,
  }));
}

/** Accepts one offer and declines every other offer still pending on the job. */
export async function acceptOffer(db: Db, jobId: number, offerId: number): Promise<void> {
  await db.query<ResultSetHeader>(
    "UPDATE transportation_offers SET status = IF(id = ?, 'ACCEPTED', 'REJECTED') WHERE job_id = ? AND status = 'PENDING'",
    [offerId, jobId],
  );
}

export async function rejectOffer(db: Db, offerId: number): Promise<void> {
  await db.query<ResultSetHeader>("UPDATE transportation_offers SET status = 'REJECTED' WHERE id = ?", [offerId]);
}

/** Closes the job once the seller has confirmed that the goods arrived. */
export async function markJobDelivered(db: Db, orderId: number): Promise<void> {
  await db.query<ResultSetHeader>("UPDATE transportation_jobs SET status = 'GOODS_DELIVERED' WHERE order_id = ?", [
    orderId,
  ]);
}

export async function assignTransporter(db: Db, jobId: number, transporterId: number, cost: number): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE transportation_jobs
        SET status = 'TRANSPORTER_ASSIGNED', assigned_transporter_id = ?, agreed_transport_cost = ?
      WHERE id = ?`,
    [transporterId, cost, jobId],
  );
}
