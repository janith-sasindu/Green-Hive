import React from 'react';
import { Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useSeller } from '../../context/SellerContext';
import { useSellerNavigation } from '../../hooks/useSellerNavigation';
import { getInitial } from '../../utils/format';
import { useSellerTheme } from './theme';
import { ink } from './ui';

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

interface AppHeaderProps {
  title: string;
  /** Shows a back arrow instead of the Green Hive logo (for screens pushed on top of the tabs). */
  showBack?: boolean;
  /** Replaces the notification bell, e.g. with the marketplace filter button. */
  action?: React.ReactNode;
}

export const AppHeader = ({ title, showBack = false, action }: AppHeaderProps) => {
  const navigation = useSellerNavigation();
  const insets = useSafeAreaInsets();
  const { profile, unreadCount } = useSeller();
  const theme = useSellerTheme();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="border-b border-gray-100 bg-white dark:border-slate-700 dark:bg-slate-800"
    >
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.surface} />
      <View className="h-14 flex-row items-center px-4">
        {showBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mr-3"
          >
            <Feather name="arrow-left" size={22} color={theme.icon} />
          </TouchableOpacity>
        ) : (
          <View className="mr-3 h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[#1c5d26]">
            {/* The logo file has wide transparent margins, so it is drawn larger and cropped by the tile */}
            <Image
              source={require('../../assets/logo.png')}
              resizeMode="contain"
              resizeMethod="resize"
              style={{ width: 60, height: 34 }}
            />
          </View>
        )}

        <Text className={`flex-1 text-lg font-bold ${ink.strong}`} numberOfLines={1}>
          {title}
        </Text>

        {action ?? (
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            hitSlop={HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            className="h-9 w-9 items-center justify-center"
          >
            <Feather name="bell" size={20} color={theme.icon} />
            {unreadCount > 0 && <View className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('SellerTabs', { screen: 'Profile' })}
          accessibilityRole="button"
          accessibilityLabel="My profile"
          className="ml-2 h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#1565c0]"
        >
          {profile.avatarUri ? (
            <Image source={{ uri: profile.avatarUri }} style={{ width: 32, height: 32 }} />
          ) : (
            <Text className="text-xs font-bold text-white">{getInitial(profile.name)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
