import express from 'express';
import cors from 'cors';
import transporterRoutes from '../routes/transporter.routes';
import { CONFIRM_PICKUP_MESSAGES } from '../data/transporterData';

async function runConfirmPickupApiTests() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/transporter', transporterRoutes);

  const PORT = 5096;
  const server = app.listen(PORT, async () => {
    console.log(`🚀 Confirm Pickup test server listening on http://localhost:${PORT}`);
    try {
      // 1. Fetch current active job for transporter
      console.log('\n--- TEST 1: GET /api/transporter/jobs/active ---');
      const res1 = await fetch(`http://localhost:${PORT}/api/transporter/jobs/active`);
      const data1 = await res1.json();
      console.log('Status Code:', res1.status);
      console.log('Active Job:', data1.data?.id, '| Cargo:', data1.data?.cropName, '| Pickup:', data1.data?.pickup);
      if (!data1.success || !data1.data) {
        throw new Error('Test 1 Failed: Active job not found for transporter 7');
      }
      const targetJobId = data1.data.dbId;
      console.log('✅ TEST 1 PASSED: Found active job with DB ID:', targetJobId);

      // 2. Test PATCH /api/transporter/jobs/:id/pickup
      console.log('\n--- TEST 2: PATCH /api/transporter/jobs/:id/pickup ---');
      const pickupPayload = {
        timestamp: 'Nov 9, 2026 · 07:15 AM',
        notes: 'Cargo safely loaded and inspected at farm. Tarpaulin secured.',
        proofPhotoUri: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
      };
      const res2 = await fetch(`http://localhost:${PORT}/api/transporter/jobs/${targetJobId}/pickup`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pickupPayload),
      });
      const data2 = await res2.json();
      console.log('Status Code:', res2.status);
      console.log('Response Message:', data2.message);
      console.log('Updated Status:', data2.data?.status, '| rawStatus:', data2.data?.rawStatus);
      console.log('Saved Pickup Timestamp:', data2.data?.pickupTimestamp);
      console.log('Saved Notes:', data2.data?.pickupNotes);
      console.log('Saved Proof Photo:', data2.data?.proofPhotoUri);

      if (res2.status !== 200 || !data2.success) {
        throw new Error(`Test 2 Failed: ${data2.message || 'Confirm pickup failed'}`);
      }
      if (data2.message !== CONFIRM_PICKUP_MESSAGES.success) {
        throw new Error(`Test 2 Failed: Message mismatch, expected '${CONFIRM_PICKUP_MESSAGES.success}'`);
      }
      if (data2.data.rawStatus !== 'In Transit') {
        throw new Error(`Test 2 Failed: Expected rawStatus 'In Transit', got '${data2.data.rawStatus}'`);
      }
      console.log('✅ TEST 2 PASSED: Confirm pickup endpoint succeeded');

      // 3. Test verification by re-fetching active job
      console.log('\n--- TEST 3: GET /api/transporter/jobs/active (Verify Persistence) ---');
      const res3 = await fetch(`http://localhost:${PORT}/api/transporter/jobs/active`);
      const data3 = await res3.json();
      console.log('Persisted Active Job Status:', data3.data?.status, '| Raw:', data3.data?.rawStatus);
      console.log('Persisted Pickup Timestamp:', data3.data?.pickupTimestamp);
      console.log('Persisted Pickup Notes:', data3.data?.pickupNotes);
      if (!data3.success || data3.data.rawStatus !== 'In Transit') {
        throw new Error('Test 3 Failed: Active job not in In Transit status after confirmation');
      }
      console.log('✅ TEST 3 PASSED: Pickup data persisted in database');

      // 4. Test POST alternative /api/transporter/jobs/:id/pickup
      console.log('\n--- TEST 4: POST /api/transporter/jobs/:id/pickup ---');
      const res4 = await fetch(`http://localhost:${PORT}/api/transporter/jobs/${targetJobId}/pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: 'Nov 9, 2026 · 07:20 AM',
          notes: 'Updated pickup verification notes.',
        }),
      });
      const data4 = await res4.json();
      console.log('Status Code:', res4.status, '| Success:', data4.success);
      if (res4.status !== 200 || !data4.success) {
        throw new Error('Test 4 Failed: POST /pickup endpoint failed');
      }
      console.log('✅ TEST 4 PASSED: POST route works seamlessly');

      // 5. Test Non-existent job edge case
      console.log('\n--- TEST 5: Non-existent job 404 validation ---');
      const res5 = await fetch(`http://localhost:${PORT}/api/transporter/jobs/999999/pickup`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pickupPayload),
      });
      const data5 = await res5.json();
      console.log('Status Code:', res5.status, '| Message:', data5.message);
      if (res5.status !== 404 || data5.message !== CONFIRM_PICKUP_MESSAGES.jobNotFound) {
        throw new Error('Test 5 Failed: Expected 404 jobNotFound response');
      }
      console.log('✅ TEST 5 PASSED: 404 validation confirmed');

      console.log('\n🎉 ALL CONFIRM PICKUP BACKEND TESTS PASSED SUCCESSFULLY!\n');
    } catch (err: any) {
      console.error('❌ Confirm pickup test error:', err.message);
      process.exitCode = 1;
    } finally {
      server.close(() => process.exit(process.exitCode || 0));
    }
  });
}

runConfirmPickupApiTests();

