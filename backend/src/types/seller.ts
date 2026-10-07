/**
 * Shapes returned by the Retail Seller API. Field names match the mobile app's
 * types in mobile/src/types so responses can be used there without mapping.
 */

export interface SellerProfile {
  id: number;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  location: string | null;
  /** Default delivery address used when requesting transportation. */
  address: string | null;
  isVerified: boolean;
  rating: number | null;
  avatarUrl: string | null;
}

/** Only the fields present are changed. */
export interface SellerProfileChanges {
  name?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  location?: string;
  address?: string;
}

export interface FarmerSummary {
  id: number;
  name: string;
  location: string | null;
  rating: number | null;
  isVerified: boolean;
}

/** A farmer advertisement as it is shown to retail sellers in the marketplace. */
export interface MarketplaceProduct {
  id: number;
  farmerId: number;
  productName: string;
  category: string;
  quantityAvailableKg: number;
  unitPriceLkr: number;
  location: string;
  description: string;
  availabilityStartDate: string;
  availabilityEndDate: string;
  status: 'ACTIVE' | 'SOLD_OUT' | 'CANCELLED';
  farmer: FarmerSummary;
  pickupAddress: string;
  imageUrl: string | null;
}

export const DELIVERY_METHODS = ['SELF_PICKUP', 'TRANSPORTATION'] as const;

export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

export type OrderStatus = 'CREATED' | 'PAYMENT_HELD' | 'PICKED_UP' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

/**
 * Payment state as the seller sees it. NOT_REQUIRED and PENDING describe a payment that
 * does not exist: self pickup needs no transport payment, and a transported order has none
 * until a transporter is approved.
 */
export type PaymentStatus = 'NOT_REQUIRED' | 'PENDING' | 'HELD' | 'RELEASED' | 'REFUNDED';

export interface SellerOrder {
  id: number;
  orderNumber: string;
  sellerId: number;
  farmerId: number;
  productName: string;
  quantityKg: number;
  productPricePerKg: number;
  totalProductAmount: number;
  deliveryMethod: DeliveryMethod;
  status: OrderStatus;
  farmer: FarmerSummary;
  pickupAddress: string;
  imageUrl: string | null;
  productPaymentStatus: PaymentStatus;
  transportPaymentStatus: PaymentStatus;
  /** Agreed transportation cost; null until the seller approves a transporter offer. */
  transportCost: number | null;
  transportJobId: number | null;
  /** Set when the order was reserved from a requirement instead of an advertisement. */
  requirementId: number | null;
  createdAt: string;
  completedAt: string | null;
}

export const ORDER_FILTERS = ['all', 'active', 'inTransit', 'completed'] as const;

export type OrderFilter = (typeof ORDER_FILTERS)[number];

/** Where and when the goods should be delivered when the seller requests transportation. */
export interface TransportRequest {
  deliveryLocation: string;
  /** YYYY-MM-DD */
  requiredDate: string;
  /** HH:mm, 24 hour */
  requiredTime: string;
}

export interface TransporterSummary {
  id: number;
  name: string;
  vehicle: string | null;
  rating: number | null;
  /** Jobs this transporter has delivered on Green Hive. */
  completedJobs: number;
}

export type TransportJobStatus = 'OPEN_FOR_BIDS' | 'TRANSPORTER_ASSIGNED' | 'GOODS_PICKED_UP' | 'GOODS_DELIVERED';

/** State of a transporter offer or a farmer fulfillment request. */
export type ResponseStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

/** A transporter's proposed cost for a job. */
export interface TransportOffer {
  id: number;
  jobId: number;
  transporterId: number;
  proposedCost: number;
  estimatedDeliveryTime: string | null;
  status: ResponseStatus;
  submittedAt: string;
  transporter: TransporterSummary;
}

export interface TransportJob extends TransportRequest {
  id: number;
  jobNumber: string;
  orderId: number;
  orderNumber: string;
  productName: string;
  pickupLocation: string;
  quantityKg: number;
  assignedTransporterId: number | null;
  agreedTransportCost: number | null;
  status: TransportJobStatus;
  /** Cheapest first. */
  offers: TransportOffer[];
}

export const PRODUCT_SORTS = ['recommended', 'priceLow', 'priceHigh', 'quantity'] as const;

export type ProductSort = (typeof PRODUCT_SORTS)[number];

export interface ProductFilters {
  /** Matches the product name, farmer name or location. */
  search?: string;
  category?: string;
  location?: string;
  verifiedOnly: boolean;
  sort: ProductSort;
  limit: number;
  offset: number;
}
