# Green Hive Backend

REST API for the Green Hive marketplace, built with Node.js, Express, TypeScript and MySQL 8.
It currently provides authentication and the Retail Seller module.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set `DB_PASSWORD` to your MySQL password. Use your own
   `JWT_SECRET` and `SEED_USER_PASSWORD` as well.

3. Create the database and tables. Use `db:seed` instead if you also want demo data:

   ```bash
   npm run db:setup
   ```

   ```bash
   npm run db:seed
   ```

4. Start the API on `http://localhost:5000`:

   ```bash
   npm run dev
   ```

`db:seed` only runs on an empty database. It creates the demo seller `amara@greenhive.test`
along with farmers, transporters, advertisements, two orders and two requirements. Every demo
account uses the password in `SEED_USER_PASSWORD`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the API and restarts it when a file changes |
| `npm run build` / `npm start` | Compiles to `dist/` and runs the compiled server |
| `npm run db:setup` | Creates the database in `.env` and applies `database/schema.sql` |
| `npm run db:seed` | Same as `db:setup`, then adds demo data to the empty database |
| `npm test` | Runs the API tests |
| `npm run typecheck` | Type-checks the source and the tests |

## Tests

Tests use Jest and Supertest against a real MySQL database named `<DB_NAME>_test`
(`green_hive_db_test` by default). That database is dropped and recreated for every test file,
so the tests never touch your development data. They need the MySQL connection in `.env`.

## Project layout

```text
database/schema.sql   Tables for every module
src/app.ts            Express app: middleware and route mounting
src/server.ts         Starts the HTTP server
src/config/           Environment and MySQL pool, withTransaction()
src/middleware/       JWT authentication, role authorization, error handler
src/routes/           Route definitions
src/controllers/      Read and validate the request, send the response
src/services/         Business rules and transactions
src/models/           SQL queries and row mapping
src/database/         Schema setup and demo data
tests/                API tests and fixtures
```

## Requests and errors

Send and receive JSON. Protected routes need `Authorization: Bearer <token>`, where the token
comes from register or login. Errors look like this, with `errors` present for invalid input:

```json
{
  "message": "Some fields are missing or invalid",
  "errors": { "quantityKg": "Quantity kg must be a number greater than zero" }
}
```

| Status | Meaning |
| --- | --- |
| 400 | The request is missing fields or has invalid values |
| 401 | Not signed in, or the token is invalid or expired |
| 403 | Signed in with a role that cannot use this route |
| 404 | The record does not exist or belongs to another user |
| 409 | The action is not allowed in the record's current state |

## Authentication

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a FARMER, SELLER or TRANSPORTER account |
| POST | `/api/auth/login` | Sign in with email and password |
| GET | `/api/auth/me` | The signed-in user |

Register needs `role`, `name`, `email`, `phone` and `password` (8 characters or more). Sellers
also send `businessName`. Register and login both return `{ token, user }`.

## Retail Seller API

Every route below is under `/api/seller` and needs a token for a user with the `SELLER` role.
A seller only ever sees and changes their own records.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/dashboard` | Order counts, total spent, newest orders, open requirements, unread count |
| GET | `/profile` | The seller's profile |
| PATCH | `/profile` | Change `name`, `businessName`, `email`, `phone`, `location` or `address` |
| GET | `/products` | Browse farmer advertisements that can be bought now |
| GET | `/products/:productId` | One advertisement |
| POST | `/orders` | Buy from an advertisement |
| GET | `/orders` | The seller's orders. `status` = `active`, `inTransit` or `completed` |
| GET | `/orders/:orderId` | One order with its transport job |
| POST | `/orders/:orderId/confirm-receipt` | Confirm the goods arrived and release the held payment |
| GET | `/transport-jobs` | Transport jobs with the offers transporters submitted |
| GET | `/transport-jobs/:jobId` | One transport job |
| POST | `/transport-jobs/:jobId/offers/:offerId/approve` | Select a transporter |
| POST | `/transport-jobs/:jobId/offers/:offerId/reject` | Decline one offer |
| POST | `/requirements` | Publish a product requirement |
| GET | `/requirements` | The seller's requirements |
| GET | `/requirements/:requirementId` | One requirement with the farmers' fulfillment requests |
| POST | `/fulfillment-requests/:requestId/accept` | Select a farmer and reserve the order |
| POST | `/fulfillment-requests/:requestId/reject` | Decline one fulfillment request |
| GET | `/notifications` | Newest notifications and the unread count |
| PATCH | `/notifications/:notificationId/read` | Mark one notification read |
| POST | `/notifications/read-all` | Mark all notifications read |
| GET | `/notification-settings` | Which notification categories are on |
| PUT | `/notification-settings` | Save all six categories as true or false |

`GET /products` accepts `search`, `category`, `location`, `verifiedOnly=true`,
`sort` (`recommended`, `priceLow`, `priceHigh`, `quantity`), `limit` and `offset`.

To place an order, send the advertisement, the quantity and how the goods will be received.
`transport` is required only for `TRANSPORTATION`. Accepting a fulfillment request takes the
same `deliveryMethod` and `transport` fields.

```json
{
  "advertisementId": 5,
  "quantityKg": 150,
  "deliveryMethod": "TRANSPORTATION",
  "transport": {
    "deliveryLocation": "Colombo Fresh Market, Colombo 03",
    "requiredDate": "2026-10-20",
    "requiredTime": "06:00"
  }
}
```

## How payments are held and released

Product and transportation payments are separate rows in `payments`, each `HELD` and later
`RELEASED`.

| Step | Order status | Product payment | Transport payment |
| --- | --- | --- | --- |
| Seller places the order | `PAYMENT_HELD` | Held | None yet |
| Seller approves a transporter offer | `PAYMENT_HELD` | Held | Held |
| Transporter confirms pickup | `PICKED_UP` | Released to the farmer | Held |
| Seller confirms receipt | `COMPLETED` | Released | Released to the transporter |

For self pickup there is no transport payment, and the product payment is released when the
seller confirms receipt. Each step runs in one database transaction, so an order and its
payments always change together.

Payment collection is simulated: a held payment is recorded without calling a payment gateway.

## Notes for the other modules

- `database/schema.sql` defines tables for all modules. The farmer and transporter tables hold
  only the columns the seller API reads, so extend them as your module needs.
- Confirming pickup belongs to the Transporter module. It should set the order to `PICKED_UP`
  and the job to `GOODS_PICKED_UP`, and call `releasePayment(connection, orderId, 'PRODUCT')`
  from `src/services/payment.service.ts`, all inside `withTransaction()`.
- `notify()` in `src/services/notification.service.ts` records a notification for any user and
  respects their notification settings.
- `authenticate` and `authorize('ROLE')` in `src/middleware/auth.ts` protect a router.
