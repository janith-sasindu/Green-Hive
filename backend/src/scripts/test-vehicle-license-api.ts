import express from 'express';
import cors from 'cors';
import transporterRoutes from '../routes/transporter.routes';
import { pool } from '../config/db';
import { VEHICLE_LICENSE_MESSAGES, DEFAULT_VEHICLE_LICENSE } from '../data';

async function runVehicleLicenseVerification() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/transporter', transporterRoutes);

  const server = app.listen(5099, async () => {
    console.log('🚀 Vehicle & License verification server listening on http://localhost:5099');

    try {
      // Test 1: Fetch Current Vehicle & License Details
      console.log('\n--- TEST 1: GET /api/transporter/vehicle-license ---');
      const res1 = await fetch('http://localhost:5099/api/transporter/vehicle-license');
      const data1 = await res1.json();
      console.log('Status Code:', res1.status, '| Message:', data1.message);
      console.log('Vehicle Specs:', {
        driverName: data1.data?.driverName,
        licenseNumber: data1.data?.licenseNumber,
        vehiclePlate: data1.data?.vehiclePlate,
        vehicleType: data1.data?.vehicleType,
        maxCapacityKg: data1.data?.maxCapacityKg,
      });

      if (res1.status !== 200 || !data1.success || !data1.data?.licenseNumber) {
        throw new Error('Test 1 Failed: Vehicle & License fetch failed');
      }
      console.log('✅ TEST 1 PASSED: Vehicle & License data fetched successfully');

      // Test 2: Update Specifications (PUT)
      console.log('\n--- TEST 2: PUT /api/transporter/vehicle-license ---');
      const updatePayload = {
        licenseNumber: 'B9988771',
        licenseExpiry: '15/05/2029',
        vehiclePlate: 'WP-ND-5544',
        vehicleType: 'Lorry - 5 Ton',
        vehicleMakeModel: 'Isuzu Forward FRR',
        maxCapacityKg: 5000,
      };

      const res2 = await fetch('http://localhost:5099/api/transporter/vehicle-license', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });
      const data2 = await res2.json();
      console.log('Status Code:', res2.status, '| Message:', data2.message);
      console.log('Updated Specs:', data2.data);

      if (
        res2.status !== 200 ||
        !data2.success ||
        data2.data?.licenseNumber !== updatePayload.licenseNumber ||
        data2.data?.vehiclePlate !== updatePayload.vehiclePlate ||
        data2.data?.maxCapacityKg !== updatePayload.maxCapacityKg
      ) {
        throw new Error('Test 2 Failed: Vehicle specifications update failed');
      }
      console.log('✅ TEST 2 PASSED: Vehicle specifications updated successfully');

      // Test 3: DB Verification & Profile Sync
      console.log('\n--- TEST 3: DB Verification for transporter_vehicle_license & transporter_profiles ---');
      const [rows]: any = await pool.query(
        'SELECT * FROM transporter_vehicle_license WHERE transporter_id = 7'
      );
      if (!rows || rows.length === 0 || rows[0].vehicle_plate !== updatePayload.vehiclePlate) {
        throw new Error('Test 3 Failed: DB persistence check failed for transporter_vehicle_license');
      }

      const [profRows]: any = await pool.query(
        'SELECT vehicle_type, vehicle_plate FROM transporter_profiles WHERE user_id = 7'
      );
      if (!profRows || profRows.length === 0 || profRows[0].vehicle_plate !== updatePayload.vehiclePlate) {
        throw new Error('Test 3 Failed: transporter_profiles sync check failed');
      }
      console.log('DB Record in transporter_vehicle_license:', {
        license: rows[0].license_number,
        plate: rows[0].vehicle_plate,
        type: rows[0].vehicle_type,
        model: rows[0].vehicle_make_model,
        capacity: rows[0].max_capacity_kg,
      });
      console.log('Synced Profile in transporter_profiles:', profRows[0]);
      console.log('✅ TEST 3 PASSED: Direct DB persistence and profile sync confirmed');

      // Test 4: Document Photo Upload
      console.log('\n--- TEST 4: POST /api/transporter/vehicle-license/documents ---');
      const docPayload = {
        target: 'licenseFront',
        uri: 'https://images.unsplash.com/photo-test-license-front-updated',
      };
      const res4 = await fetch('http://localhost:5099/api/transporter/vehicle-license/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docPayload),
      });
      const data4 = await res4.json();
      console.log('Status Code:', res4.status, '| Message:', data4.message);
      if (res4.status !== 200 || !data4.success || data4.data?.uri !== docPayload.uri) {
        throw new Error('Test 4 Failed: Document photo upload failed');
      }
      console.log('✅ TEST 4 PASSED: Document photo upload verified');

      // Test 5: Validation - Missing Required Specs
      console.log('\n--- TEST 5: Validation - Missing Required Specs ---');
      const res5 = await fetch('http://localhost:5099/api/transporter/vehicle-license', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehiclePlate: '' }),
      });
      const data5 = await res5.json();
      console.log('Status Code:', res5.status, '| Message:', data5.message);
      if (res5.status !== 400 || data5.message !== VEHICLE_LICENSE_MESSAGES.missingRequiredSpecs) {
        throw new Error('Test 5 Failed: Validation check failed for missing specs');
      }
      console.log('✅ TEST 5 PASSED: Missing specs validation confirmed');

      // Test 6: Validation - Invalid Document Target
      console.log('\n--- TEST 6: Validation - Invalid Document Target ---');
      const res6 = await fetch('http://localhost:5099/api/transporter/vehicle-license/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'invalidTarget', uri: 'https://example.com/photo.jpg' }),
      });
      const data6 = await res6.json();
      console.log('Status Code:', res6.status, '| Message:', data6.message);
      if (res6.status !== 400 || data6.message !== VEHICLE_LICENSE_MESSAGES.invalidTarget) {
        throw new Error('Test 6 Failed: Validation check failed for invalid target');
      }
      console.log('✅ TEST 6 PASSED: Invalid document target validation confirmed');

      // Clean up / Restore original default specs
      await pool.query(
        `UPDATE transporter_vehicle_license 
         SET license_number = ?, vehicle_plate = ?, vehicle_type = ?, vehicle_make_model = ?, max_capacity_kg = ?, license_front_photo_url = ?
         WHERE transporter_id = 7`,
        [
          DEFAULT_VEHICLE_LICENSE.licenseNumber,
          DEFAULT_VEHICLE_LICENSE.vehiclePlate,
          DEFAULT_VEHICLE_LICENSE.vehicleType,
          DEFAULT_VEHICLE_LICENSE.vehicleMakeModel,
          DEFAULT_VEHICLE_LICENSE.maxCapacityKg,
          DEFAULT_VEHICLE_LICENSE.licenseFrontPhotoUri,
        ]
      );
      await pool.query(
        `UPDATE transporter_profiles SET vehicle_type = ?, vehicle_plate = ? WHERE user_id = 7`,
        [DEFAULT_VEHICLE_LICENSE.vehicleType, DEFAULT_VEHICLE_LICENSE.vehiclePlate]
      );
      console.log('\n(Cleaned up: Restored original vehicle & license specifications)');

      console.log('\n🎉 ALL VEHICLE & LICENSE API TESTS PASSED SUCCESSFULLY!\n');
    } catch (err) {
      console.error('\n❌ Verification Failed:', err);
      process.exitCode = 1;
    } finally {
      server.close(() => {
        pool.end().then(() => {
          process.exit(process.exitCode || 0);
        });
      });
    }
  });
}

runVehicleLicenseVerification();

