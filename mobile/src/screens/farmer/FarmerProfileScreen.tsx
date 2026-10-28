import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  Switch,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SmoothScrollView } from "../../components/common/SmoothScrollView";

interface FarmerProfileScreenProps {
  onBackToHome: () => void;
  onLogout: () => void;
}

export const FarmerProfileScreen = ({
  onBackToHome,
  onLogout,
}: FarmerProfileScreenProps) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;

  const [isLightMode, setIsLightMode] = useState(false);

  const farmerProfile = {
    name: "Sunil Perera",
    role: "Verified Farmer",
    location: "Nuwara Eliya",
    phone: "+94 77 123 4567",
    email: "sunil@farmer.lk",
    memberSince: "August 2024",
    avatarLetter: "S",
    rating: 4.6,
    completedSales: 23,
    totalEarnings: "Rs. 142k",
    activeListings: "3 Crops",
  };

  const handleMenuPress = (itemTitle: string) => {
    switch (itemTitle) {
      case "Edit Profile":
        Alert.alert("Edit Profile", "Profile editing will be available in the next update.");
        break;
      case "Bank & Payment Details":
        Alert.alert(
          "Bank & Payment Details",
          "Bank: People's Bank\nAcc No: **** 4521\nStatus: Verified"
        );
        break;
      case "Notification Settings":
        Alert.alert(
          "Notification Settings",
          "All push notifications are enabled for new buyer requirements and order updates."
        );
        break;
      case "Help & Support":
        Alert.alert(
          "Help & Support",
          "For farmer support, contact our 24/7 hotline at 1920 or email support@greenhive.lk"
        );
        break;
      default:
        break;
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

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to log out of your farmer account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: onLogout,
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#F4F7F5]">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7F5" />

      {/* ── Top Header Bar ── */}
      <SafeAreaView edges={["top"]} className="bg-[#F4F7F5]">
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className={`px-4 flex-row items-center justify-between ${
            isSmallDevice ? "pt-1 pb-2" : "pt-2 pb-2.5"
          }`}
        >
          {/* Title */}
          <Text
            numberOfLines={1}
            className={`font-bold text-[#111827] ${
              isExtraSmall
                ? "text-[16px]"
                : isSmallDevice
                ? "text-[18px]"
                : "text-[20px]"
            }`}
          >
            My Profile
          </Text>

          {/* Notification Bell + Avatar */}
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              activeOpacity={0.7}
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
              <View className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EF4444] border border-white" />
            </TouchableOpacity>

            <View
              className={`rounded-full bg-[#166534] items-center justify-center shadow-xs ${
                isExtraSmall ? "h-8 w-8" : isSmallDevice ? "h-8 w-8" : "h-9 w-9"
              }`}
            >
              <Text
                className={`font-bold text-white ${
                  isExtraSmall ? "text-[11px]" : isSmallDevice ? "text-xs" : "text-sm"
                }`}
              >
                {farmerProfile.avatarLetter}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* ── Main Scrollable Content ── */}
      <SmoothScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: isSmallDevice ? 14 : 16,
          paddingTop: 8,
          paddingBottom: 40,
        }}
      >
        <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}>

          {/* ══════════════════════════════════════
              1. PROFILE HERO BANNER
          ══════════════════════════════════════ */}
          <View
            className={`rounded-3xl bg-[#166534] overflow-hidden shadow-md ${
              isExtraSmall ? "p-4" : isSmallDevice ? "p-5" : "p-6"
            } items-center relative mb-4`}
            style={{
              shadowColor: "#166534",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            {/* Ambient Decorative Circles */}
            <View className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/10 pointer-events-none" />
            <View className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-black/5 pointer-events-none" />

            {/* Avatar with Camera Badge */}
            <View className="relative mt-1">
              <View
                className="rounded-full bg-white/20 border-2 border-white/40 items-center justify-center"
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
                  {farmerProfile.avatarLetter}
                </Text>
              </View>

              {/* Camera Edit Badge */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleEditAvatar}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white items-center justify-center border border-gray-100"
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

            {/* Name */}
            <Text
              numberOfLines={1}
              className={`font-bold text-white text-center mt-3 ${
                isExtraSmall ? "text-lg" : isSmallDevice ? "text-xl" : "text-2xl"
              }`}
            >
              {farmerProfile.name}
            </Text>

            {/* Role Subtitle */}
            <Text
              numberOfLines={1}
              className={`font-medium text-white/90 text-center mt-1 ${
                isExtraSmall ? "text-xs" : "text-sm"
              }`}
            >
              {farmerProfile.role} · {farmerProfile.location}
            </Text>

            {/* Rating Row */}
            <View className="flex-row items-center justify-center mt-2.5">
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text className="font-extrabold text-white text-xs ml-1.5">
                {farmerProfile.rating.toFixed(1)}
              </Text>
              <Text className="text-white/80 mx-1.5 text-xs">·</Text>
              <Text className="font-medium text-white/90 text-xs">
                {farmerProfile.completedSales} sales completed
              </Text>
            </View>

            {/* 3-Column Stats */}
            <View
              className="mt-4 w-full rounded-2xl border border-white/20 p-3 flex-row items-center justify-between"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.16)" }}
            >
              <View className="flex-1 items-center justify-center">
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="font-black text-white text-base text-center"
                >
                  {farmerProfile.completedSales}
                </Text>
                <Text className="font-semibold text-white/80 text-[11px] text-center mt-0.5">
                  Sales
                </Text>
              </View>

              <View className="h-7 w-[1px] bg-white/25" />

              <View className="flex-1 items-center justify-center">
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="font-black text-white text-base text-center"
                >
                  {farmerProfile.totalEarnings}
                </Text>
                <Text className="font-semibold text-white/80 text-[11px] text-center mt-0.5">
                  Earned
                </Text>
              </View>

              <View className="h-7 w-[1px] bg-white/25" />

              <View className="flex-1 items-center justify-center">
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className="font-black text-white text-base text-center"
                >
                  {farmerProfile.activeListings}
                </Text>
                <Text className="font-semibold text-white/80 text-[11px] text-center mt-0.5">
                  Active
                </Text>
              </View>
            </View>
          </View>

          {/* ══════════════════════════════════════
              2. CONTACT & FARM INFO CARD
          ══════════════════════════════════════ */}
          <View
            className={`rounded-3xl bg-white border border-gray-100 shadow-2xs mb-4 ${
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
            <Text className="text-base font-bold text-gray-900 mb-3.5">
              Contact & Farm Info
            </Text>

            <View className="gap-3">
              {/* Phone */}
              <View className="flex-row items-center">
                <View
                  className={`rounded-2xl bg-gray-100/80 items-center justify-center mr-3 ${
                    isExtraSmall ? "h-9 w-9" : "h-11 w-11"
                  }`}
                >
                  <Ionicons
                    name="call-outline"
                    size={isExtraSmall ? 17 : 20}
                    color="#4B5563"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-medium text-gray-400">Phone</Text>
                  <Text numberOfLines={1} className="text-xs font-bold text-gray-900 mt-0.5">
                    {farmerProfile.phone}
                  </Text>
                </View>
              </View>

              {/* Email */}
              <View className="flex-row items-center">
                <View
                  className={`rounded-2xl bg-gray-100/80 items-center justify-center mr-3 ${
                    isExtraSmall ? "h-9 w-9" : "h-11 w-11"
                  }`}
                >
                  <Ionicons
                    name="mail-outline"
                    size={isExtraSmall ? 17 : 20}
                    color="#4B5563"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-medium text-gray-400">Email</Text>
                  <Text numberOfLines={1} className="text-xs font-bold text-gray-900 mt-0.5">
                    {farmerProfile.email}
                  </Text>
                </View>
              </View>

              {/* Farm Location */}
              <View className="flex-row items-center">
                <View
                  className={`rounded-2xl bg-gray-100/80 items-center justify-center mr-3 ${
                    isExtraSmall ? "h-9 w-9" : "h-11 w-11"
                  }`}
                >
                  <Ionicons
                    name="location-outline"
                    size={isExtraSmall ? 17 : 20}
                    color="#4B5563"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-medium text-gray-400">Farm Location</Text>
                  <Text numberOfLines={1} className="text-xs font-bold text-gray-900 mt-0.5">
                    {farmerProfile.location}, Central Province
                  </Text>
                </View>
              </View>

              {/* Member Since */}
              <View className="flex-row items-center">
                <View
                  className={`rounded-2xl bg-gray-100/80 items-center justify-center mr-3 ${
                    isExtraSmall ? "h-9 w-9" : "h-11 w-11"
                  }`}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={isExtraSmall ? 17 : 20}
                    color="#4B5563"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-medium text-gray-400">Member Since</Text>
                  <Text numberOfLines={1} className="text-xs font-bold text-gray-900 mt-0.5">
                    {farmerProfile.memberSince}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ══════════════════════════════════════
              3. SETTINGS & PREFERENCES CARD
          ══════════════════════════════════════ */}
          <View
            className={`rounded-3xl bg-white border border-gray-100 shadow-2xs mb-4 ${
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
              className="py-3.5 flex-row items-center justify-between border-b border-gray-100/90"
            >
              <Text className="text-xs font-semibold text-gray-800">Edit Profile</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Bank & Payment Details */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleMenuPress("Bank & Payment Details")}
              className="py-3.5 flex-row items-center justify-between border-b border-gray-100/90"
            >
              <Text className="text-xs font-semibold text-gray-800">
                Bank & Payment Details
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Notification Settings */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleMenuPress("Notification Settings")}
              className="py-3.5 flex-row items-center justify-between border-b border-gray-100/90"
            >
              <Text className="text-xs font-semibold text-gray-800">
                Notification Settings
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Help & Support */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleMenuPress("Help & Support")}
              className="py-3.5 flex-row items-center justify-between border-b border-gray-100/90"
            >
              <Text className="text-xs font-semibold text-gray-800">Help & Support</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Light Mode Toggle */}
            <View className="py-2.5 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="sunny-outline" size={19} color="#6B7280" />
                <Text className="text-xs font-semibold text-gray-800 ml-2.5">
                  Light Mode
                </Text>
              </View>
              <Switch
                value={isLightMode}
                onValueChange={(val) => setIsLightMode(val)}
                trackColor={{ false: "#E5E7EB", true: "#166534" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
                style={{
                  transform: [
                    { scaleX: isSmallDevice ? 0.85 : 0.95 },
                    { scaleY: isSmallDevice ? 0.85 : 0.95 },
                  ],
                }}
              />
            </View>
          </View>

          {/* ══════════════════════════════════════
              4. SIGN OUT BUTTON
          ══════════════════════════════════════ */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSignOut}
            className={`w-full rounded-2xl border border-red-200/90 items-center justify-center flex-row shadow-2xs mt-1 mb-6 ${
              isExtraSmall ? "py-3" : isSmallDevice ? "py-3.5" : "py-4"
            }`}
            style={{
              borderColor: "#FECACA",
              backgroundColor: "#FEF2F2",
            }}
          >
            <Ionicons
              name="log-out-outline"
              size={19}
              color="#EF4444"
              style={{ marginRight: 8 }}
            />
            <Text className="text-sm font-bold text-[#EF4444]">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </SmoothScrollView>
    </View>
  );
};
