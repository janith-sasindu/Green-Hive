import type { Advertisement, FulfillmentRequest } from './farmer';
import type { TransportationJob, TransportationOffer } from './transporter';

export type ProductCategory = 'Vegetables' | 'Fruits' | 'Grains & Rice' | 'Spices';

export type DeliveryMethod = 'SELF_PICKUP' | 'TRANSPORTATION';

/**
 * Milestone payment state. Product and transportation payments are tracked separately:
 * the product payment is released on pickup, the transportation payment on confirmed delivery.
 */
export type PaymentStatus = 'NOT_REQUIRED' | 'PENDING' | 'HELD' | 'RELEASED';

export interface FarmerSummary {
  id: number;
  name: string;
  location: string;
  rating: number;
  isVerified: boolean;
}

export interface TransporterSummary {
  id: number;
  name: string;
  vehicle: string;
  rating: number;
  completedJobs: number;
}

export interface SellerProfile {
  id: number;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  location: string;
  /** Default delivery address used when requesting transportation. */
  address: string;
  isVerified: boolean;
  rating: number;
  avatarUri?: string;
}

/** A farmer advertisement as it is shown to retail sellers in the marketplace. */
export interface MarketplaceProduct extends Advertisement {
  farmer: FarmerSummary;
  pickupAddress: string;
  emoji: string;
  imageUrl?: string;
}

export interface SellerRequirement {
  id: number;
  sellerId: number;
  productName: string;
  category: string;
  quantityNeededKg: number;
  maxBudgetPerKg: number;
  deliveryLocation: string;
  description: string;
  deadlineDate: string;
  status: 'OPEN' | 'FULFILLED' | 'EXPIRED';
  createdAt: string;
}

/** A farmer's response to one of the seller's requirements. */
export interface SellerFulfillmentRequest extends FulfillmentRequest {
  farmer: FarmerSummary;
  pickupAddress: string;
  submittedAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  sellerId: number;
  farmerId: number;
  productName: string;
  quantityKg: number;
  productPricePerKg: number;
  totalProductAmount: number;
  deliveryMethod: DeliveryMethod;
  status: 'CREATED' | 'PAYMENT_HELD' | 'PICKED_UP' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  farmer: FarmerSummary;
  pickupAddress: string;
  emoji: string;
  imageUrl?: string;
  productPaymentStatus: PaymentStatus;
  transportPaymentStatus: PaymentStatus;
  /** Agreed transportation cost; set once the seller approves a transporter offer. */
  transportCost?: number;
  transportJobId?: number;
  /** Set when the order was reserved from a requirement instead of an advertisement. */
  requirementId?: number;
  createdAt: string;
  completedAt?: string;
}

export interface SellerTransportOffer extends TransportationOffer {
  transporter: TransporterSummary;
  submittedAt: string;
}

export interface SellerTransportJob extends TransportationJob {
  jobNumber: string;
  productName: string;
  requiredTime: string;
  offers: SellerTransportOffer[];
}

export type NotificationCategory =
  | 'orders'
  | 'payments'
  | 'transportation'
  | 'fulfillment'
  | 'promotions'
  | 'security';

export type NotificationSettings = Record<NotificationCategory, boolean>;

export type NotificationLink =
  | { screen: 'OrderDetail'; orderId: number }
  | { screen: 'TransportJobDetail'; jobId: number }
  | { screen: 'RequirementDetail'; requirementId: number };

export interface SellerNotification {
  id: number;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  link?: NotificationLink;
}

export interface DashboardStats {
  activeOrders: number;
  completedOrders: number;
  inTransitOrders: number;
  totalSpent: number;
}

/** Everything the Retail Seller module reads and updates. */
export interface SellerState {
  profile: SellerProfile;
  products: MarketplaceProduct[];
  orders: Order[];
  requirements: SellerRequirement[];
  fulfillmentRequests: SellerFulfillmentRequest[];
  transportJobs: SellerTransportJob[];
  notifications: SellerNotification[];
  notificationSettings: NotificationSettings;
}

export interface TransportRequestDetails {
  deliveryLocation: string;
  requiredDate: string;
  requiredTime: string;
}

export interface PlaceOrderInput {
  source:
    | { kind: 'product'; productId: number; quantityKg: number }
    | { kind: 'fulfillment'; requestId: number };
  deliveryMethod: DeliveryMethod;
  /** Required when deliveryMethod is TRANSPORTATION. */
  transport?: TransportRequestDetails;
}

export interface CreateRequirementInput {
  productName: string;
  category: ProductCategory;
  quantityNeededKg: number;
  maxBudgetPerKg: number;
  deliveryLocation: string;
  description: string;
  deadlineDate: string;
}
