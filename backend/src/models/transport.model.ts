import type { ResultSetHeader } from 'mysql2';
import type { Db } from '../config/db';
import type { TransportRequest } from '../types/seller';

export interface NewTransportJob extends TransportRequest {
  orderId: number;
  pickupLocation: string;
  quantityKg: number;
}

/** "GH-T1024": derived from the id, so it is unique without a separate counter. */
const toJobNumber = (jobId: number): string => `GH-T${1000 + jobId}`;

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
