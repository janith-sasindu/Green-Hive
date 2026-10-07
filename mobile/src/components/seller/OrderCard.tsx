import React from 'react';
import { Text, View } from 'react-native';
import type { Order } from '../../types/seller';
import { formatKg, formatLkr } from '../../utils/format';
import { ORDER_STATUS, PRODUCT_PAYMENT_STATUS } from '../../utils/sellerStatus';
import { getOrderTotal } from '../../utils/sellerWorkflow';
import { Card, ProductImage, StatusBadge, ink } from './ui';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  /** Adds the product payment state (held / paid) under the order summary. */
  showPayment?: boolean;
}

export const OrderCard = ({ order, onPress, showPayment = false }: OrderCardProps) => (
  <Card onPress={onPress} className="flex-row p-3.5">
    <ProductImage uri={order.imageUrl} emoji={order.emoji} className="h-14 w-14 rounded-xl" />
    <View className="ml-3 flex-1">
      <View className="flex-row items-start justify-between">
        <Text className={`flex-1 pr-2 text-base font-bold ${ink.strong}`} numberOfLines={1}>
          {order.productName}
        </Text>
        <StatusBadge {...ORDER_STATUS[order.status]} />
      </View>
      <Text className={`text-xs ${ink.muted}`} numberOfLines={1}>
        {order.farmer.name} · {formatKg(order.quantityKg)}
      </Text>
      <View className="mt-1 flex-row items-center justify-between">
        <Text className={`text-xs ${ink.faint}`}>#{order.orderNumber}</Text>
        <Text className={`text-base font-extrabold ${ink.strong}`}>{formatLkr(getOrderTotal(order))}</Text>
      </View>
      {showPayment && (
        <View className="mt-2">
          <StatusBadge {...PRODUCT_PAYMENT_STATUS[order.productPaymentStatus]} />
        </View>
      )}
    </View>
  </Card>
);
