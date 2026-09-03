-- ===================================================
-- GREEN HIVE DIGITAL AGRICULTURAL MARKETPLACE
-- Database Schema for MySQL 8.0+
-- Course: Mini Project SE5104
-- ===================================================

CREATE DATABASE IF NOT EXISTS green_hive_db;
USE green_hive_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('FARMER', 'SELLER', 'TRANSPORTER', 'ADMIN') NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. FARMER PROFILES
CREATE TABLE IF NOT EXISTS farmer_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    farm_location VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. SELLER PROFILES
CREATE TABLE IF NOT EXISTS seller_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    business_name VARCHAR(150) NOT NULL,
    business_address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. TRANSPORTER PROFILES
CREATE TABLE IF NOT EXISTS transporter_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    vehicle_type VARCHAR(100) NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    capacity_kg DECIMAL(10, 2) NOT NULL,
    operating_region VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. PRODUCT ADVERTISEMENTS (Farmer supply listings)
CREATE TABLE IF NOT EXISTS advertisements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity_available_kg DECIMAL(10,2) NOT NULL,
    unit_price_lkr DECIMAL(10,2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    availability_start_date DATE NOT NULL,
    availability_end_date DATE NOT NULL,
    status ENUM('ACTIVE', 'SOLD_OUT', 'CANCELLED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. SELLER REQUIREMENTS (Retail buyer demand listings)
CREATE TABLE IF NOT EXISTS seller_requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity_needed_kg DECIMAL(10,2) NOT NULL,
    max_budget_per_kg DECIMAL(10,2) NOT NULL,
    delivery_location VARCHAR(255) NOT NULL,
    description TEXT,
    deadline_date DATE NOT NULL,
    status ENUM('OPEN', 'FULFILLED', 'EXPIRED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. FARMER FULFILLMENT REQUESTS (Farmer response to seller requirements)
CREATE TABLE IF NOT EXISTS fulfillment_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requirement_id INT NOT NULL,
    farmer_id INT NOT NULL,
    offered_quantity_kg DECIMAL(10,2) NOT NULL,
    offered_price_per_kg DECIMAL(10,2) NOT NULL,
    notes TEXT,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requirement_id) REFERENCES seller_requirements(id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    seller_id INT NOT NULL,
    farmer_id INT NOT NULL,
    advertisement_id INT NULL,
    fulfillment_request_id INT NULL,
    product_name VARCHAR(150) NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    product_price_per_kg DECIMAL(10,2) NOT NULL,
    total_product_amount DECIMAL(10,2) NOT NULL,
    delivery_method ENUM('SELF_PICKUP', 'TRANSPORTATION') NOT NULL,
    status ENUM('CREATED', 'PAYMENT_HELD', 'PICKED_UP', 'DELIVERED', 'COMPLETED', 'CANCELLED') DEFAULT 'CREATED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (farmer_id) REFERENCES users(id),
    FOREIGN KEY (advertisement_id) REFERENCES advertisements(id),
    FOREIGN KEY (fulfillment_request_id) REFERENCES fulfillment_requests(id)
);

-- 9. TRANSPORTATION JOBS
CREATE TABLE IF NOT EXISTS transportation_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    pickup_location VARCHAR(255) NOT NULL,
    delivery_location VARCHAR(255) NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    required_date DATE NOT NULL,
    assigned_transporter_id INT NULL,
    agreed_transport_cost DECIMAL(10,2) NULL,
    status ENUM('OPEN_FOR_BIDS', 'TRANSPORTER_ASSIGNED', 'GOODS_PICKED_UP', 'GOODS_DELIVERED') DEFAULT 'OPEN_FOR_BIDS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_transporter_id) REFERENCES users(id)
);

-- 10. TRANSPORTER OFFERS (Cost bids submitted by transporters)
CREATE TABLE IF NOT EXISTS transportation_offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    transporter_id INT NOT NULL,
    proposed_cost DECIMAL(10,2) NOT NULL,
    estimated_delivery_time VARCHAR(100),
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES transportation_jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (transporter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. PAYMENTS (Milestone Payment Holding)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    seller_id INT NOT NULL,
    farmer_id INT NOT NULL,
    transporter_id INT NULL,
    product_amount DECIMAL(10,2) NOT NULL,
    transport_amount DECIMAL(10,2) DEFAULT 0.00,
    total_paid_amount DECIMAL(10,2) NOT NULL,
    farmer_payment_status ENUM('HELD', 'RELEASED') DEFAULT 'HELD',
    transporter_payment_status ENUM('NOT_APPLICABLE', 'HELD', 'RELEASED') DEFAULT 'NOT_APPLICABLE',
    farmer_released_at TIMESTAMP NULL,
    transporter_released_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (farmer_id) REFERENCES users(id),
    FOREIGN KEY (transporter_id) REFERENCES users(id)
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
