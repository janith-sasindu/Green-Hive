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
