import request from 'supertest';
import { app } from '../src/app';
import { authHeader, createAdvertisement, createFarmer, createSeller, selectRows, TestUser } from './helpers/fixtures';
import { closeTestDatabase, resetTestDatabase } from './helpers/testDatabase';

let seller: TestUser;
let otherSeller: TestUser;
let farmer: TestUser;
let advertisementId: number;

const placeOrder = () =>
  request(app)
    .post('/api/seller/orders')
    .set(authHeader(seller))
    .send({ advertisementId, quantityKg: 10, deliveryMethod: 'SELF_PICKUP' });

const getNotifications = (user: TestUser) => request(app).get('/api/seller/notifications').set(authHeader(user));

const allOn = { orders: true, payments: true, transportation: true, fulfillment: true, promotions: true, security: true };

beforeAll(async () => {
  await resetTestDatabase();
  seller = await createSeller();
  otherSeller = await createSeller();
  farmer = await createFarmer();
  advertisementId = await createAdvertisement(farmer.id, { quantityKg: 500 });
});
afterAll(closeTestDatabase);

describe('GET /api/seller/notifications', () => {
  it('starts empty', async () => {
    const response = await getNotifications(seller);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ notifications: [], unreadCount: 0 });
  });

  it('lists a new notification as unread with a link to its order', async () => {
    const order = await placeOrder();

    const response = await getNotifications(seller);

    expect(response.body.unreadCount).toBe(1);
    expect(response.body.notifications).toEqual([
      {
        id: expect.any(Number),
        category: 'payments',
        title: 'Payment Held Securely',
        message: expect.stringContaining(order.body.order.orderNumber),
        createdAt: expect.any(String),
        isRead: false,
        link: { type: 'ORDER', id: order.body.order.id },
      },
    ]);
  });

  it("does not show another user's notifications", async () => {
    const response = await getNotifications(otherSeller);

    expect(response.body).toEqual({ notifications: [], unreadCount: 0 });
  });
});

describe('marking notifications as read', () => {
  it('marks one notification read', async () => {
    const [first] = (await getNotifications(seller)).body.notifications;

    const response = await request(app).patch(`/api/seller/notifications/${first.id}/read`).set(authHeader(seller));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ unreadCount: 0 });
  });

  it("cannot mark someone else's notification", async () => {
    await placeOrder();
    const [newest] = (await getNotifications(seller)).body.notifications;

    const response = await request(app)
      .patch(`/api/seller/notifications/${newest.id}/read`)
      .set(authHeader(otherSeller));

    expect(response.status).toBe(404);
    expect((await getNotifications(seller)).body.unreadCount).toBe(1);
  });

  it('marks everything read at once', async () => {
    await placeOrder();

    const response = await request(app).post('/api/seller/notifications/read-all').set(authHeader(seller));
    const after = await getNotifications(seller);

    expect(response.body).toEqual({ unreadCount: 0 });
    expect(after.body.notifications.every((item: { isRead: boolean }) => item.isRead)).toBe(true);
  });
});

describe('notification settings', () => {
  it('defaults to everything on except promotions', async () => {
    const response = await request(app).get('/api/seller/notification-settings').set(authHeader(seller));

    expect(response.body.settings).toEqual({ ...allOn, promotions: false });
  });

  it('requires every category to be true or false', async () => {
    const response = await request(app)
      .put('/api/seller/notification-settings')
      .set(authHeader(seller))
      .send({ orders: 'yes', payments: true });

    expect(response.status).toBe(400);
    expect(Object.keys(response.body.errors).sort()).toEqual([
      'fulfillment',
      'orders',
      'promotions',
      'security',
      'transportation',
    ]);
  });

  it('saves the preferences', async () => {
    const settings = { ...allOn, payments: false };

    const saved = await request(app).put('/api/seller/notification-settings').set(authHeader(seller)).send(settings);
    const loaded = await request(app).get('/api/seller/notification-settings').set(authHeader(seller));

    expect(saved.status).toBe(200);
    expect(loaded.body.settings).toEqual(settings);
  });

  it('stops recording a category that is switched off, for that user only', async () => {
    const before = (await getNotifications(seller)).body.notifications.length;
    const farmerBefore = await selectRows('SELECT id FROM notifications WHERE user_id = ?', [farmer.id]);

    await placeOrder();

    const farmerAfter = await selectRows('SELECT id FROM notifications WHERE user_id = ?', [farmer.id]);
    expect((await getNotifications(seller)).body.notifications).toHaveLength(before);
    expect(farmerAfter).toHaveLength(farmerBefore.length + 1);
  });
});
