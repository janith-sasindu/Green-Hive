import { pool } from '../config/db';

async function seedAvailableJobs() {
  try {
    console.log('--- Step 1: Creating transport_offers table if not exists ---');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transport_offers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        transporter_id INT NOT NULL,
        quote_price DECIMAL(10,2) NOT NULL,
        estimated_delivery VARCHAR(100) DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        status ENUM('Submitted', 'Accepted', 'Under Review', 'Declined') DEFAULT 'Submitted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_job_id (job_id),
        INDEX idx_transporter_id (transporter_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ transport_offers table ready.');

    console.log('--- Step 2: Seeding Open transport jobs for existing orders ---');
    // Order 2 is Red Onions, Order 3 is Ripe Tomatoes
    await pool.query(`
      INSERT INTO transport_jobs (id, job_code, order_id, transporter_id, pickup_location, drop_location, vehicle_type, fee, scheduled_date, status)
      VALUES 
        (2, '#TR-109', 2, NULL, 'Dambulla Economic Centre, Dambulla', 'Pettah Wholesale Market, Colombo 11', 'Medium Truck (3T)', 8500.00, DATE_ADD(NOW(), INTERVAL 1 DAY), 'Open'),
        (3, '#TR-110', 3, NULL, 'Dambulla Agricultural Zone, Dambulla', 'Kandy Central Market, Kandy', 'Light Truck (1.5T)', 4200.00, DATE_ADD(NOW(), INTERVAL 2 DAY), 'Open')
      ON DUPLICATE KEY UPDATE 
        status = 'Open',
        transporter_id = NULL,
        pickup_location = VALUES(pickup_location),
        drop_location = VALUES(drop_location),
        fee = VALUES(fee);
    `);
    console.log('✅ Open transport jobs 2 and 3 created/updated.');

    // Also let's check if we can add another selling ad and order for Carrots
    await pool.query(`
      INSERT IGNORE INTO selling_ads (id, farmer_id, title, category, price_per_kg, quantity_available, unit, location, valid_until, status)
      VALUES (4, 2, 'Fresh Nuwara Eliya Carrots', 'Vegetables', 180.00, 600.00, 'kg', 'Nuwara Eliya', DATE_ADD(NOW(), INTERVAL 14 DAY), 'active');
    `);

    await pool.query(`
      INSERT IGNORE INTO orders (id, order_code, selling_ad_id, seller_id, farmer_id, product_name, quantity, unit_price, total_amount, order_status, payment_status)
      VALUES (4, '#GH-2055', 4, 5, 2, 'Fresh Nuwara Eliya Carrots', 400.00, 180.00, 72000.00, 'Pending', 'Product Paid');
    `);

    await pool.query(`
      INSERT INTO transport_jobs (id, job_code, order_id, transporter_id, pickup_location, drop_location, vehicle_type, fee, scheduled_date, status)
      VALUES (4, '#TR-111', 4, NULL, 'Nuwara Eliya Green Valley Farm', 'Negombo Distribution Hub, Negombo', 'Covered Lorry (3T)', 9800.00, DATE_ADD(NOW(), INTERVAL 3 DAY), 'Open')
      ON DUPLICATE KEY UPDATE status = 'Open', transporter_id = NULL;
    `);

    const [rows] = await pool.query(`
      SELECT tj.id, tj.job_code, o.product_name, o.quantity, tj.pickup_location, tj.drop_location, tj.fee, tj.status
      FROM transport_jobs tj
      JOIN orders o ON tj.order_id = o.id
      WHERE tj.status = 'Open'
    `);
    console.log('✅ Available Jobs ready in Database:\n', rows);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding transport jobs:', error);
    process.exit(1);
  }
}

seedAvailableJobs();
