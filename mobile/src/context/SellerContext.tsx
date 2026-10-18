import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createInitialSellerState } from '../data/sellerMockData';
import type {
  CreateRequirementInput,
  DashboardStats,
  NotificationSettings,
  Order,
  PlaceOrderInput,
  SellerProfile,
  SellerRequirement,
  SellerState,
} from '../types/seller';
import * as workflow from '../utils/sellerWorkflow';

export type ProfileChanges = Partial<Pick<SellerProfile, 'phone' | 'email' | 'location' | 'avatarUri'>>;

interface SellerActions {
  updateProfile: (changes: ProfileChanges) => void;
  /** Pays for and creates an order. Throws when the request is no longer valid. */
  placeOrder: (input: PlaceOrderInput) => Order;
  createRequirement: (input: CreateRequirementInput) => SellerRequirement;
  rejectFulfillmentRequest: (requestId: number) => void;
  approveTransportOffer: (jobId: number, offerId: number) => void;
  rejectTransportOffer: (jobId: number, offerId: number) => void;
  confirmReceipt: (orderId: number) => void;
  markNotificationRead: (notificationId: number) => void;
  markAllNotificationsRead: () => void;
  saveNotificationSettings: (settings: NotificationSettings) => void;
}

interface SellerContextValue extends SellerState, SellerActions {
  unreadCount: number;
  stats: DashboardStats;
}

const SellerContext = createContext<SellerContextValue | null>(null);

/**
 * Holds the Retail Seller module's data for the session. It is seeded with sample data
 * and updated through the workflow rules; replace the seed and the commits with seller
 * API calls once the backend routes are available.
 */
export const SellerProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<SellerState>(createInitialSellerState);
  // Actions read the latest state from the ref so consecutive updates never use a stale snapshot
  const stateRef = useRef(state);

  const commit = useCallback((next: SellerState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const actions = useMemo<SellerActions>(
    () => ({
      updateProfile: (changes) =>
        commit({ ...stateRef.current, profile: { ...stateRef.current.profile, ...changes } }),
      placeOrder: (input) => {
        const result = workflow.placeOrder(stateRef.current, input);
        commit(result.state);
        return result.order;
      },
      createRequirement: (input) => {
        const result = workflow.createRequirement(stateRef.current, input);
        commit(result.state);
        return result.requirement;
      },
      rejectFulfillmentRequest: (requestId) =>
        commit(workflow.rejectFulfillmentRequest(stateRef.current, requestId)),
      approveTransportOffer: (jobId, offerId) =>
        commit(workflow.approveTransportOffer(stateRef.current, jobId, offerId)),
      rejectTransportOffer: (jobId, offerId) =>
        commit(workflow.rejectTransportOffer(stateRef.current, jobId, offerId)),
      confirmReceipt: (orderId) => commit(workflow.confirmReceipt(stateRef.current, orderId)),
      markNotificationRead: (notificationId) =>
        commit(workflow.markNotificationRead(stateRef.current, notificationId)),
      markAllNotificationsRead: () => commit(workflow.markAllNotificationsRead(stateRef.current)),
      saveNotificationSettings: (settings) =>
        commit({ ...stateRef.current, notificationSettings: settings }),
    }),
    [commit],
  );

  const value = useMemo<SellerContextValue>(
    () => ({
      ...state,
      ...actions,
      unreadCount: state.notifications.filter((item) => !item.isRead).length,
      stats: workflow.getDashboardStats(state.orders),
    }),
    [state, actions],
  );

  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
};

export const useSeller = (): SellerContextValue => {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used inside a SellerProvider');
  }
  return context;
};
