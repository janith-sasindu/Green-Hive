import { pool } from '../config/db';

async function setupNotificationsDb() {
  try {
    console.log('--- Step 1: Creating transporter_notifications table ---');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transporter_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transporter_id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('pickup', 'request', 'payment', 'assignment') DEFAULT 'assignment',
        is_read TINYINT(1) DEFAULT 0,
        icon_emoji VARCHAR(16) DEFAULT '🚚',
        job_id VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (transporter_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ transporter_notifications table ready.');

    console.log('--- Step 2: Seeding notifications for Transporter 7 ---');
    // Check if notifications already exist for transporter 7
    const [existing]: any = await pool.query(
      'SELECT COUNT(*) as count FROM transporter_notifications WHERE transporter_id = 7'
    );

    if (existing[0]?.count === 0) {
      await pool.query(`
        INSERT INTO transporter_notifications (transporter_id, title, message, type, is_read, icon_emoji, job_id, created_at)
        VALUES 
          (7, 'Job Assigned', 'You have been selected for Transport Job #GH-T1024. Please confirm pickup.', 'assignment', 0, '🚚', '#GH-T1024', NOW() - INTERVAL 45 MINUTE),
          (7, 'Cargo Ready for Pickup', 'Farmer Sunil loaded 100 kg Cabbage in Nuwara Eliya.', 'pickup', 0, '📦', '#GH-T1022', NOW() - INTERVAL 3 HOUR),
          (7, 'Payment Received', 'Rs. 18,500 has been credited to your Commercial Bank account for completed delivery #GH-T1018.', 'payment', 1, '💰', '#GH-T1018', NOW() - INTERVAL 1 DAY),
          (7, 'New Transport Request', '150 kg Ripe Tomatoes available in Dambulla Zone ready for transport.', 'request', 1, '🔔', '#GH-T1025', NOW() - INTERVAL 2 DAY)
      `);
      console.log('✅ Seeded 4 notifications for Transporter 7.');
    } else {
      console.log(`ℹ️ Transporter 7 already has ${existing[0]?.count} notifications.`);
    }

    const [rows]: any = await pool.query(
      'SELECT id, title, type, is_read, job_id, created_at FROM transporter_notifications WHERE transporter_id = 7 ORDER BY created_at DESC'
    );
    console.log('Current notifications in DB:', rows);

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to setup notifications database:', err);
    process.exit(1);
  }
}

setupNotificationsDb();

