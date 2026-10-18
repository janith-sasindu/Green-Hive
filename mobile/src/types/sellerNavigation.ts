import type { NavigatorScreenParams } from '@react-navigation/native';

export type SellerTabParamList = {
  Home: undefined;
  Market: { query?: string } | undefined;
  Orders: undefined;
  Transport: undefined;
  Profile: undefined;
};

/** What the seller is paying for: a farmer advertisement or an accepted fulfillment request. */
export type CheckoutSource =
  | { kind: 'product'; productId: number }
  | { kind: 'fulfillment'; requestId: number };

export type SellerStackParamList = {
  SellerTabs: NavigatorScreenParams<SellerTabParamList> | undefined;
  ProductDetail: { productId: number };
  Checkout: CheckoutSource;
  OrderDetail: { orderId: number; justPlaced?: boolean };
  Requirements: undefined;
  CreateRequirement: undefined;
  RequirementDetail: { requirementId: number };
  TransportJobDetail: { jobId: number };
  Notifications: undefined;
};
