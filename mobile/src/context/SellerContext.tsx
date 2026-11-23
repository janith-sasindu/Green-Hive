import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { sellerApi } from '../api/sellerApi';
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
  updateProfile: (changes: ProfileChanges) => Promise<void>;
  /** Pays for and creates an order. Rejects when the server refuses it (e.g. out of stock). */
  placeOrder: (input: PlaceOrderInput) => Promise<Order>;
  createRequirement: (input: CreateRequirementInput) => Promise<SellerRequirement>;
  rejectFulfillmentRequest: (requestId: number) => Promise<void>;
  approveTransportOffer: (jobId: number, offerId: number) => Promise<void>;
  rejectTransportOffer: (jobId: number, offerId: number) => Promise<void>;
  confirmReceipt: (orderId: number) => Promise<void>;
  markNotificationRead: (notificationId: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  saveNotificationSettings: (settings: NotificationSettings) => Promise<void>;
  /** Re-reads everything from the server. */
  refresh: () => Promise<void>;
}

interface SellerContextValue extends SellerState, SellerActions {
  unreadCount: number;
  stats: DashboardStats;
}

const SellerContext = createContext<SellerContextValue | null>(null);

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

/**
 * Holds the Retail Seller module's data. The server (see /api/seller) owns the workflow
 * rules and the database; each action calls it and replaces the local state with the
 * fresh state it returns.
 */
export const SellerProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<SellerState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const apply = useCallback((next: SellerState) => {
    if (mounted.current) setState(next);
  }, []);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      apply((await sellerApi.getState()).state);
    } catch (error) {
      if (mounted.current) setLoadError(messageOf(error));
    }
  }, [apply]);

  useEffect(() => {
    load();
  }, [load]);

  const actions = useMemo<SellerActions>(() => {
    // Quiet actions report a failure with an alert, then re-sync so the screen shows the truth
    const quiet = async (request: Promise<{ state: SellerState }>) => {
      try {
        apply((await request).state);
      } catch (error) {
        Alert.alert('Action failed', messageOf(error));
        await load();
      }
    };

    return {
      updateProfile: (changes) => quiet(sellerApi.updateProfile(changes)),
      placeOrder: async (input) => {
        const { orderId, state: next } = await sellerApi.placeOrder(input);
        apply(next);
        const order = next.orders.find((item) => item.id === orderId);
        if (!order) throw new Error('The order was placed but could not be loaded. Check My Orders.');
        return order;
      },
      createRequirement: async (input) => {
        const { requirementId, state: next } = await sellerApi.createRequirement(input);
        apply(next);
        const requirement = next.requirements.find((item) => item.id === requirementId);
        if (!requirement) throw new Error('The requirement was saved but could not be loaded.');
        return requirement;
      },
      rejectFulfillmentRequest: (requestId) => quiet(sellerApi.rejectFulfillmentRequest(requestId)),
      approveTransportOffer: (jobId, offerId) => quiet(sellerApi.approveTransportOffer(jobId, offerId)),
      rejectTransportOffer: (jobId, offerId) => quiet(sellerApi.rejectTransportOffer(jobId, offerId)),
      confirmReceipt: async (orderId) => {
        apply((await sellerApi.confirmReceipt(orderId)).state);
      },
      markNotificationRead: (id) => quiet(sellerApi.markNotificationRead(id)),
      markAllNotificationsRead: () => quiet(sellerApi.markAllNotificationsRead()),
      saveNotificationSettings: (settings) => quiet(sellerApi.saveNotificationSettings(settings)),
      refresh: load,
    };
  }, [apply, load]);

  const value = useMemo<SellerContextValue | null>(
    () =>
      state && {
        ...state,
        ...actions,
        unreadCount: state.notifications.filter((item) => !item.isRead).length,
        stats: workflow.getDashboardStats(state.orders),
      },
    [state, actions],
  );

  if (!value) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f1f6f2] px-8 dark:bg-slate-900">
        {loadError ? (
          <>
            <Text className="mb-1 text-base font-bold text-gray-900 dark:text-slate-100">Could not load your data</Text>
            <Text className="mb-5 text-center text-sm text-gray-500 dark:text-slate-400">{loadError}</Text>
            <TouchableOpacity onPress={load} className="rounded-xl bg-[#2e7d32] px-6 py-3" accessibilityRole="button">
              <Text className="font-bold text-white">Try again</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color="#2e7d32" />
            <Text className="mt-3 text-sm text-gray-500 dark:text-slate-400">Loading your marketplace…</Text>
          </>
        )}
      </View>
    );
  }

  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
};

export const useSeller = (): SellerContextValue => {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used inside a SellerProvider');
  }
  return context;
};
