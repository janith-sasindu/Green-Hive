import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  SmoothScrollView,
  SMOOTH_SCROLL_PROPS,
} from "../../components/common/SmoothScrollView";

// Mock Data imported from dedicated transporter data folder
import {
  MOCK_TRANSPORTER_PROFILE,
  MOCK_DETAILED_NOTIFICATIONS,
  TransporterNotificationItem,
  TransporterProfile,
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

  // Responsive Breakpoints
  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;
  const isTablet = screenWidth >= 600;

  // State
  const [profile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);
  const [notifications, setNotifications] = useState<
    TransporterNotificationItem[]
  >(MOCK_DETAILED_NOTIFICATIONS);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Derived state
  const unreadCount = notifications.filter((n) => !n.isRead).length;

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

  const handleMarkAllRead = () => {
    if (unreadCount === 0) {
      Alert.alert(
        "All Caught Up",
        "All notifications are already marked as read."
      );
      return;
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    Alert.alert("Success", "All notifications marked as read.");
  };

  const handleNotificationPress = (item: TransporterNotificationItem) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );

    if (item.jobId) {
      Alert.alert(
        item.title,
        `${item.message}\n\nJob Reference: ${item.jobId}`,
        [
          { text: "Dismiss", style: "cancel" },
          {
            text: "View Job Details",
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
      navigation?.navigate?.("TransporterHome");
    } else if (tab === "profile") {
      setShowProfileModal(true);
    }
  };

  const handleSignOut = () => {
    setShowProfileModal(false);
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          if (navigation?.canGoBack && navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation?.navigate?.("Welcome");
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-[#F5F8F6]">
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8F6" />

      {/* ================= TOP HEADER ================= */}
      <SafeAreaView edges={["top"]} className="bg-[#F5F8F6]">
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
                color="#1F2937"
              />
            </TouchableOpacity>

            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              className={`font-black text-gray-900 tracking-tight flex-1 ${
                isExtraSmall
                  ? "text-[16px]"
                  : isSmallDevice
                  ? "text-[18px]"
                  : isTablet
                  ? "text-[22px]"
                  : "text-[20px]"
              }`}
            >
              Notifications
            </Text>
          </View>

          {/* Right Action Icons */}
          <View className="flex-row items-center space-x-2 sm:space-x-2.5 gap-2 sm:gap-2.5">
            {/* Notification Bell */}
            <View className="relative p-1.5 rounded-full">
              <Ionicons
                name="notifications-outline"
                size={isExtraSmall ? 18 : isSmallDevice ? 20 : isTablet ? 25 : 23}
                color="#4B5563"
              />
              {unreadCount > 0 && (
                <View className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </View>

            {/* Profile Avatar Pill */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowProfileModal(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className={`rounded-full bg-[#E68A00] items-center justify-center shadow-xs ${
                isExtraSmall
                  ? "h-8 w-8"
                  : isSmallDevice
                  ? "h-8.5 w-8.5"
                  : isTablet
                  ? "h-10 w-10"
                  : "h-9 w-9"
              }`}
            >
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
            className={`font-medium text-gray-500 ${
              isSmallDevice ? "text-[11.5px]" : "text-[13.5px]"
            }`}
          >
            {unreadCount} unread
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
              color="#16A34A"
            />
            <Text
              className={`font-bold text-[#16A34A] ml-1 ${
                isSmallDevice ? "text-[11.5px]" : "text-[13.5px]"
              }`}
            >
              Mark all read
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
      >
        <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}>
          <View className="px-4 sm:px-5 space-y-2.5 sm:space-y-3 gap-2.5 sm:gap-3">
          {notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => handleNotificationPress(item)}
              className={`rounded-3xl bg-white border border-gray-100 shadow-xs flex-row items-start ${
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
                className={`rounded-2xl bg-[#FEF3C7] items-center justify-center mr-2.5 sm:mr-3.5 shrink-0 ${
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
                  className={`font-extrabold text-gray-900 mb-0.5 ${
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
                  className={`text-gray-600 font-medium ${
                    isSmallDevice
                      ? "text-[11.5px] leading-[17px]"
                      : "text-[13px] leading-5"
                  }`}
                >
                  {item.message}
                </Text>
                {item.timestamp && (
                  <Text
                    className={`font-medium text-gray-400 mt-1 sm:mt-1.5 ${
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
          ))}

          {/* Empty state fallback if notifications cleared */}
          {notifications.length === 0 && (
            <View className="py-16 items-center justify-center">
              <View className="h-16 w-16 rounded-full bg-gray-100 items-center justify-center mb-3">
                <Ionicons name="notifications-off-outline" size={28} color="#9CA3AF" />
              </View>
              <Text className="text-base font-bold text-gray-700">No Notifications</Text>
              <Text className="text-xs text-gray-400 text-center max-w-[240px] mt-1">
                You have caught up with all your transport alerts and updates.
              </Text>
            </View>
          )}
        </View>
        </View>
      </SmoothScrollView>

      {/* ================= BOTTOM NAVIGATION BAR ================= */}
      <SafeAreaView
        edges={["bottom"]}
        className="bg-white border-t border-gray-200/60"
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
              color="#9CA3AF"
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-medium text-[#9CA3AF]`}
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
              color="#9CA3AF"
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-medium text-[#9CA3AF]`}
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
              color="#9CA3AF"
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-medium text-[#9CA3AF]`}
            >
              Active
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
              color="#9CA3AF"
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-medium text-[#9CA3AF]`}
            >
              Profile
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
        <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#F9FAFB]">
          <View
            style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
            className="px-4 sm:px-5 py-3 sm:py-3.5 flex-row items-center justify-between border-b border-gray-200 bg-white"
          >
            <Text className="text-base sm:text-lg font-bold text-gray-900">
              Driver Profile
            </Text>
            <TouchableOpacity
              onPress={() => setShowProfileModal(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="p-1 rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={22} color="#4B5563" />
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
            <View className="rounded-2xl bg-white p-4 sm:p-5 border border-gray-100 shadow-2xs items-center mb-4">
              <View
                className={`rounded-full bg-[#E68A00] items-center justify-center mb-2 ${
                  isSmallDevice ? "h-14 w-14" : "h-16 w-16"
                }`}
              >
                <Text
                  className={`font-black text-white ${
                    isSmallDevice ? "text-xl" : "text-2xl"
                  }`}
                >
                  {profile.avatarLetter}
                </Text>
              </View>
              <Text className="text-base sm:text-lg font-extrabold text-gray-900">
                {profile.name}
              </Text>
              <Text className="text-xs font-semibold text-gray-500">
                {profile.email}
              </Text>
              <Text className="text-xs text-amber-700 font-bold mt-1">
                ⭐ {profile.rating.toFixed(1)} Rating ({profile.completedJobs}{" "}
                Completed Trips)
              </Text>
            </View>

            {/* Vehicle details */}
            <View className="rounded-2xl bg-white p-3.5 sm:p-4 border border-gray-100 shadow-2xs mb-4">
              <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
                Registered Vehicle
              </Text>
              <View className="space-y-1.5 gap-1.5">
                <Text className="text-xs text-gray-700">
                  🚚 <Text className="font-semibold">Type:</Text>{" "}
                  {profile.vehicleType}
                </Text>
                <Text className="text-xs text-gray-700">
                  🔢 <Text className="font-semibold">Plate:</Text>{" "}
                  {profile.vehiclePlate}
                </Text>
                <Text className="text-xs text-gray-700">
                  🛡️ <Text className="font-semibold">Status:</Text> Green-Hive
                  Verified
                </Text>
              </View>
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSignOut}
              className="rounded-2xl bg-red-50 border border-red-200 py-3 sm:py-3.5 items-center justify-center mt-2"
            >
              <Text className="text-sm font-bold text-red-600">
                Log Out of Transporter Account
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
