/**
 * End-to-end check of the seller API against the configured database.
 * Start the server first (npm run dev), then: npm run test:seller
 * It creates its own rows and removes them (and restores stock) when it finishes.
 */
import { pool } from '../config/db';

const BASE = process.env.SELLER_API_URL || `http://localhost:${process.env.PORT || 5000}/api/seller`;

async function call(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: (await res.json()) as any };
}

let failures = 0;
const check = (label: string, ok: boolean, detail?: unknown) => {
  console.log(`${ok ? '✅' : '❌'} ${label}${ok ? '' : ` -> ${JSON.stringify(detail)}`}`);
  if (!ok) failures++;
};

async function main() {
  const [adRows] = await pool.query(`SELECT id, quantity_available, status FROM selling_ads WHERE status = 'active' AND quantity_available >= 20 ORDER BY id LIMIT 1`);
  const ad = (adRows as any[])[0];
  if (!ad) throw new Error('No active advertisement with enough stock to test with.');
  const created = { orders: [] as number[], requirements: [] as number[] };

  try {
    const state0 = (await call('GET', '/state')).json.data.state;
    check('GET /state returns profile, products and orders', !!state0.profile.name && state0.products.length > 0 && Array.isArray(state0.orders), state0.profile);

    const req = await call('POST', '/requirements', {
      productName: 'Test Beans', category: 'Vegetables', quantityNeededKg: 50, maxBudgetPerKg: 200,
      deliveryLocation: 'Colombo', description: 'api test', deadlineDate: '2030-01-01',
    });
    created.requirements.push(req.json.data?.requirementId);
    check('POST /requirements creates a requirement', req.json.success && req.json.data.state.requirements.some((r: any) => r.id === req.json.data.requirementId), req.json);
    const bad = await call('POST', '/requirements', { productName: '', quantityNeededKg: 0 });
    check('POST /requirements rejects invalid input', bad.status === 400, bad.json);

    const order = await call('POST', '/orders', {
      source: { kind: 'product', productId: ad.id, quantityKg: 10 }, deliveryMethod: 'TRANSPORTATION',
      transport: { deliveryLocation: 'Colombo 07', requiredDate: '2030-01-02', requiredTime: '08:00 AM' },
    });
    const orderId = order.json.data?.orderId;
    created.orders.push(orderId);
    const placed = order.json.data?.state.orders.find((o: any) => o.id === orderId);
    check('POST /orders holds the payment and opens a transport job', placed?.status === 'PAYMENT_HELD' && placed.productPaymentStatus === 'HELD' && placed.transportPaymentStatus === 'PENDING' && !!placed.transportJobId, order.json);
    const stock = (await pool.query(`SELECT quantity_available FROM selling_ads WHERE id = ?`, [ad.id]))[0] as any[];
    check('stock is reduced', Number(stock[0].quantity_available) === Number(ad.quantity_available) - 10, stock);
    const tooMany = await call('POST', '/orders', { source: { kind: 'product', productId: ad.id, quantityKg: 99999999 }, deliveryMethod: 'SELF_PICKUP' });
    check('over-ordering is rejected', tooMany.status === 409, tooMany.json);

    const jobId = placed.transportJobId;
    const [offer] = (await pool.query(`INSERT INTO transport_offers (job_id, transporter_id, quote_price, estimated_delivery, status) VALUES (?, 7, 1800, '4 hours', 'Submitted')`, [jobId])) as any;
    const [offer2] = (await pool.query(`INSERT INTO transport_offers (job_id, transporter_id, quote_price, estimated_delivery, status) VALUES (?, 8, 2200, '5 hours', 'Submitted')`, [jobId])) as any;
    const approve = await call('POST', `/transport-jobs/${jobId}/offers/${offer.insertId}/approve`);
    const job = approve.json.data?.state.transportJobs.find((j: any) => j.id === jobId);
    check('approving an offer assigns the transporter and holds the fee', job?.status === 'TRANSPORTER_ASSIGNED' && job.agreedTransportCost === 1800 && job.offers.find((o: any) => o.id === offer2.insertId)?.status === 'REJECTED', approve.json);
    const early = await call('POST', `/orders/${orderId}/confirm-receipt`);
    check('receipt cannot be confirmed before pickup', early.status === 409, early.json);

    await pool.query(`UPDATE orders SET order_status = 'In Transit' WHERE id = ?`, [orderId]);
    const done = await call('POST', `/orders/${orderId}/confirm-receipt`);
    const finished = done.json.data?.state.orders.find((o: any) => o.id === orderId);
    check('confirming receipt completes the order and releases payments', finished?.status === 'COMPLETED' && finished.transportPaymentStatus === 'RELEASED', done.json);

    const notes = done.json.data?.state.notifications ?? [];
    check('notifications are recorded', notes.length >= 2, notes);
    const read = await call('POST', `/notifications/${notes[0].id}/read`);
    check('marking a notification read works', read.json.data.state.notifications.find((n: any) => n.id === notes[0].id).isRead === true, read.json);
    const settings = await call('PUT', '/notification-settings', { ...state0.notificationSettings, promotions: true });
    check('notification settings save', settings.json.data.state.notificationSettings.promotions === true, settings.json);
    await call('PUT', '/notification-settings', state0.notificationSettings);
  } finally {
    for (const id of created.orders.filter(Boolean)) {
      await pool.query(`DELETE FROM transport_offers WHERE job_id IN (SELECT id FROM transport_jobs WHERE order_id = ?)`, [id]);
      await pool.query(`DELETE FROM transport_jobs WHERE order_id = ?`, [id]);
      await pool.query(`DELETE FROM payments WHERE order_id = ?`, [id]);
      await pool.query(`DELETE FROM orders WHERE id = ?`, [id]);
    }
    for (const id of created.requirements.filter(Boolean)) await pool.query(`DELETE FROM requirement_ads WHERE id = ?`, [id]);
    await pool.query(`DELETE FROM seller_notifications WHERE seller_id = 5 AND (message LIKE '%test%' OR created_at >= NOW() - INTERVAL 10 MINUTE)`);
    await pool.query(`UPDATE selling_ads SET quantity_available = ?, status = ? WHERE id = ?`, [ad.quantity_available, ad.status, ad.id]);
    await pool.end();
  }
  console.log(failures ? `\n${failures} check(s) failed` : '\nAll seller API checks passed');
  process.exit(failures ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
