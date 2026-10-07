import React, { useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppHeader } from '../../components/seller/AppHeader';
import { OrderCard } from '../../components/seller/OrderCard';
import { RequirementCard } from '../../components/seller/RequirementCard';
import { FeatherIconName, SellerGradients, useSellerTheme } from '../../components/seller/theme';
import { Card, PaymentProtectionBanner, Screen, SectionLabel, ink } from '../../components/seller/ui';
import { useSeller } from '../../context/SellerContext';
import { useSellerNavigation } from '../../hooks/useSellerNavigation';
import { formatCompactLkr, getGreeting, getInitial } from '../../utils/format';
import { getRequirementStatus } from '../../utils/sellerWorkflow';

const RECENT_ORDER_COUNT = 3;
const REQUIREMENT_PREVIEW_COUNT = 2;

interface StatCardProps {
  label: string;
  value: string;
  icon: FeatherIconName;
  iconColor: string;
  tileClassName: string;
}

const StatCard = ({ label, value, icon, iconColor, tileClassName }: StatCardProps) => (
  <Card className="flex-1 flex-row items-center justify-between p-3.5">
    <View className="flex-1 pr-2">
      <Text className={`text-xs ${ink.muted}`} numberOfLines={1}>
        {label}
      </Text>
      <Text
        className={`mt-1 text-[22px] font-extrabold ${ink.strong}`}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {value}
      </Text>
    </View>
    <View className={`h-9 w-9 items-center justify-center rounded-xl ${tileClassName}`}>
      <Feather name={icon} size={18} color={iconColor} />
    </View>
  </Card>
);

interface QuickActionProps {
  emoji: string;
  label: string;
  onPress: () => void;
  highlighted?: boolean;
}

const QuickAction = ({ emoji, label, onPress, highlighted = false }: QuickActionProps) =>
  highlighted ? (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} accessibilityRole="button" className="flex-1">
      <LinearGradient
        colors={SellerGradients.seller}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, paddingVertical: 18, alignItems: 'center' }}
      >
        <Text style={{ fontSize: 28 }}>{emoji}</Text>
        <Text className="mt-2 text-sm font-bold text-white">{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  ) : (
    <Card onPress={onPress} className="flex-1 items-center py-[18px]">
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
      <Text className={`mt-2 text-sm font-bold ${ink.strong}`}>{label}</Text>
    </Card>
  );

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
}

