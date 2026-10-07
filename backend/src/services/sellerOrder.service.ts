import { Db, pool, withTransaction } from '../config/db';
import { lockAdvertisement, setAdvertisementStock } from '../models/advertisement.model';
import { findSellerOrder, insertOrder, listSellerOrders } from '../models/order.model';
import { insertTransportJob } from '../models/transport.model';
import type { DeliveryMethod, OrderFilter, SellerOrder, TransportRequest } from '../types/seller';
import { badRequest, conflict, notFound } from '../utils/AppError';
import { formatKg, formatLkr, roundMoney } from '../utils/format';
import { notify } from './notification.service';
import { holdPayment } from './payment.service';

export interface PlaceOrderInput {
  advertisementId: number;
  quantityKg: number;
  deliveryMethod: DeliveryMethod;
  /** Required when deliveryMethod is TRANSPORTATION. */
  transport?: TransportRequest;
}

export interface HeldOrderDraft {
  sellerId: number;
  farmerId: number;
  productName: string;
  imageUrl: string | null;
  quantityKg: number;
  pricePerKg: number;
  pickupAddress: string;
  deliveryMethod: DeliveryMethod;
  transport?: TransportRequest;
  advertisementId?: number;
  requirementId?: number;
  fulfillmentRequestId?: number;
}

/**
 * Creates an order with its product payment on hold and, when transportation is requested,
 * an open transport job. Returns the new order id. Must run inside a transaction.
 */
export async function createHeldOrder(db: Db, draft: HeldOrderDraft): Promise<number> {
  const needsTransport = draft.deliveryMethod === 'TRANSPORTATION';
  if (needsTransport && !draft.transport) {
    throw badRequest('Delivery details are required when transportation is requested');
  }

  const totalProductAmount = roundMoney(draft.quantityKg * draft.pricePerKg);
  const order = await insertOrder(db, {
    sellerId: draft.sellerId,
    farmerId: draft.farmerId,
    productName: draft.productName,
    imageUrl: draft.imageUrl,
    quantityKg: draft.quantityKg,
    pricePerKg: draft.pricePerKg,
    totalProductAmount,
    deliveryMethod: draft.deliveryMethod,
    pickupAddress: draft.pickupAddress,
    status: 'PAYMENT_HELD',
    advertisementId: draft.advertisementId,
    requirementId: draft.requirementId,
    fulfillmentRequestId: draft.fulfillmentRequestId,
  });

  await holdPayment(db, {
    orderId: order.id,
    type: 'PRODUCT',
    payerId: draft.sellerId,
    payeeId: draft.farmerId,
    amount: totalProductAmount,
  });

  if (needsTransport && draft.transport) {
    await insertTransportJob(db, {
      ...draft.transport,
      orderId: order.id,
      pickupLocation: draft.pickupAddress,
      quantityKg: draft.quantityKg,
    });
  }

  const link = { type: 'ORDER' as const, id: order.id };
  await notify(db, {
    userId: draft.sellerId,
    category: 'payments',
    title: 'Payment Held Securely',
    message: `${formatLkr(totalProductAmount)} for Order #${order.orderNumber} is held by Green Hive until ${
      needsTransport ? 'the transporter confirms pickup' : 'you confirm receipt'
    }.`,
    link,
  });
  await notify(db, {
    userId: draft.farmerId,
    category: 'orders',
    title: 'New Order Received',
    message: `Order #${order.orderNumber}: ${formatKg(draft.quantityKg)} of ${draft.productName}. ${formatLkr(
      totalProductAmount,
    )} is held by Green Hive and will be released to you on pickup.`,
    link,
  });

  return order.id;
}

export async function getSellerOrder(sellerId: number, orderId: number): Promise<SellerOrder> {
  const order = await findSellerOrder(pool, sellerId, orderId);
  if (!order) throw notFound('Order not found');
  return order;
}

export function getSellerOrders(sellerId: number, filter: OrderFilter): Promise<SellerOrder[]> {
  return listSellerOrders(pool, sellerId, filter);
}

/** Buys from a farmer advertisement: reserves the stock and holds the payment in one transaction. */
export async function placeOrder(sellerId: number, input: PlaceOrderInput): Promise<SellerOrder> {
  const orderId = await withTransaction(async (connection) => {
    const advertisement = await lockAdvertisement(connection, input.advertisementId);
    if (!advertisement) throw notFound('Product not found');
    if (!advertisement.isOpenForOrders) throw conflict('This product is no longer available');
    if (input.quantityKg > advertisement.quantityAvailableKg) {
      throw conflict(`Only ${formatKg(advertisement.quantityAvailableKg)} is available from this farmer`);
    }

    await setAdvertisementStock(
      connection,
      advertisement.id,
      roundMoney(advertisement.quantityAvailableKg - input.quantityKg),
    );
    return createHeldOrder(connection, {
      sellerId,
      farmerId: advertisement.farmerId,
      advertisementId: advertisement.id,
      productName: advertisement.productName,
      imageUrl: advertisement.imageUrl,
      quantityKg: input.quantityKg,
      pricePerKg: advertisement.unitPriceLkr,
      pickupAddress: advertisement.pickupAddress,
      deliveryMethod: input.deliveryMethod,
      transport: input.transport,
    });
  });
  return getSellerOrder(sellerId, orderId);
}
