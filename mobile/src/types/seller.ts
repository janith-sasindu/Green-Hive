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
  deliveryMethod: 'SELF_PICKUP' | 'TRANSPORTATION';
  status: 'CREATED' | 'PAYMENT_HELD' | 'PICKED_UP' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
}
