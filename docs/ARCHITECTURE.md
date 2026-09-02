# Green Hive System Architecture & Workflow Summary

## System Components
1. **Mobile Application (React Native + TypeScript)**
   - Used by Farmers, Retail Sellers, and Transporters.
   - Screen directory organized by user role.

2. **Web Admin Dashboard (React.js + Vite + TypeScript)**
   - Used by Administrators to manage users, monitor trades, verify profiles, and audit escrow payment releases.

3. **Backend API Server (Node.js + Express.js + MySQL)**
   - Exposes RESTful endpoints over HTTPS.
   - Handles milestone-based payment logic and escrow holds.

4. **Database (MySQL)**
   - Database name: `green_hive_db`
   - DDL Script located at `backend/database/schema.sql`.

---

## Order & Payment Holding Workflows

### Workflow A: Farmer Product Advertisement Purchase
1. **Farmer** creates product advertisement (`POST /api/farmer/advertisements`).
2. **Retail Seller** selects product & creates order with status `PAYMENT_HELD` (`POST /api/seller/orders`).
3. If Seller chooses **Transportation Required**:
   - A `transportation_job` is created.
   - **Transporters** submit cost offers (`POST /api/transporter/jobs/:id/offers`).
   - **Retail Seller** approves transporter (`POST /api/seller/orders/:id/select-transporter`).
4. **Transporter Pickup Confirmation:**
   - Transporter collects produce at farm & taps **Confirm Pickup** (`POST /api/transporter/jobs/:id/confirm-pickup`).
   - System **releases Product Payment to Farmer**.
5. **Retail Seller Delivery Confirmation:**
   - Transporter delivers produce to seller.
   - Seller taps **Confirm Receipt** (`POST /api/seller/orders/:id/confirm-delivery`).
   - System **releases Transport Fee to Transporter**.

### Workflow B: Retail Seller Requirement (Demand-Driven)
1. **Retail Seller** posts crop/quantity requirement (`POST /api/seller/requirements`).
2. **Farmers** view requirements & submit fulfillment requests (`POST /api/farmer/fulfillment-requests`).
3. **Seller** accepts a farmer & places order -> system holds funds.
4. Transportation bidding & dual milestone payment release follow Workflow A steps 3–5.
