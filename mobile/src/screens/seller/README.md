# Retail Seller Module

The retail seller part of the Green Hive mobile app: buy farmer products, post product
requirements, choose transporters and confirm delivery. Built with React Native (Expo),
TypeScript and NativeWind.

The module reads and writes real data through the backend's `/api/seller` routes (MySQL on Aiven). Set `EXPO_PUBLIC_API_URL` in `mobile/.env`; with no login token the API serves the development seller (user id 5).

## Running it

From the repository root:

```bash
npm start --prefix mobile
```

Open the app in Expo Go and tap **Retail Seller** under Quick Demo Access on the Welcome
screen. Run the unit tests with:

```bash
npm test --prefix mobile
```

## Screens

| Screen | File | What the seller does |
| --- | --- | --- |
| Dashboard | `SellerHomeScreen.tsx` | See order counts, total spent, recent orders and open requirements |
| Marketplace | `MarketplaceScreen.tsx` | Search, filter and sort farmer products |
| Product details | `ProductDetailScreen.tsx` | View a product and start an order |
| Checkout | `CheckoutScreen.tsx` | Choose quantity and self pickup or transportation, then pay |
| My Orders | `OrdersScreen.tsx` | Filter and search orders |
| Order details | `OrderDetailScreen.tsx` | Track progress and payments, confirm receipt, buy again |
| Transportation | `TransportScreen.tsx` | List the transport jobs for orders that need delivery |
| Transport job | `TransportJobDetailScreen.tsx` | Compare transporter costs, approve or reject offers |
| My Requirements | `RequirementsScreen.tsx` | List the requirements the seller posted |
| Create requirement | `CreateRequirementScreen.tsx` | Post what the seller needs |
| Requirement details | `RequirementDetailScreen.tsx` | Review farmer requests, accept or reject |
| Notifications | `NotificationsScreen.tsx` | Read order, payment and transport updates |
| My Profile | `ProfileScreen.tsx` | Edit contact details, notification settings, help, dark mode, sign out |

Navigation is set up in `src/navigation/SellerNavigator.tsx`: five bottom tabs (Home,
Market, Orders, Transport, Profile) with the other screens opened on top of them.

## How the order and payment rules work

All rules are in `src/utils/sellerWorkflow.ts` as plain functions that take the current data
and return the next data, so an order, its transport job and its payments always change
together. Green Hive holds each payment until its milestone is confirmed:

| Step | Product payment | Transport payment |
| --- | --- | --- |
| Seller places the order | Held | None yet |
| Seller approves a transporter offer | Held | Held |
| Transporter confirms pickup | Released to the farmer | Held |
| Seller confirms receipt | Released | Released to the transporter |

With self pickup there is no transport payment, and the product payment is released when
the seller confirms receipt. Placing an order from an advertisement reduces the farmer's
stock, and accepting a farmer's fulfillment request closes the requirement and declines the
other requests.

## Where things are

| Folder | Contents |
| --- | --- |
| `src/screens/seller/` | The screens listed above |
| `src/components/seller/` | Shared parts: header, tab bar, cards, forms, bottom sheets |
| `src/context/SellerContext.tsx` | The seller data (loaded from the API) and the actions that change it |
| `src/api/sellerApi.ts` | Calls to the `/api/seller` endpoints |
| `src/utils/` | `sellerWorkflow.ts` (rules), `sellerStatus.ts` (status labels), `format.ts`, `validation.ts` |
| `src/types/seller.ts` | Types for orders, products, requirements and notifications |
| `tests/` | Unit tests for the rules and helpers (`tests/fixtures/` holds test-only sample data) |

## Not built yet

- **Payment is simulated.** No payment gateway is called.
- **Pickup confirmation** belongs to the Transporter module (it moves the order to In Transit).
