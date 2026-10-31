import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Alert,
  Switch,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, CommonActions } from "@react-navigation/native";
import { SmoothScrollView } from "../../components/common/SmoothScrollView";
import { ThemedAlertModal, ThemedAlertModalType } from "../../components/common";
import { useTransporterTheme } from "../../context/TransporterThemeContext";
import { TransporterEditProfileScreen } from "./TransporterEditProfileScreen";
import { TransporterNotificationSettingsScreen } from "./TransporterNotificationSettingsScreen";
import {
  MOCK_TRANSPORTER_PROFILE,
  MOCK_TRANSPORTER_STATS,
  TransporterProfile,
  TransporterStats,
} from "./data";

export interface TransporterProfileScreenProps {
  navigation?: any;
  onSelectTab?: (tab: "home" | "jobs" | "active" | "profile") => void;
  activeTab?: "home" | "jobs" | "active" | "profile";
}

export const TransporterProfileScreen: React.FC<TransporterProfileScreenProps> = ({
  navigation,
  onSelectTab,
  activeTab = "profile",
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { isDark, setDarkMode, toggleDarkMode, colors } = useTransporterTheme();

  // Responsive Breakpoints
  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;
  const isTablet = screenWidth >= 600;

  // Profile and stats state from mock data
  const [profile, setProfile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);
  const [stats, setStats] = useState<TransporterStats>(MOCK_TRANSPORTER_STATS);

  // Sync profile when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setProfile({ ...MOCK_TRANSPORTER_PROFILE });
    }, [])
  );

  // Screen Modals
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showNotificationSettingsModal, setShowNotificationSettingsModal] = useState(false);

  // Photo upload and preview state
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [tempPhotoUri, setTempPhotoUri] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  // Themed Alert Modal state
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    type?: ThemedAlertModalType;
    primaryButtonText?: string;
    onPrimaryPress?: () => void;
    secondaryButtonText?: string;
    onSecondaryPress?: () => void;
  } | null>(null);

  const showAlert = (
    title: string,
    message: string,
    options?: {
      type?: ThemedAlertModalType;
      primaryButtonText?: string;
      onPrimaryPress?: () => void;
      secondaryButtonText?: string;
      onSecondaryPress?: () => void;
    }
  ) => {
    setAlertConfig({
      title,
      message,
      type: options?.type || "warning",
      primaryButtonText: options?.primaryButtonText || "Got It",
      onPrimaryPress: options?.onPrimaryPress,
      secondaryButtonText: options?.secondaryButtonText,
      onSecondaryPress: options?.onSecondaryPress,
    });
  };

  const handleNotificationPress = () => {
    if (navigation?.navigate) {
      navigation.navigate("TransporterNotifications");
    }
  };

  const handleEditAvatar = () => {
    setShowSourceModal(true);
  };

  const handleUseCamera = async () => {
    setShowSourceModal(false);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showAlert(
          "Camera Permission Required",
          "GreenHive needs camera access to capture a picture for your profile. Please enable camera permission in your phone settings.",
          { type: "warning" }
        );
        return;
      }

      setIsProcessingPhoto(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setTempPhotoUri(result.assets[0].uri);
        setShowPreviewModal(true);
      }
    } catch (err) {
      showAlert(
        "Camera Error",
        "Could not launch the camera. Please check your device settings and try again.",
        { type: "error" }
      );
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handlePickFromGallery = async () => {
    setShowSourceModal(false);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert(
          "Gallery Permission Required",
          "GreenHive needs photo library access to select a profile picture. Please enable gallery access in your device settings.",
          { type: "warning" }
        );
        return;
      }

      setIsProcessingPhoto(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setTempPhotoUri(result.assets[0].uri);
        setShowPreviewModal(true);
      }
    } catch (err) {
      showAlert(
        "Gallery Error",
        "Could not access photo library. Please check your permissions and try again.",
        { type: "error" }
      );
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleConfirmUpload = () => {
    if (!tempPhotoUri) return;
    setProfile((prev) => ({
      ...prev,
      avatarUri: tempPhotoUri,
    }));
    MOCK_TRANSPORTER_PROFILE.avatarUri = tempPhotoUri;
    setShowPreviewModal(false);
    setTempPhotoUri(null);

    showAlert(
      "Profile Picture Updated",
      "Your new profile picture has been successfully uploaded and set!",
      {
        type: "success",
        primaryButtonText: "Great!",
      }
    );
  };

  const handleSelectAgain = () => {
    setShowPreviewModal(false);
    setShowSourceModal(true);
  };

  const handleRemovePhoto = () => {
    setShowSourceModal(false);
    showAlert(
      "Remove Profile Picture",
      "Are you sure you want to remove your profile picture and restore the default initial letter?",
      {
        type: "warning",
        primaryButtonText: "Remove",
        onPrimaryPress: () => {
          setProfile((prev) => {
            const next = { ...prev };
            delete next.avatarUri;
            return next;
          });
          delete MOCK_TRANSPORTER_PROFILE.avatarUri;
          showAlert("Picture Removed", "Your profile picture has been reset to default.", {
            type: "info",
            primaryButtonText: "Done",
          });
        },
        secondaryButtonText: "Cancel",
      }
    );
  };

  const handleMenuPress = (itemTitle: string) => {
    switch (itemTitle) {
      case "Notification Settings":
        if (navigation?.navigate) {
          navigation.navigate("TransporterNotificationSettings");
        } else {
          setShowNotificationSettingsModal(true);
        }
        break;
      case "Vehicle & License":
        Alert.alert(
          "Vehicle & License",
          `Vehicle: ${profile.vehicleType}\nPlate: ${profile.vehiclePlate}\nDriver License: Verified`
        );
        break;
      case "Help & Support":
        Alert.alert(
          "Help & Support",
          "For carrier support, contact our 24/7 hotline at 1920 or email support@greenhive.lk"
        );
        break;
      case "Edit Profile":
        if (navigation?.navigate) {
          navigation.navigate("TransporterEditProfile");
        } else {
          setShowEditProfileModal(true);
        }
        break;
      default:
        break;
    }
  };

  const handleSignOut = () => {
    showAlert(
      "Sign Out?",
      "Are you sure you want to sign out of your transporter account? You will return to the welcome screen.",
      {
        type: "error",
        primaryButtonText: "Sign Out",
        secondaryButtonText: "Cancel",
        onPrimaryPress: () => {
          let rootNav = navigation;
          while (rootNav?.getParent && rootNav.getParent()) {
            rootNav = rootNav.getParent();
          }
          if (rootNav?.dispatch) {
            rootNav.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Welcome" }],
              })
            );
          } else if (navigation?.reset) {
            navigation.reset({
              index: 0,
              routes: [{ name: "Welcome" }],
            });
          } else if (navigation?.navigate) {
            navigation.navigate("Welcome");
          }
        },
        onSecondaryPress: () => {
          // Cancelled: User stays logged in
        },
      }
    );
  };

  const handleTabPress = (tab: "home" | "jobs" | "active" | "profile") => {
    if (tab === "profile") {
      return;
    }
    if (onSelectTab) {
      onSelectTab(tab);
    } else if (tab === "home") {
      if (navigation?.navigate) {
        navigation.navigate("TransporterHome");
      }
    } else if (tab === "jobs") {
      if (navigation?.navigate) {
        navigation.navigate("TransporterAvailableJobs");
      }
    } else if (tab === "active") {
      if (navigation?.navigate) {
        navigation.navigate("TransporterActiveJob");
      }
    }
  };

  return (
    <View className="flex-1 bg-[#F4F7F5] dark:bg-slate-900">
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      {/* Top Header Bar */}
      <SafeAreaView edges={["top"]} className="bg-[#F4F7F5] dark:bg-slate-900">
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className={`px-4 sm:px-5 flex-row items-center justify-between ${
            isSmallDevice ? "pt-1 pb-2" : "pt-2 pb-2.5"
          }`}
        >
          {/* Left: App Logo & Screen Title */}
          <View className="flex-row items-center flex-1 pr-2">
            <View
              className="mr-2.5 items-center justify-center"
              style={{
                width: isExtraSmall ? 33 : isSmallDevice ? 38 : 43,
                height: isExtraSmall ? 28 : isSmallDevice ? 32 : 36,
              }}
            >
              <Image
                source={require("../../assets/logo-icon.png")}
                resizeMode="contain"
                style={{
                  width: isExtraSmall ? 33 : isSmallDevice ? 38 : 43,
                  height: isExtraSmall ? 28 : isSmallDevice ? 32 : 36,
                }}
              />
            </View>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              className={`font-bold text-[#111827] dark:text-white flex-1 ${
                isExtraSmall
                  ? "text-[16px]"
                  : isSmallDevice
                  ? "text-[18px]"
                  : "text-[20px]"
              }`}
            >
              My Profile
            </Text>
          </View>

          {/* Right: Notifications & Profile Avatar */}
          <View className="flex-row items-center space-x-2 sm:space-x-2.5 gap-2 sm:gap-2.5">
            {/* Notification Bell */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleNotificationPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className={`relative items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-gray-100/90 dark:border-slate-700 shadow-xs ${
                isExtraSmall ? "h-8 w-8" : isSmallDevice ? "h-9 w-9" : "h-10 w-10"
              }`}
            >
              <Ionicons
                name="notifications-outline"
                size={isExtraSmall ? 16 : isSmallDevice ? 18 : 20}
                color={colors.icon}
              />
              {/* Unread Alert Dot */}
              <View className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EF4444] border border-white dark:border-slate-800" />
            </TouchableOpacity>

            {/* User Avatar Circle */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleEditAvatar}
              className={`rounded-full bg-[#E68A00] items-center justify-center shadow-xs overflow-hidden ${
                isExtraSmall ? "h-8 w-8" : isSmallDevice ? "h-8.5 w-8.5" : "h-9 w-9"
              }`}
            >
              {profile.avatarUri ? (
                <Image
                  source={{ uri: profile.avatarUri }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <Text
                  className={`font-bold text-white ${
                    isExtraSmall
                      ? "text-[11px]"
                      : isSmallDevice
                      ? "text-xs"
                      : "text-sm"
                  }`}
                >
                  {profile.avatarLetter || "R"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Main Content Area */}
      <SmoothScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: isSmallDevice ? 14 : 16,
          paddingTop: 8,
          paddingBottom: 40,
        }}
      >
        <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}>
          {/* ================= 1. PROFILE HERO BANNER ================= */}
          <View
            className={`rounded-3xl bg-[#E68A00] overflow-hidden shadow-md ${
              isExtraSmall ? "p-4" : isSmallDevice ? "p-5" : "p-6"
            } items-center relative mb-4`}
            style={{
              shadowColor: "#E68A00",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            {/* Ambient Background Decorative Glow */}
            <View className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/10 pointer-events-none" />
            <View className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-black/5 pointer-events-none" />

            {/* Profile Avatar with Camera Edit Badge */}
            <View className="relative mt-1">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleEditAvatar}
                className={`rounded-full bg-white/20 border-2 border-white/40 items-center justify-center overflow-hidden ${
                  isExtraSmall
                    ? "h-20 w-20"
                    : isSmallDevice
                    ? "h-22 w-22"
                    : "h-24 w-24"
                }`}
                style={{
                  width: isExtraSmall ? 80 : isSmallDevice ? 88 : 96,
                  height: isExtraSmall ? 80 : isSmallDevice ? 88 : 96,
                }}
              >
                {profile.avatarUri ? (
                  <Image
                    source={{ uri: profile.avatarUri }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text
                    className={`font-black text-white ${
                      isExtraSmall ? "text-3xl" : "text-4xl"
                    }`}
                  >
                    {profile.avatarLetter || "R"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Camera Edit Badge */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleEditAvatar}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white dark:bg-slate-800 items-center justify-center shadow-md border border-gray-100 dark:border-slate-700"
                style={{
                  elevation: 4,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                }}
              >
                <Ionicons name="camera-outline" size={17} color={isDark ? "#E68A00" : "#4B5563"} />
              </TouchableOpacity>
            </View>

            {/* Driver Name */}
            <Text
              numberOfLines={1}
              className={`font-bold text-white text-center mt-3 ${
                isExtraSmall
                  ? "text-lg"
                  : isSmallDevice
                  ? "text-xl"
                  : "text-2xl"
              }`}
            >
              {profile.name}
            </Text>

            {/* Vehicle Type Subtitle */}
            <Text
              numberOfLines={1}
              className={`font-medium text-white/90 text-center mt-1 ${
                isExtraSmall ? "text-xs" : "text-sm"
              }`}
            >
              {profile.vehicleType}
            </Text>

            {/* Rating and Completed Jobs Row */}
            <View className="flex-row items-center justify-center mt-2.5 sm:mt-3">
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text className="font-extrabold text-white text-xs sm:text-sm ml-1.5">
                {profile.rating.toFixed(1)}
              </Text>
              <Text className="text-white/80 mx-1.5 text-xs sm:text-sm">·</Text>
              <Text className="font-medium text-white/90 text-xs sm:text-sm">
                {profile.completedJobs} jobs completed
              </Text>
            </View>

            {/* 3-Column Performance Stats Card */}
            <View
              className="mt-4 sm:mt-5 w-full rounded-2xl bg-white/15 border border-white/20 p-3 sm:p-3.5 flex-row items-center justify-between"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.16)",
              }}
            >
              {/* Stat 1: Jobs */}
              <View className="flex-1 items-center justify-center">
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="font-black text-white text-base sm:text-lg text-center"
                >
                  {profile.completedJobs}
                </Text>
                <Text className="font-semibold text-white/80 text-[11px] sm:text-xs text-center mt-0.5">
                  Jobs
                </Text>
              </View>

              {/* Divider */}
              <View className="h-7 w-[1px] bg-white/25" />

              {/* Stat 2: Earned */}
              <View className="flex-1 items-center justify-center">
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="font-black text-white text-base sm:text-lg text-center"
                >
                  {profile.totalEarnings || "Rs. 320k"}
                </Text>
                <Text className="font-semibold text-white/80 text-[11px] sm:text-xs text-center mt-0.5">
                  Earned
                </Text>
              </View>

              {/* Divider */}
              <View className="h-7 w-[1px] bg-white/25" />

              {/* Stat 3: On Time */}
              <View className="flex-1 items-center justify-center">
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="font-black text-white text-base sm:text-lg text-center"
                >
                  {profile.onTimeDeliveryRate || "98%"}
                </Text>
                <Text className="font-semibold text-white/80 text-[11px] sm:text-xs text-center mt-0.5">
                  On Time
                </Text>
              </View>
            </View>
          </View>

          {/* ================= 2. CONTACT & VEHICLE CARD ================= */}
          <View
            className={`rounded-3xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-2xs mb-4 ${
              isExtraSmall ? "p-3.5" : isSmallDevice ? "p-4" : "p-5"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3.5 sm:mb-4">
              Contact & Vehicle
            </Text>

            <View className="space-y-3 sm:space-y-3.5 gap-3 sm:gap-3.5">
              {/* Phone Row */}
              <View className="flex-row items-center">
                <View
                  className={`rounded-2xl bg-gray-100/80 dark:bg-slate-700 items-center justify-center mr-3 sm:mr-3.5 ${
                    isExtraSmall ? "h-9 w-9" : "h-11 w-11"
                  }`}
                >
                  <Ionicons name="call-outline" size={isExtraSmall ? 17 : 20} color={colors.icon} />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] sm:text-xs font-medium text-gray-400 dark:text-slate-400">
                    Phone
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5"
                  >
                    {profile.phone}
                  </Text>
                </View>
              </View>

              {/* Email Row */}
              <View className="flex-row items-center">
                <View
                  className={`rounded-2xl bg-gray-100/80 dark:bg-slate-700 items-center justify-center mr-3 sm:mr-3.5 ${
                    isExtraSmall ? "h-9 w-9" : "h-11 w-11"
                  }`}
                >
                  <Ionicons name="mail-outline" size={isExtraSmall ? 17 : 20} color={colors.icon} />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] sm:text-xs font-medium text-gray-400 dark:text-slate-400">
                    Email
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5"
                  >
                    {profile.email}
                  </Text>
                </View>
              </View>

              {/* Base Location Row */}
              <View className="flex-row items-center">
                <View
                  className={`rounded-2xl bg-gray-100/80 dark:bg-slate-700 items-center justify-center mr-3 sm:mr-3.5 ${
                    isExtraSmall ? "h-9 w-9" : "h-11 w-11"
                  }`}
                >
                  <Ionicons name="location-outline" size={isExtraSmall ? 17 : 20} color={colors.icon} />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] sm:text-xs font-medium text-gray-400 dark:text-slate-400">
                    Base Location
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5"
                  >
                    {profile.baseLocation || "Colombo"}
                  </Text>
                </View>
              </View>

              {/* Vehicle Row */}
              <View className="flex-row items-center">
                <View
                  className={`rounded-2xl bg-gray-100/80 dark:bg-slate-700 items-center justify-center mr-3 sm:mr-3.5 ${
                    isExtraSmall ? "h-9 w-9" : "h-11 w-11"
                  }`}
                >
                  <Ionicons name="bus-outline" size={isExtraSmall ? 17 : 20} color={colors.icon} />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] sm:text-xs font-medium text-gray-400 dark:text-slate-400">
                    Vehicle
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5"
                  >
                    {profile.vehicleType}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ================= 3. SETTINGS & PREFERENCES CARD ================= */}
          <View
            className={`rounded-3xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-2xs mb-4 ${
              isExtraSmall ? "px-3.5 py-1" : isSmallDevice ? "px-4 py-1.5" : "px-5 py-2"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {/* Edit Profile */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleMenuPress("Edit Profile")}
              className="py-3.5 sm:py-4 flex-row items-center justify-between border-b border-gray-100/90 dark:border-slate-700"
            >
              <Text className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-slate-200">
                Edit Profile
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
            </TouchableOpacity>

            {/* Vehicle & License */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleMenuPress("Vehicle & License")}
              className="py-3.5 sm:py-4 flex-row items-center justify-between border-b border-gray-100/90 dark:border-slate-700"
            >
              <Text className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-slate-200">
                Vehicle & License
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
            </TouchableOpacity>

            {/* Notification Settings */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleMenuPress("Notification Settings")}
              className="py-3.5 sm:py-4 flex-row items-center justify-between border-b border-gray-100/90 dark:border-slate-700"
            >
              <Text className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-slate-200">
                Notification Settings
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
            </TouchableOpacity>

            {/* Help & Support */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleMenuPress("Help & Support")}
              className="py-3.5 sm:py-4 flex-row items-center justify-between border-b border-gray-100/90 dark:border-slate-700"
            >
              <Text className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-slate-200">
                Help & Support
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
            </TouchableOpacity>

            {/* Dark Mode Switch */}
            <View className="py-2.5 sm:py-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons
                  name={isDark ? "moon" : "sunny-outline"}
                  size={19}
                  color={isDark ? "#FBBF24" : "#6B7280"}
                />
                <Text className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white ml-2.5">
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={(val) => setDarkMode(val)}
                trackColor={colors.switchTrack}
                thumbColor="#FFFFFF"
                ios_backgroundColor={isDark ? "#334155" : "#E5E7EB"}
                style={{
                  transform: [
                    { scaleX: isSmallDevice ? 0.85 : 0.95 },
                    { scaleY: isSmallDevice ? 0.85 : 0.95 },
                  ],
                }}
              />
            </View>
          </View>

          {/* ================= 4. SIGN OUT BUTTON ================= */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSignOut}
            className={`w-full rounded-2xl sm:rounded-3xl border items-center justify-center flex-row shadow-2xs mt-1 mb-6 ${
              isExtraSmall ? "py-3" : isSmallDevice ? "py-3.5" : "py-4"
            }`}
            style={{
              borderColor: isDark ? "rgba(239, 68, 68, 0.4)" : "#FECACA",
              backgroundColor: isDark ? "rgba(239, 68, 68, 0.12)" : "#FEF2F2",
            }}
          >
            <Ionicons
              name="log-out-outline"
              size={19}
              color="#EF4444"
              style={{ marginRight: 8 }}
            />
            <Text className="text-sm sm:text-base font-bold text-[#EF4444]">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </SmoothScrollView>

      {/* ================= 5. BOTTOM NAVIGATION BAR ================= */}
      <SafeAreaView
        edges={["bottom"]}
        className="bg-white dark:bg-slate-800 border-t border-gray-200/80 dark:border-slate-700"
      >
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className={`flex-row items-center justify-around ${
            isSmallDevice ? "pt-1.5 pb-0.5" : "pt-2 pb-1"
          }`}
        >
          {/* Home Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("home")}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name="home-outline"
              size={isSmallDevice ? 20 : 22}
              color={colors.iconMuted}
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-medium text-[#9CA3AF] dark:text-slate-400`}
            >
              Home
            </Text>
          </TouchableOpacity>

          {/* Jobs Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("jobs")}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name="location-outline"
              size={isSmallDevice ? 20 : 22}
              color={colors.iconMuted}
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-medium text-[#9CA3AF] dark:text-slate-400`}
            >
              Jobs
            </Text>
          </TouchableOpacity>

          {/* Active Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("active")}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name="bus-outline"
              size={isSmallDevice ? 20 : 22}
              color={colors.iconMuted}
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-medium text-[#9CA3AF] dark:text-slate-400`}
            >
              Active
            </Text>
          </TouchableOpacity>

          {/* Profile Tab (Active) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("profile")}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name="person"
              size={isSmallDevice ? 20 : 22}
              color="#E68A00"
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-bold text-[#E68A00]`}
            >
              Profile
            </Text>
            <View
              className={`rounded-full bg-[#E68A00] mt-1 ${
                isSmallDevice ? "h-[2px] w-5" : "h-[2px] w-6"
              }`}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ================= PHOTO SOURCE SELECTION MODAL ================= */}
      <Modal
        visible={showSourceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSourceModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-end sm:justify-center items-center p-0 sm:p-4">
          <TouchableOpacity
            activeOpacity={1}
            className="absolute inset-0"
            onPress={() => setShowSourceModal(false)}
          />
          <View
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border-t sm:border border-gray-100 dark:border-slate-700"
            style={{ elevation: 10 }}
          >
            {/* Sheet Handle for mobile */}
            <View className="items-center mb-3 sm:hidden">
              <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center space-x-3">
                <View className="h-10 w-10 rounded-full bg-[#FFF5E6] dark:bg-amber-950/40 items-center justify-center border border-amber-200/60 dark:border-amber-800/40">
                  <Ionicons name="camera" size={20} color="#E68A00" />
                </View>
                <View className="ml-3">
                  <Text className="text-base sm:text-lg font-bold text-[#111827] dark:text-white">
                    Profile Photo
                  </Text>
                  <Text className="text-xs text-[#6B7280] dark:text-slate-400">
                    Choose an option to update your photo
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowSourceModal(false)}
                className="h-8 w-8 rounded-full bg-gray-100 dark:bg-slate-700 items-center justify-center"
              >
                <Ionicons name="close" size={18} color={isDark ? "#94A3B8" : "#6B7280"} />
              </TouchableOpacity>
            </View>

            {/* Option 1: Use Camera */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleUseCamera}
              disabled={isProcessingPhoto}
              className="flex-row items-center p-3.5 mb-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40"
            >
              <View className="h-11 w-11 rounded-xl bg-[#E68A00] items-center justify-center mr-3 shadow-xs">
                <Ionicons name="camera" size={22} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                  Use Camera
                </Text>
                <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Open camera to capture a picture
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={isDark ? "#94A3B8" : "#9CA3AF"} />
            </TouchableOpacity>

            {/* Option 2: Choose from Gallery */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePickFromGallery}
              disabled={isProcessingPhoto}
              className="flex-row items-center p-3.5 mb-2.5 rounded-2xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200/60 dark:border-slate-700"
            >
              <View className="h-11 w-11 rounded-xl bg-blue-500 items-center justify-center mr-3 shadow-xs">
                <Ionicons name="images" size={22} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                  Choose from Gallery
                </Text>
                <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Select a picture from your device library
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={isDark ? "#94A3B8" : "#9CA3AF"} />
            </TouchableOpacity>

            {/* Option 3: Remove Current Photo (conditional) */}
            {profile.avatarUri && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleRemovePhoto}
                className="flex-row items-center p-3.5 mb-2.5 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40"
              >
                <View className="h-11 w-11 rounded-xl bg-red-500 items-center justify-center mr-3 shadow-xs">
                  <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-red-600 dark:text-red-400">
                    Remove Current Photo
                  </Text>
                  <Text className="text-xs text-red-400 dark:text-red-300 mt-0.5">
                    Revert back to default initial letter
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#EF4444" />
              </TouchableOpacity>
            )}

            {/* Cancel Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowSourceModal(false)}
              className="mt-1 py-3.5 rounded-2xl bg-gray-100 dark:bg-slate-700 items-center justify-center"
            >
              <Text className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= IN-SCREEN PICTURE PREVIEW MODAL ================= */}
      <Modal
        visible={showPreviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowPreviewModal(false);
          setTempPhotoUri(null);
        }}
      >
        <View className="flex-1 bg-black/75 justify-center items-center p-4">
          <View
            className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-slate-700 items-center"
            style={{ elevation: 12 }}
          >
            {/* Header Icon & Title */}
            <View className="items-center mb-4">
              <View className="h-12 w-12 rounded-full bg-[#FFF5E6] dark:bg-amber-950/40 items-center justify-center border border-amber-200/60 dark:border-amber-800/40 mb-2">
                <Ionicons name="person-circle-outline" size={28} color="#E68A00" />
              </View>
              <Text className="text-lg font-bold text-gray-900 dark:text-white text-center">
                Preview Profile Picture
              </Text>
              <Text className="text-xs text-gray-500 dark:text-slate-400 text-center mt-1 px-2">
                Check how your photo looks before uploading it as your profile picture
              </Text>
            </View>

            {/* Circular Preview Container */}
            <View className="my-2 items-center justify-center">
              <View
                className="rounded-full border-4 border-[#E68A00] p-1 shadow-lg bg-gray-100 dark:bg-slate-700"
                style={{
                  shadowColor: "#E68A00",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  elevation: 8,
                }}
              >
                {tempPhotoUri && (
                  <Image
                    source={{ uri: tempPhotoUri }}
                    style={{ width: 150, height: 150, borderRadius: 75 }}
                    resizeMode="cover"
                  />
                )}
              </View>

              {/* Helpful Badge */}
              <View className="flex-row items-center mt-3 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full border border-amber-200/50 dark:border-amber-800/40">
                <Ionicons name="sparkles" size={12} color="#E68A00" />
                <Text className="text-[11px] font-semibold text-[#E68A00] ml-1.5">
                  Looking sharp!
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="w-full mt-4">
              {/* Primary: Upload as Profile Picture */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleConfirmUpload}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#E68A00] flex-row items-center justify-center shadow-md mb-2.5"
                style={{
                  shadowColor: "#E68A00",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                <Text className="text-sm font-bold text-white ml-2">
                  Upload as Profile Picture
                </Text>
              </TouchableOpacity>

              {/* Secondary: Take or Select Again */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSelectAgain}
                className="w-full py-3 px-4 rounded-2xl bg-gray-100 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 flex-row items-center justify-center mb-1.5"
              >
                <Ionicons name="refresh-outline" size={17} color={isDark ? "#CBD5E1" : "#4B5563"} />
                <Text className="text-sm font-semibold text-gray-700 dark:text-slate-200 ml-2">
                  Retake or Choose Again
                </Text>
              </TouchableOpacity>

              {/* Cancel: Dismiss */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setShowPreviewModal(false);
                  setTempPhotoUri(null);
                }}
                className="w-full py-2.5 items-center justify-center"
              >
                <Text className="text-xs font-medium text-gray-400 dark:text-slate-500">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Themed Alert Modal for Warnings & Confirmations */}
      {alertConfig && (
        <ThemedAlertModal
          visible={!!alertConfig}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          primaryButtonText={alertConfig.primaryButtonText}
          onPrimaryPress={() => {
            const cb = alertConfig.onPrimaryPress;
            setAlertConfig(null);
            if (cb) cb();
          }}
          secondaryButtonText={alertConfig.secondaryButtonText}
          onSecondaryPress={() => {
            const cb = alertConfig.onSecondaryPress;
            setAlertConfig(null);
            if (cb) cb();
          }}
          onClose={() => setAlertConfig(null)}
        />
      )}

      {/* Edit Profile Full-Screen Modal Fallback */}
      <Modal
        visible={showEditProfileModal}
        animationType="slide"
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <TransporterEditProfileScreen
          onBack={() => setShowEditProfileModal(false)}
          onSave={(updated) => {
            setProfile({ ...updated });
            setShowEditProfileModal(false);
          }}
        />
      </Modal>

      {/* Notification Settings Full-Screen Modal Fallback */}
      <Modal
        visible={showNotificationSettingsModal}
        animationType="slide"
        onRequestClose={() => setShowNotificationSettingsModal(false)}
      >
        <TransporterNotificationSettingsScreen
          onBack={() => setShowNotificationSettingsModal(false)}
          navigation={navigation}
        />
      </Modal>
    </View>
  );
};

export default TransporterProfileScreen;
