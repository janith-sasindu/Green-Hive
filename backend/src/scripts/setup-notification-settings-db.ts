import { pool } from '../config/db';

async function setupNotificationSettingsDb() {
  try {
    console.log('--- Step 1: Creating transporter_notification_settings table ---');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transporter_notification_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transporter_id INT NOT NULL UNIQUE,
        new_jobs_push TINYINT(1) DEFAULT 1,
        current_job_updates_push TINYINT(1) DEFAULT 1,
        offer_status_push TINYINT(1) DEFAULT 1,
        payment_push TINYINT(1) DEFAULT 1,
        sound_and_vibration TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (transporter_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ transporter_notification_settings table created successfully.');

    console.log('--- Step 2: Seeding default notification settings for Transporter 7 ---');
    await pool.query(`
      INSERT INTO transporter_notification_settings (
        transporter_id,
        new_jobs_push,
        current_job_updates_push,
        offer_status_push,
        payment_push,
        sound_and_vibration
      ) VALUES (7, 1, 1, 1, 1, 1)
      ON DUPLICATE KEY UPDATE
        new_jobs_push = VALUES(new_jobs_push),
        current_job_updates_push = VALUES(current_job_updates_push),
        offer_status_push = VALUES(offer_status_push),
        payment_push = VALUES(payment_push),
        sound_and_vibration = VALUES(sound_and_vibration);
    `);
    console.log('✅ Default settings seeded for Transporter 7.');

    const [rows]: any = await pool.query(
      'SELECT * FROM transporter_notification_settings WHERE transporter_id = 7'
    );
    console.log('Current settings in DB for Transporter 7:', rows[0]);

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to setup notification settings database:', err);
    process.exit(1);
  }
}

setupNotificationSettingsDb();

