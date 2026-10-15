import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/seller/AppHeader';
import { RequirementCard } from '../../components/seller/RequirementCard';
import { EmptyState, PrimaryButton, Screen, ink } from '../../components/seller/ui';
import { useSeller } from '../../context/SellerContext';
import { useSellerNavigation } from '../../hooks/useSellerNavigation';

export const RequirementsScreen = () => {
  const navigation = useSellerNavigation();
  const insets = useSafeAreaInsets();
  const { requirements, fulfillmentRequests } = useSeller();

  return (
    <Screen>
      <AppHeader title="My Requirements" showBack />
      <FlatList
        data={requirements}
        keyExtractor={(requirement) => String(requirement.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text className={`text-sm ${ink.muted}`}>
            Post what you need and review the fulfillment requests farmers send you.
          </Text>
        }
        renderItem={({ item }) => (
          <RequirementCard
            requirement={item}
            pendingRequests={
              fulfillmentRequests.filter(
                (request) => request.requirementId === item.id && request.status === 'PENDING',
              ).length
            }
            onPress={() => navigation.navigate('RequirementDetail', { requirementId: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            emoji="📋"
            title="No requirements yet"
            message="Tell farmers which product, quantity and price you are looking for."
          />
        }
      />
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        className="border-t border-gray-100 bg-white px-4 pt-3 dark:border-slate-700 dark:bg-slate-800"
      >
        <PrimaryButton label="+ New Requirement" onPress={() => navigation.navigate('CreateRequirement')} />
      </View>
    </Screen>
  );
};
