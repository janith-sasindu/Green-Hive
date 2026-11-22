import express from 'express';
import cors from 'cors';
import transporterRoutes from '../routes/transporter.routes';
import { pool } from '../config/db';
import { OFFER_SUBMITTED_CONSTANTS } from '../data';

async function runOfferSubmittedVerification() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/transporter', transporterRoutes);

  const server = app.listen(5098, async () => {
    console.log('🚀 Offer Submitted verification server listening on http://localhost:5098');
    try {
      // Test 1: Fetch Latest Submitted Offer
      console.log('\n--- TEST 1: GET /api/transporter/offers/latest ---');
      const res1 = await fetch('http://localhost:5098/api/transporter/offers/latest');
      const data1 = await res1.json();
      console.log('Status Code:', res1.status);
      console.log('Latest Offer:', data1.data ? {
        id: data1.data.id,
        offerId: data1.data.offerId,
        cropName: data1.data.cropName,
        quotePrice: data1.data.quotePrice,
        statusLabel: data1.data.statusLabel,
      } : 'No offer found');

      if (res1.status !== 200 || !data1.success) {
        throw new Error('Test 1 Failed: Latest offer fetch failed');
      }
      console.log('✅ TEST 1 PASSED: Latest submitted offer fetched successfully');

      // Test 2: Fetch by specific Job ID
      console.log('\n--- TEST 2: GET /api/transporter/offers/latest?jobId=2 ---');
      const res2 = await fetch('http://localhost:5098/api/transporter/offers/latest?jobId=2');
      const data2 = await res2.json();
      console.log('Status Code:', res2.status);
      if (res2.status !== 200 || !data2.success) {
        throw new Error('Test 2 Failed: Job-specific offer fetch failed');
      }
      console.log('✅ TEST 2 PASSED: Job-specific offer query works');

      // Test 3: Fetch for non-existent job
      console.log('\n--- TEST 3: GET /api/transporter/offers/latest?jobId=999999 ---');
      const res3 = await fetch('http://localhost:5098/api/transporter/offers/latest?jobId=999999');
      const data3 = await res3.json();
      console.log('Status Code:', res3.status, '| Data:', data3.data, '| Message:', data3.message);
      if (res3.status !== 200 || !data3.success || data3.data !== null || data3.message !== OFFER_SUBMITTED_CONSTANTS.noOfferFound) {
        throw new Error('Test 3 Failed: Non-existent job query did not return null');
      }
      console.log('✅ TEST 3 PASSED: Non-existent job offer handled gracefully with null');

      console.log('\n=============================================');
      console.log('🎉 ALL OFFER SUBMITTED API TESTS PASSED! 🎉');
      console.log('=============================================\n');
    } catch (err) {
      console.error('❌ Verification failed with error:', err);
      process.exitCode = 1;
    } finally {
      server.close();
      await pool.end();
    }
  });
}

runOfferSubmittedVerification();

