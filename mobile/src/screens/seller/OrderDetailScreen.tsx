import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { AppHeader } from '../../components/seller/AppHeader';
import { useSellerTheme } from '../../components/seller/theme';
import {
  Card,
  ConfirmDialog,
  EmptyState,
  InfoRow,
  PrimaryButton,
  ProductImage,
  RouteSummary,
  Screen,
  SectionLabel,
  StatusBadge,
  Timeline,
  TimelineStep,
  ink,
} from '../../components/seller/ui';
import { useSeller } from '../../context/SellerContext';
import { useSellerNavigation } from '../../hooks/useSellerNavigation';
import type { Order, SellerTransportJob } from '../../types/seller';
import type { SellerStackParamList } from '../../types/sellerNavigation';
import { formatDateTime, formatKg, formatLkr } from '../../utils/format';
import {
  ORDER_STATUS,
  PRODUCT_PAYMENT_STATUS,
  StatusMeta,
  TRANSPORT_PAYMENT_STATUS,
} from '../../utils/sellerStatus';
import {
  canConfirmReceipt,
  getAssignedTransporterName,
  getOrderTotal,
  isInTransit,
} from '../../utils/sellerWorkflow';

const buildTimeline = (order: Order, transporterName?: string): TimelineStep[] => {
  const completed = order.status === 'COMPLETED';
  const placed: TimelineStep = {
    title: 'Order placed',
    description: 'Product payment held by Green Hive',
    done: true,
  };

  if (order.deliveryMethod === 'SELF_PICKUP') {
    return [
      placed,
      {
        title: 'Goods collected',
        description: 'You confirm receipt and the farmer is paid',
        done: completed,
      },
    ];
  }

  const transporterApproved =
    order.transportPaymentStatus === 'HELD' || order.transportPaymentStatus === 'RELEASED';
  return [
    placed,
    {
      title: 'Transporter approved',
      description: transporterApproved
        ? `${transporterName ?? 'Transporter'} assigned · transportation payment held`
        : 'Choose one of the submitted transporter offers',
      done: transporterApproved,
    },
    {
      title: 'Goods picked up',
      description: 'Product payment released to the farmer',
      done: isInTransit(order) || completed,
    },
    {
      title: 'Delivered',
      description: 'Goods arrive at your delivery location',
      done: order.status === 'DELIVERED' || completed,
    },
    {
      title: 'Receipt confirmed',
      description: 'Transportation payment released to the transporter',
      done: completed,
    },
  ];
};

/** One-line guidance on what the seller should expect or do next. */
const getNextStep = (order: Order, job?: SellerTransportJob, transporterName?: string): string => {
  if (order.status === 'COMPLETED') {
    return order.completedAt
      ? `Completed on ${formatDateTime(order.completedAt)}. All payments have been released.`
      : 'This order is complete. All payments have been released.';
  }
  if (order.status === 'CANCELLED') return 'This order was cancelled.';
  if (order.deliveryMethod === 'SELF_PICKUP') {
    return 'Collect your goods from the farmer, then confirm receipt to release the payment.';
  }
  if (order.status === 'DELIVERED') {
    return 'The transporter marked this order as delivered. Confirm receipt to release their payment.';
  }
  if (order.status === 'PICKED_UP') {
    return 'Your goods are on the way. Confirm receipt once they arrive in good condition.';
  }
  if (job?.status === 'OPEN_FOR_BIDS') {
    const pending = job.offers.filter((offer) => offer.status === 'PENDING').length;
    return pending > 0
      ? `${pending} transporter ${pending === 1 ? 'offer is' : 'offers are'} waiting for your review.`
      : 'Waiting for transporters to submit their costs for this delivery.';
  }
  return `Waiting for ${transporterName ?? 'the transporter'} to collect the goods from the farmer.`;
};

interface PaymentRowProps {
  title: string;
  caption: string;
  amount: string;
  status: StatusMeta;
}

