import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { AppHeader } from '../../components/seller/AppHeader';
import {
  Card,
  EmptyState,
  InfoRow,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionLabel,
  StatusBadge,
  ink,
} from '../../components/seller/ui';
import { useSeller } from '../../context/SellerContext';
import { useSellerNavigation } from '../../hooks/useSellerNavigation';
import type { SellerFulfillmentRequest, SellerRequirement } from '../../types/seller';
import type { SellerStackParamList } from '../../types/sellerNavigation';
import { formatDate, formatKg, formatLkr, getInitial } from '../../utils/format';
import { REQUIREMENT_STATUS, RESPONSE_STATUS } from '../../utils/sellerStatus';
import { getRequirementStatus } from '../../utils/sellerWorkflow';

const OfferFigure = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-1">
    <Text className={`text-[11px] ${ink.faint}`}>{label}</Text>
    <Text className={`mt-0.5 text-sm font-bold ${ink.strong}`}>{value}</Text>
  </View>
);

interface FulfillmentRequestCardProps {
  request: SellerFulfillmentRequest;
  requirement: SellerRequirement;
  /** Accept / reject are only offered while the requirement is still open. */
  canDecide: boolean;
  onAccept: () => void;
  onReject: () => void;
}

const FulfillmentRequestCard = ({ request, requirement, canDecide, onAccept, onReject }: FulfillmentRequestCardProps) => {
  const isPending = request.status === 'PENDING';
  const overBudgetBy = request.offeredPricePerKg - requirement.maxBudgetPerKg;
  const isPartial = request.offeredQuantityKg < requirement.quantityNeededKg;

  return (
    <Card className="p-4">
      <View className="flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
          <Text className="text-sm font-bold text-green-800 dark:text-green-300">{getInitial(request.farmer.name)}</Text>
        </View>
        <View className="flex-1 pr-2">
          <Text className={`text-base font-bold ${ink.strong}`} numberOfLines={1}>
            {request.farmer.name}
          </Text>
          <Text className={`text-xs ${ink.muted}`} numberOfLines={1}>
            {request.farmer.location} · ★ {request.farmer.rating.toFixed(1)}
            {request.farmer.isVerified ? ' · Verified' : ''}
          </Text>
        </View>
        {!isPending && <StatusBadge {...RESPONSE_STATUS[request.status]} />}
      </View>

      <View className="mt-3 flex-row rounded-xl bg-gray-50 p-3 dark:bg-slate-900">
        <OfferFigure label="Quantity" value={formatKg(request.offeredQuantityKg)} />
        <OfferFigure label="Price per kg" value={formatLkr(request.offeredPricePerKg)} />
        <OfferFigure label="Total" value={formatLkr(request.offeredQuantityKg * request.offeredPricePerKg)} />
      </View>

      <View className="mt-3 flex-row flex-wrap gap-2">
        {overBudgetBy > 0 ? (
          <StatusBadge label={`${formatLkr(overBudgetBy)}/kg above budget`} tone="amber" showDot={false} />
        ) : (
          <StatusBadge label="Within budget" tone="green" showDot={false} />
        )}
        {isPartial && (
          <StatusBadge
            label={`Partial: ${formatKg(request.offeredQuantityKg)} of ${formatKg(requirement.quantityNeededKg)}`}
            tone="gray"
            showDot={false}
          />
        )}
      </View>

      {request.notes && <Text className={`mt-3 text-sm italic leading-5 ${ink.body}`}>“{request.notes}”</Text>}

      {isPending && canDecide && (
        <View className="mt-4 flex-row gap-3">
          <View className="flex-1">
            <SecondaryButton label="Reject" size="sm" tone="danger" onPress={onReject} />
          </View>
          <View className="flex-1">
            <PrimaryButton label="Accept & Reserve" size="sm" onPress={onAccept} />
          </View>
        </View>
      )}
    </Card>
  );
};

export const RequirementDetailScreen = () => {
  const navigation = useSellerNavigation();
  const { params } = useRoute<RouteProp<SellerStackParamList, 'RequirementDetail'>>();
  const { requirements, fulfillmentRequests, orders, rejectFulfillmentRequest } = useSeller();

  const requirement = requirements.find((item) => item.id === params.requirementId);
  if (!requirement) {
    return (
      <Screen>
        <AppHeader title="Requirement" showBack />
        <EmptyState emoji="📋" title="Requirement not found" message="This requirement could not be loaded." />
      </Screen>
    );
  }

  const status = getRequirementStatus(requirement);
  const requests = fulfillmentRequests.filter((request) => request.requirementId === requirement.id);
  const reservedOrder = orders.find((order) => order.requirementId === requirement.id);

  return (
    <Screen>
      <AppHeader title="Requirement" showBack />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Card className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-2">
              <Text className={`text-xl font-extrabold ${ink.strong}`}>{requirement.productName}</Text>
              <Text className={`mt-0.5 text-sm ${ink.muted}`}>{requirement.category}</Text>
            </View>
            <StatusBadge {...REQUIREMENT_STATUS[status]} />
          </View>

          <View className="mt-4 flex-row rounded-xl bg-gray-50 p-3 dark:bg-slate-900">
            <OfferFigure label="Quantity needed" value={formatKg(requirement.quantityNeededKg)} />
            <OfferFigure label="Max price per kg" value={formatLkr(requirement.maxBudgetPerKg)} />
            <OfferFigure
              label="Max budget"
              value={formatLkr(requirement.quantityNeededKg * requirement.maxBudgetPerKg)}
            />
          </View>

          <View className="mt-4 gap-4">
            <InfoRow icon="map-pin" label="Deliver to" value={requirement.deliveryLocation} />
            <InfoRow icon="calendar" label="Needed by" value={formatDate(requirement.deadlineDate)} />
          </View>

          {requirement.description !== '' && (
            <Text className={`mt-4 text-sm leading-5 ${ink.body}`}>{requirement.description}</Text>
          )}

          {reservedOrder && (
            <TouchableOpacity
              onPress={() => navigation.navigate('OrderDetail', { orderId: reservedOrder.id })}
              accessibilityRole="button"
              className="mt-4 border-t border-gray-100 pt-3 dark:border-slate-700"
            >
              <Text className={`text-sm font-semibold ${ink.accent}`}>
                Reserved with {reservedOrder.farmer.name} · View order #{reservedOrder.orderNumber} →
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        <View className="mb-3 mt-6">
          <SectionLabel>{`Farmer requests (${requests.length})`}</SectionLabel>
        </View>
        {requests.length === 0 ? (
          <Card className="p-2">
            <EmptyState
              emoji="🌾"
              title="No requests yet"
              message={
                status === 'OPEN'
                  ? 'Farmers can see this requirement. You will be notified when one of them responds.'
                  : 'No farmer responded to this requirement.'
              }
            />
          </Card>
        ) : (
          <View className="gap-3">
            {requests.map((request) => (
              <FulfillmentRequestCard
                key={request.id}
                request={request}
                requirement={requirement}
                canDecide={status === 'OPEN'}
                onAccept={() => navigation.navigate('Checkout', { kind: 'fulfillment', requestId: request.id })}
                onReject={() => rejectFulfillmentRequest(request.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};
