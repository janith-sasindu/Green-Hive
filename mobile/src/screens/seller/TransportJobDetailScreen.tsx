import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { AppHeader } from '../../components/seller/AppHeader';
import { useSellerTheme } from '../../components/seller/theme';
import {
  Card,
  ConfirmDialog,
  EmptyState,
  PrimaryButton,
  RouteSummary,
  Screen,
  SecondaryButton,
  SectionLabel,
  StatusBadge,
  Timeline,
  ink,
} from '../../components/seller/ui';
import { useSeller } from '../../context/SellerContext';
import { useSellerNavigation } from '../../hooks/useSellerNavigation';
import type { SellerTransportOffer } from '../../types/seller';
import type { SellerStackParamList } from '../../types/sellerNavigation';
import { formatKg, formatLkr } from '../../utils/format';
import { RESPONSE_STATUS, TRANSPORT_JOB_STATUS, TRANSPORT_PAYMENT_STATUS } from '../../utils/sellerStatus';

interface OfferCardProps {
  offer: SellerTransportOffer;
  isLowest: boolean;
  /** Approve / reject are only offered while the job is still open for bids. */
  canDecide: boolean;
  onApprove: () => void;
  onReject: () => void;
}

const OfferCard = ({ offer, isLowest, canDecide, onApprove, onReject }: OfferCardProps) => {
  const theme = useSellerTheme();
  const isPending = offer.status === 'PENDING';

  return (
    <Card className="p-4">
      <View className="flex-row items-start">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/20">
          <Feather name="truck" size={18} color="#d97706" />
        </View>
        <View className="flex-1 pr-2">
          <Text className={`text-base font-bold ${ink.strong}`} numberOfLines={1}>
            {offer.transporter.name}
          </Text>
          <Text className={`text-xs ${ink.muted}`} numberOfLines={1}>
            {offer.transporter.vehicle}
          </Text>
          <Text className={`mt-0.5 text-xs ${ink.faint}`}>
            ★ {offer.transporter.rating.toFixed(1)} · {offer.transporter.completedJobs} jobs · Est.{' '}
            {offer.estimatedDeliveryTime}
          </Text>
        </View>
        <View className="items-end">
          <Text className={`text-lg font-extrabold ${ink.strong}`}>{formatLkr(offer.proposedCost)}</Text>
          <View className="mt-1 flex-row">
            {isPending ? (
              isLowest && <StatusBadge label="Lowest cost" tone="green" showDot={false} />
            ) : (
              <StatusBadge {...RESPONSE_STATUS[offer.status]} />
            )}
          </View>
        </View>
      </View>

      {isPending && canDecide && (
        <View className="mt-4 flex-row gap-3">
          <View className="flex-1">
            <SecondaryButton label="Reject" size="sm" tone="danger" onPress={onReject} />
          </View>
          <View className="flex-1">
            <PrimaryButton label="Approve" size="sm" onPress={onApprove} />
          </View>
        </View>
      )}
    </Card>
  );
};

