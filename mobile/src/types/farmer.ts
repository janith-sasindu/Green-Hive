export interface Advertisement {
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
}

export interface FulfillmentRequest {
  id: number;
  requirementId: number;
  farmerId: number;
  offeredQuantityKg: number;
  offeredPricePerKg: number;
  notes?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}
