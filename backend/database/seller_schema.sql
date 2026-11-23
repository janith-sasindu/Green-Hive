-- ========================================================
-- GREEN HIVE - RETAIL SELLER MODULE DATABASE SCHEMA
-- Extends the shared schema (users, selling_ads, requirement_ads,
-- fulfillment_requests, orders, payments, transport_jobs, transport_offers).
-- Safe to run more than once (see src/scripts/setup-seller-db.ts).
-- ========================================================

CREATE TABLE IF NOT EXISTS seller_profiles (
  seller_id INT PRIMARY KEY,
  business_name VARCHAR(150) DEFAULT NULL,
  address VARCHAR(255) DEFAULT NULL,
  avatar_url TEXT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS seller_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  category ENUM('orders','payments','transportation','fulfillment','promotions','security') NOT NULL,
  title VARCHAR(150) NOT NULL,
  message VARCHAR(500) NOT NULL,
  link_screen VARCHAR(40) DEFAULT NULL,
  link_id INT DEFAULT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_seller_notifications (seller_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS seller_notification_settings (
  seller_id INT PRIMARY KEY,
  orders TINYINT(1) NOT NULL DEFAULT 1,
  payments TINYINT(1) NOT NULL DEFAULT 1,
  transportation TINYINT(1) NOT NULL DEFAULT 1,
  fulfillment TINYINT(1) NOT NULL DEFAULT 1,
  promotions TINYINT(1) NOT NULL DEFAULT 0,
  security TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
