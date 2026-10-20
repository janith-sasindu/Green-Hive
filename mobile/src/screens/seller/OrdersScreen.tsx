import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppHeader } from '../../components/seller/AppHeader';
import { OrderCard } from '../../components/seller/OrderCard';
import { useSellerTheme } from '../../components/seller/theme';
import { Chip, EmptyState, PrimaryButton, Screen, ink } from '../../components/seller/ui';
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

/** Matches an order by its number, product name or farmer name. */
const matchesSearch = (order: Order, term: string): boolean =>
  [order.orderNumber, order.productName, order.farmer.name].some((value) => value.toLowerCase().includes(term));

export const OrdersScreen = () => {
  const navigation = useSellerNavigation();
  const theme = useSellerTheme();
  const { orders } = useSeller();
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [search, setSearch] = useState('');

  const visibleOrders = useMemo(() => {
    const active = FILTERS.find((item) => item.value === filter) ?? FILTERS[0];
    const term = search.trim().toLowerCase();
    return orders.filter((order) => active.matches(order) && (term === '' || matchesSearch(order, term)));
  }, [orders, filter, search]);

  return (
    <Screen>
      <AppHeader title="My Orders" />
      <View className="px-4 pt-4">
        <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800">
          <Feather name="search" size={18} color={theme.iconMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
            placeholder="Search by order number, product or farmer"
            placeholderTextColor={theme.placeholder}
            accessibilityLabel="Search orders"
            className={`ml-3 flex-1 py-3.5 text-sm ${ink.strong}`}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} accessibilityLabel="Clear order search">
              <Feather name="x" size={18} color={theme.iconMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14, gap: 8 }}
        bounces={true}
        scrollEventThrottle={16}
        decelerationRate="normal"
        overScrollMode="never"
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
        bounces={true}
        scrollEventThrottle={16}
        decelerationRate="normal"
        overScrollMode="never"
        nestedScrollEnabled={true}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            showPayment
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
          />
        )}
        ListEmptyComponent={
          filter === 'all' && search.trim() === '' ? (
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
            <EmptyState
              emoji="📦"
              title="Nothing here"
              message={search.trim() === '' ? 'No orders match this filter right now.' : 'No orders match your search.'}
            />
          )
        }
      />
    </Screen>
  );
};
