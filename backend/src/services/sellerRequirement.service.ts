import { pool, withTransaction } from '../config/db';
import {
  findOtherPendingFarmers,
  findSellerRequirement,
  insertRequirement,
  listFulfillmentRequests,
  listSellerRequirements,
  lockFulfillmentRequest,
  rejectFulfillmentRequest,
  reserveRequirement,
} from '../models/requirement.model';
import type {
  DeliveryMethod,
  NewRequirement,
  RequirementDetail,
  SellerOrder,
  SellerRequirement,
  TransportRequest,
} from '../types/seller';
import { conflict, notFound } from '../utils/AppError';
import { formatKg, formatLkr } from '../utils/format';
import { notify } from './notification.service';
import { createHeldOrder, getSellerOrder } from './sellerOrder.service';

export interface ReservationInput {
  deliveryMethod: DeliveryMethod;
  /** Required when deliveryMethod is TRANSPORTATION. */
  transport?: TransportRequest;
}

export function getSellerRequirements(sellerId: number): Promise<SellerRequirement[]> {
  return listSellerRequirements(pool, sellerId);
}

export async function getSellerRequirement(sellerId: number, requirementId: number): Promise<RequirementDetail> {
  const requirement = await findSellerRequirement(pool, sellerId, requirementId);
  if (!requirement) throw notFound('Requirement not found');
  return { ...requirement, fulfillmentRequests: await listFulfillmentRequests(pool, requirementId) };
}

export async function createRequirement(sellerId: number, requirement: NewRequirement): Promise<RequirementDetail> {
  const requirementId = await insertRequirement(pool, sellerId, requirement);
  return getSellerRequirement(sellerId, requirementId);
}

/**
 * Selects a farmer for a requirement and reserves the order by paying for it. In one
 * transaction the chosen request is accepted, the other pending requests are declined,
 * the requirement is closed and an order is created with its payment on hold.
 */
export async function acceptFulfillmentRequest(
  sellerId: number,
  requestId: number,
  reservation: ReservationInput,
): Promise<SellerOrder> {
  const orderId = await withTransaction(async (connection) => {
    const request = await lockFulfillmentRequest(connection, sellerId, requestId);
    if (!request) throw notFound('Fulfillment request not found');
    if (request.requirement.status !== 'OPEN') {
      throw conflict(
        request.requirement.status === 'EXPIRED'
          ? 'This requirement has passed its deadline'
          : 'A farmer has already been selected for this requirement',
      );
    }
    if (request.status !== 'PENDING') throw conflict('This fulfillment request is no longer available');

    const declinedFarmers = await findOtherPendingFarmers(connection, request.requirement.id, request.id);
    await reserveRequirement(connection, request.requirement.id, request.id);

    const newOrderId = await createHeldOrder(connection, {
      sellerId,
      farmerId: request.farmerId,
      requirementId: request.requirement.id,
      fulfillmentRequestId: request.id,
      productName: request.requirement.productName,
      imageUrl: null,
      quantityKg: request.offeredQuantityKg,
      pricePerKg: request.offeredPricePerKg,
      pickupAddress: request.pickupAddress,
      deliveryMethod: reservation.deliveryMethod,
      transport: reservation.transport,
    });

    const link = { type: 'REQUIREMENT' as const, id: request.requirement.id };
    await notify(connection, {
      userId: request.farmerId,
      category: 'fulfillment',
      title: 'Fulfillment Request Accepted',
      message: `Your offer of ${formatKg(request.offeredQuantityKg)} of ${request.requirement.productName} at ${formatLkr(
        request.offeredPricePerKg,
      )}/kg was accepted and the order has been reserved.`,
      link,
    });
    for (const farmerId of declinedFarmers) {
      await notify(connection, {
        userId: farmerId,
        category: 'fulfillment',
        title: 'Fulfillment Request Not Selected',
        message: `Another farmer was selected to supply ${request.requirement.productName}.`,
        link,
      });
    }
    return newOrderId;
  });
  return getSellerOrder(sellerId, orderId);
}

export async function declineFulfillmentRequest(sellerId: number, requestId: number): Promise<RequirementDetail> {
  const requirementId = await withTransaction(async (connection) => {
    const request = await lockFulfillmentRequest(connection, sellerId, requestId);
    if (!request) throw notFound('Fulfillment request not found');
    if (request.status !== 'PENDING') throw conflict('Only pending fulfillment requests can be rejected');

    await rejectFulfillmentRequest(connection, request.id);
    await notify(connection, {
      userId: request.farmerId,
      category: 'fulfillment',
      title: 'Fulfillment Request Rejected',
      message: `Your offer to supply ${request.requirement.productName} was not accepted.`,
      link: { type: 'REQUIREMENT', id: request.requirement.id },
    });
    return request.requirement.id;
  });
  return getSellerRequirement(sellerId, requirementId);
}
