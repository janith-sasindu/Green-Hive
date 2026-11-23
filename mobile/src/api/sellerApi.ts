import axios from 'axios';
import { apiClient } from './client';
import type {
  CreateRequirementInput,
  NotificationSettings,
  PlaceOrderInput,
  SellerProfile,
  SellerState,
} from '../types/seller';

/**
 * Retail Seller REST endpoints. Every call answers with the seller's full, current state
 * (plus the id of anything it created), so the app always mirrors the database.
 */
interface SellerResponse<T> {
  success: boolean;
  message?: string;
  data: T & { state: SellerState };
}

const unwrap = async <T = object>(request: Promise<{ data: SellerResponse<T> }>) => {
  try {
    return (await request).data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = (error.response?.data as { message?: string } | undefined)?.message;
      if (message) throw new Error(message);
      if (!error.response) {
        throw new Error('Cannot reach the Green Hive server. Check your connection and try again.');
      }
    }
    throw error;
  }
};

export const sellerApi = {
  getState: () => unwrap(apiClient.get('/seller/state')),
  updateProfile: (changes: Partial<Pick<SellerProfile, 'phone' | 'email' | 'location' | 'avatarUri'>>) =>
    unwrap(apiClient.put('/seller/profile', changes)),
  createRequirement: (input: CreateRequirementInput) =>
    unwrap<{ requirementId: number }>(apiClient.post('/seller/requirements', input)),
  rejectFulfillmentRequest: (requestId: number) =>
    unwrap(apiClient.post(`/seller/fulfillment-requests/${requestId}/reject`)),
  placeOrder: (input: PlaceOrderInput) => unwrap<{ orderId: number }>(apiClient.post('/seller/orders', input)),
  confirmReceipt: (orderId: number) => unwrap(apiClient.post(`/seller/orders/${orderId}/confirm-receipt`)),
  approveTransportOffer: (jobId: number, offerId: number) =>
    unwrap(apiClient.post(`/seller/transport-jobs/${jobId}/offers/${offerId}/approve`)),
  rejectTransportOffer: (jobId: number, offerId: number) =>
    unwrap(apiClient.post(`/seller/transport-jobs/${jobId}/offers/${offerId}/reject`)),
  markNotificationRead: (id: number) => unwrap(apiClient.post(`/seller/notifications/${id}/read`)),
  markAllNotificationsRead: () => unwrap(apiClient.post('/seller/notifications/read-all')),
  saveNotificationSettings: (settings: NotificationSettings) =>
    unwrap(apiClient.put('/seller/notification-settings', settings)),
};
