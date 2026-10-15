import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { SellerRequirement } from '../../types/seller';
import { formatDate, formatKg, formatLkr } from '../../utils/format';
import { REQUIREMENT_STATUS } from '../../utils/sellerStatus';
import { getRequirementStatus } from '../../utils/sellerWorkflow';
import { useSellerTheme } from './theme';
import { Card, StatusBadge, ink } from './ui';

interface RequirementCardProps {
  requirement: SellerRequirement;
  /** Fulfillment requests still waiting for the seller's decision. */
  pendingRequests: number;
  onPress: () => void;
}

export const RequirementCard = ({ requirement, pendingRequests, onPress }: RequirementCardProps) => {
  const theme = useSellerTheme();
  const status = getRequirementStatus(requirement);

  return (
    <Card onPress={onPress} className="p-4">
      <View className="flex-row items-start justify-between">
        <Text className={`flex-1 pr-2 text-base font-bold ${ink.strong}`} numberOfLines={1}>
          {requirement.productName} · {formatKg(requirement.quantityNeededKg)}
        </Text>
        <StatusBadge {...REQUIREMENT_STATUS[status]} />
      </View>
      <Text className={`mt-0.5 text-xs ${ink.muted}`}>
        Up to {formatLkr(requirement.maxBudgetPerKg)}/kg · {requirement.category}
      </Text>
      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Feather name="clock" size={13} color={theme.iconMuted} />
          <Text className={`ml-1.5 text-xs ${ink.faint}`}>Needed by {formatDate(requirement.deadlineDate)}</Text>
        </View>
        {status === 'OPEN' && (
          <Text className={`text-xs font-semibold ${pendingRequests > 0 ? ink.accent : ink.faint}`}>
            {pendingRequests > 0
              ? `${pendingRequests} ${pendingRequests === 1 ? 'request' : 'requests'} →`
              : 'No requests yet'}
          </Text>
        )}
      </View>
    </Card>
  );
};
