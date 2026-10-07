import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { Db } from '../config/db';
import { conflict } from '../utils/AppError';

/**
 * Milestone payment holding. Green Hive keeps the seller's money until the transaction
 * reaches the agreed milestone: the product payment is released when pickup is confirmed,
 * the transportation payment when the seller confirms delivery.
 *
 * Collection is simulated for now: a held payment is recorded without calling a payment
 * gateway, and `gateway_reference` stays empty until one is integrated.
 *
 * Both functions must be called inside the transaction that changes the order, so a
 * payment can never be held or released without the matching status change.
 */

export type PaymentType = 'PRODUCT' | 'TRANSPORTATION';

interface HoldPaymentInput {
  orderId: number;
  type: PaymentType;
  payerId: number;
  payeeId: number;
  amount: number;
}

interface PaymentRow extends RowDataPacket {
  id: number;
  payee_id: number;
  amount: number;
  status: 'HELD' | 'RELEASED' | 'REFUNDED';
}

export async function holdPayment(db: Db, payment: HoldPaymentInput): Promise<void> {
  try {
    await db.query<ResultSetHeader>(
      `INSERT INTO payments (order_id, payment_type, payer_id, payee_id, amount, status)
       VALUES (?, ?, ?, ?, ?, 'HELD')`,
      [payment.orderId, payment.type, payment.payerId, payment.payeeId, payment.amount],
    );
  } catch (error) {
    // The unique (order, type) key stops the same amount from being held twice
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      throw conflict('This payment has already been made');
    }
    throw error;
  }
}

/** Releases a held payment to its payee and returns who was paid and how much. */
export async function releasePayment(
  db: Db,
  orderId: number,
  type: PaymentType,
): Promise<{ payeeId: number; amount: number }> {
  const [rows] = await db.query<PaymentRow[]>(
    'SELECT id, payee_id, amount, status FROM payments WHERE order_id = ? AND payment_type = ? FOR UPDATE',
    [orderId, type],
  );
  const payment = rows[0];
  if (!payment) throw conflict('No payment is being held for this order');
  if (payment.status !== 'HELD') throw conflict('This payment has already been released');

  await db.query<ResultSetHeader>(
    "UPDATE payments SET status = 'RELEASED', released_at = CURRENT_TIMESTAMP WHERE id = ?",
    [payment.id],
  );
  return { payeeId: payment.payee_id, amount: payment.amount };
}
