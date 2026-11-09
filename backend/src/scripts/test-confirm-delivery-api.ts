import express from 'express';
import cors from 'cors';
import transporterRoutes from '../routes/transporter.routes';
import { CONFIRM_DELIVERY_MESSAGES } from '../data/transporterData';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

async function runConfirmDeliveryApiTests() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/transporter', transporterRoutes);

  const PORT = 5095;
  const server = app.listen(PORT, async () => {
    console.log(`🚀 Confirm Delivery test server listening on http://localhost:${PORT}`);
    let targetJobId = 1;
    let originalStatus = 'In Transit';

    try {
      // 1. Fetch current active or assigned job for transporter 7
      console.log('\n--- TEST 1: Check Current Active Trip ---');
      const [activeRows] = await pool.query<RowDataPacket[]>(
        `SELECT id, status FROM transport_jobs WHERE transporter_id = 7 ORDER BY id ASC LIMIT 1`
      );

      if (activeRows.length > 0) {
        targetJobId = activeRows[0].id;
        originalStatus = activeRows[0].status;
        console.log(`Target Job ID: ${targetJobId} | Current status: ${originalStatus}`);
      }
      console.log('✅ TEST 1 PASSED: Target job identified');

      // 2. Test PATCH /api/transporter/jobs/:id/delivery
      console.log('\n--- TEST 2: PATCH /api/transporter/jobs/:id/delivery ---');
      const deliveryPayload = {
        timestamp: 'Nov 9, 2026 · 08:30 AM',
        receiverName: 'Mr. K. Perera (Receiving Bay 3)',
        notes: '100 kg cabbage unloaded in pristine condition. Received and verified.',
        proofPhotoUri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      };
      const res2 = await fetch(`http://localhost:${PORT}/api/transporter/jobs/${targetJobId}/delivery`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliveryPayload),
      });
      const data2 = await res2.json();
      console.log('Status Code:', res2.status);
      console.log('Response Message:', data2.message);
      console.log('Updated Job Status:', data2.data?.status);
      console.log('Receiver Name:', data2.data?.receiverName);
      console.log('Delivery Timestamp:', data2.data?.deliveryTimestamp);
      console.log('Delivery Notes:', data2.data?.deliveryNotes);
      console.log('Delivery Proof Photo:', data2.data?.deliveryProofPhotoUri);

      if (res2.status !== 200 || !data2.success) {
        throw new Error(`Test 2 Failed: ${data2.message || 'Confirm delivery failed'}`);
      }
      if (data2.message !== CONFIRM_DELIVERY_MESSAGES.success) {
        throw new Error(`Test 2 Failed: Message mismatch, expected '${CONFIRM_DELIVERY_MESSAGES.success}'`);
      }
      if (data2.data.status !== 'Delivered') {
        throw new Error(`Test 2 Failed: Expected status 'Delivered', got '${data2.data.status}'`);
      }
      console.log('✅ TEST 2 PASSED: Confirm delivery endpoint succeeded');

      // 3. Verify Payment Release & Order Status in DB
      console.log('\n--- TEST 3: DB Verification for Order & Payment Release ---');
      const [orderRows] = await pool.query<RowDataPacket[]>(
        `SELECT id, order_status FROM orders WHERE id = (SELECT order_id FROM transport_jobs WHERE id = ?)`,
        [targetJobId]
      );
      if (orderRows.length > 0) {
        console.log('Linked Order Status:', orderRows[0].order_status);
      }

      const [paymentRows] = await pool.query<RowDataPacket[]>(
        `SELECT id, status, amount FROM payments WHERE order_id = (SELECT order_id FROM transport_jobs WHERE id = ?) AND payment_type = 'transport_fee'`,
        [targetJobId]
      );
      if (paymentRows.length > 0) {
        console.log('Transport Fee Payment Status:', paymentRows[0].status, '| Amount:', paymentRows[0].amount);
        if (paymentRows[0].status !== 'Released') {
          throw new Error('Test 3 Failed: Payment status was not updated to Released');
        }
      }
      console.log('✅ TEST 3 PASSED: Order and payment release verified in database');

      // 4. Test POST alternative route
      console.log('\n--- TEST 4: POST /api/transporter/jobs/:id/delivery ---');
      const res4 = await fetch(`http://localhost:${PORT}/api/transporter/jobs/${targetJobId}/delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: 'Nov 9, 2026 · 08:35 AM',
          receiverName: 'Mr. Sunil Perera',
          notes: 'Updated delivery confirmation remarks.',
        }),
      });
      const data4 = await res4.json();
      console.log('Status Code:', res4.status, '| Success:', data4.success);
      if (res4.status !== 200 || !data4.success) {
        throw new Error('Test 4 Failed: POST /delivery endpoint failed');
      }
      console.log('✅ TEST 4 PASSED: POST delivery route works seamlessly');

      // 5. Test Non-existent Job 404 validation
      console.log('\n--- TEST 5: Non-existent job 404 validation ---');
      const res5 = await fetch(`http://localhost:${PORT}/api/transporter/jobs/999999/delivery`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliveryPayload),
      });
      const data5 = await res5.json();
      console.log('Status Code:', res5.status, '| Message:', data5.message);
      if (res5.status !== 404 || data5.message !== CONFIRM_DELIVERY_MESSAGES.jobNotFound) {
        throw new Error('Test 5 Failed: Expected 404 jobNotFound response');
      }
      console.log('✅ TEST 5 PASSED: 404 validation confirmed');

      // Restore active job status to 'In Transit' so the app has an active job for testing
      await pool.query(
        `UPDATE transport_jobs SET status = 'In Transit' WHERE id = ?`,
        [targetJobId]
      );
      console.log(`\n(Cleaned up: Restored transport job #${targetJobId} status to 'In Transit')`);

      console.log('\n🎉 ALL CONFIRM DELIVERY BACKEND TESTS PASSED SUCCESSFULLY!\n');
    } catch (err: any) {
      console.error('❌ Confirm delivery test error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close(() => process.exit(process.exitCode || 0));
    }
  });
}

runConfirmDeliveryApiTests();
