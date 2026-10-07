import request from 'supertest';
import { app } from '../src/app';
import {
  authHeader,
  createFarmer,
  createFulfillmentRequest,
  createSeller,
  dateFromToday,
  selectRows,
  TestUser,
} from './helpers/fixtures';
import { closeTestDatabase, resetTestDatabase } from './helpers/testDatabase';

let seller: TestUser;
let otherSeller: TestUser;
let sunil: TestUser;
let priya: TestUser;
let nimal: TestUser;

const carrots = () => ({
  productName: 'Carrots',
  category: 'Vegetables',
  quantityNeededKg: 200,
  maxBudgetPerKg: 110,
  deliveryLocation: 'Colombo Fresh Market, Colombo 07',
  description: 'Medium sized, washed carrots.',
  deadlineDate: dateFromToday(7),
});

const postRequirement = (owner: TestUser, body: Record<string, unknown>) =>
  request(app).post('/api/seller/requirements').set(authHeader(owner)).send(body);

const decide = (owner: TestUser, requestId: number, action: 'accept' | 'reject', body: Record<string, unknown> = {}) =>
  request(app).post(`/api/seller/fulfillment-requests/${requestId}/${action}`).set(authHeader(owner)).send(body);

const requestStatuses = async (requirementId: number) => {
  const rows = await selectRows<{ id: number; status: string }>(
    'SELECT id, status FROM fulfillment_requests WHERE requirement_id = ?',
    [requirementId],
  );
  return Object.fromEntries(rows.map((row) => [row.id, row.status]));
};

beforeAll(async () => {
  await resetTestDatabase();
  seller = await createSeller();
  otherSeller = await createSeller();
  sunil = await createFarmer({
    name: 'Sunil Perera',
    location: 'Nuwara Eliya',
    isVerified: true,
    farmAddress: 'Nuwara Eliya Farm, Hanguranketha Road',
  });
  priya = await createFarmer({ name: 'Priya Kumarasinghe', location: 'Kandy' });
  nimal = await createFarmer({ name: 'Nimal Fernando' });
});
afterAll(closeTestDatabase);

describe('POST /api/seller/requirements', () => {
  it('publishes an open requirement', async () => {
    const response = await postRequirement(seller, carrots());

    expect(response.status).toBe(201);
    expect(response.body.requirement).toMatchObject({
      ...carrots(),
      sellerId: seller.id,
      status: 'OPEN',
      pendingRequests: 0,
      orderId: null,
      fulfillmentRequests: [],
    });
  });

  it('rejects missing fields and a deadline in the past', async () => {
    const empty = await postRequirement(seller, {});
    const pastDeadline = await postRequirement(seller, { ...carrots(), deadlineDate: dateFromToday(-1) });

    expect(empty.status).toBe(400);
    expect(Object.keys(empty.body.errors).sort()).toEqual([
      'category',
      'deadlineDate',
      'deliveryLocation',
      'maxBudgetPerKg',
      'productName',
      'quantityNeededKg',
    ]);
    expect(pastDeadline.status).toBe(400);
    expect(pastDeadline.body.errors).toHaveProperty('deadlineDate');
  });
});

