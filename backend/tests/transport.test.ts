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
  TestUser,
} from './helpers/fixtures';
import { closeTestDatabase, resetTestDatabase } from './helpers/testDatabase';

let seller: TestUser;
let otherSeller: TestUser;
let ruwan: TestUser;
let lanka: TestUser;
let hill: TestUser;
let orderId: number;
let jobId: number;
let ruwanOfferId: number;
let lankaOfferId: number;
let hillOfferId: number;

const offerUrl = (job: number, offer: number, action: 'approve' | 'reject') =>
  `/api/seller/transport-jobs/${job}/offers/${offer}/${action}`;

/** Places an order that needs transportation and returns its order and job ids. */
async function placeTransportOrder(buyer: TestUser, advertisementId: number) {
  const response = await request(app)
    .post('/api/seller/orders')
    .set(authHeader(buyer))
    .send({
      advertisementId,
      quantityKg: 150,
      deliveryMethod: 'TRANSPORTATION',
      transport: {
        deliveryLocation: 'Colombo Fresh Market, Colombo 03',
        requiredDate: dateFromToday(1),
        requiredTime: '06:00',
      },
    });
  return { orderId: response.body.order.id as number, jobId: response.body.order.transportJobId as number };
}

beforeAll(async () => {
  await resetTestDatabase();
  seller = await createSeller();
  otherSeller = await createSeller();
  const farmer = await createFarmer({ farmAddress: 'Dambulla Agricultural Zone, Plot 14' });
  ruwan = await createTransporter({ name: 'Ruwan Transport', rating: 4.7, vehicleType: 'Isuzu Elf lorry' });
  lanka = await createTransporter({ name: 'Lanka Express Logistics' });
  hill = await createTransporter({ name: 'Hill Country Movers' });

  const advertisementId = await createAdvertisement(farmer.id, { productName: 'Ripe Tomatoes', pricePerKg: 90 });
  ({ orderId, jobId } = await placeTransportOrder(seller, advertisementId));
});
afterAll(closeTestDatabase);

describe('GET /api/seller/transport-jobs', () => {
  it('shows a new job as open with no offers yet', async () => {
    const response = await request(app).get('/api/seller/transport-jobs').set(authHeader(seller));

    expect(response.status).toBe(200);
    expect(response.body.transportJobs).toHaveLength(1);
    expect(response.body.transportJobs[0]).toMatchObject({
      id: jobId,
      jobNumber: expect.stringMatching(/^GH-T\d+$/),
      orderId,
      productName: 'Ripe Tomatoes',
      pickupLocation: 'Dambulla Agricultural Zone, Plot 14',
      deliveryLocation: 'Colombo Fresh Market, Colombo 03',
      quantityKg: 150,
      requiredDate: dateFromToday(1),
      requiredTime: '06:00',
      status: 'OPEN_FOR_BIDS',
      offers: [],
    });
  });

  it('lists submitted offers cheapest first with the transporter details', async () => {
    lankaOfferId = await createTransportOffer(jobId, lanka.id, 2400, '3.5 hours');
    ruwanOfferId = await createTransportOffer(jobId, ruwan.id, 2000, '4 hours');
    hillOfferId = await createTransportOffer(jobId, hill.id, 2600);

    const response = await request(app).get(`/api/seller/transport-jobs/${jobId}`).set(authHeader(seller));

    expect(response.body.transportJob.offers.map((offer: { proposedCost: number }) => offer.proposedCost)).toEqual([
      2000, 2400, 2600,
    ]);
    expect(response.body.transportJob.offers[0]).toMatchObject({
      id: ruwanOfferId,
      status: 'PENDING',
      estimatedDeliveryTime: '4 hours',
      transporter: { name: 'Ruwan Transport', vehicle: 'Isuzu Elf lorry', rating: 4.7, completedJobs: 0 },
    });
  });

  it("hides the job from sellers who don't own the order", async () => {
    const list = await request(app).get('/api/seller/transport-jobs').set(authHeader(otherSeller));
    const detail = await request(app).get(`/api/seller/transport-jobs/${jobId}`).set(authHeader(otherSeller));
    const approve = await request(app).post(offerUrl(jobId, ruwanOfferId, 'approve')).set(authHeader(otherSeller));

    expect(list.body.transportJobs).toEqual([]);
    expect(detail.status).toBe(404);
    expect(approve.status).toBe(404);
  });
});

