-- Green Hive database schema (MySQL 8)
--
-- Apply with `npm run db:setup`, which creates the database named in .env and runs this file.
-- Entities follow the ER diagram in the project proposal. Money is stored in LKR and
-- quantities in kilograms.

-- ---------------------------------------------------------------------------
-- Users and role profiles
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  role          ENUM('FARMER', 'SELLER', 'TRANSPORTER', 'ADMIN') NOT NULL,
  location      VARCHAR(120) NULL,
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  rating        DECIMAL(2, 1) NULL,
  avatar_url    VARCHAR(500) NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seller_profiles (
  user_id       INT UNSIGNED NOT NULL,
  business_name VARCHAR(150) NOT NULL,
  -- Default delivery address used when the seller requests transportation
  address       VARCHAR(255) NULL,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_seller_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS farmer_profiles (
  user_id      INT UNSIGNED NOT NULL,
  -- Where buyers and transporters collect the farmer's produce
  farm_address VARCHAR(255) NULL,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_farmer_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transporter_profiles (
  user_id        INT UNSIGNED NOT NULL,
  vehicle_type   VARCHAR(120) NULL,
  vehicle_number VARCHAR(20)  NULL,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_transporter_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Supply: farmer advertisements
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS advertisements (
  id                      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  farmer_id               INT UNSIGNED NOT NULL,
  product_name            VARCHAR(120) NOT NULL,
  category                VARCHAR(60)  NOT NULL,
  quantity_available_kg   DECIMAL(10, 2) NOT NULL,
  unit_price_lkr          DECIMAL(10, 2) NOT NULL,
  location                VARCHAR(120) NOT NULL,
  description             TEXT NULL,
  image_url               VARCHAR(500) NULL,
  availability_start_date DATE NOT NULL,
  availability_end_date   DATE NOT NULL,
  status                  ENUM('ACTIVE', 'SOLD_OUT', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_advertisements_browse (status, category),
  KEY idx_advertisements_farmer (farmer_id),
  CONSTRAINT fk_advertisements_farmer FOREIGN KEY (farmer_id) REFERENCES users (id),
  CONSTRAINT chk_advertisements_quantity CHECK (quantity_available_kg >= 0),
  CONSTRAINT chk_advertisements_price CHECK (unit_price_lkr > 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Demand: seller requirements and farmer fulfillment requests
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS requirements (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  seller_id          INT UNSIGNED NOT NULL,
  product_name       VARCHAR(120) NOT NULL,
  category           VARCHAR(60)  NOT NULL,
  quantity_needed_kg DECIMAL(10, 2) NOT NULL,
  max_budget_per_kg  DECIMAL(10, 2) NOT NULL,
  delivery_location  VARCHAR(255) NOT NULL,
  description        TEXT NULL,
  deadline_date      DATE NOT NULL,
  -- EXPIRED is also reported for OPEN requirements whose deadline has passed
  status             ENUM('OPEN', 'FULFILLED', 'EXPIRED') NOT NULL DEFAULT 'OPEN',
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_requirements_seller (seller_id, status),
  KEY idx_requirements_open (status, deadline_date),
  CONSTRAINT fk_requirements_seller FOREIGN KEY (seller_id) REFERENCES users (id),
  CONSTRAINT chk_requirements_quantity CHECK (quantity_needed_kg > 0),
  CONSTRAINT chk_requirements_budget CHECK (max_budget_per_kg > 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fulfillment_requests (
  id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  requirement_id       INT UNSIGNED NOT NULL,
  farmer_id            INT UNSIGNED NOT NULL,
  offered_quantity_kg  DECIMAL(10, 2) NOT NULL,
  offered_price_per_kg DECIMAL(10, 2) NOT NULL,
  notes                VARCHAR(500) NULL,
  status               ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  -- A farmer responds to a requirement once
  UNIQUE KEY uq_fulfillment_requirement_farmer (requirement_id, farmer_id),
  KEY idx_fulfillment_farmer (farmer_id),
  CONSTRAINT fk_fulfillment_requirement FOREIGN KEY (requirement_id) REFERENCES requirements (id) ON DELETE CASCADE,
  CONSTRAINT fk_fulfillment_farmer FOREIGN KEY (farmer_id) REFERENCES users (id),
  CONSTRAINT chk_fulfillment_quantity CHECK (offered_quantity_kg > 0),
  CONSTRAINT chk_fulfillment_price CHECK (offered_price_per_kg > 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Orders and milestone payments
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS orders (
  id                     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- Human readable reference such as GH-2041, assigned right after insert
  order_number           VARCHAR(20) NULL,
  seller_id              INT UNSIGNED NOT NULL,
  farmer_id              INT UNSIGNED NOT NULL,
  -- An order comes from an advertisement or from an accepted fulfillment request
  advertisement_id       INT UNSIGNED NULL,
  requirement_id         INT UNSIGNED NULL,
  fulfillment_request_id INT UNSIGNED NULL,
  product_name           VARCHAR(120) NOT NULL,
  image_url              VARCHAR(500) NULL,
  quantity_kg            DECIMAL(10, 2) NOT NULL,
  product_price_per_kg   DECIMAL(10, 2) NOT NULL,
  total_product_amount   DECIMAL(12, 2) NOT NULL,
  delivery_method        ENUM('SELF_PICKUP', 'TRANSPORTATION') NOT NULL,
  pickup_address         VARCHAR(255) NOT NULL,
  status                 ENUM('CREATED', 'PAYMENT_HELD', 'PICKED_UP', 'DELIVERED', 'COMPLETED', 'CANCELLED')
                           NOT NULL DEFAULT 'CREATED',
  created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at           TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_number (order_number),
  -- A fulfillment request can be reserved by one order only
  UNIQUE KEY uq_orders_fulfillment_request (fulfillment_request_id),
  KEY idx_orders_seller (seller_id, status),
  KEY idx_orders_farmer (farmer_id, status),
  CONSTRAINT fk_orders_seller FOREIGN KEY (seller_id) REFERENCES users (id),
  CONSTRAINT fk_orders_farmer FOREIGN KEY (farmer_id) REFERENCES users (id),
  CONSTRAINT fk_orders_advertisement FOREIGN KEY (advertisement_id) REFERENCES advertisements (id),
  CONSTRAINT fk_orders_requirement FOREIGN KEY (requirement_id) REFERENCES requirements (id),
  CONSTRAINT fk_orders_fulfillment FOREIGN KEY (fulfillment_request_id) REFERENCES fulfillment_requests (id),
  CONSTRAINT chk_orders_quantity CHECK (quantity_kg > 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Product and transportation payments are held and released separately:
-- the product payment on pickup, the transportation payment on confirmed delivery.
CREATE TABLE IF NOT EXISTS payments (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id          INT UNSIGNED NOT NULL,
  payment_type      ENUM('PRODUCT', 'TRANSPORTATION') NOT NULL,
  payer_id          INT UNSIGNED NOT NULL,
  payee_id          INT UNSIGNED NOT NULL,
  amount            DECIMAL(12, 2) NOT NULL,
  status            ENUM('HELD', 'RELEASED', 'REFUNDED') NOT NULL DEFAULT 'HELD',
  gateway_reference VARCHAR(100) NULL,
  held_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  released_at       TIMESTAMP NULL,
  PRIMARY KEY (id),
  -- One payment of each type per order, so a retry can never hold the same amount twice
  UNIQUE KEY uq_payments_order_type (order_id, payment_type),
  KEY idx_payments_payee (payee_id, status),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id),
  CONSTRAINT fk_payments_payer FOREIGN KEY (payer_id) REFERENCES users (id),
  CONSTRAINT fk_payments_payee FOREIGN KEY (payee_id) REFERENCES users (id),
  CONSTRAINT chk_payments_amount CHECK (amount > 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Transportation
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS transportation_jobs (
  id                      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  -- Human readable reference such as GH-T1024, assigned right after insert
  job_number              VARCHAR(20) NULL,
  order_id                INT UNSIGNED NOT NULL,
  pickup_location         VARCHAR(255) NOT NULL,
  delivery_location       VARCHAR(255) NOT NULL,
  quantity_kg             DECIMAL(10, 2) NOT NULL,
  required_date           DATE NOT NULL,
  required_time           TIME NOT NULL,
  assigned_transporter_id INT UNSIGNED NULL,
  agreed_transport_cost   DECIMAL(10, 2) NULL,
  status                  ENUM('OPEN_FOR_BIDS', 'TRANSPORTER_ASSIGNED', 'GOODS_PICKED_UP', 'GOODS_DELIVERED')
                            NOT NULL DEFAULT 'OPEN_FOR_BIDS',
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_transportation_jobs_number (job_number),
  UNIQUE KEY uq_transportation_jobs_order (order_id),
  KEY idx_transportation_jobs_status (status),
  KEY idx_transportation_jobs_transporter (assigned_transporter_id),
  CONSTRAINT fk_transportation_jobs_order FOREIGN KEY (order_id) REFERENCES orders (id),
  CONSTRAINT fk_transportation_jobs_transporter FOREIGN KEY (assigned_transporter_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transportation_offers (
  id                      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  job_id                  INT UNSIGNED NOT NULL,
  transporter_id          INT UNSIGNED NOT NULL,
  proposed_cost           DECIMAL(10, 2) NOT NULL,
  estimated_delivery_time VARCHAR(60) NULL,
  status                  ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  -- A transporter submits one cost per job
  UNIQUE KEY uq_transportation_offers_job_transporter (job_id, transporter_id),
  KEY idx_transportation_offers_transporter (transporter_id, status),
  CONSTRAINT fk_transportation_offers_job FOREIGN KEY (job_id) REFERENCES transportation_jobs (id) ON DELETE CASCADE,
  CONSTRAINT fk_transportation_offers_transporter FOREIGN KEY (transporter_id) REFERENCES users (id),
  CONSTRAINT chk_transportation_offers_cost CHECK (proposed_cost > 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  category   ENUM('orders', 'payments', 'transportation', 'fulfillment', 'promotions', 'security') NOT NULL,
  title      VARCHAR(150) NOT NULL,
  message    VARCHAR(500) NOT NULL,
  -- Optional record the notification is about, so the app can open it
  link_type  ENUM('ORDER', 'TRANSPORT_JOB', 'REQUIREMENT') NULL,
  link_id    INT UNSIGNED NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user (user_id, is_read, created_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- A user without a row here receives every category
CREATE TABLE IF NOT EXISTS notification_settings (
  user_id        INT UNSIGNED NOT NULL,
  orders         BOOLEAN NOT NULL DEFAULT TRUE,
  payments       BOOLEAN NOT NULL DEFAULT TRUE,
  transportation BOOLEAN NOT NULL DEFAULT TRUE,
  fulfillment    BOOLEAN NOT NULL DEFAULT TRUE,
  promotions     BOOLEAN NOT NULL DEFAULT FALSE,
  security       BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_notification_settings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
