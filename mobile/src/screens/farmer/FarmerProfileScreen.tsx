import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StatusBar,
  Alert, Switch, useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SmoothScrollView } from "../../components/common/SmoothScrollView";

interface FarmerProfileScreenProps {
  onBackToHome: () => void;
  onLogout: () => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
}

export const FarmerProfileScreen = ({
  onBackToHome,
  onLogout,
  isDark,
  setIsDark,
}: FarmerProfileScreenProps) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;

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

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const t = {
    screenBg:    isDark ? "#0F1A12" : "#F4F7F5",
    headerBg:    isDark ? "#0F1A12" : "#F4F7F5",
    cardBg:      isDark ? "#1C2B1F" : "#FFFFFF",
    cardBorder:  isDark ? "#2A3D2E" : "#F3F4F6",
    titleText:   isDark ? "#E8F5EA" : "#111827",
    subLabel:    isDark ? "#6EAB7A" : "#9CA3AF",
    valueText:   isDark ? "#E8F5EA" : "#111827",
    menuText:    isDark ? "#D1FAE5" : "#1F2937",
    iconBg:      isDark ? "#1E3324" : "rgba(243,244,246,0.8)",
    iconColor:   isDark ? "#8DB898" : "#4B5563",
    divider:     isDark ? "#2A3D2E" : "rgba(243,244,246,0.9)",
    chevron:     isDark ? "#4B7A54" : "#9CA3AF",
    notifBellBg: isDark ? "#1C2B1F" : "#FFFFFF",
    notifBellBorder: isDark ? "#2A3D2E" : "rgba(243,244,246,0.9)",
    statusBar:   (isDark ? "light-content" : "dark-content") as "light-content" | "dark-content",
  };

  const handleMenuPress = (itemTitle: string) => {
    switch (itemTitle) {
      case "Edit Profile":
        Alert.alert("Edit Profile", "Profile editing will be available in the next update.");
        break;
      case "Bank & Payment Details":
        Alert.alert("Bank & Payment Details", "Bank: People's Bank\nAcc No: **** 4521\nStatus: Verified");
        break;
      case "Notification Settings":
        Alert.alert("Notification Settings", "All push notifications are enabled for new buyer requirements and order updates.");
        break;
      case "Help & Support":
        Alert.alert("Help & Support", "For farmer support, contact our 24/7 hotline at 1920 or email support@greenhive.lk");
        break;
      default: break;
    }
  };

  const handleEditAvatar = () => {
    Alert.alert("Profile Photo", "Choose an option to update your profile photo:", [
      { text: "Take Photo", onPress: () => {} },
      { text: "Choose from Library", onPress: () => {} },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to log out of your farmer account?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: onLogout },
    ]);
  };

  const contactRows = [
    { icon: "call-outline",     label: "Phone",        value: farmerProfile.phone },
    { icon: "mail-outline",     label: "Email",        value: farmerProfile.email },
    { icon: "location-outline", label: "Farm Location",value: `${farmerProfile.location}, Central Province` },
    { icon: "calendar-outline", label: "Member Since", value: farmerProfile.memberSince },
  ] as const;

  const menuItems = ["Edit Profile", "Bank & Payment Details", "Notification Settings", "Help & Support"];

  return (
    <View style={{ flex: 1, backgroundColor: t.screenBg }}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.screenBg} />

      {/* Header */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: t.headerBg }}>
        <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className={`px-4 flex-row items-center justify-between ${isSmallDevice ? "pt-1 pb-2" : "pt-2 pb-2.5"}`}>
          <Text numberOfLines={1} style={{ color: t.titleText }}
            className={`font-bold ${isExtraSmall ? "text-[16px]" : isSmallDevice ? "text-[18px]" : "text-[20px]"}`}>
            My Profile
          </Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ backgroundColor: t.notifBellBg, borderWidth: 1, borderColor: t.notifBellBorder }}
              className={`relative items-center justify-center rounded-full shadow-xs ${isExtraSmall ? "h-8 w-8" : isSmallDevice ? "h-9 w-9" : "h-10 w-10"}`}>
              <Ionicons name="notifications-outline" size={isExtraSmall ? 16 : isSmallDevice ? 18 : 20} color={t.iconColor} />
              <View className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EF4444] border border-white" />
            </TouchableOpacity>
            <View style={{ backgroundColor: "#166534" }}
              className={`rounded-full items-center justify-center shadow-xs ${isExtraSmall ? "h-8 w-8" : "h-9 w-9"}`}>
              <Text style={{ color: "#FFFFFF" }} className={`font-bold ${isExtraSmall ? "text-[11px]" : "text-sm"}`}>
                {farmerProfile.avatarLetter}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Scrollable Content */}
      <SmoothScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: isSmallDevice ? 14 : 16, paddingTop: 8, paddingBottom: 40 }}>
        <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}>

          {/* Hero Banner */}
          <View className={`rounded-3xl bg-[#166534] overflow-hidden shadow-md items-center relative mb-4 ${isExtraSmall ? "p-4" : isSmallDevice ? "p-5" : "p-6"}`}
            style={{ shadowColor: "#166534", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 }}>
            <View className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/10" />
            <View className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-black/5" />

            <View className="relative mt-1">
              <View className="rounded-full bg-white/20 border-2 border-white/40 items-center justify-center"
                style={{ width: isExtraSmall ? 80 : isSmallDevice ? 88 : 96, height: isExtraSmall ? 80 : isSmallDevice ? 88 : 96 }}>
                <Text className={`font-black text-white ${isExtraSmall ? "text-3xl" : "text-4xl"}`}>{farmerProfile.avatarLetter}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.85} onPress={handleEditAvatar} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white items-center justify-center border border-gray-100"
                style={{ elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 }}>
                <Ionicons name="camera-outline" size={17} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <Text numberOfLines={1} className={`font-bold text-white text-center mt-3 ${isExtraSmall ? "text-lg" : isSmallDevice ? "text-xl" : "text-2xl"}`}>
              {farmerProfile.name}
            </Text>
            <Text numberOfLines={1} className={`font-medium text-white/90 text-center mt-1 ${isExtraSmall ? "text-xs" : "text-sm"}`}>
              {farmerProfile.role} · {farmerProfile.location}
            </Text>
            <View className="flex-row items-center justify-center mt-2.5">
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text className="font-extrabold text-white text-xs ml-1.5">{farmerProfile.rating.toFixed(1)}</Text>
              <Text className="text-white/80 mx-1.5 text-xs">·</Text>
              <Text className="font-medium text-white/90 text-xs">{farmerProfile.completedSales} sales completed</Text>
            </View>

            <View className="mt-4 w-full rounded-2xl border border-white/20 p-3 flex-row items-center justify-between"
              style={{ backgroundColor: "rgba(255,255,255,0.16)" }}>
              {[
                { val: String(farmerProfile.completedSales), lbl: "Sales" },
                { val: farmerProfile.totalEarnings,          lbl: "Earned" },
                { val: farmerProfile.activeListings,         lbl: "Active" },
              ].map(({ val, lbl }, idx) => (
                <View key={lbl} className="flex-row flex-1 items-center justify-center">
                  {idx > 0 && <View className="h-7 w-[1px] bg-white/25 mr-2" />}
                  <View className="flex-1 items-center">
                    <Text numberOfLines={1} adjustsFontSizeToFit className="font-black text-white text-base text-center">{val}</Text>
                    <Text className="font-semibold text-white/80 text-[11px] text-center mt-0.5">{lbl}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Contact Card */}
          <View className={`rounded-3xl mb-4 ${isExtraSmall ? "p-3.5" : isSmallDevice ? "p-4" : "p-5"}`}
            style={{ backgroundColor: t.cardBg, borderWidth: 1, borderColor: t.cardBorder, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
            <Text style={{ color: t.titleText }} className="text-base font-bold mb-3.5">Contact & Farm Info</Text>
            <View className="gap-3">
              {contactRows.map(({ icon, label, value }) => (
                <View key={label} className="flex-row items-center">
                  <View style={{ backgroundColor: t.iconBg }} className={`rounded-2xl items-center justify-center mr-3 ${isExtraSmall ? "h-9 w-9" : "h-11 w-11"}`}>
                    <Ionicons name={icon as any} size={isExtraSmall ? 17 : 20} color={t.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: t.subLabel }} className="text-[11px] font-medium">{label}</Text>
                    <Text numberOfLines={1} style={{ color: t.valueText }} className="text-xs font-bold mt-0.5">{value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Settings Card */}
          <View className={`rounded-3xl mb-4 ${isExtraSmall ? "px-3.5 py-1" : isSmallDevice ? "px-4 py-1.5" : "px-5 py-2"}`}
            style={{ backgroundColor: t.cardBg, borderWidth: 1, borderColor: t.cardBorder, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
            {menuItems.map((item) => (
              <TouchableOpacity key={item} activeOpacity={0.7} onPress={() => handleMenuPress(item)}
                className="py-3.5 flex-row items-center justify-between"
                style={{ borderBottomWidth: 1, borderBottomColor: t.divider }}>
                <Text style={{ color: t.menuText }} className="text-xs font-semibold">{item}</Text>
                <Ionicons name="chevron-forward" size={18} color={t.chevron} />
              </TouchableOpacity>
            ))}
            {/* Dark Mode Toggle */}
            <View className="py-2.5 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name={isDark ? "moon-outline" : "sunny-outline"} size={19} color={t.iconColor} />
                <Text style={{ color: t.menuText }} className="text-xs font-semibold ml-2.5">
                  {isDark ? "Dark Mode" : "Light Mode"}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={setIsDark}
                trackColor={{ false: "#E5E7EB", true: "#166534" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
                style={{ transform: [{ scaleX: isSmallDevice ? 0.85 : 0.95 }, { scaleY: isSmallDevice ? 0.85 : 0.95 }] }}
              />
            </View>
          </View>

          {/* Sign Out */}
          <TouchableOpacity activeOpacity={0.8} onPress={handleSignOut}
            className={`w-full rounded-2xl items-center justify-center flex-row mt-1 mb-6 ${isExtraSmall ? "py-3" : isSmallDevice ? "py-3.5" : "py-4"}`}
            style={{ borderWidth: 1, borderColor: "#FECACA", backgroundColor: isDark ? "#2D1515" : "#FEF2F2" }}>
            <Ionicons name="log-out-outline" size={19} color="#EF4444" style={{ marginRight: 8 }} />
            <Text className="text-sm font-bold text-[#EF4444]">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </SmoothScrollView>
    </View>
  );
};
