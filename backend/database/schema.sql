-- ========================================================
-- GREEN HIVE - FARMER MODULE DATABASE SCHEMA
-- Database: MySQL (Aiven Cloud / Local MySQL)
-- ========================================================

-- 1. Ensure core users table exists
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

-- 2. Farmer Profiles
CREATE TABLE IF NOT EXISTS farmer_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  farm_name VARCHAR(150) DEFAULT NULL,
  farm_location VARCHAR(150) DEFAULT 'Nuwara Eliya',
  avatar_url TEXT DEFAULT NULL,
  avatar_letter VARCHAR(5) DEFAULT 'F',
  rating DECIMAL(3, 1) DEFAULT 5.0,
  completed_sales INT DEFAULT 0,
  total_earnings DECIMAL(12, 2) DEFAULT 0.00,
  member_since VARCHAR(50) DEFAULT 'August 2024',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_farmer_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Selling Ads (Farmer Crop Products)
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

-- 4. Requirement Ads (Posted by Wholesale/Retail Buyers for Farmers to View)
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

-- 5. Fulfillment Requests (Offers submitted by Farmers against Buyer Requirements)
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

-- 6. Farmer Bank Details (Payouts & Financial Verification)
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

-- 7. Farmer Notifications (Order, pickup, and payout status updates)
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

-- 8. Farmer Notification Settings (Push/In-App category toggles)
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
