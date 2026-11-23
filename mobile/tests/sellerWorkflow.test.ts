// Tests for the seller workflow rules.
import { createInitialSellerState } from '../src/data/sellerMockData';
import type { SellerState } from '../src/types/seller';
import {
  approveTransportOffer,
  canConfirmReceipt,
  confirmReceipt,
  createRequirement,
  getDashboardStats,
  getOrderTotal,
  getRequirementStatus,
  markAllNotificationsRead,
  markNotificationRead,
  placeOrder,
  rejectFulfillmentRequest,
  rejectTransportOffer,
} from '../src/utils/sellerWorkflow';

const NOW = new Date('2026-10-30T10:00:00');
const transport = { deliveryLocation: 'Colombo 07', requiredDate: '2026-11-01', requiredTime: '08:00 AM' };

let state: SellerState;
beforeEach(() => {
  state = createInitialSellerState();
});

describe('placeOrder from an advertisement', () => {
  it('holds the product payment and reduces the stock for self pickup', () => {
    const { state: next, order } = placeOrder(
      state,
      { source: { kind: 'product', productId: 1, quantityKg: 100 }, deliveryMethod: 'SELF_PICKUP' },
      NOW,
    );

    expect(order).toMatchObject({
      productName: 'Fresh Cabbage',
      totalProductAmount: 8000,
      status: 'PAYMENT_HELD',
      productPaymentStatus: 'HELD',
      transportPaymentStatus: 'NOT_REQUIRED',
    });
    expect(next.products.find((product) => product.id === 1)?.quantityAvailableKg).toBe(400);
    expect(next.transportJobs).toHaveLength(state.transportJobs.length);
  });

  it('opens a transport job and leaves the transport payment pending', () => {
    const { state: next, order } = placeOrder(
      state,
      { source: { kind: 'product', productId: 5, quantityKg: 50 }, deliveryMethod: 'TRANSPORTATION', transport },
      NOW,
    );
    const job = next.transportJobs.find((item) => item.id === order.transportJobId);

    expect(order.transportPaymentStatus).toBe('PENDING');
    expect(job).toMatchObject({ status: 'OPEN_FOR_BIDS', deliveryLocation: 'Colombo 07', quantityKg: 50, offers: [] });
  });

  it('numbers new orders after the existing ones', () => {
    const { order } = placeOrder(
      state,
      { source: { kind: 'product', productId: 1, quantityKg: 10 }, deliveryMethod: 'SELF_PICKUP' },
      NOW,
    );

    expect(order.orderNumber).toBe('GH-2051');
  });

  it('marks the product sold out when the last stock is bought', () => {
    const { state: next } = placeOrder(
      state,
      { source: { kind: 'product', productId: 6, quantityKg: 150 }, deliveryMethod: 'SELF_PICKUP' },
      NOW,
    );

    expect(next.products.find((product) => product.id === 6)).toMatchObject({
      quantityAvailableKg: 0,
      status: 'SOLD_OUT',
    });
  });

  it('refuses more than the available stock, a sold out product and missing delivery details', () => {
    const tooMuch = () =>
      placeOrder(state, { source: { kind: 'product', productId: 1, quantityKg: 501 }, deliveryMethod: 'SELF_PICKUP' }, NOW);
    const noDelivery = () =>
      placeOrder(
        state,
        {
          source: { kind: 'product', productId: 1, quantityKg: 5 },
          deliveryMethod: 'TRANSPORTATION',
          transport: { ...transport, deliveryLocation: '  ' },
        },
        NOW,
      );

    expect(tooMuch).toThrow('Only 500 kg');
    expect(noDelivery).toThrow('delivery location');
  });

  it('does not notify when the seller switched off that category', () => {
    const quiet = { ...state, notificationSettings: { ...state.notificationSettings, payments: false } };

    const { state: next } = placeOrder(
      quiet,
      { source: { kind: 'product', productId: 1, quantityKg: 10 }, deliveryMethod: 'SELF_PICKUP' },
      NOW,
    );

    expect(next.notifications).toHaveLength(state.notifications.length);
  });
});

describe('reserving an order from a fulfillment request', () => {
  it('accepts one farmer, declines the rest and closes the requirement', () => {
    const { state: next, order } = placeOrder(
      state,
      { source: { kind: 'fulfillment', requestId: 1 }, deliveryMethod: 'SELF_PICKUP' },
      NOW,
    );

    expect(order).toMatchObject({ requirementId: 1, quantityKg: 200, productPricePerKg: 105, totalProductAmount: 21000 });
    expect(next.fulfillmentRequests.map((request) => request.status)).toEqual(['ACCEPTED', 'REJECTED']);
    expect(next.requirements.find((item) => item.id === 1)?.status).toBe('FULFILLED');
  });

  it('cannot reserve the same requirement twice', () => {
    const { state: next } = placeOrder(
      state,
      { source: { kind: 'fulfillment', requestId: 1 }, deliveryMethod: 'SELF_PICKUP' },
      NOW,
    );

    expect(() =>
      placeOrder(next, { source: { kind: 'fulfillment', requestId: 2 }, deliveryMethod: 'SELF_PICKUP' }, NOW),
    ).toThrow('no longer available');
  });

  it('cannot reserve a requirement past its deadline', () => {
    const late = new Date('2027-01-01T00:00:00');

    expect(() =>
      placeOrder(state, { source: { kind: 'fulfillment', requestId: 1 }, deliveryMethod: 'SELF_PICKUP' }, late),
    ).toThrow('no longer open');
  });
});

