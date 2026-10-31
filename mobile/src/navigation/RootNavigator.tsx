import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import AccountDetailsScreen from '../screens/auth/AccountDetailsScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import { FarmerHomeScreen } from '../screens/farmer/FarmerHomeScreen';
import SellerNavigator from './SellerNavigator';
import {
  TransporterHomeScreen,
  TransporterAvailableJobsScreen,
  TransporterNotificationsScreen,
  TransporterSubmitOfferScreen,
  TransporterOfferSubmittedScreen,
  TransporterActiveJobScreen,
  TransporterProfileScreen,
  TransporterEditProfileScreen,
  TransporterNotificationSettingsScreen,
  TransporterMyOffersScreen,
  TransporterConfirmPickupScreen,
} from '../screens/transporter';

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
  TransporterAvailableJobs: undefined;
  TransporterNotifications: undefined;
  TransporterSubmitOffer: { job?: any } | undefined;
  TransporterOfferSubmitted: { job?: any; offerData?: any } | undefined;
  TransporterActiveJob: { job?: any } | undefined;
  TransporterProfile: undefined;
  TransporterEditProfile: undefined;
  TransporterNotificationSettings: undefined;
  TransporterMyOffers: undefined;
  TransporterConfirmPickup: { job?: any } | undefined;
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
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransporterAvailableJobs"
        component={TransporterAvailableJobsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransporterNotifications"
        component={TransporterNotificationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransporterSubmitOffer"
        component={TransporterSubmitOfferScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransporterOfferSubmitted"
        component={TransporterOfferSubmittedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransporterActiveJob"
        component={TransporterActiveJobScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransporterProfile"
        component={TransporterProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransporterEditProfile"
        component={TransporterEditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransporterNotificationSettings"
        component={TransporterNotificationSettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransporterMyOffers"
        component={TransporterMyOffersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransporterConfirmPickup"
        component={TransporterConfirmPickupScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
