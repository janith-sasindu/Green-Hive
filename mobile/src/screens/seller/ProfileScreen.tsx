import React, { useState } from 'react';
import { Image, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { CommonActions, NavigationProp, ParamListBase } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { AppHeader } from '../../components/seller/AppHeader';
import { EditProfileSheet } from '../../components/seller/EditProfileSheet';
import { HelpSupportSheet } from '../../components/seller/HelpSupportSheet';
import { NotificationSettingsSheet } from '../../components/seller/NotificationSettingsSheet';
import { SellerGradients, useSellerTheme } from '../../components/seller/theme';
import { Card, ConfirmDialog, InfoRow, Screen, ink } from '../../components/seller/ui';
import { Colors } from '../../constants/colors';
import { useSeller } from '../../context/SellerContext';
import { useSellerNavigation } from '../../hooks/useSellerNavigation';
import { formatCompactLkr, getInitial } from '../../utils/format';

type ProfileSheet = 'edit' | 'notifications' | 'help';

const ProfileStat = ({ value, label, divided = false }: { value: string; label: string; divided?: boolean }) => (
  <View className={`flex-1 items-center ${divided ? 'border-l border-white/20' : ''}`}>
    <Text className="text-lg font-extrabold text-white">{value}</Text>
    <Text className="text-xs text-blue-100">{label}</Text>
  </View>
);

const MenuRow = ({ label, onPress }: { label: string; onPress: () => void }) => {
  const theme = useSellerTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3.5 dark:border-slate-700"
    >
      <Text className={`text-[15px] font-semibold ${ink.strong}`}>{label}</Text>
      <Feather name="chevron-right" size={18} color={theme.iconMuted} />
    </TouchableOpacity>
  );
};

export const ProfileScreen = () => {
  const navigation = useSellerNavigation();
  const theme = useSellerTheme();
  const { profile, orders, stats, updateProfile } = useSeller();
  const [openSheet, setOpenSheet] = useState<ProfileSheet | null>(null);
  const [signOutVisible, setSignOutVisible] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const closeSheet = () => setOpenSheet(null);

  const changePhoto = async () => {
    setPhotoError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });
      if (!result.canceled && result.assets.length > 0) {
        updateProfile({ avatarUri: result.assets[0].uri });
      }
    } catch {
      setPhotoError('Your photo library could not be opened. Check the app permissions and try again.');
    }
  };

  const signOut = () => {
    setSignOutVisible(false);
    // Walk up to the app's root stack, which owns the Welcome screen
    let root: NavigationProp<ParamListBase> | undefined = navigation.getParent();
    while (root?.getParent()) root = root.getParent();
    root?.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] }));
  };

  return (
    <Screen>
      <AppHeader title="My Profile" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={SellerGradients.seller}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 20, padding: 20, alignItems: 'center' }}
        >
          <View>
            <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white/20">
              {profile.avatarUri ? (
                <Image source={{ uri: profile.avatarUri }} style={{ width: 80, height: 80 }} />
              ) : (
                <Text className="text-3xl font-bold text-white">{getInitial(profile.name)}</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={changePhoto}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              className="absolute -right-1 bottom-0 h-7 w-7 items-center justify-center rounded-full bg-white"
            >
              <Feather name="camera" size={14} color={Colors.secondary} />
            </TouchableOpacity>
          </View>

          <Text className="mt-3 text-center text-xl font-extrabold text-white">{profile.name}</Text>
          <Text className="mt-0.5 text-sm text-blue-100">{profile.businessName}</Text>
          {profile.isVerified && (
            <View className="mt-1.5 flex-row items-center">
              <Feather name="check-circle" size={13} color="#dbeafe" />
              <Text className="ml-1.5 text-xs text-blue-100">Verified Seller</Text>
            </View>
          )}

          <View className="mt-4 flex-row self-stretch rounded-2xl bg-white/15 py-3">
            <ProfileStat value={String(orders.length)} label="Orders" />
            <ProfileStat value={formatCompactLkr(stats.totalSpent)} label="Total Spent" divided />
            <ProfileStat value={profile.rating.toFixed(1)} label="Rating" divided />
          </View>
        </LinearGradient>

        {photoError && <Text className="mt-2 text-xs text-red-500">{photoError}</Text>}

        <Card className="mt-4 gap-4 p-4">
          <Text className={`text-base font-bold ${ink.strong}`}>Contact Information</Text>
          <InfoRow icon="phone" label="Phone" value={profile.phone} />
          <InfoRow icon="mail" label="Email" value={profile.email} />
          <InfoRow icon="map-pin" label="Location" value={profile.location} />
        </Card>

        <Card className="mt-4">
          <MenuRow label="Edit Profile" onPress={() => setOpenSheet('edit')} />
          <MenuRow label="Notification Settings" onPress={() => setOpenSheet('notifications')} />
          <MenuRow label="Help & Support" onPress={() => setOpenSheet('help')} />
          <View className="flex-row items-center px-4 py-2.5">
            <Feather name={theme.isDark ? 'moon' : 'sun'} size={18} color={theme.icon} />
            <Text className={`ml-3 flex-1 text-[15px] font-semibold ${ink.strong}`}>
              {theme.isDark ? 'Dark Mode' : 'Light Mode'}
            </Text>
            <Switch
              value={theme.isDark}
              onValueChange={theme.setDarkMode}
              trackColor={theme.switchTrack}
              thumbColor="#ffffff"
              accessibilityLabel="Dark mode"
            />
          </View>
        </Card>

        <TouchableOpacity
          onPress={() => setSignOutVisible(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          className="mt-4 flex-row items-center justify-center rounded-2xl border border-red-200 bg-red-50 py-4 dark:border-red-500/40 dark:bg-red-500/10"
        >
          <Feather name="log-out" size={18} color="#dc2626" />
          <Text className="ml-2 text-base font-bold text-red-600 dark:text-red-400">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <EditProfileSheet visible={openSheet === 'edit'} onClose={closeSheet} />
      <NotificationSettingsSheet visible={openSheet === 'notifications'} onClose={closeSheet} />
      <HelpSupportSheet visible={openSheet === 'help'} onClose={closeSheet} />
      <ConfirmDialog
        visible={signOutVisible}
        title="Sign out?"
        message="You will return to the welcome screen."
        confirmLabel="Sign Out"
        onConfirm={signOut}
        onCancel={() => setSignOutVisible(false)}
      />
    </Screen>
  );
};
