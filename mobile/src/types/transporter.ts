export interface TransportationJob {
  id: number;
  orderId: number;
  pickupLocation: string;
  deliveryLocation: string;
  quantityKg: number;
  requiredDate: string;
  assignedTransporterId?: number;
  agreedTransportCost?: number;
  status: 'OPEN_FOR_BIDS' | 'TRANSPORTER_ASSIGNED' | 'GOODS_PICKED_UP' | 'GOODS_DELIVERED';
}

export interface TransportationOffer {
  id: number;
  jobId: number;
  transporterId: number;
  proposedCost: number;
  estimatedDeliveryTime: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}
