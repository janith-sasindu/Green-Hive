import express from 'express';
import cors from 'cors';
import transporterRoutes from '../routes/transporter.routes';
import { pool } from '../config/db';

async function runNotificationsVerification() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/transporter', transporterRoutes);

  const server = app.listen(5098, async () => {
    console.log('🚀 Notifications verification server listening on http://localhost:5098');
    try {
      // Step 0: Ensure test data exists with at least one unread item
      await pool.query(
        'UPDATE transporter_notifications SET is_read = 0 WHERE id IN (1, 2) AND transporter_id = 7'
      );

      // Test 1: Fetch Notifications
      console.log('\n--- TEST 1: GET /api/transporter/notifications ---');
      const res1 = await fetch('http://localhost:5098/api/transporter/notifications');
      const data1 = await res1.json();
      console.log('Status Code:', res1.status);
      console.log('Total notifications:', data1.data?.length);
      console.log('Unread count:', data1.unreadCount);
      console.log('Sample notification:', data1.data?.[0]);

      if (res1.status !== 200 || !data1.success || !Array.isArray(data1.data) || data1.data.length === 0) {
        throw new Error('Test 1 Failed: Notifications retrieval failed');
      }
      console.log('✅ TEST 1 PASSED: Notifications retrieved successfully');

      // Test 2: Mark Single Notification as Read
      console.log('\n--- TEST 2: PATCH /api/transporter/notifications/1/read ---');
      const res2 = await fetch('http://localhost:5098/api/transporter/notifications/1/read', {
        method: 'PATCH',
      });
      const data2 = await res2.json();
      console.log('Status Code:', res2.status, '| Response:', data2.message);
      if (res2.status !== 200 || !data2.success) {
        throw new Error('Test 2 Failed: Mark single notification read failed');
      }
      console.log('✅ TEST 2 PASSED: Single notification marked read');

      // Test 3: Mark All Notifications as Read
      console.log('\n--- TEST 3: PATCH /api/transporter/notifications/read-all ---');
      const res3 = await fetch('http://localhost:5098/api/transporter/notifications/read-all', {
        method: 'PATCH',
      });
      const data3 = await res3.json();
      console.log('Status Code:', res3.status, '| Response:', data3.message);
      if (res3.status !== 200 || !data3.success) {
        throw new Error('Test 3 Failed: Mark all notifications read failed');
      }
      console.log('✅ TEST 3 PASSED: All notifications marked read');

      // Test 4: Verify unread count is now 0
      console.log('\n--- TEST 4: GET /api/transporter/notifications (Verify all read) ---');
      const res4 = await fetch('http://localhost:5098/api/transporter/notifications');
      const data4 = await res4.json();
      console.log('Unread count after mark all read:', data4.unreadCount);
      if (data4.unreadCount !== 0) {
        throw new Error('Test 4 Failed: Expected 0 unread notifications');
      }
      console.log('✅ TEST 4 PASSED: Verified 0 unread notifications');

      // Reset item 1 and 2 to unread for demo / mobile experience
      await pool.query(
        'UPDATE transporter_notifications SET is_read = 0 WHERE id IN (1, 2) AND transporter_id = 7'
      );
      console.log('\n🔄 Reset notifications 1 & 2 to unread for active mobile testing.');

      console.log('\n=========================================');
      console.log('🎉 ALL NOTIFICATIONS API TESTS PASSED SUCCESSFULLY! 🎉');
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

runNotificationsVerification();

