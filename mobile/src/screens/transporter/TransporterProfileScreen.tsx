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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SmoothScrollView } from "../../components/common/SmoothScrollView";
import { useTransporterTheme } from "../../context/TransporterThemeContext";
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

  const handleNotificationPress = () => {
    if (navigation?.navigate) {
      navigation.navigate("TransporterNotifications");
    }
  };

  const handleEditAvatar = () => {
    Alert.alert(
      "Profile Photo",
      "Choose an option to update your profile photo:",
      [
        { text: "Take Photo", onPress: () => {} },
        { text: "Choose from Library", onPress: () => {} },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleMenuPress = (itemTitle: string) => {
    switch (itemTitle) {
      case "Notification Settings":
        if (navigation?.navigate) {
          navigation.navigate("TransporterNotifications");
        } else {
          Alert.alert("Notification Settings", "All push notifications are enabled for new job offers and trip updates.");
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
        Alert.alert("Edit Profile", "Profile editing will be unlocked in the next account review.");
        break;
      default:
        break;
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to log out of your driver account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            if (navigation?.reset) {
              navigation.reset({
                index: 0,
                routes: [{ name: "Welcome" }],
              });
            } else if (navigation?.navigate) {
              navigation.navigate("Welcome");
            } else if (navigation?.canGoBack && navigation.canGoBack()) {
              navigation.goBack();
            }
          },
        },
      ]
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
              className={`rounded-xl bg-[#135228] items-center justify-center mr-2.5 shadow-xs overflow-hidden ${
                isExtraSmall ? "h-7 w-7" : isSmallDevice ? "h-8 w-8" : "h-9 w-9"
              }`}
            >
              <Image
                source={require("../../assets/logo.png")}
                className={
                  isExtraSmall
                    ? "h-6 w-6"
                    : isSmallDevice
                    ? "h-7 w-7"
                    : "h-8 w-8"
                }
                resizeMode="contain"
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
            <View
              className={`rounded-full bg-[#E68A00] items-center justify-center shadow-xs ${
                isExtraSmall ? "h-8 w-8" : isSmallDevice ? "h-8.5 w-8.5" : "h-9 w-9"
              }`}
            >
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
            </View>
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
              <View
                className={`rounded-full bg-white/20 border-2 border-white/40 items-center justify-center ${
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
                <Text
                  className={`font-black text-white ${
                    isExtraSmall ? "text-3xl" : "text-4xl"
                  }`}
                >
                  {profile.avatarLetter || "R"}
                </Text>
              </View>

              {/* Camera Edit Badge */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleEditAvatar}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white items-center justify-center shadow-md border border-gray-100"
                style={{
                  elevation: 4,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                }}
              >
                <Ionicons name="camera-outline" size={17} color="#4B5563" />
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
    </View>
  );
};

export default TransporterProfileScreen;
