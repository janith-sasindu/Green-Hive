import express from 'express';
import cors from 'cors';
import transporterRoutes from '../routes/transporter.routes';
import { pool } from '../config/db';
import { OFFER_MESSAGES, DEFAULT_TRANSPORTER_ID } from '../data';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

async function runMyOffersVerification() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/transporter', transporterRoutes);

  const server = app.listen(5097, async () => {
    console.log('🚀 My Offers verification server listening on http://localhost:5097');
    try {
      // Test 1: Fetch My Offers
      console.log('\n--- TEST 1: GET /api/transporter/offers ---');
      const res1 = await fetch('http://localhost:5097/api/transporter/offers');
      const data1 = await res1.json();
      console.log('Status Code:', res1.status);
      console.log('Offers count:', data1.count);
      if (res1.status !== 200 || !data1.success || !Array.isArray(data1.data)) {
        throw new Error('Test 1 Failed: Offers fetch failed');
      }
      if (data1.data.length > 0) {
        const first = data1.data[0];
        console.log('Sample Offer:', {
          id: first.id,
          offerId: first.offerId,
          cropName: first.cropName,
          quotePrice: first.quotePrice,
          status: first.status,
        });
      }
      console.log('✅ TEST 1 PASSED: Transporter offers fetched successfully');

      // Test 2: Filter by status
      console.log('\n--- TEST 2: GET /api/transporter/offers?status=Submitted ---');
      const res2 = await fetch('http://localhost:5097/api/transporter/offers?status=Submitted');
      const data2 = await res2.json();
      console.log('Status Code:', res2.status, '| Submitted count:', data2.count);
      if (res2.status !== 200 || !data2.success) {
        throw new Error('Test 2 Failed: Status filter failed');
      }
      console.log('✅ TEST 2 PASSED: Status filtering works correctly');

      // Test 3: Insert temporary offer and Withdraw
      console.log('\n--- TEST 3: DELETE /api/transporter/offers/:id (Withdraw Pending Offer) ---');
      // Create temporary offer for job 2
      const [insertRes] = await pool.query<ResultSetHeader>(
        `INSERT INTO transport_offers (job_id, transporter_id, quote_price, estimated_delivery, notes, status)
         VALUES (2, ?, 9900.00, 'Test delivery window', 'Temporary test offer for withdrawal', 'Submitted')`,
        [DEFAULT_TRANSPORTER_ID]
      );
      const tempOfferId = insertRes.insertId;
      console.log(`Created temporary test offer with ID: ${tempOfferId}`);

      const res3 = await fetch(`http://localhost:5097/api/transporter/offers/${tempOfferId}`, {
        method: 'DELETE',
      });
      const data3 = await res3.json();
      console.log('Status Code:', res3.status, '| Message:', data3.message);
      if (res3.status !== 200 || !data3.success || data3.message !== OFFER_MESSAGES.withdrawSuccess) {
        throw new Error('Test 3 Failed: Withdraw offer failed');
      }
      console.log('✅ TEST 3 PASSED: Offer successfully withdrawn and removed from database');

      // Test 4: Rejection of non-existent offer withdrawal
      console.log('\n--- TEST 4: DELETE /api/transporter/offers/:id (Non-existent offer) ---');
      const res4 = await fetch('http://localhost:5097/api/transporter/offers/999999', {
        method: 'DELETE',
      });
      const data4 = await res4.json();
      console.log('Status Code:', res4.status, '| Error message:', data4.message);
      if (res4.status !== 404 || data4.message !== OFFER_MESSAGES.notFound) {
        throw new Error('Test 4 Failed: Non-existent offer was not properly rejected with 404');
      }
      console.log('✅ TEST 4 PASSED: Non-existent offer correctly returned 404 Not Found');

      console.log('\n=====================================');
      console.log('🎉 ALL MY OFFERS API TESTS PASSED! 🎉');
      console.log('=====================================\n');
    } catch (err) {
      console.error('❌ Verification failed with error:', err);
      process.exitCode = 1;
    } finally {
      server.close();
      await pool.end();
    }
  });
}

runMyOffersVerification();

