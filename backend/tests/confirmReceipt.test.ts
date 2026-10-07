import request from 'supertest';
import { app } from '../src/app';
import {
  authHeader,
  createAdvertisement,
  createFarmer,
  createSeller,
  createTransporter,
  createTransportOffer,
  dateFromToday,
  selectRows,
  simulatePickupConfirmation,
  TestUser,
} from './helpers/fixtures';
import { closeTestDatabase, resetTestDatabase } from './helpers/testDatabase';

let seller: TestUser;
let otherSeller: TestUser;
let farmer: TestUser;
let transporter: TestUser;

const confirmReceipt = (buyer: TestUser, orderId: number) =>
  request(app).post(`/api/seller/orders/${orderId}/confirm-receipt`).set(authHeader(buyer));

const paymentStatuses = async (orderId: number) => {
  const rows = await selectRows<{ payment_type: string; status: string }>(
    'SELECT payment_type, status FROM payments WHERE order_id = ?',
    [orderId],
  );
  return Object.fromEntries(rows.map((row) => [row.payment_type, row.status]));
};

async function placeOrder(deliveryMethod: 'SELF_PICKUP' | 'TRANSPORTATION') {
  const advertisementId = await createAdvertisement(farmer.id, { pricePerKg: 80 });
  const response = await request(app)
    .post('/api/seller/orders')
    .set(authHeader(seller))
    .send({
      advertisementId,
      quantityKg: 100,
      deliveryMethod,
      transport:
        deliveryMethod === 'TRANSPORTATION'
          ? { deliveryLocation: 'Colombo 07', requiredDate: dateFromToday(1), requiredTime: '08:00' }
          : undefined,
    });
  return response.body.order as { id: number; transportJobId: number };
}

beforeAll(async () => {
  await resetTestDatabase();
  seller = await createSeller();
  otherSeller = await createSeller();
  farmer = await createFarmer({ name: 'Sunil Perera' });
  transporter = await createTransporter({ name: 'Ruwan Transport' });
});
afterAll(closeTestDatabase);

describe('confirming receipt of a self pickup order', () => {
  let orderId: number;

  beforeAll(async () => {
    orderId = (await placeOrder('SELF_PICKUP')).id;
  });

  it("is refused for a seller who doesn't own the order", async () => {
    const response = await confirmReceipt(otherSeller, orderId);

    expect(response.status).toBe(404);
    expect(await paymentStatuses(orderId)).toEqual({ PRODUCT: 'HELD' });
  });

  it('completes the order and releases the product payment to the farmer', async () => {
    const response = await confirmReceipt(seller, orderId);
    const [payment] = await selectRows('SELECT status, released_at FROM payments WHERE order_id = ?', [orderId]);

    expect(response.status).toBe(200);
    expect(response.body.order).toMatchObject({
      status: 'COMPLETED',
      productPaymentStatus: 'RELEASED',
      completedAt: expect.any(String),
    });
    expect(payment).toMatchObject({ status: 'RELEASED', released_at: expect.any(Date) });
  });

  it('tells the farmer that the payment was released', async () => {
    const notifications = await selectRows(
      "SELECT title, message FROM notifications WHERE user_id = ? AND category = 'payments'",
      [farmer.id],
    );

    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({ title: 'Product Payment Released' });
    expect(notifications[0].message).toContain('Rs. 8,000');
  });

  it('cannot be confirmed a second time', async () => {
    const response = await confirmReceipt(seller, orderId);

    expect(response.status).toBe(409);
  });
});

describe('confirming receipt of a transported order', () => {
  let orderId: number;
  let jobId: number;

  beforeAll(async () => {
    const order = await placeOrder('TRANSPORTATION');
    orderId = order.id;
    jobId = order.transportJobId;
  });

  it('is refused while no transporter has been selected', async () => {
    const response = await confirmReceipt(seller, orderId);

    expect(response.status).toBe(409);
    expect(await paymentStatuses(orderId)).toEqual({ PRODUCT: 'HELD' });
  });

  it('is refused before pickup, leaving both payments on hold', async () => {
    const offerId = await createTransportOffer(jobId, transporter.id, 1500);
    await request(app)
      .post(`/api/seller/transport-jobs/${jobId}/offers/${offerId}/approve`)
      .set(authHeader(seller));

    const response = await confirmReceipt(seller, orderId);

    expect(response.status).toBe(409);
    expect(response.body.message).toContain('picked up');
    expect(await paymentStatuses(orderId)).toEqual({ PRODUCT: 'HELD', TRANSPORTATION: 'HELD' });
  });

  it('shows the order as in transit once pickup is confirmed, with only the farmer paid', async () => {
    await simulatePickupConfirmation(orderId);

    const response = await request(app).get('/api/seller/orders?status=inTransit').set(authHeader(seller));

    expect(response.body.orders).toHaveLength(1);
    expect(response.body.orders[0]).toMatchObject({
      id: orderId,
      status: 'PICKED_UP',
      productPaymentStatus: 'RELEASED',
      transportPaymentStatus: 'HELD',
    });
  });

  it('completes the order, releases the transport payment and closes the job', async () => {
    const response = await confirmReceipt(seller, orderId);
    const [job] = await selectRows('SELECT status FROM transportation_jobs WHERE id = ?', [jobId]);

    expect(response.status).toBe(200);
    expect(response.body.order).toMatchObject({
      status: 'COMPLETED',
      productPaymentStatus: 'RELEASED',
      transportPaymentStatus: 'RELEASED',
      transportCost: 1500,
    });
    expect(job).toEqual({ status: 'GOODS_DELIVERED' });
    expect(await paymentStatuses(orderId)).toEqual({ PRODUCT: 'RELEASED', TRANSPORTATION: 'RELEASED' });
  });

  it('counts the delivery towards the transporter and lists the order as completed', async () => {
    const job = await request(app).get(`/api/seller/transport-jobs/${jobId}`).set(authHeader(seller));
    const completed = await request(app).get('/api/seller/orders?status=completed').set(authHeader(seller));
    const active = await request(app).get('/api/seller/orders?status=active').set(authHeader(seller));

    expect(job.body.transportJob.offers[0].transporter.completedJobs).toBe(1);
    expect(completed.body.orders.map((order: { id: number }) => order.id)).toContain(orderId);
    expect(active.body.orders).toEqual([]);
  });

  it('cannot release the transport payment twice', async () => {
    const response = await confirmReceipt(seller, orderId);
    const released = await selectRows(
      "SELECT id FROM notifications WHERE user_id = ? AND title = 'Transportation Payment Released'",
      [transporter.id],
    );

    expect(response.status).toBe(409);
    expect(released).toHaveLength(1);
  });
});
