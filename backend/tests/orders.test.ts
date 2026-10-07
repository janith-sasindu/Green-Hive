import request from 'supertest';
import { app } from '../src/app';
import {
  authHeader,
  createAdvertisement,
  createFarmer,
  createSeller,
  dateFromToday,
  selectRows,
  TestUser,
} from './helpers/fixtures';
import { closeTestDatabase, resetTestDatabase } from './helpers/testDatabase';

let seller: TestUser;
let otherSeller: TestUser;
let farmer: TestUser;

const transport = () => ({
  deliveryLocation: 'Colombo Fresh Market, Colombo 07',
  requiredDate: dateFromToday(1),
  requiredTime: '08:00',
});

const placeOrder = (buyer: TestUser, body: Record<string, unknown>) =>
  request(app).post('/api/seller/orders').set(authHeader(buyer)).send(body);

beforeAll(async () => {
  await resetTestDatabase();
  seller = await createSeller();
  otherSeller = await createSeller();
  farmer = await createFarmer({ name: 'Sunil Perera', farmAddress: 'Nuwara Eliya Farm, Hanguranketha Road' });
});
afterAll(closeTestDatabase);

describe('POST /api/seller/orders (self pickup)', () => {
  let advertisementId: number;
  let orderId: number;

  beforeAll(async () => {
    advertisementId = await createAdvertisement(farmer.id, { quantityKg: 500, pricePerKg: 80 });
  });

  it('creates the order with the product payment on hold', async () => {
    const response = await placeOrder(seller, { advertisementId, quantityKg: 100, deliveryMethod: 'SELF_PICKUP' });

    expect(response.status).toBe(201);
    expect(response.body.order).toMatchObject({
      orderNumber: expect.stringMatching(/^GH-\d+$/),
      productName: 'Fresh Cabbage',
      quantityKg: 100,
      productPricePerKg: 80,
      totalProductAmount: 8000,
      deliveryMethod: 'SELF_PICKUP',
      status: 'PAYMENT_HELD',
      productPaymentStatus: 'HELD',
      transportPaymentStatus: 'NOT_REQUIRED',
      transportCost: null,
      transportJobId: null,
      pickupAddress: 'Nuwara Eliya Farm, Hanguranketha Road',
      farmer: { name: 'Sunil Perera' },
    });
    orderId = response.body.order.id;
  });

  it('holds exactly one payment from the seller for the farmer', async () => {
    const payments = await selectRows('SELECT * FROM payments WHERE order_id = ?', [orderId]);

    expect(payments).toHaveLength(1);
    expect(payments[0]).toMatchObject({
      payment_type: 'PRODUCT',
      payer_id: seller.id,
      payee_id: farmer.id,
      amount: 8000,
      status: 'HELD',
      released_at: null,
    });
  });

  it('reduces the stock the farmer still has on offer', async () => {
    const [advertisement] = await selectRows('SELECT quantity_available_kg, status FROM advertisements WHERE id = ?', [
      advertisementId,
    ]);

    expect(advertisement).toMatchObject({ quantity_available_kg: 400, status: 'ACTIVE' });
  });

  it('notifies the seller about the held payment and the farmer about the order', async () => {
    const sellerNotifications = await selectRows('SELECT category, link_type, link_id FROM notifications WHERE user_id = ?', [
      seller.id,
    ]);
    const farmerNotifications = await selectRows('SELECT category, title FROM notifications WHERE user_id = ?', [
      farmer.id,
    ]);

    expect(sellerNotifications).toEqual([{ category: 'payments', link_type: 'ORDER', link_id: orderId }]);
    expect(farmerNotifications).toEqual([{ category: 'orders', title: 'New Order Received' }]);
  });

  it('marks the advertisement sold out when the last of the stock is ordered', async () => {
    const response = await placeOrder(seller, { advertisementId, quantityKg: 400, deliveryMethod: 'SELF_PICKUP' });
    const [advertisement] = await selectRows('SELECT quantity_available_kg, status FROM advertisements WHERE id = ?', [
      advertisementId,
    ]);

    expect(response.status).toBe(201);
    expect(advertisement).toMatchObject({ quantity_available_kg: 0, status: 'SOLD_OUT' });
  });

  it('refuses a sold out product without creating an order or payment', async () => {
    const before = await selectRows('SELECT COUNT(*) AS total FROM payments');

    const response = await placeOrder(seller, { advertisementId, quantityKg: 1, deliveryMethod: 'SELF_PICKUP' });
    const after = await selectRows('SELECT COUNT(*) AS total FROM payments');

    expect(response.status).toBe(409);
    expect(after).toEqual(before);
  });
});

