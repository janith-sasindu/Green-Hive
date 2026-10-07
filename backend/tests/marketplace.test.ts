import request from 'supertest';
import { app } from '../src/app';
import { authHeader, createAdvertisement, createFarmer, createSeller, TestUser } from './helpers/fixtures';
import { closeTestDatabase, resetTestDatabase } from './helpers/testDatabase';

let seller: TestUser;
let cabbageId: number;
let soldOutId: number;

const productNames = (body: { products: { productName: string }[] }): string[] =>
  body.products.map((product) => product.productName);

beforeAll(async () => {
  await resetTestDatabase();
  seller = await createSeller();

  const sunil = await createFarmer({
    name: 'Sunil Perera',
    location: 'Nuwara Eliya',
    isVerified: true,
    rating: 4.8,
    farmAddress: 'Nuwara Eliya Farm, Hanguranketha Road',
  });
  const priya = await createFarmer({ name: 'Priya Kumarasinghe', location: 'Kandy' });

  cabbageId = await createAdvertisement(sunil.id, { productName: 'Fresh Cabbage', pricePerKg: 80, quantityKg: 500 });
  await createAdvertisement(sunil.id, { productName: 'Organic Carrots', pricePerKg: 120, quantityKg: 300 });
  await createAdvertisement(priya.id, {
    productName: 'Green Beans',
    pricePerKg: 180,
    quantityKg: 200,
    location: 'Kandy',
  });
  await createAdvertisement(priya.id, {
    productName: 'Banana Bunch',
    category: 'Fruits',
    pricePerKg: 60,
    quantityKg: 800,
    location: 'Kandy',
  });

  // None of these can be bought, so the listing must leave them out
  soldOutId = await createAdvertisement(sunil.id, { productName: 'Sold Out Leeks', status: 'SOLD_OUT' });
  await createAdvertisement(sunil.id, { productName: 'Cancelled Beetroot', status: 'CANCELLED' });
  await createAdvertisement(sunil.id, { productName: 'Expired Pumpkin', availableForDays: -1 });
  await createAdvertisement(sunil.id, { productName: 'Empty Radish', quantityKg: 0 });
});
afterAll(closeTestDatabase);

describe('GET /api/seller/products', () => {
  it('lists only advertisements that can be bought, verified farmers first', async () => {
    const response = await request(app).get('/api/seller/products').set(authHeader(seller));

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(4);
    expect(productNames(response.body).sort()).toEqual([
      'Banana Bunch',
      'Fresh Cabbage',
      'Green Beans',
      'Organic Carrots',
    ]);
    expect(response.body.products[0].farmer.isVerified).toBe(true);
  });

  it('returns the farmer and prices as numbers', async () => {
    const response = await request(app).get('/api/seller/products?search=cabbage').set(authHeader(seller));

    expect(response.body.products).toHaveLength(1);
    expect(response.body.products[0]).toMatchObject({
      productName: 'Fresh Cabbage',
      unitPriceLkr: 80,
      quantityAvailableKg: 500,
      pickupAddress: 'Nuwara Eliya Farm, Hanguranketha Road',
      farmer: { name: 'Sunil Perera', location: 'Nuwara Eliya', rating: 4.8, isVerified: true },
    });
    expect(response.body.products[0].availabilityEndDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('searches by farmer name and filters by category, location and verification', async () => {
    const byFarmer = await request(app).get('/api/seller/products?search=priya').set(authHeader(seller));
    const fruits = await request(app).get('/api/seller/products?category=Fruits').set(authHeader(seller));
    const kandy = await request(app).get('/api/seller/products?location=Kandy').set(authHeader(seller));
    const verified = await request(app).get('/api/seller/products?verifiedOnly=true').set(authHeader(seller));

    expect(productNames(byFarmer.body).sort()).toEqual(['Banana Bunch', 'Green Beans']);
    expect(productNames(fruits.body)).toEqual(['Banana Bunch']);
    expect(productNames(kandy.body).sort()).toEqual(['Banana Bunch', 'Green Beans']);
    expect(productNames(verified.body).sort()).toEqual(['Fresh Cabbage', 'Organic Carrots']);
  });

  it('sorts by price and pages the results', async () => {
    const cheapest = await request(app).get('/api/seller/products?sort=priceLow&limit=2').set(authHeader(seller));
    const nextPage = await request(app)
      .get('/api/seller/products?sort=priceLow&limit=2&offset=2')
      .set(authHeader(seller));

    expect(productNames(cheapest.body)).toEqual(['Banana Bunch', 'Fresh Cabbage']);
    expect(productNames(nextPage.body)).toEqual(['Organic Carrots', 'Green Beans']);
    expect(cheapest.body.total).toBe(4);
  });

  it('treats % and _ in a search as plain text', async () => {
    const response = await request(app).get('/api/seller/products?search=%25').set(authHeader(seller));

    expect(response.body.products).toEqual([]);
  });
});

describe('GET /api/seller/products/:productId', () => {
  it('returns one product', async () => {
    const response = await request(app).get(`/api/seller/products/${cabbageId}`).set(authHeader(seller));

    expect(response.status).toBe(200);
    expect(response.body.product).toMatchObject({ id: cabbageId, productName: 'Fresh Cabbage', status: 'ACTIVE' });
  });

  it('still shows a sold out product so the app can explain why it cannot be ordered', async () => {
    const response = await request(app).get(`/api/seller/products/${soldOutId}`).set(authHeader(seller));

    expect(response.status).toBe(200);
    expect(response.body.product.status).toBe('SOLD_OUT');
  });

  it('answers 404 for an unknown product and 400 for a malformed id', async () => {
    const unknown = await request(app).get('/api/seller/products/999999').set(authHeader(seller));
    const malformed = await request(app).get('/api/seller/products/abc').set(authHeader(seller));

    expect(unknown.status).toBe(404);
    expect(malformed.status).toBe(400);
  });
});