describe('reviewing farmer fulfillment requests', () => {
  let requirementId: number;
  let sunilRequestId: number;
  let priyaRequestId: number;
  let nimalRequestId: number;

  beforeAll(async () => {
    requirementId = (await postRequirement(seller, carrots())).body.requirement.id;
    sunilRequestId = await createFulfillmentRequest(requirementId, sunil.id, 200, 105, 'Harvest ready in two days.');
    priyaRequestId = await createFulfillmentRequest(requirementId, priya.id, 150, 98);
    nimalRequestId = await createFulfillmentRequest(requirementId, nimal.id, 200, 120);
  });

  it('lists the requirement with how many requests are waiting', async () => {
    const mine = await request(app).get('/api/seller/requirements').set(authHeader(seller));
    const theirs = await request(app).get('/api/seller/requirements').set(authHeader(otherSeller));

    const requirement = mine.body.requirements.find((item: { id: number }) => item.id === requirementId);
    expect(requirement).toMatchObject({ productName: 'Carrots', status: 'OPEN', pendingRequests: 3 });
    expect(theirs.body.requirements).toEqual([]);
  });

  it('shows each request with the farmer and their pickup address', async () => {
    const response = await request(app).get(`/api/seller/requirements/${requirementId}`).set(authHeader(seller));

    expect(response.status).toBe(200);
    expect(response.body.requirement.fulfillmentRequests).toHaveLength(3);
    expect(response.body.requirement.fulfillmentRequests[0]).toMatchObject({
      id: sunilRequestId,
      offeredQuantityKg: 200,
      offeredPricePerKg: 105,
      notes: 'Harvest ready in two days.',
      status: 'PENDING',
      pickupAddress: 'Nuwara Eliya Farm, Hanguranketha Road',
      farmer: { name: 'Sunil Perera', location: 'Nuwara Eliya', isVerified: true },
    });
    // No farm address on file, so the farmer's town is used
    expect(response.body.requirement.fulfillmentRequests[1].pickupAddress).toBe('Kandy');
  });

  it("keeps another seller away from the requirement and its requests", async () => {
    const detail = await request(app).get(`/api/seller/requirements/${requirementId}`).set(authHeader(otherSeller));
    const accept = await decide(otherSeller, sunilRequestId, 'accept', { deliveryMethod: 'SELF_PICKUP' });
    const reject = await decide(otherSeller, sunilRequestId, 'reject');

    expect([detail.status, accept.status, reject.status]).toEqual([404, 404, 404]);
    expect((await requestStatuses(requirementId))[sunilRequestId]).toBe('PENDING');
  });

  it('rejects a single request and tells that farmer', async () => {
    const response = await decide(seller, nimalRequestId, 'reject');
    const notifications = await selectRows('SELECT category, title FROM notifications WHERE user_id = ?', [nimal.id]);

    expect(response.status).toBe(200);
    expect(response.body.requirement).toMatchObject({ status: 'OPEN', pendingRequests: 2 });
    expect(notifications).toEqual([{ category: 'fulfillment', title: 'Fulfillment Request Rejected' }]);
    expect((await decide(seller, nimalRequestId, 'reject')).status).toBe(409);
  });

  it('needs a delivery method to reserve the order', async () => {
    const response = await decide(seller, sunilRequestId, 'accept', {});

    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('deliveryMethod');
  });

  it('accepting a farmer reserves an order at the offered quantity and price, with payment held', async () => {
    const response = await decide(seller, sunilRequestId, 'accept', { deliveryMethod: 'SELF_PICKUP' });
    const payments = await selectRows('SELECT payment_type, payee_id, amount, status FROM payments WHERE order_id = ?', [
      response.body.order.id,
    ]);

    expect(response.status).toBe(201);
    expect(response.body.order).toMatchObject({
      requirementId,
      farmerId: sunil.id,
      productName: 'Carrots',
      quantityKg: 200,
      productPricePerKg: 105,
      totalProductAmount: 21000,
      status: 'PAYMENT_HELD',
      productPaymentStatus: 'HELD',
      pickupAddress: 'Nuwara Eliya Farm, Hanguranketha Road',
    });
    expect(payments).toEqual([{ payment_type: 'PRODUCT', payee_id: sunil.id, amount: 21000, status: 'HELD' }]);
  });

  it('closes the requirement and declines the other pending request', async () => {
    const response = await request(app).get(`/api/seller/requirements/${requirementId}`).set(authHeader(seller));

    expect(response.body.requirement).toMatchObject({
      status: 'FULFILLED',
      pendingRequests: 0,
      orderId: expect.any(Number),
    });
    expect(await requestStatuses(requirementId)).toEqual({
      [sunilRequestId]: 'ACCEPTED',
      [priyaRequestId]: 'REJECTED',
      [nimalRequestId]: 'REJECTED',
    });
  });

  it('notifies the accepted farmer and the farmer who was not selected', async () => {
    const accepted = await selectRows("SELECT title FROM notifications WHERE user_id = ? AND category = 'fulfillment'", [
      sunil.id,
    ]);
    const notSelected = await selectRows('SELECT title FROM notifications WHERE user_id = ?', [priya.id]);

    expect(accepted).toEqual([{ title: 'Fulfillment Request Accepted' }]);
    expect(notSelected).toEqual([{ title: 'Fulfillment Request Not Selected' }]);
  });

  it('cannot reserve the same requirement a second time', async () => {
    const response = await decide(seller, priyaRequestId, 'accept', { deliveryMethod: 'SELF_PICKUP' });
    const orders = await selectRows('SELECT id FROM orders WHERE requirement_id = ?', [requirementId]);

    expect(response.status).toBe(409);
    expect(orders).toHaveLength(1);
  });
});

describe('reserving with transportation', () => {
  it('opens a transport job from the farm to the requested delivery location', async () => {
    const requirementId = (await postRequirement(seller, carrots())).body.requirement.id;
    const requestId = await createFulfillmentRequest(requirementId, sunil.id, 180, 100);

    const response = await decide(seller, requestId, 'accept', {
      deliveryMethod: 'TRANSPORTATION',
      transport: { deliveryLocation: 'Colombo 07', requiredDate: dateFromToday(2), requiredTime: '10:00' },
    });
    const [job] = await selectRows('SELECT pickup_location, delivery_location, quantity_kg, status FROM transportation_jobs WHERE order_id = ?', [
      response.body.order.id,
    ]);

    expect(response.status).toBe(201);
    expect(response.body.order.transportPaymentStatus).toBe('PENDING');
    expect(job).toEqual({
      pickup_location: 'Nuwara Eliya Farm, Hanguranketha Road',
      delivery_location: 'Colombo 07',
      quantity_kg: 180,
      status: 'OPEN_FOR_BIDS',
    });
  });
});

describe('a requirement past its deadline', () => {
  it('is reported as expired and can no longer be reserved', async () => {
    const requirementId = (await postRequirement(seller, carrots())).body.requirement.id;
    const requestId = await createFulfillmentRequest(requirementId, priya.id, 200, 100);
    await selectRows('UPDATE requirements SET deadline_date = CURDATE() - INTERVAL 1 DAY WHERE id = ?', [requirementId]);

    const detail = await request(app).get(`/api/seller/requirements/${requirementId}`).set(authHeader(seller));
    const accept = await decide(seller, requestId, 'accept', { deliveryMethod: 'SELF_PICKUP' });

    expect(detail.body.requirement.status).toBe('EXPIRED');
    expect(accept.status).toBe(409);
    expect((await requestStatuses(requirementId))[requestId]).toBe('PENDING');
  });
});
