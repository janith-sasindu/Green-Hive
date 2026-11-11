import { pool } from '../config/db';

async function setupFarmerDb() {
  try {
    console.log('========================================================');
    console.log('🌱 Starting Green-Hive Farmer Module Database Setup...');
    console.log('========================================================');

    // 1. Ensure core users table exists
    console.log('--- Step 1: Checking users table ---');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        phone VARCHAR(20) DEFAULT NULL,
        password VARCHAR(255) DEFAULT NULL,
        role ENUM('farmer', 'seller', 'transporter', 'admin') NOT NULL DEFAULT 'farmer',
        location VARCHAR(150) DEFAULT NULL,
        verified TINYINT(1) DEFAULT 0,
        status ENUM('active', 'pending', 'suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ users table verified.');

    // 2. farmer_profiles table
    console.log('--- Step 2: Creating farmer_profiles table ---');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS farmer_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        farm_name VARCHAR(150) DEFAULT NULL,
        farm_location VARCHAR(150) DEFAULT 'Nuwara Eliya',
        avatar_url TEXT DEFAULT NULL,
        avatar_letter VARCHAR(5) DEFAULT 'S',
        rating DECIMAL(3, 1) DEFAULT 4.6,
        completed_sales INT DEFAULT 23,
        total_earnings DECIMAL(12, 2) DEFAULT 142000.00,
        member_since VARCHAR(50) DEFAULT 'August 2024',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_farmer_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ farmer_profiles table ready.');

    // 3. selling_ads table
    console.log('--- Step 3: Creating or upgrading selling_ads table ---');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS selling_ads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farmer_id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        category ENUM('Vegetables', 'Fruits', 'Grains', 'Spices') NOT NULL DEFAULT 'Vegetables',
        price_per_kg DECIMAL(10, 2) NOT NULL,
        quantity_available DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(20) DEFAULT 'kg',
        location VARCHAR(150) NOT NULL,
        description TEXT DEFAULT NULL,
        image_url TEXT DEFAULT NULL,
        valid_until DATE DEFAULT NULL,
        status ENUM('active', 'sold_out', 'cancelled') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_farmer (farmer_id),
        INDEX idx_category_status (category, status),
        CONSTRAINT fk_selling_ads_farmer FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure description & image_url exist if table was previously created with fewer columns
    const [existingCols]: any = await pool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'selling_ads' AND COLUMN_NAME IN ('description', 'image_url', 'valid_until')
    `);
    const colNames = existingCols.map((c: any) => c.COLUMN_NAME);
    if (!colNames.includes('description')) {
      await pool.query(`ALTER TABLE selling_ads ADD COLUMN description TEXT DEFAULT NULL`);
      console.log('➕ Added description column to selling_ads.');
    }
    if (!colNames.includes('image_url')) {
      await pool.query(`ALTER TABLE selling_ads ADD COLUMN image_url TEXT DEFAULT NULL`);
      console.log('➕ Added image_url column to selling_ads.');
    }
    if (!colNames.includes('valid_until')) {
      await pool.query(`ALTER TABLE selling_ads ADD COLUMN valid_until DATE DEFAULT NULL`);
      console.log('➕ Added valid_until column to selling_ads.');
    } else {
      // Ensure valid_until allows NULL so inserts without expiry date don't throw ER_NO_DEFAULT_FOR_FIELD
      await pool.query(`ALTER TABLE selling_ads MODIFY COLUMN valid_until DATE DEFAULT NULL`);
    }
    console.log('✅ selling_ads table ready.');

    // 4. requirement_ads table
    console.log('--- Step 4: Creating requirement_ads table ---');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS requirement_ads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        seller_id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        category ENUM('Vegetables', 'Fruits', 'Grains', 'Spices') NOT NULL,
        target_price_per_kg DECIMAL(10, 2) NOT NULL,
        quantity_required DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(20) DEFAULT 'kg',
        location VARCHAR(150) NOT NULL,
        deadline VARCHAR(100) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        status ENUM('active', 'fulfilled', 'cancelled') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_req_status (status),
        CONSTRAINT fk_requirement_ads_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ requirement_ads table ready.');

    // 5. fulfillment_requests table
    console.log('--- Step 5: Creating fulfillment_requests table ---');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fulfillment_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        requirement_id INT NOT NULL,
        farmer_id INT NOT NULL,
        offered_quantity_kg DECIMAL(10, 2) NOT NULL,
        offered_price_per_kg DECIMAL(10, 2) NOT NULL,
        notes TEXT DEFAULT NULL,
        status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_req_farmer (requirement_id, farmer_id),
        CONSTRAINT fk_fulfillment_req FOREIGN KEY (requirement_id) REFERENCES requirement_ads(id) ON DELETE CASCADE,
        CONSTRAINT fk_fulfillment_farmer FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ fulfillment_requests table ready.');

    // 6. farmer_bank_details table
    console.log('--- Step 6: Creating farmer_bank_details table ---');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS farmer_bank_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farmer_id INT NOT NULL UNIQUE,
        account_holder_name VARCHAR(150) NOT NULL,
        bank_name VARCHAR(100) NOT NULL,
        branch_name VARCHAR(100) NOT NULL,
        branch_code VARCHAR(20) DEFAULT '014',
        account_number VARCHAR(50) NOT NULL,
        account_type VARCHAR(30) DEFAULT 'Savings Account',
        is_verified TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_farmer_bank FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ farmer_bank_details table ready.');

    // 7. farmer_notifications table
    console.log('--- Step 7: Creating farmer_notifications table ---');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS farmer_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farmer_id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('order', 'payment', 'pickup', 'system') DEFAULT 'order',
        is_read TINYINT(1) DEFAULT 0,
        icon_emoji VARCHAR(16) DEFAULT '🌾',
        order_id VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_farmer_notifications (farmer_id, is_read),
        CONSTRAINT fk_farmer_notif FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ farmer_notifications table ready.');

    // 8. farmer_notification_settings table
    console.log('--- Step 8: Creating farmer_notification_settings table ---');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS farmer_notification_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        farmer_id INT NOT NULL UNIQUE,
        orders TINYINT(1) DEFAULT 1,
        payments TINYINT(1) DEFAULT 1,
        transportation TINYINT(1) DEFAULT 1,
        fulfillment TINYINT(1) DEFAULT 1,
        promotions TINYINT(1) DEFAULT 1,
        security TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_farmer_notif_settings FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ farmer_notification_settings table ready.');

    // 9. Seed Default Test Farmer: Sunil Perera (User ID 2)
    console.log('--- Step 9: Seeding default farmer user and profile data ---');
    // Default bcrypt hash for 'farmer123'
    const defaultPasswordHash = '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/bB8s7lR2E7jX6N5U4T3S2R1Q0P.m';

    // Check if farmer user already exists
    const [existingUsers]: any = await pool.query(`SELECT id FROM users WHERE role = 'farmer' LIMIT 1`);
    let farmerUserId = 2;

    if (existingUsers.length > 0) {
      farmerUserId = existingUsers[0].id;
      console.log(`ℹ️ Existing farmer user found with ID ${farmerUserId}.`);
      await pool.query(`
        UPDATE users 
        SET name = 'Sunil Perera', phone = '+94 77 123 4567', location = 'Nuwara Eliya', verified = 1, status = 'active'
        WHERE id = ?
      `, [farmerUserId]);
    } else {
      await pool.query(`
        INSERT INTO users (id, name, email, phone, password_hash, role, location, verified, status)
        VALUES (2, 'Sunil Perera', 'sunil@farmer.lk', '+94 77 123 4567', ?, 'farmer', 'Nuwara Eliya', 1, 'active')
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          phone = VALUES(phone),
          location = VALUES(location),
          role = 'farmer';
      `, [defaultPasswordHash]);
    }

    await pool.query(`
      INSERT INTO farmer_profiles (user_id, farm_name, farm_location, avatar_letter, rating, completed_sales, total_earnings, member_since)
      VALUES (?, 'Sunil Green Farm', 'Nuwara Eliya', 'S', 4.6, 23, 142000.00, 'August 2024')
      ON DUPLICATE KEY UPDATE 
        farm_location = VALUES(farm_location),
        rating = VALUES(rating),
        completed_sales = VALUES(completed_sales),
        total_earnings = VALUES(total_earnings);
    `, [farmerUserId]);

    await pool.query(`
      INSERT INTO farmer_bank_details (farmer_id, account_holder_name, bank_name, branch_name, branch_code, account_number, account_type, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE 
        account_holder_name = VALUES(account_holder_name),
        bank_name = VALUES(bank_name),
        account_number = VALUES(account_number);
    `, [farmerUserId, 'Sunil Perera', "People's Bank", 'Nuwara Eliya Branch', '024', '4521008741', 'Savings Account']);

    await pool.query(`
      INSERT INTO farmer_notification_settings (farmer_id, orders, payments, transportation, fulfillment, promotions, security)
      VALUES (?, 1, 1, 1, 1, 1, 1)
      ON DUPLICATE KEY UPDATE orders = 1;
    `, [farmerUserId]);

    // 10. Seed Sample Selling Ads (matching mobile FarmerHomeScreen products)
    console.log(`--- Step 10: Seeding sample crop listings for Farmer ${farmerUserId} ---`);
    await pool.query(`
      INSERT INTO selling_ads (farmer_id, title, category, price_per_kg, quantity_available, unit, location, description, valid_until, status)
      VALUES 
        (?, 'Fresh Cabbage', 'Vegetables', 80.00, 500.00, 'kg', 'Nuwara Eliya', 'Crisp fresh farm-harvested green cabbage.', DATE_ADD(NOW(), INTERVAL 14 DAY), 'active'),
        (?, 'Organic Carrots', 'Vegetables', 120.00, 300.00, 'kg', 'Nuwara Eliya', 'Certified organic highland carrots.', DATE_ADD(NOW(), INTERVAL 14 DAY), 'active'),
        (?, 'Leeks', 'Vegetables', 200.00, 150.00, 'kg', 'Nuwara Eliya', 'Highland tender leeks freshly cut.', DATE_ADD(NOW(), INTERVAL 14 DAY), 'active')
    `, [farmerUserId, farmerUserId, farmerUserId]);

    // 11. Seed Notifications for Farmer
    console.log(`--- Step 11: Seeding initial farmer notifications for Farmer ${farmerUserId} ---`);
    await pool.query(`
      INSERT INTO farmer_notifications (farmer_id, title, message, type, is_read, icon_emoji, order_id)
      VALUES 
        (?, 'Order Confirmed', 'Buyer Colombo Fresh Market placed order #GH-2041 for 100 kg Cabbage.', 'order', 0, '🛒', '#GH-2041'),
        (?, 'Escrow Payment Held', 'Green Hive holds Rs. 8,000 in escrow for Order #GH-2041 until delivery.', 'payment', 0, '💰', '#GH-2041'),
        (?, 'Transporter Assigned', 'Nimal Bandara (Lorry WP-LH-4821) scheduled for pickup tomorrow morning.', 'pickup', 1, '🚚', '#GH-2041')
    `, [farmerUserId, farmerUserId, farmerUserId]);

    console.log('========================================================');
    console.log('🎉 Farmer Module Database tables and initial seeds ready!');
    console.log('========================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up Farmer database:', error);
    process.exit(1);
  }
}

setupFarmerDb();