describe('rejecting an offer', () => {
  it('declines that offer only and tells the transporter', async () => {
    const response = await request(app).post(offerUrl(jobId, hillOfferId, 'reject')).set(authHeader(seller));
    const statuses = Object.fromEntries(
      response.body.transportJob.offers.map((offer: { id: number; status: string }) => [offer.id, offer.status]),
    );
    const notifications = await selectRows('SELECT title FROM notifications WHERE user_id = ?', [hill.id]);

    expect(response.status).toBe(200);
    expect(response.body.transportJob.status).toBe('OPEN_FOR_BIDS');
    expect(statuses).toEqual({ [hillOfferId]: 'REJECTED', [ruwanOfferId]: 'PENDING', [lankaOfferId]: 'PENDING' });
    expect(notifications).toEqual([{ title: 'Transportation Offer Rejected' }]);
  });

  it('cannot reject the same offer twice', async () => {
    const response = await request(app).post(offerUrl(jobId, hillOfferId, 'reject')).set(authHeader(seller));

    expect(response.status).toBe(409);
  });
});

describe('approving an offer', () => {
  it('does not accept an offer that belongs to a different job', async () => {
    const farmer = await createFarmer();
    const other = await placeTransportOrder(seller, await createAdvertisement(farmer.id));
    const foreignOfferId = await createTransportOffer(other.jobId, ruwan.id, 1800);

    const response = await request(app).post(offerUrl(jobId, foreignOfferId, 'approve')).set(authHeader(seller));

    expect(response.status).toBe(404);
  });

  it('assigns the transporter and declines the remaining offers', async () => {
    const response = await request(app).post(offerUrl(jobId, ruwanOfferId, 'approve')).set(authHeader(seller));
    const statuses = Object.fromEntries(
      response.body.transportJob.offers.map((offer: { id: number; status: string }) => [offer.id, offer.status]),
    );

    expect(response.status).toBe(200);
    expect(response.body.transportJob).toMatchObject({
      status: 'TRANSPORTER_ASSIGNED',
      assignedTransporterId: ruwan.id,
      agreedTransportCost: 2000,
    });
    expect(statuses).toEqual({ [ruwanOfferId]: 'ACCEPTED', [lankaOfferId]: 'REJECTED', [hillOfferId]: 'REJECTED' });
  });

  it('holds the agreed cost as a separate transportation payment', async () => {
    const payments = await selectRows(
      'SELECT payment_type, payer_id, payee_id, amount, status FROM payments WHERE order_id = ? ORDER BY id',
      [orderId],
    );

    expect(payments).toEqual([
      { payment_type: 'PRODUCT', payer_id: seller.id, payee_id: expect.any(Number), amount: 13500, status: 'HELD' },
      { payment_type: 'TRANSPORTATION', payer_id: seller.id, payee_id: ruwan.id, amount: 2000, status: 'HELD' },
    ]);
  });

  it('shows the cost and both held payments on the order, with its job', async () => {
    const response = await request(app).get(`/api/seller/orders/${orderId}`).set(authHeader(seller));

    expect(response.body.order).toMatchObject({
      status: 'PAYMENT_HELD',
      productPaymentStatus: 'HELD',
      transportPaymentStatus: 'HELD',
      transportCost: 2000,
    });
    expect(response.body.transportJob).toMatchObject({ id: jobId, status: 'TRANSPORTER_ASSIGNED' });
  });

  it('notifies the chosen transporter and the one that was not selected', async () => {
    const chosen = await selectRows('SELECT title FROM notifications WHERE user_id = ?', [ruwan.id]);
    const notSelected = await selectRows('SELECT title FROM notifications WHERE user_id = ?', [lanka.id]);

    expect(chosen).toEqual([{ title: 'Transportation Offer Approved' }]);
    expect(notSelected).toEqual([{ title: 'Transportation Offer Not Selected' }]);
  });

  it('cannot select a second transporter or hold the cost twice', async () => {
    const response = await request(app).post(offerUrl(jobId, lankaOfferId, 'approve')).set(authHeader(seller));
    const payments = await selectRows("SELECT id FROM payments WHERE order_id = ? AND payment_type = 'TRANSPORTATION'", [
      orderId,
    ]);

    expect(response.status).toBe(409);
    expect(payments).toHaveLength(1);
  });
});
