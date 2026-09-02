# Green Hive - Digital Agricultural Marketplace

**Course:** Mini Project - SE5104 (Department of Software Engineering, 2022 / 2023)  
**Group No:** 03  
---

## 📌 Project Overview
**Green Hive** is an integrated digital agricultural marketplace that connects farmers directly with retail sellers, streamlines transportation, and ensures transparent, milestone-based secure agricultural transactions.

### Core Features
1. **Farmer Module:** Product listings, advertisements, seller requirement browsing, and fulfillment requests.
2. **Retail Seller Module:** Product search & purchase, demand posting (seller requirements), transporter selection.
3. **Transporter Module:** Job discovery, cost submission, pickup/delivery confirmation.
4. **Admin Module:** Dashboard for user management, order/payment monitoring, dispute resolution, and reports.
---

## 📂 Repository Directory Structure

```text
Green_Hive/
├── backend/                   # Express.js REST API Backend (Node.js + MySQL)
│   ├── database/              # MySQL DDL Schemas & Migrations (schema.sql)
│   ├── src/
│   │   ├── config/            # DB & Environment Configuration
│   │   ├── controllers/       # Route controllers (Farmer, Seller, Transporter, Admin, Payment)
│   │   ├── middleware/        # JWT Authentication & Role Authorization
│   │   ├── models/            # Database Query Models
│   │   ├── routes/            # API Route definitions
│   │   ├── services/          # Core Business & Payment Logic
│   │   ├── types/             # TypeScript Type Interfaces
│   │   └── server.ts          # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/                    # Mobile Application (React Native / Expo + TypeScript)
│   ├── src/
│   │   ├── assets/            # App icons, images
│   │   ├── components/        # Shared UI components
│   │   ├── navigation/        # React Navigation setup
│   │   ├── screens/           # Screens for Farmer, Retail Seller, and Transporter
│   │   ├── services/          # API Integration Services
│   │   └── types/             # Screen & Data types
│   ├── App.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── admin/                     # Web Admin Dashboard (React.js + Vite + TypeScript)
│   ├── src/
│   │   ├── components/        # Admin UI components (Tables, Charts, Cards)
│   │   ├── pages/             # Dashboard pages (Users, Orders, Transporters, Payments)
│   │   ├── services/          # Admin API client
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                      # Proposal, DFDs, ER Diagrams, Architecture Docs
├── .github/                   # PR Template and Workflows
├── .gitignore
└── README.md
```
