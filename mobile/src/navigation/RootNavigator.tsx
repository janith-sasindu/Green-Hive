import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import AccountDetailsScreen from '../screens/auth/AccountDetailsScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import { FarmerHomeScreen } from '../screens/farmer/FarmerHomeScreen';
import SellerNavigator from './SellerNavigator';
import { TransporterHomeScreen } from '../screens/transporter/TransporterHomeScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  LoginScreen: undefined;
  RoleSelection: undefined;
  RoleSelectionScreen: undefined;
  AccountDetailsScreen: { role: string };
  AccountDetails: { role: string };
  IdentityVerificationScreen: { role?: string } | undefined;
  IdentityVerification: { role?: string } | undefined;
  FarmerHome: undefined;
  SellerHome: undefined;
  TransporterHome: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />

      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="RoleSelectionScreen" component={RoleSelectionScreen} />

      <Stack.Screen name="AccountDetailsScreen" component={AccountDetailsScreen} />
      <Stack.Screen name="AccountDetails" component={AccountDetailsScreen} />
      <Stack.Screen
        name="IdentityVerificationScreen"
        component={AccountDetailsScreen}
      />
      <Stack.Screen
        name="IdentityVerification"
        component={AccountDetailsScreen}
      />
      <Stack.Screen
        name="FarmerHome"
        component={FarmerHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="SellerHome" component={SellerNavigator} />
      <Stack.Screen
        name="TransporterHome"
        component={TransporterHomeScreen}
        options={{ headerShown: true, title: 'Transporter Dashboard' }}
      />
    </Stack.Navigator>
  );
}
