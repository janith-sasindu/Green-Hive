import { pool } from '../config/db';

async function setupProfileDb() {
  try {
    console.log('--- Step 1: Creating transporter_profiles table ---');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transporter_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        avatar_url TEXT DEFAULT NULL,
        vehicle_type VARCHAR(100) DEFAULT 'Lorry - 3 Ton',
        vehicle_plate VARCHAR(50) DEFAULT 'WP-LH-4821',
        rating DECIMAL(3,1) DEFAULT 4.8,
        on_time_rate VARCHAR(20) DEFAULT '98%',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ transporter_profiles table ready.');

    console.log('--- Step 2: Creating transporter_bank_details table ---');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transporter_bank_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transporter_id INT NOT NULL UNIQUE,
        account_holder_name VARCHAR(150) NOT NULL,
        bank_name VARCHAR(100) NOT NULL,
        branch_name VARCHAR(100) NOT NULL,
        branch_code VARCHAR(20) DEFAULT '014',
        account_number VARCHAR(50) NOT NULL,
        account_type VARCHAR(30) DEFAULT 'Savings Account',
        is_verified TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (transporter_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ transporter_bank_details table ready.');

    console.log('--- Step 3: Seeding initial profile & bank details for Transporter 7 ---');
    // Ensure profile row for Transporter 7 (Nimal Bandara)
    await pool.query(`
      INSERT INTO transporter_profiles (user_id, avatar_url, vehicle_type, vehicle_plate, rating, on_time_rate)
      VALUES (7, NULL, 'Lorry - 3 Ton', 'WP-LH-4821', 4.8, '98%')
      ON DUPLICATE KEY UPDATE 
        vehicle_type = VALUES(vehicle_type),
        vehicle_plate = VALUES(vehicle_plate),
        rating = VALUES(rating);
    `);

    // Ensure bank details for Transporter 7
    await pool.query(`
      INSERT INTO transporter_bank_details (transporter_id, account_holder_name, bank_name, branch_name, branch_code, account_number, account_type, is_verified)
      VALUES (7, 'Nimal Bandara', 'Commercial Bank of Ceylon', 'Kurunegala City Branch', '034', '8004529104', 'Savings Account', 1)
      ON DUPLICATE KEY UPDATE 
        account_holder_name = VALUES(account_holder_name),
        bank_name = VALUES(bank_name),
        account_number = VALUES(account_number);
    `);
    console.log('✅ Seeded initial profile and bank details.');

    const [profiles] = await pool.query('SELECT * FROM transporter_profiles WHERE user_id = 7');
    const [bank] = await pool.query('SELECT * FROM transporter_bank_details WHERE transporter_id = 7');
    console.log('Transporter Profile:', profiles);
    console.log('Bank Details:', bank);

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to setup profile database:', err);
    process.exit(1);
  }
}

setupProfileDb();

