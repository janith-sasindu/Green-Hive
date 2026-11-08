import express from 'express';
import cors from 'cors';
import transporterRoutes from '../routes/transporter.routes';
import { pool } from '../config/db';
import { PROFILE_VALIDATION_MESSAGES } from '../data';

async function runEditProfileVerification() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/transporter', transporterRoutes);

  const server = app.listen(5096, async () => {
    console.log('🚀 Edit Profile verification server listening on http://localhost:5096');
    try {
      // Test 1: Fetch Profile
      console.log('\n--- TEST 1: GET /api/transporter/profile ---');
      const res1 = await fetch('http://localhost:5096/api/transporter/profile');
      const data1 = await res1.json();
      console.log('Status Code:', res1.status);
      console.log('Current Name:', data1.data?.name);
      console.log('Current Vehicle:', data1.data?.vehicleType, '| Plate:', data1.data?.vehiclePlate);
      if (res1.status !== 200 || !data1.success) {
        throw new Error('Test 1 Failed: Profile fetch failed');
      }
      console.log('✅ TEST 1 PASSED: Profile fetched successfully');

      // Test 2: Update Profile with Complete Payload
      console.log('\n--- TEST 2: PUT /api/transporter/profile (Complete Update) ---');
      const updatePayload = {
        name: 'Nimal Bandara',
        phone: '+94 76 890 1234',
        email: 'nimal.bandara@transport.lk',
        baseLocation: 'Kurunegala',
        vehicleType: 'Lorry - 3 Ton',
        vehiclePlate: 'WP-LH-4821',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
      };

      const res2 = await fetch('http://localhost:5096/api/transporter/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });
      const data2 = await res2.json();
      console.log('Status Code:', res2.status, '| Message:', data2.message);
      console.log('Updated Profile:', data2.data);

      if (
        res2.status !== 200 ||
        !data2.success ||
        data2.data?.name !== updatePayload.name ||
        data2.data?.vehiclePlate !== updatePayload.vehiclePlate
      ) {
        throw new Error('Test 2 Failed: Profile update failed');
      }
      console.log('✅ TEST 2 PASSED: Profile updated successfully');

      // Test 3: Validation - Missing Name
      console.log('\n--- TEST 3: PUT /api/transporter/profile (Validation - Missing Name) ---');
      const res3 = await fetch('http://localhost:5096/api/transporter/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', phone: '+94 76 890 1234' }),
      });
      const data3 = await res3.json();
      console.log('Status Code:', res3.status, '| Error message:', data3.message);
      if (res3.status !== 400 || data3.message !== PROFILE_VALIDATION_MESSAGES.missingName) {
        throw new Error('Test 3 Failed: Missing name validation did not trigger');
      }
      console.log('✅ TEST 3 PASSED: Missing name correctly rejected');

      // Test 4: Validation - Invalid Email
      console.log('\n--- TEST 4: PUT /api/transporter/profile (Validation - Invalid Email) ---');
      const res4 = await fetch('http://localhost:5096/api/transporter/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Nimal Bandara', email: 'invalid-email-string' }),
      });
      const data4 = await res4.json();
      console.log('Status Code:', res4.status, '| Error message:', data4.message);
      if (res4.status !== 400 || data4.message !== PROFILE_VALIDATION_MESSAGES.invalidEmail) {
        throw new Error('Test 4 Failed: Invalid email validation did not trigger');
      }
      console.log('✅ TEST 4 PASSED: Invalid email correctly rejected');

      // Reset transporter 7 back to clean baseline values
      await pool.query(
        `UPDATE users SET name = 'Nimal Bandara', phone = '+94 76 345 6789', email = 'ruwan@transport.lk', location = 'Colombo' WHERE id = 7`
      );
      await pool.query(
        `UPDATE transporter_profiles SET vehicle_type = 'Lorry - 3 Ton', vehicle_plate = 'WP-LH-4821', avatar_url = NULL WHERE user_id = 7`
      );
      console.log('\n🔄 Baseline test profile data restored for Transporter 7.');

      console.log('\n=========================================');
      console.log('🎉 ALL EDIT PROFILE API TESTS PASSED! 🎉');
      console.log('=========================================\n');

      server.close();
      process.exit(0);
    } catch (err) {
      console.error('\n❌ Verification Failed:', err);
      server.close();
      process.exit(1);
    }
  });
}

runEditProfileVerification();

