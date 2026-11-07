import express from 'express';
import cors from 'cors';
import transporterRoutes from '../routes/transporter.routes';

async function runProfileVerification() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/transporter', transporterRoutes);

  const server = app.listen(5097, async () => {
    console.log('🚀 Profile verification server listening on http://localhost:5097');
    try {
      // Test 1: Fetch Profile
      console.log('\n--- TEST 1: GET /api/transporter/profile ---');
      const res1 = await fetch('http://localhost:5097/api/transporter/profile');
      const data1 = await res1.json();
      console.log('Status Code:', res1.status);
      console.log('Driver Name:', data1.data?.name);
      console.log('Vehicle:', data1.data?.vehicleType, '| Plate:', data1.data?.vehiclePlate);
      console.log('Performance Rating:', data1.data?.rating, '⭐');
      console.log('On-Time Delivery Rate:', data1.data?.onTimeDeliveryRate);
      if (res1.status !== 200 || !data1.success) {
        throw new Error('Test 1 Failed: Profile retrieval failed');
      }
      console.log('✅ TEST 1 PASSED');

      // Test 2: Update Profile
      console.log('\n--- TEST 2: PUT /api/transporter/profile ---');
      const res2 = await fetch('http://localhost:5097/api/transporter/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Nimal Bandara',
          phone: '+94 78 678 9012',
          email: 'nimal@logistics.lk',
          baseLocation: 'Kurunegala',
          vehicleType: 'Lorry - 3 Ton',
          vehiclePlate: 'WP-LH-4821',
        }),
      });
      const data2 = await res2.json();
      console.log('Status Code:', res2.status, '| Response:', data2.message);
      if (res2.status !== 200 || !data2.success) {
        throw new Error('Test 2 Failed: Profile update failed');
      }
      console.log('✅ TEST 2 PASSED');

      // Test 3: Upload Avatar
      console.log('\n--- TEST 3: POST /api/transporter/profile/avatar ---');
      const testAvatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400';
      const res3 = await fetch('http://localhost:5097/api/transporter/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: testAvatarUrl }),
      });
      const data3 = await res3.json();
      console.log('Status Code:', res3.status, '| Response:', data3.message);
      if (res3.status !== 200 || !data3.success) {
        throw new Error('Test 3 Failed: Avatar update failed');
      }
      console.log('✅ TEST 3 PASSED');

      // Test 4: Remove Avatar
      console.log('\n--- TEST 4: DELETE /api/transporter/profile/avatar ---');
      const res4 = await fetch('http://localhost:5097/api/transporter/profile/avatar', {
        method: 'DELETE',
      });
      const data4 = await res4.json();
      console.log('Status Code:', res4.status, '| Response:', data4.message);
      if (res4.status !== 200 || !data4.success) {
        throw new Error('Test 4 Failed: Avatar removal failed');
      }
      console.log('✅ TEST 4 PASSED');

      // Test 5: Fetch Bank Details
      console.log('\n--- TEST 5: GET /api/transporter/bank-details ---');
      const res5 = await fetch('http://localhost:5097/api/transporter/bank-details');
      const data5 = await res5.json();
      console.log('Status Code:', res5.status);
      console.log('Bank:', data5.data?.bankName);
      console.log('Account Number:', data5.data?.accountNumber);
      console.log('Holder:', data5.data?.accountHolderName);
      if (res5.status !== 200 || !data5.success) {
        throw new Error('Test 5 Failed: Bank details retrieval failed');
      }
      console.log('✅ TEST 5 PASSED');

      // Test 6: Update Bank Details
      console.log('\n--- TEST 6: PUT /api/transporter/bank-details ---');
      const res6 = await fetch('http://localhost:5097/api/transporter/bank-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountHolderName: 'Nimal Bandara',
          bankName: 'Commercial Bank of Ceylon',
          branchName: 'Kurunegala City Branch',
          branchCode: '034',
          accountNumber: '8004529104',
          accountType: 'Savings Account',
        }),
      });
      const data6 = await res6.json();
      console.log('Status Code:', res6.status, '| Response:', data6.message);
      if (res6.status !== 200 || !data6.success) {
        throw new Error('Test 6 Failed: Bank details update failed');
      }
      console.log('✅ TEST 6 PASSED');

      console.log('\n🎉 ALL PROFILE & BANK BACKEND TESTS PASSED SUCCESSFULLY!\n');
    } catch (err: any) {
      console.error('❌ Profile verification failed:', err.message);
      process.exitCode = 1;
    } finally {
      server.close(() => process.exit(process.exitCode || 0));
    }
  });
}

runProfileVerification();