export const TransportJobDetailScreen = () => {
  const navigation = useSellerNavigation();
  const theme = useSellerTheme();
  const { params } = useRoute<RouteProp<SellerStackParamList, 'TransportJobDetail'>>();
  const { transportJobs, orders, approveTransportOffer, rejectTransportOffer } = useSeller();
  const [offerToApprove, setOfferToApprove] = useState<SellerTransportOffer | null>(null);

  const job = transportJobs.find((item) => item.id === params.jobId);
  if (!job) {
    return (
      <Screen>
        <AppHeader title="Transport Job" showBack />
        <EmptyState emoji="🚛" title="Job not found" message="This transport job could not be loaded." />
      </Screen>
    );
  }

  const order = orders.find((item) => item.id === job.orderId);
  const isOpen = job.status === 'OPEN_FOR_BIDS';
  const offers = [...job.offers].sort((a, b) => a.proposedCost - b.proposedCost);
  const pendingOffers = offers.filter((offer) => offer.status === 'PENDING');
  const assignedOffer = offers.find((offer) => offer.status === 'ACCEPTED');
  // Only worth pointing out when there is more than one offer to compare
  const lowestPendingId = pendingOffers.length > 1 ? pendingOffers[0].id : null;

  const handleApprove = () => {
    if (!offerToApprove) return;
    approveTransportOffer(job.id, offerToApprove.id);
    setOfferToApprove(null);
  };

  return (
    <Screen>
      <AppHeader title={`Job #${job.jobNumber}`} showBack />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Card className="p-4">
          <View className="flex-row items-start justify-between">
            <Text className={`flex-1 pr-2 text-lg font-bold ${ink.strong}`} numberOfLines={1}>
              {job.productName} · {formatKg(job.quantityKg)}
            </Text>
            <StatusBadge {...TRANSPORT_JOB_STATUS[job.status]} showDot={false} />
          </View>
          <View className="mt-3">
            <RouteSummary pickup={job.pickupLocation} delivery={job.deliveryLocation} />
          </View>
          <View className="mt-3 flex-row items-center justify-between border-t border-gray-100 pt-3 dark:border-slate-700">
            <View className="flex-row items-center">
              <Feather name="clock" size={13} color={theme.iconMuted} />
              <Text className={`ml-1.5 text-xs ${ink.faint}`}>
                {job.requiredDate} · {job.requiredTime}
              </Text>
            </View>
            {order && (
              <TouchableOpacity
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
              >
                <Text className={`text-sm font-semibold ${ink.accent}`}>Order #{order.orderNumber} →</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {assignedOffer && (
          <Card className="mt-3 p-4">
            <SectionLabel>Assigned transporter</SectionLabel>
            <View className="mt-3 flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className={`text-base font-bold ${ink.strong}`}>{assignedOffer.transporter.name}</Text>
                <Text className={`text-xs ${ink.muted}`}>
                  {assignedOffer.transporter.vehicle} · ★ {assignedOffer.transporter.rating.toFixed(1)}
                </Text>
              </View>
              <View className="items-end">
                <Text className={`text-lg font-extrabold ${ink.strong}`}>
                  {formatLkr(assignedOffer.proposedCost)}
                </Text>
                {order && (
                  <View className="mt-1 flex-row">
                    <StatusBadge {...TRANSPORT_PAYMENT_STATUS[order.transportPaymentStatus]} />
                  </View>
                )}
              </View>
            </View>
            <View className="mt-4 border-t border-gray-100 pt-4 dark:border-slate-700">
              <Timeline
                steps={[
                  {
                    title: 'Transporter approved',
                    description: 'Transportation payment held by Green Hive',
                    done: true,
                  },
                  {
                    title: 'Goods picked up',
                    description: 'Transporter confirms pickup from the farmer',
                    done: job.status === 'GOODS_PICKED_UP' || job.status === 'GOODS_DELIVERED',
                  },
                  {
                    title: 'Delivered and confirmed',
                    description: 'You confirm receipt and the transporter is paid',
                    done: order?.transportPaymentStatus === 'RELEASED',
                  },
                ]}
              />
            </View>
          </Card>
        )}

        <View className="mb-3 mt-6">
          <SectionLabel>{`Transporter offers (${offers.length})`}</SectionLabel>
        </View>
        {isOpen && (
          <Text className={`mb-3 text-sm leading-5 ${ink.muted}`}>
            {pendingOffers.length > 0
              ? 'Compare the submitted costs and approve the transporter that suits you. The cost is held by Green Hive until you confirm delivery.'
              : 'Transporters can see this job. You will be notified when they submit their costs.'}
          </Text>
        )}
        {offers.length === 0 ? (
          <Card className="p-2">
            <EmptyState
              emoji="⏳"
              title="Waiting for offers"
              message="No transporter has submitted a cost for this job yet."
            />
          </Card>
        ) : (
          <View className="gap-3">
            {offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                isLowest={offer.id === lowestPendingId}
                canDecide={isOpen}
                onApprove={() => setOfferToApprove(offer)}
                onReject={() => rejectTransportOffer(job.id, offer.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={offerToApprove !== null}
        title="Approve this transporter?"
        message={
          offerToApprove
            ? `${offerToApprove.transporter.name} will deliver this order for ${formatLkr(
                offerToApprove.proposedCost,
              )}. The amount is held by Green Hive and released only after you confirm delivery. Other offers will be declined.`
            : ''
        }
        confirmLabel="Approve & Pay"
        onConfirm={handleApprove}
        onCancel={() => setOfferToApprove(null)}
      />
    </Screen>
  );
};
