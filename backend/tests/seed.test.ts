import request from 'supertest';
import { app } from '../src/app';
import { DEMO_SELLER_EMAIL, seedDemoData } from '../src/database/seed';
import { closeTestDatabase, resetTestDatabase } from './helpers/testDatabase';

const password = 'a-password-only-for-this-test';
let token: string;

const get = (path: string) => request(app).get(path).set('Authorization', `Bearer ${token}`);

beforeAll(async () => {
  await resetTestDatabase();
  await seedDemoData(password);
  const login = await request(app).post('/api/auth/login').send({ email: DEMO_SELLER_EMAIL, password });
  token = login.body.token;
});
afterAll(closeTestDatabase);

describe('demo data', () => {
  it('lets the demo seller sign in', () => {
    expect(token).toEqual(expect.any(String));
  });

  it('gives the dashboard one order in transit and one waiting for a transporter', async () => {
    const response = await get('/api/seller/dashboard');

    // 8,000 + 13,500 for the products and 1,500 for the approved transporter
    expect(response.body.stats).toEqual({ activeOrders: 2, completedOrders: 0, inTransitOrders: 1, totalSpent: 23000 });
    expect(response.body.unreadNotifications).toBe(1);
    expect(response.body.openRequirements).toHaveLength(2);
  });

  it('fills the marketplace, transport jobs and requirement requests', async () => {
    const products = await get('/api/seller/products');
    const jobs = await get('/api/seller/transport-jobs');
    const requirements = await get('/api/seller/requirements');

    const openJob = jobs.body.transportJobs.find((job: { status: string }) => job.status === 'OPEN_FOR_BIDS');
    const carrots = requirements.body.requirements.find((item: { productName: string }) => item.productName === 'Carrots');

    expect(products.body.total).toBe(8);
    expect(jobs.body.transportJobs).toHaveLength(2);
    expect(openJob.offers.map((offer: { proposedCost: number }) => offer.proposedCost)).toEqual([2000, 2400]);
    expect(carrots.pendingRequests).toBe(2);
  });

  it('is not added twice', async () => {
    await expect(seedDemoData(password)).rejects.toThrow('already has users');
  });
});
