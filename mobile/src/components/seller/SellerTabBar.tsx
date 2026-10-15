import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import type { SellerTabParamList } from '../../types/sellerNavigation';
import { FeatherIconName, useSellerTheme } from './theme';

const TABS: Record<keyof SellerTabParamList, { label: string; icon: FeatherIconName }> = {
  Home: { label: 'Home', icon: 'home' },
  Market: { label: 'Market', icon: 'shopping-bag' },
  Orders: { label: 'Orders', icon: 'package' },
  Transport: { label: 'Transport', icon: 'truck' },
  Profile: { label: 'Profile', icon: 'user' },
};

export const SellerTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const theme = useSellerTheme();

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      className="flex-row border-t border-gray-100 bg-white pt-2 dark:border-slate-700 dark:bg-slate-800"
    >
      {state.routes.map((route, index) => {
        const tab = TABS[route.name as keyof SellerTabParamList];
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            className="flex-1 items-center"
          >
            <Feather name={tab.icon} size={22} color={focused ? theme.accent : theme.iconMuted} />
            <Text
              className={`mt-1 text-xs ${
                focused ? 'font-bold text-[#1565c0] dark:text-blue-400' : 'font-semibold text-gray-400 dark:text-slate-500'
              }`}
            >
              {tab.label}
            </Text>
            <View
              className={`mt-1 h-[3px] w-6 rounded-full ${focused ? 'bg-[#1565c0] dark:bg-blue-400' : 'bg-transparent'}`}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