const PaymentRow = ({ title, caption, amount, status }: PaymentRowProps) => (
  <View className="flex-row items-center justify-between py-2.5">
    <View className="flex-1 pr-3">
      <Text className={`text-sm font-semibold ${ink.strong}`}>{title}</Text>
      <Text className={`mt-0.5 text-xs leading-4 ${ink.muted}`}>{caption}</Text>
    </View>
    <View className="items-end">
      <Text className={`text-sm font-bold ${ink.strong}`}>{amount}</Text>
      <View className="mt-1 flex-row">
        <StatusBadge {...status} />
      </View>
    </View>
  </View>
);

export const OrderDetailScreen = () => {
  const navigation = useSellerNavigation();
  const insets = useSafeAreaInsets();
  const theme = useSellerTheme();
  const { params } = useRoute<RouteProp<SellerStackParamList, 'OrderDetail'>>();
  const { orders, transportJobs, confirmReceipt } = useSeller();
  const [notice, setNotice] = useState<string | null>(
    params.justPlaced ? 'Order placed. Your payment is held securely by Green Hive.' : null,
  );
  const [confirmVisible, setConfirmVisible] = useState(false);

  const order = orders.find((item) => item.id === params.orderId);
  if (!order) {
    return (
      <Screen>
        <AppHeader title="Order Details" showBack />
        <EmptyState emoji="📦" title="Order not found" message="This order could not be loaded." />
      </Screen>
    );
  }

  const transported = order.deliveryMethod === 'TRANSPORTATION';
  const job = transportJobs.find((item) => item.id === order.transportJobId);
  const transporterName = job ? getAssignedTransporterName(job) : undefined;
  // What confirming receipt releases: the transporter's payment, or the farmer's for self pickup
  const releaseAmount = transported ? (order.transportCost ?? 0) : order.totalProductAmount;
  const releaseRecipient = transported ? (transporterName ?? 'the transporter') : order.farmer.name;

  // Only reachable while canConfirmReceipt(order) holds, which is the rule confirmReceipt enforces
  const handleConfirmReceipt = () => {
    setConfirmVisible(false);
    confirmReceipt(order.id);
    setNotice(`Receipt confirmed. ${formatLkr(releaseAmount)} was released to ${releaseRecipient}.`);
  };

  return (
    <Screen>
      <AppHeader title={`Order #${order.orderNumber}`} showBack />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {notice && (
          <View className="mb-3 flex-row items-center rounded-2xl border border-green-200 bg-green-50 p-3.5 dark:border-green-500/30 dark:bg-green-500/10">
            <Feather name="check-circle" size={18} color="#16a34a" />
            <Text className="ml-2.5 flex-1 text-sm font-semibold text-green-800 dark:text-green-300">{notice}</Text>
          </View>
        )}

        <Card className="p-4">
          <View className="flex-row items-center">
            <ProductImage uri={order.imageUrl} emoji={order.emoji} className="h-16 w-16 rounded-xl" />
            <View className="ml-3 flex-1">
              <Text className={`text-lg font-bold ${ink.strong}`} numberOfLines={1}>
                {order.productName}
              </Text>
              <Text className={`text-xs ${ink.muted}`}>
                {formatKg(order.quantityKg)} × {formatLkr(order.productPricePerKg)}/kg
              </Text>
              <View className="mt-1.5 flex-row">
                <StatusBadge {...ORDER_STATUS[order.status]} />
              </View>
            </View>
          </View>
          <View className="mt-3 border-t border-gray-100 pt-3 dark:border-slate-700">
            <Text className={`text-sm leading-5 ${ink.body}`}>{getNextStep(order, job, transporterName)}</Text>
            <Text className={`mt-1.5 text-xs ${ink.faint}`}>Placed on {formatDateTime(order.createdAt)}</Text>
          </View>
        </Card>

        <Card className="mt-3 p-4">
          <SectionLabel>Order progress</SectionLabel>
          <View className="mt-4">
            <Timeline steps={buildTimeline(order, transporterName)} />
          </View>
        </Card>

        <Card className="mt-3 p-4">
          <SectionLabel>Payments</SectionLabel>
          <View className="mt-1">
            <PaymentRow
              title="Product payment"
              caption={
                order.productPaymentStatus === 'RELEASED'
                  ? `Released to ${order.farmer.name}`
                  : transported
                    ? 'Released to the farmer when pickup is confirmed'
                    : 'Released to the farmer when you confirm receipt'
              }
              amount={formatLkr(order.totalProductAmount)}
              status={PRODUCT_PAYMENT_STATUS[order.productPaymentStatus]}
            />
            {transported && (
              <PaymentRow
                title="Transportation payment"
                caption={
                  order.transportPaymentStatus === 'RELEASED'
                    ? `Released to ${transporterName ?? 'the transporter'}`
                    : order.transportPaymentStatus === 'HELD'
                      ? 'Released to the transporter when you confirm delivery'
                      : 'Paid when you approve a transporter offer'
                }
                amount={order.transportCost !== undefined ? formatLkr(order.transportCost) : '—'}
                status={TRANSPORT_PAYMENT_STATUS[order.transportPaymentStatus]}
              />
            )}
          </View>
          <View className="mt-1 flex-row items-center justify-between border-t border-gray-100 pt-3 dark:border-slate-700">
            <Text className={`text-sm font-bold ${ink.strong}`}>Total paid</Text>
            <Text className={`text-xl font-extrabold ${ink.strong}`}>{formatLkr(getOrderTotal(order))}</Text>
          </View>
        </Card>

        <Card className="mt-3 gap-4 p-4">
          <SectionLabel>Farmer</SectionLabel>
          <InfoRow
            icon="user"
            label={order.farmer.isVerified ? 'Verified farmer' : 'Farmer'}
            value={`${order.farmer.name} · ★ ${order.farmer.rating.toFixed(1)}`}
          />
          <InfoRow icon="map-pin" label="Pickup location" value={order.pickupAddress} />
        </Card>

        <Card className="mt-3 p-4">
          <SectionLabel>Delivery</SectionLabel>
          {job ? (
            <>
              <Text className={`mb-3 mt-3 text-sm font-semibold ${ink.strong}`}>
                Transportation · Job #{job.jobNumber}
              </Text>
              <RouteSummary pickup={job.pickupLocation} delivery={job.deliveryLocation} />
              <View className="mt-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Feather name="clock" size={13} color={theme.iconMuted} />
                  <Text className={`ml-1.5 text-xs ${ink.faint}`}>
                    {job.requiredDate} · {job.requiredTime}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('TransportJobDetail', { jobId: job.id })}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                >
                  <Text className={`text-sm font-semibold ${ink.accent}`}>
                    {job.status === 'OPEN_FOR_BIDS' ? 'Review offers →' : 'View transport job →'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text className={`mt-3 text-sm leading-5 ${ink.body}`}>
              Self pickup. You collect the goods directly from the farmer's pickup location.
            </Text>
          )}
        </Card>
      </ScrollView>

      {canConfirmReceipt(order) && (
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          className="border-t border-gray-100 bg-white px-4 pt-3 dark:border-slate-700 dark:bg-slate-800"
        >
          <PrimaryButton label="Confirm Receipt of Goods" onPress={() => setConfirmVisible(true)} />
        </View>
      )}

      <ConfirmDialog
        visible={confirmVisible}
        title="Confirm receipt?"
        message={`Confirm that you received ${formatKg(order.quantityKg)} of ${order.productName} in good condition. ${formatLkr(
          releaseAmount,
        )} will be released to ${releaseRecipient}. This cannot be undone.`}
        confirmLabel="Confirm Receipt"
        onConfirm={handleConfirmReceipt}
        onCancel={() => setConfirmVisible(false)}
      />
    </Screen>
  );
};
