import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
  Switch,
  useWindowDimensions,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  SmoothScrollView,
  SMOOTH_SCROLL_PROPS,
} from "../../components/common/SmoothScrollView";
import { useTransporterTheme } from "../../context/TransporterThemeContext";

// Mock Data imported from dedicated transporter data folder as fallback
import {
  MOCK_TRANSPORTER_PROFILE,
  MOCK_DETAILED_NOTIFICATIONS,
  TransporterNotificationItem,
  TransporterProfile,
  TRANSPORTER_API_ENDPOINTS,
  NOTIFICATIONS_HEADER,
  NOTIFICATIONS_EMPTY_STATE,
  NOTIFICATIONS_ALERTS,
  NOTIFICATIONS_PROFILE_MODAL,
  NOTIFICATIONS_NAV_TABS,
} from "./data";

export interface TransporterNotificationsScreenProps {
  navigation?: any;
  onBack?: () => void;
  onSelectTab?: (tab: "home" | "jobs" | "active" | "profile") => void;
}

export const TransporterNotificationsScreen = ({
  navigation,
  onBack,
  onSelectTab,
}: TransporterNotificationsScreenProps) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { isDark, toggleDarkMode, colors } = useTransporterTheme();

  // Responsive Breakpoints
  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;
  const isTablet = screenWidth >= 600;

  // Backend Endpoints from centralized data config
  const NOTIFICATIONS_URL = TRANSPORTER_API_ENDPOINTS.notifications;
  const PROFILE_URL = TRANSPORTER_API_ENDPOINTS.profile;

  // State
  const [profile, setProfile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);
  const [notifications, setNotifications] = useState<TransporterNotificationItem[]>(
    MOCK_DETAILED_NOTIFICATIONS
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  const avatarUri = profile.avatarUri || MOCK_TRANSPORTER_PROFILE.avatarUri;

  // Derived state
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Fetch Notifications from Backend
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(NOTIFICATIONS_URL);
      const json = await response.json();
      if (json.success && json.data) {
        setNotifications(Array.isArray(json.data) ? json.data : json.data.notifications || []);
      }
    } catch (error) {
      console.log("Error fetching notifications from backend:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [NOTIFICATIONS_URL]);

  // Fetch Profile for top avatar and modal details
  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(PROFILE_URL);
      const json = await response.json();
      if (json.success && json.data) {
        setProfile((prev) => ({
          ...prev,
          name: json.data.name || prev.name,
          email: json.data.email || prev.email,
          phone: json.data.phone || prev.phone,
          vehicleType: json.data.vehicleType || prev.vehicleType,
          vehiclePlate: json.data.vehiclePlate || prev.vehiclePlate,
          avatarUri: json.data.avatarUri || prev.avatarUri,
          avatarLetter: json.data.avatarLetter || json.data.name?.charAt(0) || "T",
          rating: json.data.rating ?? prev.rating,
          completedJobs: json.data.completedJobs ?? prev.completedJobs,
        }));
      }
    } catch (error) {
      console.log("Error fetching profile in notifications screen:", error);
    }
  }, [PROFILE_URL]);

  // Auto-fetch data whenever screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      fetchProfile();
    }, [fetchNotifications, fetchProfile])
  );

  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
    fetchProfile();
  };

  // Handlers
  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate?.("TransporterAvailableJobs");
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) {
      Alert.alert(
        NOTIFICATIONS_ALERTS.allCaughtUp.title,
        NOTIFICATIONS_ALERTS.allCaughtUp.message
      );
      return;
    }

    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      const response = await fetch(`${NOTIFICATIONS_URL}/read-all`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const json = await response.json();
      if (json.success) {
        Alert.alert(NOTIFICATIONS_ALERTS.markAllSuccess.title, NOTIFICATIONS_ALERTS.markAllSuccess.message);
      }
    } catch (error) {
      console.log("Error marking all notifications read:", error);
      Alert.alert(NOTIFICATIONS_ALERTS.markAllSuccess.title, NOTIFICATIONS_ALERTS.markAllSuccess.message);
    }
  };

  const handleNotificationPress = (item: TransporterNotificationItem) => {
    // Optimistically mark as read in local state
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );

    // Call backend API to persist read state
    fetch(`${NOTIFICATIONS_URL}/${item.id}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    }).catch((e) =>
      console.log("Failed to mark notification read on backend:", e)
    );

    if (item.jobId) {
      Alert.alert(
        item.title,
        `${item.message}\n\n${NOTIFICATIONS_ALERTS.jobReferenceLabel} ${item.jobId}`,
        [
          { text: NOTIFICATIONS_ALERTS.dismissButton, style: "cancel" },
          {
            text: NOTIFICATIONS_ALERTS.viewJobDetailsButton,
            onPress: () => {
              if (navigation?.navigate) {
                navigation.navigate("TransporterHome");
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(item.title, item.message);
    }
  };

  const handleTabPress = (tab: "home" | "jobs" | "active" | "profile") => {
    if (onSelectTab) {
      onSelectTab(tab);
    } else if (tab === "home") {
      navigation?.navigate?.("TransporterHome");
    } else if (tab === "jobs") {
      navigation?.navigate?.("TransporterAvailableJobs");
    } else if (tab === "active") {
      navigation?.navigate?.("TransporterActiveJob");
    } else if (tab === "profile") {
      navigation?.navigate?.("TransporterProfile");
    }
  };

  const handleSignOut = () => {
    setShowProfileModal(false);
    Alert.alert(
      NOTIFICATIONS_ALERTS.signOut.title,
      NOTIFICATIONS_ALERTS.signOut.message,
      [
        { text: NOTIFICATIONS_ALERTS.signOut.cancelButton, style: "cancel" },
        {
          text: NOTIFICATIONS_ALERTS.signOut.confirmButton,
          style: "destructive",
          onPress: () => {
            if (navigation?.canGoBack && navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation?.navigate?.("Welcome");
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#F5F8F6] dark:bg-slate-900">
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0F172A" : "#F5F8F6"}
      />

      {/* ================= TOP HEADER ================= */}
      <SafeAreaView edges={["top"]} className="bg-[#F5F8F6] dark:bg-slate-900">
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className={`px-4 sm:px-5 flex-row items-center justify-between ${
            isSmallDevice ? "pt-1 pb-1.5" : "pt-2 pb-2.5"
          }`}
        >
          {/* Back button & Screen Title */}
          <View className="flex-row items-center flex-1 pr-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGoBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="p-1 -ml-1 mr-2 rounded-full"
            >
              <Ionicons
                name="arrow-back"
                size={isExtraSmall ? 20 : isSmallDevice ? 22 : isTablet ? 26 : 24}
                color={isDark ? "#FFFFFF" : "#1F2937"}
              />
            </TouchableOpacity>

            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              className={`font-black text-gray-900 dark:text-white tracking-tight flex-1 ${
                isExtraSmall
                  ? "text-[16px]"
                  : isSmallDevice
                  ? "text-[18px]"
                  : isTablet
                  ? "text-[22px]"
                  : "text-[20px]"
              }`}
            >
              {NOTIFICATIONS_HEADER.title}
            </Text>
          </View>

          {/* Right Action Icons */}
          <View className="flex-row items-center space-x-2 sm:space-x-2.5 gap-2 sm:gap-2.5">
            {/* Settings button leading to Notification Settings */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (navigation?.navigate) {
                  navigation.navigate("TransporterNotificationSettings");
                }
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="p-1.5 rounded-full"
            >
              <Ionicons
                name="settings-outline"
                size={isExtraSmall ? 19 : isSmallDevice ? 21 : isTablet ? 25 : 23}
                color={colors.icon}
              />
            </TouchableOpacity>

            {/* Profile Avatar Pill */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleTabPress("profile")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className={`rounded-full bg-[#E68A00] items-center justify-center shadow-xs overflow-hidden ${
                isExtraSmall
                  ? "h-8 w-8"
                  : isSmallDevice
                  ? "h-8.5 w-8.5"
                  : isTablet
                  ? "h-10 w-10"
                  : "h-9 w-9"
              }`}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text
                  className={`font-extrabold text-white ${
                    isExtraSmall
                      ? "text-xs"
                      : isSmallDevice
                      ? "text-xs"
                      : isTablet
                      ? "text-base"
                      : "text-sm"
                  }`}
                >
                  {profile.avatarLetter}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Sub-header row: unread count and "Mark all read" */}
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className="px-4 sm:px-5 pt-1 pb-2 flex-row items-center justify-between"
        >
          <Text
            numberOfLines={1}
            className={`font-medium text-gray-500 dark:text-slate-400 ${
              isSmallDevice ? "text-[11.5px]" : "text-[13.5px]"
            }`}
          >
            {NOTIFICATIONS_HEADER.unreadLabel(unreadCount)}
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleMarkAllRead}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="flex-row items-center"
          >
            <Ionicons
              name="checkmark"
              size={isSmallDevice ? 14 : 15}
              color={isDark ? "#34D399" : "#16A34A"}
            />
            <Text
              className={`font-bold text-[#16A34A] dark:text-emerald-400 ml-1 ${
                isSmallDevice ? "text-[11.5px]" : "text-[13.5px]"
              }`}
            >
              {NOTIFICATIONS_HEADER.markAllReadButton}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ================= MAIN SCROLLABLE BODY ================= */}
      <SmoothScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: isSmallDevice ? 32 : 44,
          paddingTop: isSmallDevice ? 4 : 8,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#E68A00"]}
            tintColor="#E68A00"
          />
        }
      >
        <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}>
          <View className="px-4 sm:px-5 space-y-2.5 sm:space-y-3 gap-2.5 sm:gap-3">
            {loading && notifications.length === 0 ? (
              <View className="py-20 items-center justify-center">
                <ActivityIndicator size="large" color="#E68A00" />
                <Text className="text-xs font-semibold text-gray-400 dark:text-slate-500 mt-3">
                  {NOTIFICATIONS_EMPTY_STATE.loading}
                </Text>
              </View>
            ) : (
              notifications.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => handleNotificationPress(item)}
                  className={`rounded-3xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xs flex-row items-start ${
                    isExtraSmall ? "p-3" : isSmallDevice ? "p-3.5" : "p-4 sm:p-5"
                  }`}
                  style={{
                    elevation: 1.5,
                    shadowColor: "#000",
                    shadowOpacity: 0.03,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                  }}
                >
                  {/* Left icon badge container */}
                  <View
                    className={`rounded-2xl bg-[#FEF3C7] dark:bg-amber-950/60 items-center justify-center mr-2.5 sm:mr-3.5 shrink-0 ${
                      isExtraSmall
                        ? "h-9 w-9"
                        : isSmallDevice
                        ? "h-10 w-10"
                        : isTablet
                        ? "h-14 w-14"
                        : "h-12 w-12"
                    }`}
                  >
                    <Text
                      className={
                        isExtraSmall
                          ? "text-base"
                          : isSmallDevice
                          ? "text-lg"
                          : isTablet
                          ? "text-3xl"
                          : "text-2xl"
                      }
                    >
                      {item.iconEmoji || "🚚"}
                    </Text>
                  </View>

                  {/* Notification text content */}
                  <View className="flex-1 pr-1.5 sm:pr-2">
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                      className={`font-extrabold text-gray-900 dark:text-white mb-0.5 ${
                        isExtraSmall
                          ? "text-[13px]"
                          : isSmallDevice
                          ? "text-[14px]"
                          : isTablet
                          ? "text-[17px]"
                          : "text-[15.5px]"
                      }`}
                    >
                      {item.title}
                    </Text>
                    <Text
                      className={`text-gray-600 dark:text-slate-300 font-medium ${
                        isSmallDevice
                          ? "text-[11.5px] leading-[17px]"
                          : "text-[13px] leading-5"
                      }`}
                    >
                      {item.message}
                    </Text>
                    {item.timestamp && (
                      <Text
                        className={`font-medium text-gray-400 dark:text-slate-400 mt-1 sm:mt-1.5 ${
                          isSmallDevice ? "text-[10px]" : "text-[11.5px]"
                        }`}
                      >
                        {item.timestamp}
                      </Text>
                    )}
                  </View>

                  {/* Unread indicator dot */}
                  {!item.isRead && (
                    <View
                      className={`rounded-full bg-[#16A34A] shrink-0 ${
                        isSmallDevice
                          ? "h-2 w-2 mt-1"
                          : "h-2.5 w-2.5 mt-1.5"
                      }`}
                    />
                  )}
                </TouchableOpacity>
              ))
            )}

            {/* Empty state fallback if notifications cleared */}
            {!loading && notifications.length === 0 && (
              <View className="py-16 items-center justify-center">
                <View className="h-16 w-16 rounded-full bg-gray-100 dark:bg-slate-800 items-center justify-center mb-3">
                  <Ionicons
                    name="notifications-off-outline"
                    size={28}
                    color={colors.iconMuted}
                  />
                </View>
                <Text className="text-base font-bold text-gray-700 dark:text-slate-200">
                  {NOTIFICATIONS_EMPTY_STATE.title}
                </Text>
                <Text className="text-xs text-gray-400 dark:text-slate-400 text-center max-w-[240px] mt-1">
                  {NOTIFICATIONS_EMPTY_STATE.description}
                </Text>
              </View>
            )}
          </View>
        </View>
      </SmoothScrollView>

      {/* ================= BOTTOM NAVIGATION BAR ================= */}
      <SafeAreaView
        edges={["bottom"]}
        className="bg-white dark:bg-slate-800 border-t border-gray-200/60 dark:border-slate-700"
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
              {NOTIFICATIONS_NAV_TABS.home}
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
              {NOTIFICATIONS_NAV_TABS.jobs}
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
              {NOTIFICATIONS_NAV_TABS.active}
            </Text>
          </TouchableOpacity>

          {/* Profile Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("profile")}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name="person-outline"
              size={isSmallDevice ? 20 : 22}
              color={colors.iconMuted}
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-medium text-[#9CA3AF] dark:text-slate-400`}
            >
              {NOTIFICATIONS_NAV_TABS.profile}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ================= MODAL: DRIVER PROFILE ================= */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#F9FAFB] dark:bg-slate-900">
          <View
            style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
            className="px-4 sm:px-5 py-3 sm:py-3.5 flex-row items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800"
          >
            <Text className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {NOTIFICATIONS_PROFILE_MODAL.title}
            </Text>
            <TouchableOpacity
              onPress={() => setShowProfileModal(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="p-1 rounded-full bg-gray-100 dark:bg-slate-700"
            >
              <Ionicons name="close" size={22} color={colors.iconMuted} />
            </TouchableOpacity>
          </View>

          <SmoothScrollView
            className="p-3.5 sm:p-4 flex-1"
            contentContainerStyle={{
              paddingBottom: 40,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}>
              {/* Driver Card */}
              <View className="rounded-2xl bg-white dark:bg-slate-800 p-4 sm:p-5 border border-gray-100 dark:border-slate-700 shadow-2xs items-center mb-4">
                <View
                  className={`rounded-full bg-[#E68A00] items-center justify-center mb-2 overflow-hidden ${
                    isSmallDevice ? "h-14 w-14" : "h-16 w-16"
                  }`}
                >
                  {avatarUri ? (
                    <Image
                      source={{ uri: avatarUri }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text
                      className={`font-black text-white ${
                        isSmallDevice ? "text-xl" : "text-2xl"
                      }`}
                    >
                      {profile.avatarLetter}
                    </Text>
                  )}
                </View>
                <Text className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                  {profile.name}
                </Text>
                <Text className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  {profile.email}
                </Text>
                <Text className="text-xs text-amber-700 dark:text-amber-400 font-bold mt-1">
                  {NOTIFICATIONS_PROFILE_MODAL.tripsSummary(profile.rating, profile.completedJobs)}
                </Text>
              </View>

              {/* Vehicle details */}
              <View className="rounded-2xl bg-white dark:bg-slate-800 p-3.5 sm:p-4 border border-gray-100 dark:border-slate-700 shadow-2xs mb-4">
                <Text className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">
                  {NOTIFICATIONS_PROFILE_MODAL.vehicleSectionTitle}
                </Text>
                <View className="space-y-1.5 gap-1.5">
                  <Text className="text-xs text-gray-700 dark:text-slate-300">
                    🚚 <Text className="font-semibold">{NOTIFICATIONS_PROFILE_MODAL.typeLabel}</Text>{" "}
                    {profile.vehicleType}
                  </Text>
                  <Text className="text-xs text-gray-700 dark:text-slate-300">
                    🔢 <Text className="font-semibold">{NOTIFICATIONS_PROFILE_MODAL.plateLabel}</Text>{" "}
                    {profile.vehiclePlate}
                  </Text>
                  <Text className="text-xs text-gray-700 dark:text-slate-300">
                    🛡️ <Text className="font-semibold">{NOTIFICATIONS_PROFILE_MODAL.statusLabel}</Text>{" "}
                    {NOTIFICATIONS_PROFILE_MODAL.verifiedStatus}
                  </Text>
                </View>
              </View>

              {/* Dark Mode Toggle Card */}
              <View className="rounded-2xl bg-white dark:bg-slate-800 p-3.5 sm:p-4 border border-gray-100 dark:border-slate-700 shadow-2xs mb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="h-8 w-8 rounded-full bg-amber-50 dark:bg-slate-700 items-center justify-center mr-3">
                      <Ionicons
                        name={isDark ? "moon" : "sunny"}
                        size={18}
                        color={isDark ? "#F59E0B" : "#D97706"}
                      />
                    </View>
                    <View>
                      <Text className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                        {NOTIFICATIONS_PROFILE_MODAL.darkModeTitle}
                      </Text>
                      <Text className="text-[10.5px] text-gray-500 dark:text-slate-400">
                        {isDark ? NOTIFICATIONS_PROFILE_MODAL.darkModeActive : NOTIFICATIONS_PROFILE_MODAL.lightModeActive}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isDark}
                    onValueChange={toggleDarkMode}
                    trackColor={{ false: "#D1D5DB", true: "#E68A00" }}
                    thumbColor={isDark ? "#FFFFFF" : "#FFFFFF"}
                  />
                </View>
              </View>

              {/* Sign Out Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSignOut}
                className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 py-3 sm:py-3.5 items-center justify-center mt-2"
              >
                <Text className="text-sm font-bold text-red-600 dark:text-red-400">
                  {NOTIFICATIONS_PROFILE_MODAL.logOutButton}
                </Text>
              </TouchableOpacity>
            </View>
          </SmoothScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default TransporterNotificationsScreen;
