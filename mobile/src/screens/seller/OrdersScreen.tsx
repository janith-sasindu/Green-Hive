import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView } from 'react-native';
import { AppHeader } from '../../components/seller/AppHeader';
import { OrderCard } from '../../components/seller/OrderCard';
import { Chip, EmptyState, PrimaryButton, Screen } from '../../components/seller/ui';
import { useSeller } from '../../context/SellerContext';
import { useSellerNavigation } from '../../hooks/useSellerNavigation';
import type { Order } from '../../types/seller';
import { isActiveOrder, isInTransit } from '../../utils/sellerWorkflow';

type OrderFilter = 'all' | 'active' | 'inTransit' | 'completed';

const FILTERS: { value: OrderFilter; label: string; matches: (order: Order) => boolean }[] = [
  { value: 'all', label: 'All', matches: () => true },
  { value: 'active', label: 'Active', matches: isActiveOrder },
  { value: 'inTransit', label: 'In Transit', matches: isInTransit },
  { value: 'completed', label: 'Completed', matches: (order) => order.status === 'COMPLETED' },
];

export const OrdersScreen = () => {
  const navigation = useSellerNavigation();
  const { orders } = useSeller();
  const [filter, setFilter] = useState<OrderFilter>('all');

  const visibleOrders = useMemo(() => {
    const active = FILTERS.find((item) => item.value === filter) ?? FILTERS[0];
    return orders.filter(active.matches);
  }, [orders, filter]);

  return (
    <Screen>
      <AppHeader title="My Orders" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14, gap: 8 }}
      >
        {FILTERS.map((item) => (
          <Chip
            key={item.value}
            label={item.label}
            active={filter === item.value}
            onPress={() => setFilter(item.value)}
          />
        ))}
      </ScrollView>

      <FlatList
        data={visibleOrders}
        keyExtractor={(order) => String(order.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 12 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            showPayment
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
          />
        )}
        ListEmptyComponent={
          filter === 'all' ? (
            <EmptyState
              emoji="📦"
              title="No orders yet"
              message="Products you buy from farmers will appear here with their delivery and payment status."
            >
              <PrimaryButton
                label="Browse Products"
                onPress={() => navigation.navigate('SellerTabs', { screen: 'Market' })}
              />
            </EmptyState>
          ) : (
            <EmptyState emoji="📦" title="Nothing here" message="No orders match this filter right now." />
          )
        }
      />
    </Screen>
  );
};
