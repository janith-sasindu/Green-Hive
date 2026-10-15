import { CATEGORY_EMOJI } from '../constants/productCategories';
import type {
  CreateRequirementInput,
  DashboardStats,
  Order,
  PlaceOrderInput,
  ProductCategory,
  SellerNotification,
  SellerRequirement,
  SellerState,
  SellerTransportJob,
} from '../types/seller';
import { formatKg, formatLkr, toDateString } from './format';

/**
 * Business rules for the Retail Seller workflow (ordering, requirements, transporter
 * selection and milestone payments). Every function is pure: it validates the requested
 * transition against the current state and returns the next state, so an order, its
 * transport job and its payments always change together.
 */

type NotificationDraft = Omit<SellerNotification, 'id' | 'createdAt' | 'isRead'>;

const nextId = (items: { id: number }[]): number =>
  items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

/** nextReference(['GH-2041', 'GH-2050'], 'GH-', 2000) -> "GH-2051" */
const nextReference = (references: string[], prefix: string, start: number): string => {
  const highest = references.reduce((max, reference) => {
    const value = Number(reference.slice(prefix.length));
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, start);
  return `${prefix}${highest + 1}`;
};

// Notifications are only recorded for categories the seller has left switched on
const withNotification = (state: SellerState, draft: NotificationDraft, now: Date): SellerState => {
  if (!state.notificationSettings[draft.category]) return state;
  const notification: SellerNotification = {
    ...draft,
    id: nextId(state.notifications),
    createdAt: now.toISOString(),
    isRead: false,
  };
  return { ...state, notifications: [notification, ...state.notifications] };
};

export const isActiveOrder = (order: Order): boolean =>
  order.status !== 'COMPLETED' && order.status !== 'CANCELLED';

export const isInTransit = (order: Order): boolean =>
  order.status === 'PICKED_UP' || order.status === 'DELIVERED';

/** Product amount plus the transportation cost once a transporter has been approved. */
export const getOrderTotal = (order: Order): number => order.totalProductAmount + (order.transportCost ?? 0);

export const getDashboardStats = (orders: Order[]): DashboardStats => ({
  activeOrders: orders.filter(isActiveOrder).length,
  completedOrders: orders.filter((order) => order.status === 'COMPLETED').length,
  inTransitOrders: orders.filter(isInTransit).length,
  totalSpent: orders
    .filter((order) => order.status !== 'CANCELLED')
    .reduce((sum, order) => sum + getOrderTotal(order), 0),
});

/**
 * Self pickup orders are confirmed when the seller collects the goods. Transported orders
 * can only be confirmed after the transporter has confirmed pickup.
 */
export const canConfirmReceipt = (order: Order): boolean =>
  order.deliveryMethod === 'SELF_PICKUP' ? order.status === 'PAYMENT_HELD' : isInTransit(order);

/** A requirement stops accepting fulfillment requests once it is reserved or past its deadline. */
export const getRequirementStatus = (
  requirement: SellerRequirement,
  now: Date = new Date(),
): SellerRequirement['status'] =>
  requirement.status === 'OPEN' && requirement.deadlineDate < toDateString(now) ? 'EXPIRED' : requirement.status;

export const getAssignedTransporterName = (job: SellerTransportJob): string | undefined =>
  job.offers.find((offer) => offer.transporterId === job.assignedTransporterId)?.transporter.name;

export function placeOrder(
  state: SellerState,
  input: PlaceOrderInput,
  now: Date = new Date(),
): { state: SellerState; order: Order } {
  const { source, deliveryMethod, transport } = input;
  if (deliveryMethod === 'TRANSPORTATION' && !transport?.deliveryLocation.trim()) {
    throw new Error('A delivery location is required when transportation is requested.');
  }

  let { products, requirements, fulfillmentRequests } = state;
  let line: Pick<
    Order,
    | 'farmerId'
    | 'farmer'
    | 'productName'
    | 'quantityKg'
    | 'productPricePerKg'
    | 'pickupAddress'
    | 'emoji'
    | 'imageUrl'
    | 'requirementId'
  >;

  if (source.kind === 'product') {
    const { productId, quantityKg } = source;
    const product = products.find((item) => item.id === productId);
    if (!product || product.status !== 'ACTIVE') {
      throw new Error('This product is no longer available.');
    }
    if (!Number.isFinite(quantityKg) || quantityKg <= 0) {
      throw new Error('Enter a quantity greater than zero.');
    }
    if (quantityKg > product.quantityAvailableKg) {
      throw new Error(`Only ${formatKg(product.quantityAvailableKg)} available from this farmer.`);
    }

    const remainingKg = product.quantityAvailableKg - quantityKg;
    products = products.map((item) =>
      item.id === productId
        ? { ...item, quantityAvailableKg: remainingKg, status: remainingKg === 0 ? 'SOLD_OUT' : item.status }
        : item,
    );
    line = {
      farmerId: product.farmerId,
      farmer: product.farmer,
      productName: product.productName,
      quantityKg,
      productPricePerKg: product.unitPriceLkr,
      pickupAddress: product.pickupAddress,
      emoji: product.emoji,
      imageUrl: product.imageUrl,
    };
  } else {
    const { requestId } = source;
    const request = fulfillmentRequests.find((item) => item.id === requestId);
    if (!request || request.status !== 'PENDING') {
      throw new Error('This fulfillment request is no longer available.');
    }
    const requirement = requirements.find((item) => item.id === request.requirementId);
    if (!requirement || getRequirementStatus(requirement, now) !== 'OPEN') {
      throw new Error('This requirement is no longer open.');
    }

    // Reserving one farmer closes the requirement and declines the other pending requests
    fulfillmentRequests = fulfillmentRequests.map((item) => {
      if (item.requirementId !== requirement.id) return item;
      if (item.id === requestId) return { ...item, status: 'ACCEPTED' };
      return item.status === 'PENDING' ? { ...item, status: 'REJECTED' } : item;
    });
    requirements = requirements.map((item) =>
      item.id === requirement.id ? { ...item, status: 'FULFILLED' } : item,
    );
    line = {
      farmerId: request.farmerId,
      farmer: request.farmer,
      productName: requirement.productName,
      quantityKg: request.offeredQuantityKg,
      productPricePerKg: request.offeredPricePerKg,
      pickupAddress: request.pickupAddress,
      emoji: CATEGORY_EMOJI[requirement.category as ProductCategory] ?? '📦',
      requirementId: requirement.id,
    };
  }

  const orderId = nextId(state.orders);
  const needsTransport = deliveryMethod === 'TRANSPORTATION' && transport !== undefined;
  const job: SellerTransportJob | undefined = needsTransport
    ? {
        id: nextId(state.transportJobs),
        jobNumber: nextReference(
          state.transportJobs.map((item) => item.jobNumber),
          'GH-T',
          1000,
        ),
        orderId,
        productName: line.productName,
        pickupLocation: line.pickupAddress,
        deliveryLocation: transport.deliveryLocation.trim(),
        quantityKg: line.quantityKg,
        requiredDate: transport.requiredDate,
        requiredTime: transport.requiredTime,
        status: 'OPEN_FOR_BIDS',
        offers: [],
      }
    : undefined;

  const order: Order = {
    ...line,
    id: orderId,
    orderNumber: nextReference(
      state.orders.map((item) => item.orderNumber),
      'GH-',
      2000,
    ),
    sellerId: state.profile.id,
    totalProductAmount: line.quantityKg * line.productPricePerKg,
    deliveryMethod,
    status: 'PAYMENT_HELD',
    productPaymentStatus: 'HELD',
    transportPaymentStatus: job ? 'PENDING' : 'NOT_REQUIRED',
    transportJobId: job?.id,
    createdAt: now.toISOString(),
  };

  const next: SellerState = {
    ...state,
    products,
    requirements,
    fulfillmentRequests,
    orders: [order, ...state.orders],
    transportJobs: job ? [job, ...state.transportJobs] : state.transportJobs,
  };

  return {
    order,
    state: withNotification(
      next,
      {
        category: 'payments',
        title: 'Payment Held Securely',
        message: `${formatLkr(order.totalProductAmount)} for Order #${order.orderNumber} is held by Green Hive until ${
          job ? 'the transporter confirms pickup' : 'you confirm receipt'
        }.`,
        link: { screen: 'OrderDetail', orderId },
      },
      now,
    ),
  };
}

export function createRequirement(
  state: SellerState,
  input: CreateRequirementInput,
  now: Date = new Date(),
): { state: SellerState; requirement: SellerRequirement } {
  const productName = input.productName.trim();
  if (!productName) throw new Error('Enter the product you need.');
  if (!(input.quantityNeededKg > 0)) throw new Error('Enter the quantity you need.');
  if (!(input.maxBudgetPerKg > 0)) throw new Error('Enter your maximum price per kg.');
  if (!input.deliveryLocation.trim()) throw new Error('Enter a delivery location.');

  const requirement: SellerRequirement = {
    ...input,
    id: nextId(state.requirements),
    sellerId: state.profile.id,
    productName,
    deliveryLocation: input.deliveryLocation.trim(),
    description: input.description.trim(),
    status: 'OPEN',
    createdAt: now.toISOString(),
  };
  return { requirement, state: { ...state, requirements: [requirement, ...state.requirements] } };
}

export function rejectFulfillmentRequest(state: SellerState, requestId: number): SellerState {
  const request = state.fulfillmentRequests.find((item) => item.id === requestId);
  if (!request || request.status !== 'PENDING') {
    throw new Error('Only pending fulfillment requests can be rejected.');
  }
  return {
    ...state,
    fulfillmentRequests: state.fulfillmentRequests.map((item) =>
      item.id === requestId ? { ...item, status: 'REJECTED' } : item,
    ),
  };
}

/** Approving an offer assigns the transporter and places the transportation payment on hold. */
export function approveTransportOffer(
  state: SellerState,
  jobId: number,
  offerId: number,
  now: Date = new Date(),
): SellerState {
  const job = state.transportJobs.find((item) => item.id === jobId);
  if (!job || job.status !== 'OPEN_FOR_BIDS') {
    throw new Error('A transporter has already been selected for this job.');
  }
  const offer = job.offers.find((item) => item.id === offerId);
  if (!offer || offer.status !== 'PENDING') {
    throw new Error('This offer is no longer available.');
  }

  const next: SellerState = {
    ...state,
    transportJobs: state.transportJobs.map((item) =>
      item.id === jobId
        ? {
            ...item,
            status: 'TRANSPORTER_ASSIGNED',
            assignedTransporterId: offer.transporterId,
            agreedTransportCost: offer.proposedCost,
            offers: item.offers.map((other) => {
              if (other.id === offerId) return { ...other, status: 'ACCEPTED' };
              return other.status === 'PENDING' ? { ...other, status: 'REJECTED' } : other;
            }),
          }
        : item,
    ),
    orders: state.orders.map((order) =>
      order.id === job.orderId
        ? { ...order, transportCost: offer.proposedCost, transportPaymentStatus: 'HELD' }
        : order,
    ),
  };

  return withNotification(
    next,
    {
      category: 'payments',
      title: 'Transportation Payment Held',
      message: `${formatLkr(offer.proposedCost)} for Job #${job.jobNumber} is held by Green Hive until you confirm delivery.`,
      link: { screen: 'TransportJobDetail', jobId },
    },
    now,
  );
}

export function rejectTransportOffer(state: SellerState, jobId: number, offerId: number): SellerState {
  const offer = state.transportJobs
    .find((item) => item.id === jobId)
    ?.offers.find((item) => item.id === offerId);
  if (!offer || offer.status !== 'PENDING') {
    throw new Error('Only pending offers can be rejected.');
  }
  return {
    ...state,
    transportJobs: state.transportJobs.map((item) =>
      item.id === jobId
        ? {
            ...item,
            offers: item.offers.map((other) => (other.id === offerId ? { ...other, status: 'REJECTED' } : other)),
          }
        : item,
    ),
  };
}

/**
 * Completes the order and releases the payment still on hold: the transporter's payment
 * for transported orders, or the farmer's product payment for self pickup orders.
 */
export function confirmReceipt(state: SellerState, orderId: number, now: Date = new Date()): SellerState {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order || !canConfirmReceipt(order)) {
    throw new Error('Receipt cannot be confirmed for this order yet.');
  }

  const transported = order.deliveryMethod === 'TRANSPORTATION';
  const job = state.transportJobs.find((item) => item.id === order.transportJobId);
  const next: SellerState = {
    ...state,
    orders: state.orders.map((item) =>
      item.id === orderId
        ? {
            ...item,
            status: 'COMPLETED',
            productPaymentStatus: 'RELEASED',
            transportPaymentStatus: transported ? 'RELEASED' : item.transportPaymentStatus,
            completedAt: now.toISOString(),
          }
        : item,
    ),
    transportJobs: state.transportJobs.map((item) =>
      item.id === order.transportJobId ? { ...item, status: 'GOODS_DELIVERED' } : item,
    ),
  };

  const transporterName = job ? getAssignedTransporterName(job) : undefined;
  return withNotification(
    next,
    transported
      ? {
          category: 'payments',
          title: 'Transportation Payment Released',
          message: `${formatLkr(order.transportCost ?? 0)} was released to ${
            transporterName ?? 'the transporter'
          } after you confirmed delivery of Order #${order.orderNumber}.`,
          link: { screen: 'OrderDetail', orderId },
        }
      : {
          category: 'payments',
          title: 'Product Payment Released',
          message: `${formatLkr(order.totalProductAmount)} was released to ${
            order.farmer.name
          } after you confirmed receipt of Order #${order.orderNumber}.`,
          link: { screen: 'OrderDetail', orderId },
        },
    now,
  );
}

export function markNotificationRead(state: SellerState, notificationId: number): SellerState {
  return {
    ...state,
    notifications: state.notifications.map((item) =>
      item.id === notificationId ? { ...item, isRead: true } : item,
    ),
  };
}

export function markAllNotificationsRead(state: SellerState): SellerState {
  return {
    ...state,
    notifications: state.notifications.map((item) => (item.isRead ? item : { ...item, isRead: true })),
  };
}