const SectionHeader = ({ title, onViewAll }: SectionHeaderProps) => (
  <View className="mb-3 mt-6 flex-row items-center justify-between">
    <SectionLabel>{title}</SectionLabel>
    {onViewAll && (
      <TouchableOpacity onPress={onViewAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text className={`text-sm font-semibold ${ink.accent}`}>View all</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const SellerHomeScreen = () => {
  const navigation = useSellerNavigation();
  const theme = useSellerTheme();
  const { profile, orders, requirements, fulfillmentRequests, stats, unreadCount } = useSeller();
  const [search, setSearch] = useState('');

  const openMarket = (query?: string) =>
    navigation.navigate('SellerTabs', { screen: 'Market', params: query ? { query } : undefined });

  const submitSearch = () => {
    openMarket(search.trim());
    setSearch('');
  };

  const recentOrders = orders.slice(0, RECENT_ORDER_COUNT);
  const openRequirements = requirements
    .filter((requirement) => getRequirementStatus(requirement) === 'OPEN')
    .slice(0, REQUIREMENT_PREVIEW_COUNT);

  return (
    <Screen>
      <AppHeader title="Dashboard" />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={SellerGradients.seller}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 20, padding: 20, overflow: 'hidden' }}
        >
          <View className="absolute -bottom-10 -right-8 h-36 w-36 rounded-full bg-white/10" />
          <View className="flex-row items-center">
            <View className="mr-3.5 h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/20">
              {profile.avatarUri ? (
                <Image source={{ uri: profile.avatarUri }} style={{ width: 48, height: 48 }} />
              ) : (
                <Text className="text-xl font-bold text-white">{getInitial(profile.name)}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-xs text-blue-100">{getGreeting()},</Text>
              <Text className="text-xl font-extrabold text-white" numberOfLines={1}>
                {profile.name}
              </Text>
              <Text className="text-xs text-blue-100" numberOfLines={1}>
                {profile.businessName} · {profile.location}
              </Text>
            </View>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.8}
              accessibilityRole="button"
              className="mt-4 self-center rounded-full bg-white/15 px-4 py-2"
            >
              <Text className="text-xs font-semibold text-white">
                🔔 {unreadCount} new {unreadCount === 1 ? 'notification' : 'notifications'}
              </Text>
            </TouchableOpacity>
          )}
        </LinearGradient>

        <View className="mt-4 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800">
          <Feather name="search" size={18} color={theme.iconMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={submitSearch}
            returnKeyType="search"
            placeholder="Search fresh products from farmers..."
            placeholderTextColor={theme.placeholder}
            accessibilityLabel="Search products"
            className={`ml-3 flex-1 py-3.5 text-sm ${ink.strong}`}
          />
        </View>

        <View className="mt-4 gap-3">
          <View className="flex-row gap-3">
            <StatCard
              label="Active Orders"
              value={String(stats.activeOrders)}
              icon="box"
              iconColor="#2563eb"
              tileClassName="bg-blue-50 dark:bg-blue-500/20"
            />
            <StatCard
              label="Completed"
              value={String(stats.completedOrders)}
              icon="trending-up"
              iconColor="#16a34a"
              tileClassName="bg-green-50 dark:bg-green-500/20"
            />
          </View>
          <View className="flex-row gap-3">
            <StatCard
              label="In Transit"
              value={String(stats.inTransitOrders)}
              icon="truck"
              iconColor="#ea580c"
              tileClassName="bg-orange-50 dark:bg-orange-500/20"
            />
            <StatCard
              label="Total Spent"
              value={formatCompactLkr(stats.totalSpent)}
              icon="shopping-bag"
              iconColor="#9333ea"
              tileClassName="bg-purple-50 dark:bg-purple-500/20"
            />
          </View>
        </View>

        <SectionHeader title="Quick Actions" />
        <View className="gap-3">
          <View className="flex-row gap-3">
            <QuickAction emoji="🛒" label="Browse Products" onPress={() => openMarket()} highlighted />
            <QuickAction
              emoji="📋"
              label="Create Requirement"
              onPress={() => navigation.navigate('CreateRequirement')}
            />
          </View>
          <View className="flex-row gap-3">
            <QuickAction
              emoji="📦"
              label="My Orders"
              onPress={() => navigation.navigate('SellerTabs', { screen: 'Orders' })}
            />
            <QuickAction
              emoji="🚛"
              label="Transportation"
              onPress={() => navigation.navigate('SellerTabs', { screen: 'Transport' })}
            />
          </View>
        </View>

        <View className="mt-4">
          <PaymentProtectionBanner />
        </View>

        <SectionHeader
          title="Recent Orders"
          onViewAll={() => navigation.navigate('SellerTabs', { screen: 'Orders' })}
        />
        {recentOrders.length === 0 ? (
          <Card className="p-4">
            <Text className={`text-sm ${ink.muted}`}>
              You have not placed any orders yet. Browse the marketplace to get started.
            </Text>
          </Card>
        ) : (
          <View className="gap-3">
            {recentOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
              />
            ))}
          </View>
        )}

        <SectionHeader title="My Requirements" onViewAll={() => navigation.navigate('Requirements')} />
        {openRequirements.length === 0 ? (
          <Card className="p-4">
            <Text className={`text-sm ${ink.muted}`}>
              No open requirements. Post what you need and let farmers send you their offers.
            </Text>
          </Card>
        ) : (
          <View className="gap-3">
            {openRequirements.map((requirement) => (
              <RequirementCard
                key={requirement.id}
                requirement={requirement}
                pendingRequests={
                  fulfillmentRequests.filter(
                    (request) => request.requirementId === requirement.id && request.status === 'PENDING',
                  ).length
                }
                onPress={() => navigation.navigate('RequirementDetail', { requirementId: requirement.id })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};
