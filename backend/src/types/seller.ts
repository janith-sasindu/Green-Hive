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
