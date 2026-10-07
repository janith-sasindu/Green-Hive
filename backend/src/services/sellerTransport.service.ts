import { pool, withTransaction } from '../config/db';
import {
  acceptOffer,
  assignTransporter,
  findSellerJob,
  listSellerJobs,
  lockJobOffers,
  lockSellerJob,
  rejectOffer,
} from '../models/transport.model';
import type { TransportJob } from '../types/seller';
import { conflict, notFound } from '../utils/AppError';
import { formatLkr } from '../utils/format';
import { notify } from './notification.service';
import { holdPayment } from './payment.service';

export function getSellerTransportJobs(sellerId: number): Promise<TransportJob[]> {
  return listSellerJobs(pool, sellerId);
}

export async function getSellerTransportJob(sellerId: number, jobId: number): Promise<TransportJob> {
  const job = await findSellerJob(pool, sellerId, jobId);
  if (!job) throw notFound('Transport job not found');
  return job;
}

/**
 * Selects a transporter for the job: accepts their offer, declines the others, assigns the
 * job and puts the agreed transportation cost on hold, all in one transaction.
 */
export async function approveTransportOffer(sellerId: number, jobId: number, offerId: number): Promise<TransportJob> {
  await withTransaction(async (connection) => {
    const job = await lockSellerJob(connection, sellerId, jobId);
    if (!job) throw notFound('Transport job not found');
    if (job.status !== 'OPEN_FOR_BIDS') {
      throw conflict('A transporter has already been selected for this job');
    }

    const offers = await lockJobOffers(connection, jobId);
    const chosen = offers.find((offer) => offer.id === offerId);
    if (!chosen) throw notFound('Transport offer not found');
    if (chosen.status !== 'PENDING') throw conflict('This offer is no longer available');

    await acceptOffer(connection, jobId, offerId);
    await assignTransporter(connection, jobId, chosen.transporterId, chosen.proposedCost);
    await holdPayment(connection, {
      orderId: job.orderId,
      type: 'TRANSPORTATION',
      payerId: sellerId,
      payeeId: chosen.transporterId,
      amount: chosen.proposedCost,
    });

    const link = { type: 'TRANSPORT_JOB' as const, id: jobId };
    await notify(connection, {
      userId: sellerId,
      category: 'payments',
      title: 'Transportation Payment Held',
      message: `${formatLkr(chosen.proposedCost)} for Job #${job.jobNumber} is held by Green Hive until you confirm delivery.`,
      link,
    });
    await notify(connection, {
      userId: chosen.transporterId,
      category: 'transportation',
      title: 'Transportation Offer Approved',
      message: `Your offer of ${formatLkr(chosen.proposedCost)} for Job #${job.jobNumber} was approved. Payment is released after delivery is confirmed.`,
      link,
    });
    for (const offer of offers) {
      if (offer.id !== offerId && offer.status === 'PENDING') {
        await notify(connection, {
          userId: offer.transporterId,
          category: 'transportation',
          title: 'Transportation Offer Not Selected',
          message: `Another transporter was selected for Job #${job.jobNumber}.`,
          link,
        });
      }
    }
  });
  return getSellerTransportJob(sellerId, jobId);
}

export async function rejectTransportOffer(sellerId: number, jobId: number, offerId: number): Promise<TransportJob> {
  await withTransaction(async (connection) => {
    const job = await lockSellerJob(connection, sellerId, jobId);
    if (!job) throw notFound('Transport job not found');

    const offer = (await lockJobOffers(connection, jobId)).find((item) => item.id === offerId);
    if (!offer) throw notFound('Transport offer not found');
    if (offer.status !== 'PENDING') throw conflict('Only pending offers can be rejected');

    await rejectOffer(connection, offerId);
    await notify(connection, {
      userId: offer.transporterId,
      category: 'transportation',
      title: 'Transportation Offer Rejected',
      message: `Your offer of ${formatLkr(offer.proposedCost)} for Job #${job.jobNumber} was not accepted.`,
      link: { type: 'TRANSPORT_JOB', id: jobId },
    });
  });
  return getSellerTransportJob(sellerId, jobId);
}
