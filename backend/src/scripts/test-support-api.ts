import express from 'express';
import cors from 'cors';
import transporterRoutes from '../routes/transporter.routes';
import { pool } from '../config/db';
import { SUPPORT_MESSAGES } from '../data';

async function runSupportApiVerification() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/transporter', transporterRoutes);

  const server = app.listen(5098, async () => {
    console.log('🚀 Help & Support verification server listening on http://localhost:5098');
    let createdTicketCode: string | null = null;

    try {
      // Test 1: Fetch Existing Support Tickets
      console.log('\n--- TEST 1: GET /api/transporter/support/tickets ---');
      const res1 = await fetch('http://localhost:5098/api/transporter/support/tickets');
      const data1 = await res1.json();
      console.log('Status Code:', res1.status, '| Message:', data1.message);
      console.log(`Found ${data1.data?.length || 0} support tickets`);
      if (res1.status !== 200 || !data1.success || !Array.isArray(data1.data)) {
        throw new Error('Test 1 Failed: Could not fetch support tickets');
      }
      if (data1.data.length > 0) {
        console.log('Sample ticket:', {
          id: data1.data[0].id,
          category: data1.data[0].category,
          subject: data1.data[0].subject,
          status: data1.data[0].status,
        });
      }
      console.log('✅ TEST 1 PASSED: Support tickets retrieved successfully');

      // Test 2: Submit a New Support Ticket
      console.log('\n--- TEST 2: POST /api/transporter/support/tickets ---');
      const newTicketPayload = {
        category: 'Trip & Delivery Issue',
        subject: 'Farm gate access delay on Job #TR-1',
        message: 'Farmer delayed cargo loading by 40 minutes due to ongoing field packaging.',
        relatedJobId: '#TR-1',
        imageUri: 'https://images.unsplash.com/photo-1542838132-92c53300491e',
      };

      const res2 = await fetch('http://localhost:5098/api/transporter/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicketPayload),
      });
      const data2 = await res2.json();
      console.log('Status Code:', res2.status, '| Message:', data2.message);
      console.log('Created Ticket:', data2.data);

      if (
        res2.status !== 201 ||
        !data2.success ||
        !data2.data?.id ||
        data2.data?.subject !== newTicketPayload.subject ||
        data2.data?.status !== 'Pending'
      ) {
        throw new Error('Test 2 Failed: Ticket submission failed');
      }
      createdTicketCode = data2.data.id;
      console.log('✅ TEST 2 PASSED: Support ticket created successfully with ID:', createdTicketCode);

      // Test 3: DB Verification for the Created Ticket
      console.log('\n--- TEST 3: DB Verification for transporter_support_tickets ---');
      const [rows]: any = await pool.query(
        'SELECT * FROM transporter_support_tickets WHERE ticket_code = ?',
        [createdTicketCode]
      );
      if (!rows || rows.length === 0 || rows[0].subject !== newTicketPayload.subject) {
        throw new Error('Test 3 Failed: DB persistence check failed');
      }
      console.log('DB Record:', {
        id: rows[0].id,
        code: rows[0].ticket_code,
        category: rows[0].category,
        subject: rows[0].subject,
        status: rows[0].status,
        related_job: rows[0].related_job_code,
      });
      console.log('✅ TEST 3 PASSED: Direct DB persistence verified');

      // Test 4: Validation - Missing Subject
      console.log('\n--- TEST 4: Validation - Missing Subject ---');
      const res4 = await fetch('http://localhost:5098/api/transporter/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'Payment & Wallet',
          subject: '',
          message: 'My payout is pending',
        }),
      });
      const data4 = await res4.json();
      console.log('Status Code:', res4.status, '| Message:', data4.message);
      if (res4.status !== 400 || data4.message !== SUPPORT_MESSAGES.missingSubject) {
        throw new Error('Test 4 Failed: Validation check failed for missing subject');
      }
      console.log('✅ TEST 4 PASSED: Missing subject validation confirmed');

      // Test 5: Validation - Missing Message
      console.log('\n--- TEST 5: Validation - Missing Message ---');
      const res5 = await fetch('http://localhost:5098/api/transporter/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'Payment & Wallet',
          subject: 'Payment Issue',
          message: '   ',
        }),
      });
      const data5 = await res5.json();
      console.log('Status Code:', res5.status, '| Message:', data5.message);
      if (res5.status !== 400 || data5.message !== SUPPORT_MESSAGES.missingMessage) {
        throw new Error('Test 5 Failed: Validation check failed for missing message');
      }
      console.log('✅ TEST 5 PASSED: Missing message validation confirmed');

      // Clean up test ticket
      if (createdTicketCode) {
        await pool.query('DELETE FROM transporter_support_tickets WHERE ticket_code = ?', [
          createdTicketCode,
        ]);
        console.log('\n(Cleaned up created test ticket:', createdTicketCode, ')');
      }

      console.log('\n🎉 ALL HELP & SUPPORT API TESTS PASSED SUCCESSFULLY!\n');
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

runSupportApiVerification();

