import express from 'express';
import cors from 'cors';
import transporterRoutes from '../routes/transporter.routes';
import { pool } from '../config/db';
import { BANK_DETAILS_MESSAGES } from '../data';

async function runBankDetailsVerification() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/transporter', transporterRoutes);

  const server = app.listen(5097, async () => {
    console.log('🚀 Bank Details verification server listening on http://localhost:5097');
    try {
      // Test 1: Fetch Current Bank Details
      console.log('\n--- TEST 1: GET /api/transporter/bank-details ---');
      const res1 = await fetch('http://localhost:5097/api/transporter/bank-details');
      const data1 = await res1.json();
      console.log('Status Code:', res1.status, '| Message:', data1.message);
      console.log('Bank Account:', data1.data);
      if (res1.status !== 200 || !data1.success || !data1.data?.accountNumber) {
        throw new Error('Test 1 Failed: Bank details fetch failed');
      }
      console.log('✅ TEST 1 PASSED: Bank details fetched successfully');

      // Test 2: Update Bank Details (PUT)
      console.log('\n--- TEST 2: PUT /api/transporter/bank-details ---');
      const updatePayload = {
        accountHolderName: 'Ruwan Bandara',
        bankName: 'Commercial Bank of Ceylon',
        branchName: 'Colombo Fort Branch',
        branchCode: '016',
        accountNumber: '8204918234',
        accountType: 'Savings',
      };

      const res2 = await fetch('http://localhost:5097/api/transporter/bank-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });
      const data2 = await res2.json();
      console.log('Status Code:', res2.status, '| Message:', data2.message);
      console.log('Updated Account:', data2.data);

      if (
        res2.status !== 200 ||
        !data2.success ||
        data2.data?.accountHolderName !== updatePayload.accountHolderName ||
        data2.data?.accountNumber !== updatePayload.accountNumber ||
        data2.data?.branchCode !== updatePayload.branchCode ||
        data2.data?.verificationStatus !== 'Verified'
      ) {
        throw new Error('Test 2 Failed: Bank details update failed');
      }
      console.log('✅ TEST 2 PASSED: Bank details updated successfully');

      // Test 3: Direct Database Verification
      console.log('\n--- TEST 3: DB Verification for transporter_bank_details ---');
      const [rows]: any = await pool.query(
        'SELECT * FROM transporter_bank_details WHERE transporter_id = 7'
      );
      if (!rows || rows.length === 0 || rows[0].account_number !== updatePayload.accountNumber) {
        throw new Error('Test 3 Failed: DB persistence check failed');
      }
      console.log('DB Record:', {
        id: rows[0].id,
        holder: rows[0].account_holder_name,
        bank: rows[0].bank_name,
        account: rows[0].account_number,
        branch: rows[0].branch_name,
        is_verified: rows[0].is_verified,
      });
      console.log('✅ TEST 3 PASSED: Direct DB persistence verified');

      // Test 4: POST route alias
      console.log('\n--- TEST 4: POST /api/transporter/bank-details ---');
      const res4 = await fetch('http://localhost:5097/api/transporter/bank-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });
      const data4 = await res4.json();
      if (res4.status !== 200 || !data4.success) {
        throw new Error('Test 4 Failed: POST alias failed');
      }
      console.log('✅ TEST 4 PASSED: POST route alias works seamlessly');

      // Test 5: Validation - Missing Required Fields
      console.log('\n--- TEST 5: Validation - Missing Required Fields ---');
      const res5 = await fetch('http://localhost:5097/api/transporter/bank-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountHolderName: '' }),
      });
      const data5 = await res5.json();
      console.log('Status Code:', res5.status, '| Message:', data5.message);
      if (res5.status !== 400 || data5.message !== BANK_DETAILS_MESSAGES.validationError) {
        throw new Error('Test 5 Failed: Validation check failed for missing fields');
      }
      console.log('✅ TEST 5 PASSED: Missing fields validation confirmed');

      // Test 6: Validation - Invalid Account Number (< 6 digits)
      console.log('\n--- TEST 6: Validation - Short Account Number ---');
      const res6 = await fetch('http://localhost:5097/api/transporter/bank-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountHolderName: 'Nimal Bandara',
          bankName: 'Commercial Bank of Ceylon',
          accountNumber: '1234',
        }),
      });
      const data6 = await res6.json();
      console.log('Status Code:', res6.status, '| Message:', data6.message);
      if (res6.status !== 400 || data6.message !== BANK_DETAILS_MESSAGES.invalidAccountNumber) {
        throw new Error('Test 6 Failed: Validation check failed for short account number');
      }
      console.log('✅ TEST 6 PASSED: Invalid account number validation confirmed');

      console.log('\n🎉 ALL BANK DETAILS API TESTS PASSED SUCCESSFULLY!\n');
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

runBankDetailsVerification();

