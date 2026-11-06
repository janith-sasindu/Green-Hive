import express from 'express';
import cors from 'cors';
import transporterRoutes from '../routes/transporter.routes';
import { pool } from '../config/db';

async function runApiVerification() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/transporter', transporterRoutes);

  const server = app.listen(5099, async () => {
    console.log('🚀 Verification test server listening on http://localhost:5099');
    try {
      // Test 1: Fetch all available jobs
      console.log('\n--- TEST 1: GET /api/transporter/jobs/available ---');
      const res1 = await fetch('http://localhost:5099/api/transporter/jobs/available');
      const data1 = await res1.json();
      console.log('Status:', res1.status);
      console.log('Total Available Jobs:', data1.totalCount);
      if (!data1.success || data1.totalCount === 0) {
        throw new Error('Test 1 Failed: Available jobs list is empty or unsuccessful');
      }
      console.log('Sample Job 0:', {
        id: data1.data[0].id,
        crop: data1.data[0].cropName,
        weight: data1.data[0].weight,
        price: data1.data[0].price,
        pickup: data1.data[0].pickup,
        dropoff: data1.data[0].dropoff,
      });
      console.log('✅ TEST 1 PASSED');

      // Test 2: Search filtering
      console.log('\n--- TEST 2: GET /api/transporter/jobs/available?search=Tomatoes ---');
      const res2 = await fetch('http://localhost:5099/api/transporter/jobs/available?search=Tomatoes');
      const data2 = await res2.json();
      console.log('Status:', res2.status, '| Matched jobs:', data2.totalCount);
      if (!data2.success || data2.totalCount === 0) {
        throw new Error('Test 2 Failed: Search for Tomatoes returned 0 results');
      }
      console.log('Matched Crop:', data2.data[0].cropName);
      console.log('✅ TEST 2 PASSED');

      // Test 3: Get job by ID
      const targetJobId = data1.data[0].dbId;
      console.log(`\n--- TEST 3: GET /api/transporter/jobs/${targetJobId} ---`);
      const res3 = await fetch(`http://localhost:5099/api/transporter/jobs/${targetJobId}`);
      const data3 = await res3.json();
      console.log('Status:', res3.status);
      if (!data3.success || !data3.data) {
        throw new Error('Test 3 Failed: Single job retrieval failed');
      }
      console.log('Job Farmer Contact:', data3.data.farmerName, data3.data.farmerPhone);
      console.log('✅ TEST 3 PASSED');

      // Test 4: Submit Offer
      console.log(`\n--- TEST 4: POST /api/transporter/jobs/${targetJobId}/offers ---`);
      // Delete any previous test offer on this job by transporter 7 first so test is idempotent
      await pool.query('DELETE FROM transport_offers WHERE job_id = ? AND transporter_id = ?', [targetJobId, 7]);

      const res4 = await fetch(`http://localhost:5099/api/transporter/jobs/${targetJobId}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotePrice: 8500,
          estimatedDelivery: 'Tomorrow afternoon before 4 PM',
          notes: 'Standard refrigerated truck ready for immediate dispatch',
        }),
      });
      const data4 = await res4.json();
      console.log('Status:', res4.status, '| Response:', data4);
      if (res4.status !== 201 || !data4.success) {
        throw new Error('Test 4 Failed: Offer submission failed');
      }
      console.log('✅ TEST 4 PASSED');

      console.log('\n🎉 ALL AVAILABLE JOBS BACKEND TESTS PASSED SUCCESSFULLY!\n');
    } catch (err: any) {
      console.error('❌ Verification failed:', err.message);
      process.exitCode = 1;
    } finally {
      server.close(() => process.exit(process.exitCode || 0));
    }
  });
}

runApiVerification();

