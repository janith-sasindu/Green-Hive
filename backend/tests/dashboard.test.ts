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
  simulatePickupConfirmation,
  TestUser,
} from './helpers/fixtures';
import { closeTestDatabase, resetTestDatabase } from './helpers/testDatabase';

let seller: TestUser;
let otherSeller: TestUser;
let farmer: TestUser;
let transporter: TestUser;

const getDashboard = (user: TestUser) => request(app).get('/api/seller/dashboard').set(authHeader(user));

const placeOrder = async (deliveryMethod: 'SELF_PICKUP' | 'TRANSPORTATION') => {
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
};

beforeAll(async () => {
  await resetTestDatabase();
  seller = await createSeller();
  otherSeller = await createSeller();
  farmer = await createFarmer();
  transporter = await createTransporter();
});
afterAll(closeTestDatabase);

describe('GET /api/seller/dashboard', () => {
  it('is all zeros for a new seller', async () => {
    const response = await getDashboard(seller);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      stats: { activeOrders: 0, completedOrders: 0, inTransitOrders: 0, totalSpent: 0 },
      recentOrders: [],
      openRequirements: [],
      unreadNotifications: 0,
    });
  });

  it('follows orders through payment, transit and completion', async () => {
    const pickupOrder = await placeOrder('SELF_PICKUP');
    const transportOrder = await placeOrder('TRANSPORTATION');
    const afterOrdering = (await getDashboard(seller)).body.stats;

    // Approving a transporter adds the transport cost to what the seller has paid
    const offerId = await createTransportOffer(transportOrder.transportJobId, transporter.id, 1500);
    await request(app)
      .post(`/api/seller/transport-jobs/${transportOrder.transportJobId}/offers/${offerId}/approve`)
      .set(authHeader(seller));
    await simulatePickupConfirmation(transportOrder.id);
    const inTransit = (await getDashboard(seller)).body.stats;

    await request(app).post(`/api/seller/orders/${pickupOrder.id}/confirm-receipt`).set(authHeader(seller));
    await request(app).post(`/api/seller/orders/${transportOrder.id}/confirm-receipt`).set(authHeader(seller));
    const completed = (await getDashboard(seller)).body.stats;

    expect(afterOrdering).toEqual({ activeOrders: 2, completedOrders: 0, inTransitOrders: 0, totalSpent: 16000 });
    expect(inTransit).toEqual({ activeOrders: 2, completedOrders: 0, inTransitOrders: 1, totalSpent: 17500 });
    expect(completed).toEqual({ activeOrders: 0, completedOrders: 2, inTransitOrders: 0, totalSpent: 17500 });
  });

  it('includes the newest orders, open requirements and the unread count', async () => {
    await placeOrder('SELF_PICKUP');
    const newest = await placeOrder('SELF_PICKUP');
    await request(app)
      .post('/api/seller/requirements')
      .set(authHeader(seller))
      .send({
        productName: 'Green Chillies',
        category: 'Spices',
        quantityNeededKg: 50,
        maxBudgetPerKg: 250,
        deliveryLocation: 'Colombo 07',
        deadlineDate: dateFromToday(10),
      });

    const response = await getDashboard(seller);

    expect(response.body.recentOrders).toHaveLength(3);
    expect(response.body.recentOrders[0].id).toBe(newest.id);
    expect(response.body.openRequirements).toEqual([
      expect.objectContaining({ productName: 'Green Chillies', status: 'OPEN', pendingRequests: 0 }),
    ]);
    expect(response.body.unreadNotifications).toBeGreaterThan(0);
  });

  it("is not affected by another seller's activity", async () => {
    const response = await getDashboard(otherSeller);

    expect(response.body.stats).toEqual({ activeOrders: 0, completedOrders: 0, inTransitOrders: 0, totalSpent: 0 });
    expect(response.body.recentOrders).toEqual([]);
  });
});
