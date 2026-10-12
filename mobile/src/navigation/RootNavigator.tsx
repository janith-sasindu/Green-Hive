import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import CreateAccountScreen from '../screens/auth/CreateAccountScreen';
import AccountDetailsScreen from '../screens/auth/AccountDetailsScreen';
import IdentityVerificationScreen from '../screens/auth/IdentityVerificationScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import { FarmerHomeScreen } from '../screens/farmer/FarmerHomeScreen';
import { SellerHomeScreen } from '../screens/seller/SellerHomeScreen';
import { TransporterHomeScreen } from '../screens/transporter/TransporterHomeScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  LoginScreen: undefined;
  RoleSelection: undefined;
  CreateAccount: { role: string };
  AccountDetailsScreen: { role: string };
  AccountDetails: { role: string };
  IdentityVerificationScreen: {
    role?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
  };
  IdentityVerification: {
    role?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
  };
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
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="AccountDetailsScreen" component={AccountDetailsScreen} />
      <Stack.Screen name="AccountDetails" component={AccountDetailsScreen} />
      <Stack.Screen
        name="IdentityVerificationScreen"
        component={IdentityVerificationScreen}
      />
      <Stack.Screen
        name="IdentityVerification"
        component={IdentityVerificationScreen}
      />
      <Stack.Screen
        name="FarmerHome"
        component={FarmerHomeScreen}
        options={{ headerShown: true, title: 'Farmer Dashboard' }}
      />
      <Stack.Screen
        name="SellerHome"
        component={SellerHomeScreen}
        options={{ headerShown: true, title: 'Seller Dashboard' }}
      />
      <Stack.Screen
        name="TransporterHome"
        component={TransporterHomeScreen}
        options={{ headerShown: true, title: 'Transporter Dashboard' }}
      />
    </Stack.Navigator>
  );
}
