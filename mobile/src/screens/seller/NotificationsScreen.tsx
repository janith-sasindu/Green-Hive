import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppHeader } from '../../components/seller/AppHeader';
import { Card, EmptyState, Screen, ink } from '../../components/seller/ui';
import { Colors } from '../../constants/colors';
import { NOTIFICATION_CATEGORIES } from '../../constants/notificationCategories';
import { useSeller } from '../../context/SellerContext';
import { useSellerNavigation } from '../../hooks/useSellerNavigation';
import type { SellerNotification } from '../../types/seller';
import { formatDateTime } from '../../utils/format';

interface NotificationCardProps {
  notification: SellerNotification;
  onPress: () => void;
}

const NotificationCard = ({ notification, onPress }: NotificationCardProps) => {
  const category = NOTIFICATION_CATEGORIES[notification.category];
  return (
    <Card onPress={onPress} className="flex-row p-4">
      <View className={`mr-3 h-10 w-10 items-center justify-center rounded-xl ${category.tileClassName}`}>
        <Text className="text-lg">{category.emoji}</Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-start">
          <Text className={`flex-1 pr-2 text-[15px] font-bold ${ink.strong}`}>{notification.title}</Text>
          {!notification.isRead && <View className="mt-1.5 h-2 w-2 rounded-full bg-green-500" />}
        </View>
        <Text className={`mt-0.5 text-xs leading-5 ${ink.body}`}>{notification.message}</Text>
        <Text className={`mt-1.5 text-xs ${ink.faint}`}>{formatDateTime(notification.createdAt)}</Text>
      </View>
    </Card>
  );
};

export const NotificationsScreen = () => {
  const navigation = useSellerNavigation();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useSeller();

  const openNotification = (notification: SellerNotification) => {
    if (!notification.isRead) markNotificationRead(notification.id);
    const { link } = notification;
    if (!link) return;
    switch (link.screen) {
      case 'OrderDetail':
        navigation.navigate('OrderDetail', { orderId: link.orderId });
        break;
      case 'TransportJobDetail':
        navigation.navigate('TransportJobDetail', { jobId: link.jobId });
        break;
      case 'RequirementDetail':
        navigation.navigate('RequirementDetail', { requirementId: link.requirementId });
        break;
    }
  };

  return (
    <Screen>
      <AppHeader title="Notifications" showBack />
      <FlatList
        data={notifications}
        keyExtractor={(notification) => String(notification.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          notifications.length > 0 ? (
            <View className="flex-row items-center justify-between">
              <Text className={`text-sm ${ink.muted}`}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </Text>
              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={markAllNotificationsRead}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  className="flex-row items-center"
                >
                  <Feather name="check" size={15} color={Colors.primary} />
                  <Text className="ml-1 text-sm font-semibold text-green-700 dark:text-green-400">Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
        renderItem={({ item }) => <NotificationCard notification={item} onPress={() => openNotification(item)} />}
        ListEmptyComponent={
          <EmptyState
            emoji="🔔"
            title="No notifications"
            message="Updates about your orders, payments, transport offers and requirements will appear here."
          />
        }
      />
    </Screen>
  );
};
