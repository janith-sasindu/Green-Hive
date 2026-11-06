import express from 'express';
import cors from 'cors';
import transporterRoutes from '../routes/transporter.routes';
import { pool } from '../config/db';

async function runActiveJobLifecycleTest() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/transporter', transporterRoutes);

  const server = app.listen(5098, async () => {
    console.log('🚀 Active Job test server listening on http://localhost:5098');
    try {
      // Test 1: Fetch active job for transporter
      console.log('\n--- TEST 1: GET /api/transporter/jobs/active ---');
      const res1 = await fetch('http://localhost:5098/api/transporter/jobs/active');
      const data1 = await res1.json();
      console.log('Status Code:', res1.status);
      console.log('Active Job Data:', data1);
      if (!data1.success || !data1.data) {
        throw new Error('Test 1 Failed: Expected active job data for transporter');
      }
      console.log('Active Trip ID:', data1.data.id);
      console.log('Cargo:', data1.data.cropName, '·', data1.data.weight);
      console.log('Pickup:', data1.data.pickup, '| Farmer:', data1.data.farmerName);
      console.log('Dropoff:', data1.data.dropoff, '| Seller:', data1.data.sellerName);
      console.log('Trip Earnings:', data1.data.price);
      console.log('✅ TEST 1 PASSED');

      // Test 2: Status update to In Transit
      console.log('\n--- TEST 2: PATCH /api/transporter/jobs/1/status (In Transit) ---');
      const res2 = await fetch(`http://localhost:5098/api/transporter/jobs/${data1.data.dbId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'In Transit' }),
      });
      const data2 = await res2.json();
      console.log('Status Code:', res2.status, '| Response:', data2);
      if (res2.status !== 200 || !data2.success) {
        throw new Error('Test 2 Failed: Status update to In Transit failed');
      }
      console.log('✅ TEST 2 PASSED');

      // Test 3: Status validation with mobile equivalent "In Progress"
      console.log('\n--- TEST 3: PATCH /api/transporter/jobs/1/status (In Progress mapped to In Transit) ---');
      const res3 = await fetch(`http://localhost:5098/api/transporter/jobs/${data1.data.dbId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'In Progress' }),
      });
      const data3 = await res3.json();
      console.log('Status Code:', res3.status, '| Response:', data3);
      if (res3.status !== 200 || !data3.success) {
        throw new Error('Test 3 Failed: In Progress mapping failed');
      }
      console.log('✅ TEST 3 PASSED');

      console.log('\n🎉 ALL ACTIVE JOB BACKEND TESTS PASSED SUCCESSFULLY!\n');
    } catch (err: any) {
      console.error('❌ Active job verification failed:', err.message);
      process.exitCode = 1;
    } finally {
      server.close(() => process.exit(process.exitCode || 0));
    }
  });
}

runActiveJobLifecycleTest();

