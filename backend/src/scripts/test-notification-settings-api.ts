import express from 'express';
import cors from 'cors';
import transporterRoutes from '../routes/transporter.routes';
import { pool } from '../config/db';

async function runNotificationSettingsVerification() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/transporter', transporterRoutes);

  const server = app.listen(5099, async () => {
    console.log('🚀 Notification settings verification server listening on http://localhost:5099');
    try {
      // Step 0: Ensure base test settings exist in DB
      await pool.query(`
        INSERT INTO transporter_notification_settings (
          transporter_id, new_jobs_push, current_job_updates_push, offer_status_push, payment_push, sound_and_vibration
        ) VALUES (7, 1, 1, 1, 1, 1)
        ON DUPLICATE KEY UPDATE
          new_jobs_push = 1, current_job_updates_push = 1, offer_status_push = 1, payment_push = 1, sound_and_vibration = 1
      `);

      // Test 1: Fetch Notification Settings
      console.log('\n--- TEST 1: GET /api/transporter/notification-settings ---');
      const res1 = await fetch('http://localhost:5099/api/transporter/notification-settings');
      const data1 = await res1.json();
      console.log('Status Code:', res1.status);
      console.log('Fetched settings:', data1.data);

      if (
        res1.status !== 200 ||
        !data1.success ||
        typeof data1.data?.newJobsPush !== 'boolean' ||
        typeof data1.data?.soundAndVibration !== 'boolean'
      ) {
        throw new Error('Test 1 Failed: Notification settings retrieval failed');
      }
      console.log('✅ TEST 1 PASSED: Notification settings retrieved successfully');

      // Test 2: Update Notification Settings
      console.log('\n--- TEST 2: PUT /api/transporter/notification-settings ---');
      const updatedPayload = {
        newJobsPush: true,
        currentJobUpdatesPush: true,
        offerStatusPush: false,
        paymentPush: true,
        soundAndVibration: false,
      };

      const res2 = await fetch('http://localhost:5099/api/transporter/notification-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });
      const data2 = await res2.json();
      console.log('Status Code:', res2.status, '| Response message:', data2.message);
      console.log('Updated settings response:', data2.data);

      if (
        res2.status !== 200 ||
        !data2.success ||
        data2.data?.offerStatusPush !== false ||
        data2.data?.soundAndVibration !== false
      ) {
        throw new Error('Test 2 Failed: Notification settings update failed');
      }
      console.log('✅ TEST 2 PASSED: Notification settings updated successfully');

      // Test 3: Verify Persistence with subsequent GET
      console.log('\n--- TEST 3: GET /api/transporter/notification-settings (Verify Persistence) ---');
      const res3 = await fetch('http://localhost:5099/api/transporter/notification-settings');
      const data3 = await res3.json();
      console.log('Persisted settings in DB:', data3.data);

      if (
        data3.data?.offerStatusPush !== false ||
        data3.data?.soundAndVibration !== false ||
        data3.data?.newJobsPush !== true
      ) {
        throw new Error('Test 3 Failed: Settings were not properly persisted in database');
      }
      console.log('✅ TEST 3 PASSED: Persistence verified in database');

      // Reset settings back to all true for active user defaults
      await pool.query(`
        UPDATE transporter_notification_settings
        SET new_jobs_push = 1, current_job_updates_push = 1, offer_status_push = 1, payment_push = 1, sound_and_vibration = 1
        WHERE transporter_id = 7
      `);
      console.log('\n🔄 Reset settings for Transporter 7 back to active defaults (all true).');

      console.log('\n=========================================');
      console.log('🎉 ALL NOTIFICATION SETTINGS TESTS PASSED! 🎉');
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

runNotificationSettingsVerification();

