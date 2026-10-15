import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SellerTabBar } from '../components/seller/SellerTabBar';
import { SellerProvider } from '../context/SellerContext';
import { CheckoutScreen } from '../screens/seller/CheckoutScreen';
import { CreateRequirementScreen } from '../screens/seller/CreateRequirementScreen';
import { MarketplaceScreen } from '../screens/seller/MarketplaceScreen';
import { NotificationsScreen } from '../screens/seller/NotificationsScreen';
import { OrderDetailScreen } from '../screens/seller/OrderDetailScreen';
import { OrdersScreen } from '../screens/seller/OrdersScreen';
import { ProductDetailScreen } from '../screens/seller/ProductDetailScreen';
import { ProfileScreen } from '../screens/seller/ProfileScreen';
import { RequirementDetailScreen } from '../screens/seller/RequirementDetailScreen';
import { RequirementsScreen } from '../screens/seller/RequirementsScreen';
import { SellerHomeScreen } from '../screens/seller/SellerHomeScreen';
import { TransportJobDetailScreen } from '../screens/seller/TransportJobDetailScreen';
import { TransportScreen } from '../screens/seller/TransportScreen';
import type { SellerStackParamList, SellerTabParamList } from '../types/sellerNavigation';

const Tab = createBottomTabNavigator<SellerTabParamList>();
const Stack = createNativeStackNavigator<SellerStackParamList>();

const SellerTabs = () => (
  <Tab.Navigator tabBar={(props) => <SellerTabBar {...props} />} screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={SellerHomeScreen} />
    <Tab.Screen name="Market" component={MarketplaceScreen} />
    <Tab.Screen name="Orders" component={OrdersScreen} />
    <Tab.Screen name="Transport" component={TransportScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

/** Retail Seller module: the five main tabs plus the screens pushed on top of them. */
export default function SellerNavigator() {
  return (
    <SellerProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SellerTabs" component={SellerTabs} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="Requirements" component={RequirementsScreen} />
        <Stack.Screen name="CreateRequirement" component={CreateRequirementScreen} />
        <Stack.Screen name="RequirementDetail" component={RequirementDetailScreen} />
        <Stack.Screen name="TransportJobDetail" component={TransportJobDetailScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </SellerProvider>
  );
}
