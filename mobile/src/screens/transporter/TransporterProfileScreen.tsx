import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SmoothScrollView } from "../../components/common/SmoothScrollView";
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

  return (
    <View className="flex-1 bg-[#F4F7F5]">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7F5" />

      {/* Top Header Bar */}
      <SafeAreaView edges={["top"]} className="bg-[#F4F7F5]">
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
              className={`font-bold text-[#111827] flex-1 ${
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
              className={`relative items-center justify-center rounded-full bg-white border border-gray-100/90 shadow-xs ${
                isExtraSmall ? "h-8 w-8" : isSmallDevice ? "h-9 w-9" : "h-10 w-10"
              }`}
            >
              <Ionicons
                name="notifications-outline"
                size={isExtraSmall ? 16 : isSmallDevice ? 18 : 20}
                color="#4B5563"
              />
              {/* Unread Alert Dot */}
              <View className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EF4444] border border-white" />
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
          </View>
        </View>
      </SmoothScrollView>
    </View>
  );
};

export default TransporterProfileScreen;
