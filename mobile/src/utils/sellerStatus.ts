import type { FulfillmentRequest } from '../types/farmer';
import type { Order, PaymentStatus, SellerRequirement } from '../types/seller';
import type { TransportationJob, TransportationOffer } from '../types/transporter';

export type BadgeTone = 'blue' | 'amber' | 'green' | 'red' | 'gray' | 'indigo';

export interface StatusMeta {
  label: string;
  tone: BadgeTone;
}

export const ORDER_STATUS: Record<Order['status'], StatusMeta> = {
  CREATED: { label: 'Awaiting Payment', tone: 'gray' },
  PAYMENT_HELD: { label: 'Payment Held', tone: 'amber' },
  PICKED_UP: { label: 'In Transit', tone: 'blue' },
  DELIVERED: { label: 'Delivered', tone: 'indigo' },
  COMPLETED: { label: 'Completed', tone: 'green' },
  CANCELLED: { label: 'Cancelled', tone: 'red' },
};

export const PRODUCT_PAYMENT_STATUS: Record<PaymentStatus, StatusMeta> = {
  NOT_REQUIRED: { label: 'Not required', tone: 'gray' },
  PENDING: { label: 'Awaiting payment', tone: 'gray' },
  HELD: { label: 'Held by Green Hive', tone: 'amber' },
  RELEASED: { label: 'Product Paid', tone: 'green' },
};

export const TRANSPORT_PAYMENT_STATUS: Record<PaymentStatus, StatusMeta> = {
  NOT_REQUIRED: { label: 'Not required', tone: 'gray' },
  PENDING: { label: 'Awaiting transporter', tone: 'gray' },
  HELD: { label: 'Held by Green Hive', tone: 'amber' },
  RELEASED: { label: 'Transport Paid', tone: 'green' },
};

export const TRANSPORT_JOB_STATUS: Record<TransportationJob['status'], StatusMeta> = {
  OPEN_FOR_BIDS: { label: 'open', tone: 'amber' },
  TRANSPORTER_ASSIGNED: { label: 'active', tone: 'blue' },
  GOODS_PICKED_UP: { label: 'active', tone: 'blue' },
  GOODS_DELIVERED: { label: 'delivered', tone: 'green' },
};

export const REQUIREMENT_STATUS: Record<SellerRequirement['status'], StatusMeta> = {
  OPEN: { label: 'Open', tone: 'green' },
  FULFILLED: { label: 'Reserved', tone: 'blue' },
  EXPIRED: { label: 'Expired', tone: 'gray' },
};

// Fulfillment requests and transporter offers share the same three states
export const RESPONSE_STATUS: Record<FulfillmentRequest['status'] | TransportationOffer['status'], StatusMeta> = {
  PENDING: { label: 'Pending', tone: 'amber' },
  ACCEPTED: { label: 'Accepted', tone: 'green' },
  REJECTED: { label: 'Rejected', tone: 'red' },
};
