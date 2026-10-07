import request from 'supertest';
import { app } from '../src/app';
import { authHeader, createSeller, TestUser } from './helpers/fixtures';
import { closeTestDatabase, resetTestDatabase } from './helpers/testDatabase';

let seller: TestUser;
let otherSeller: TestUser;

beforeAll(async () => {
  await resetTestDatabase();
  seller = await createSeller({ name: 'Amara', businessName: 'Colombo Fresh Market', location: 'Colombo 07' });
  otherSeller = await createSeller();
});
afterAll(closeTestDatabase);

describe('GET /api/seller/profile', () => {
  it('returns the seller with their business details', async () => {
    const response = await request(app).get('/api/seller/profile').set(authHeader(seller));

    expect(response.status).toBe(200);
    expect(response.body.profile).toMatchObject({
      id: seller.id,
      name: 'Amara',
      businessName: 'Colombo Fresh Market',
      location: 'Colombo 07',
      address: 'Test Market, Colombo 07',
    });
  });
});

describe('PATCH /api/seller/profile', () => {
  it('changes only the fields that are sent', async () => {
    const response = await request(app)
      .patch('/api/seller/profile')
      .set(authHeader(seller))
      .send({ phone: '+94 77 555 0199', location: 'Kandy' });

    expect(response.status).toBe(200);
    expect(response.body.profile).toMatchObject({
      phone: '+94 77 555 0199',
      location: 'Kandy',
      name: 'Amara',
      businessName: 'Colombo Fresh Market',
    });
  });

  it('rejects an invalid phone number or email', async () => {
    const response = await request(app)
      .patch('/api/seller/profile')
      .set(authHeader(seller))
      .send({ phone: '12345', email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(Object.keys(response.body.errors).sort()).toEqual(['email', 'phone']);
  });

  it("rejects another account's email", async () => {
    const response = await request(app)
      .patch('/api/seller/profile')
      .set(authHeader(seller))
      .send({ email: otherSeller.email });

    expect(response.status).toBe(409);
  });
});