describe('POST /api/seller/orders (rules)', () => {
  it('refuses more than the farmer has available', async () => {
    const advertisementId = await createAdvertisement(farmer.id, { quantityKg: 50 });

    const response = await placeOrder(seller, { advertisementId, quantityKg: 51, deliveryMethod: 'SELF_PICKUP' });

    expect(response.status).toBe(409);
    expect(response.body.message).toContain('50 kg');
  });

  it('refuses an advertisement that has passed its availability period', async () => {
    const advertisementId = await createAdvertisement(farmer.id, { availableForDays: -1 });

    const response = await placeOrder(seller, { advertisementId, quantityKg: 10, deliveryMethod: 'SELF_PICKUP' });

    expect(response.status).toBe(409);
  });

  it('answers 404 for a product that does not exist', async () => {
    const response = await placeOrder(seller, { advertisementId: 999999, quantityKg: 10, deliveryMethod: 'SELF_PICKUP' });

    expect(response.status).toBe(404);
  });

  it('validates the quantity, delivery method and delivery details', async () => {
    const advertisementId = await createAdvertisement(farmer.id);

    const noQuantity = await placeOrder(seller, { advertisementId, quantityKg: 0, deliveryMethod: 'PIGEON' });
    const noTransport = await placeOrder(seller, { advertisementId, quantityKg: 10, deliveryMethod: 'TRANSPORTATION' });
    const pastDate = await placeOrder(seller, {
      advertisementId,
      quantityKg: 10,
      deliveryMethod: 'TRANSPORTATION',
      transport: { ...transport(), requiredDate: dateFromToday(-1), requiredTime: '25:00' },
    });

    expect(noQuantity.status).toBe(400);
    expect(Object.keys(noQuantity.body.errors).sort()).toEqual(['deliveryMethod', 'quantityKg']);
    expect(Object.keys(noTransport.body.errors).sort()).toEqual([
      'transport.deliveryLocation',
      'transport.requiredDate',
      'transport.requiredTime',
    ]);
    expect(Object.keys(pastDate.body.errors).sort()).toEqual(['transport.requiredDate', 'transport.requiredTime']);
  });

  it('never sells the same stock twice when two sellers order at once', async () => {
    const advertisementId = await createAdvertisement(farmer.id, { quantityKg: 500 });
    const order = { advertisementId, quantityKg: 300, deliveryMethod: 'SELF_PICKUP' };

    const responses = await Promise.all([placeOrder(seller, order), placeOrder(otherSeller, order)]);
    const [advertisement] = await selectRows('SELECT quantity_available_kg FROM advertisements WHERE id = ?', [
      advertisementId,
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    expect(advertisement).toMatchObject({ quantity_available_kg: 200 });
  });
});

describe('POST /api/seller/orders (transportation)', () => {
  it('creates an open transport job and leaves the transport payment pending', async () => {
    const advertisementId = await createAdvertisement(farmer.id, { productName: 'Ripe Tomatoes', pricePerKg: 90 });

    const response = await placeOrder(seller, {
      advertisementId,
      quantityKg: 150,
      deliveryMethod: 'TRANSPORTATION',
      transport: transport(),
    });
    const jobs = await selectRows('SELECT * FROM transportation_jobs WHERE order_id = ?', [response.body.order.id]);

    expect(response.status).toBe(201);
    expect(response.body.order).toMatchObject({
      totalProductAmount: 13500,
      productPaymentStatus: 'HELD',
      transportPaymentStatus: 'PENDING',
      transportJobId: expect.any(Number),
    });
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      job_number: expect.stringMatching(/^GH-T\d+$/),
      pickup_location: 'Nuwara Eliya Farm, Hanguranketha Road',
      delivery_location: 'Colombo Fresh Market, Colombo 07',
      quantity_kg: 150,
      required_date: dateFromToday(1),
      required_time: '08:00:00',
      status: 'OPEN_FOR_BIDS',
      assigned_transporter_id: null,
    });
  });
});

describe('GET /api/seller/orders', () => {
  beforeAll(async () => {
    // Make sure both sellers have at least one order, whoever won the race above
    const advertisementId = await createAdvertisement(farmer.id);
    await placeOrder(seller, { advertisementId, quantityKg: 5, deliveryMethod: 'SELF_PICKUP' });
    await placeOrder(otherSeller, { advertisementId, quantityKg: 5, deliveryMethod: 'SELF_PICKUP' });
  });

  it("lists the seller's own orders, newest first", async () => {
    const mine = await request(app).get('/api/seller/orders').set(authHeader(seller));
    const theirs = await request(app).get('/api/seller/orders').set(authHeader(otherSeller));

    const sellerIds = (body: { orders: { sellerId: number }[] }) => new Set(body.orders.map((order) => order.sellerId));
    const ids = mine.body.orders.map((order: { id: number }) => order.id);

    expect(mine.status).toBe(200);
    expect(sellerIds(mine.body)).toEqual(new Set([seller.id]));
    expect(sellerIds(theirs.body)).toEqual(new Set([otherSeller.id]));
    expect(ids).toEqual([...ids].sort((a, b) => b - a));
  });

  it('filters by status group', async () => {
    const active = await request(app).get('/api/seller/orders?status=active').set(authHeader(seller));
    const completed = await request(app).get('/api/seller/orders?status=completed').set(authHeader(seller));

    expect(active.body.orders.length).toBeGreaterThan(0);
    expect(completed.body.orders).toEqual([]);
  });

  it("does not show one seller another seller's order", async () => {
    const mine = await request(app).get('/api/seller/orders').set(authHeader(seller));
    const orderId = mine.body.orders[0].id;

    const asOwner = await request(app).get(`/api/seller/orders/${orderId}`).set(authHeader(seller));
    const asStranger = await request(app).get(`/api/seller/orders/${orderId}`).set(authHeader(otherSeller));

    expect(asOwner.status).toBe(200);
    expect(asStranger.status).toBe(404);
  });
});