describe('requirements', () => {
  const input = {
    productName: ' Pumpkin ',
    category: 'Vegetables' as const,
    quantityNeededKg: 120,
    maxBudgetPerKg: 75,
    deliveryLocation: 'Colombo 07',
    description: ' Firm ',
    deadlineDate: '2026-11-10',
  };

  it('creates an open requirement with trimmed text', () => {
    const { state: next, requirement } = createRequirement(state, input, NOW);

    expect(requirement).toMatchObject({ productName: 'Pumpkin', description: 'Firm', status: 'OPEN' });
    expect(next.requirements[0]).toBe(requirement);
  });

  it('rejects an empty product or a zero quantity', () => {
    expect(() => createRequirement(state, { ...input, productName: '  ' }, NOW)).toThrow('product');
    expect(() => createRequirement(state, { ...input, quantityNeededKg: 0 }, NOW)).toThrow('quantity');
  });

  it('reports an open requirement as expired after its deadline', () => {
    const requirement = state.requirements[0];

    expect(getRequirementStatus(requirement, new Date('2026-01-01'))).toBe('OPEN');
    expect(getRequirementStatus(requirement, new Date('2030-01-01'))).toBe('EXPIRED');
  });

  it('rejects a pending fulfillment request only once', () => {
    const next = rejectFulfillmentRequest(state, 1);

    expect(next.fulfillmentRequests[0].status).toBe('REJECTED');
    expect(() => rejectFulfillmentRequest(next, 1)).toThrow('pending');
  });
});

describe('transporter offers', () => {
  it('approving an offer assigns the transporter, declines the others and holds the cost', () => {
    const next = approveTransportOffer(state, 2, 3, NOW);
    const job = next.transportJobs.find((item) => item.id === 2);
    const order = next.orders.find((item) => item.id === 2);

    expect(job).toMatchObject({ status: 'TRANSPORTER_ASSIGNED', assignedTransporterId: 201, agreedTransportCost: 2000 });
    expect(job?.offers.map((offer) => offer.status)).toEqual(['ACCEPTED', 'REJECTED']);
    expect(order).toMatchObject({ transportCost: 2000, transportPaymentStatus: 'HELD' });
  });

  it('cannot select a second transporter or an offer that is no longer pending', () => {
    const next = approveTransportOffer(state, 2, 3, NOW);

    expect(() => approveTransportOffer(next, 2, 4, NOW)).toThrow('already been selected');
    expect(() => approveTransportOffer(state, 1, 2, NOW)).toThrow('already been selected');
  });

  it('rejects one pending offer and leaves the job open', () => {
    const next = rejectTransportOffer(state, 2, 4);
    const job = next.transportJobs.find((item) => item.id === 2);

    expect(job?.status).toBe('OPEN_FOR_BIDS');
    expect(job?.offers.map((offer) => offer.status)).toEqual(['PENDING', 'REJECTED']);
    expect(() => rejectTransportOffer(next, 2, 4)).toThrow('pending');
  });
});

describe('confirming receipt', () => {
  it('completes an in-transit order and releases the transport payment', () => {
    const next = confirmReceipt(state, 1, NOW);

    expect(next.orders.find((order) => order.id === 1)).toMatchObject({
      status: 'COMPLETED',
      productPaymentStatus: 'RELEASED',
      transportPaymentStatus: 'RELEASED',
    });
    expect(next.transportJobs.find((job) => job.id === 1)?.status).toBe('GOODS_DELIVERED');
  });

  it('is refused before the transporter has picked up the goods', () => {
    const order = state.orders.find((item) => item.id === 2)!;

    expect(canConfirmReceipt(order)).toBe(false);
    expect(() => confirmReceipt(state, 2, NOW)).toThrow('cannot be confirmed');
  });

  it('is refused a second time', () => {
    const done = confirmReceipt(state, 1, NOW);

    expect(() => confirmReceipt(done, 1, NOW)).toThrow('cannot be confirmed');
  });

  it('releases the farmer payment for a self pickup order', () => {
    const { state: ordered, order } = placeOrder(
      state,
      { source: { kind: 'product', productId: 1, quantityKg: 10 }, deliveryMethod: 'SELF_PICKUP' },
      NOW,
    );

    expect(canConfirmReceipt(order)).toBe(true);
    const next = confirmReceipt(ordered, order.id, NOW);
    expect(next.orders.find((item) => item.id === order.id)).toMatchObject({
      status: 'COMPLETED',
      productPaymentStatus: 'RELEASED',
    });
  });
});

describe('dashboard figures and notifications', () => {
  it('counts orders and adds transport cost only once it is agreed', () => {
    expect(getOrderTotal(state.orders[0])).toBe(9500);
    expect(getOrderTotal(state.orders[1])).toBe(13500);
    expect(getDashboardStats(state.orders)).toEqual({
      activeOrders: 2,
      completedOrders: 0,
      inTransitOrders: 1,
      totalSpent: 23000,
    });
  });

  it('marks one notification or all notifications as read', () => {
    const one = markNotificationRead(state, 3);
    const all = markAllNotificationsRead(state);

    expect(one.notifications.every((item) => item.isRead)).toBe(true);
    expect(all.notifications.every((item) => item.isRead)).toBe(true);
  });
});
