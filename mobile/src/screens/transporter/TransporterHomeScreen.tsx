import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Alert,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface TransporterHomeScreenProps {
  navigation?: any;
}

interface AvailableJobItem {
  id: string;
  cropName: string;
  weight: string;
  pickup: string;
  dropoff: string;
  pickupTime: string;
  status: "Open" | "Assigned";
  price?: string;
}

export const TransporterHomeScreen = ({ navigation }: TransporterHomeScreenProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const isSmallDevice = screenWidth < 380;

  // Active bottom navigation tab
  const [activeTab, setActiveTab] = useState<"home" | "jobs" | "active" | "profile">("home");

  // Interactive Modals
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAvailableJobsModal, setShowAvailableJobsModal] = useState(false);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);

  // Active Job State
  const [jobStatus, setJobStatus] = useState<string>("In Progress");

  // Available Jobs (matching the exact screenshot)
  const availableJobsList: AvailableJobItem[] = [
    {
      id: "#GH-T1025",
      cropName: "Ripe Tomatoes",
      weight: "150 kg",
      pickup: "Dambulla Agricultural Zone, Plot 14",
      dropoff: "Colombo Fresh Market, Colombo 03",
      pickupTime: "2026-08-31 · 06:00 AM",
      status: "Open",
      price: "Rs. 15,500",
    },
    {
      id: "#GH-T1020",
      cropName: "Organic Carrots",
      weight: "200 kg",
      pickup: "Nuwara Eliya Highlands Farm",
      dropoff: "Kandy Supermart, City Center",
      pickupTime: "2026-08-29 · 07:00 AM",
      status: "Open",
      price: "Rs. 14,000",
    },
  ];

  const handleConfirmPickup = () => {
    Alert.alert(
      "Confirm Pickup",
      "Are you currently at Nuwara Eliya Farm, Hanguranketha Road to confirm loading of 100 kg Fresh Cabbage?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            setJobStatus("In Transit");
            Alert.alert("Pickup Confirmed!", "Cargo is loaded. Trip status updated to 'In Transit'.");
          },
        },
      ]
    );
  };

  const handleUpdateStatus = () => {
    Alert.alert(
      "Update Delivery Status",
      "Select current status for job #GH-T1024:",
      [
        { text: "In Progress", onPress: () => setJobStatus("In Progress") },
        { text: "At Pickup Location", onPress: () => setJobStatus("At Pickup") },
        { text: "In Transit on Highway", onPress: () => setJobStatus("In Transit") },
        {
          text: "Delivered to Colombo 07",
          onPress: () => {
            setJobStatus("Delivered");
            Alert.alert("Delivery Completed!", "Fresh Cabbage delivered. Payment of Rs. 18,500 has been added to your earnings.");
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleMakeOffer = (jobId: string, cropInfo: string) => {
    Alert.alert(
      "Submit Transport Offer",
      `Do you want to submit your standard rate offer for ${cropInfo} (${jobId})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit Offer",
          onPress: () => {
            Alert.alert("Offer Sent!", `Your quote for ${jobId} has been sent to the farmer. You will receive an alert once accepted.`);
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to log out of your driver account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          setShowProfileModal(false);
          if (navigation?.canGoBack && navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation?.navigate("Welcome");
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-[#F4F7F5]">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7F5" />

      {/* Top SafeArea Header */}
      <SafeAreaView edges={["top"]} className="bg-[#F4F7F5]">
        <View className="px-5 pt-1.5 pb-2.5 flex-row items-center justify-between">
          {/* Left: App Logo & Dashboard Title */}
          <View className="flex-row items-center">
            <View className="h-9 w-9 rounded-xl bg-[#135228] items-center justify-center mr-2.5 shadow-xs overflow-hidden">
              <Image
                source={require("../../assets/logo.png")}
                className="h-8 w-8"
                resizeMode="contain"
              />
            </View>
            <Text className="text-[20px] font-bold text-[#111827]">
              Dashboard
            </Text>
          </View>

          {/* Right: Notifications & Profile Avatar */}
          <View className="flex-row items-center">
            {/* Notification Bell */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowNotifications(true)}
              className="relative h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-100/90 shadow-xs mr-2"
            >
              <Ionicons name="notifications-outline" size={20} color="#4B5563" />
              {/* Unread Alert Dot */}
              <View className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-[#EF4444] border border-white" />
            </TouchableOpacity>

            {/* User Avatar Circle */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowProfileModal(true)}
              className="h-9 w-9 rounded-full bg-[#E68A00] items-center justify-center shadow-xs"
            >
              <Text className="text-base font-bold text-white">R</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Scrollable Dashboard Body */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* ================= 1. DRIVER PROFILE BANNER CARD ================= */}
        <View className="px-4 mt-2">
          <View
            className="relative overflow-hidden rounded-[26px] bg-[#E68A00] p-5 shadow-sm"
            style={{
              elevation: 4,
              shadowColor: "#E68A00",
              shadowOpacity: 0.25,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            {/* Decorative Background Circles */}
            <View className="absolute -right-10 -bottom-10 h-44 w-44 rounded-full bg-white/10 pointer-events-none" />
            <View className="absolute right-16 -top-12 h-28 w-28 rounded-full bg-white/5 pointer-events-none" />

            {/* Driver Profile Row */}
            <View className="flex-row items-center">
              {/* Avatar Square */}
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/25 shadow-xs">
                <Text className="text-2xl font-black text-white">R</Text>
              </View>

              {/* Driver Info */}
              <View className="ml-3.5 flex-1">
                <Text className="text-[13px] font-medium text-[#FEF3C7]">
                  Good morning,
                </Text>
                <Text
                  className="text-[21px] font-extrabold text-white leading-tight mt-0.5"
                  numberOfLines={1}
                >
                  Ruwan Bandara
                </Text>
                <Text className="text-[13px] font-medium text-[#FEF3C7] mt-0.5">
                  Lorry - 3 Ton
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <Ionicons name="checkmark-circle-outline" size={13} color="#FEF3C7" />
                  <Text className="ml-1 text-[12px] font-medium text-[#FEF3C7]">
                    Verified Driver
                  </Text>
                </View>
              </View>
            </View>

            {/* Centered Rating Pill */}
            <View className="mt-4 flex-row items-center justify-center self-center rounded-full bg-white/20 px-4 py-1.5">
              <Text className="text-sm">⭐</Text>
              <Text className="ml-1 text-[13px] font-extrabold text-white">
                4.8
              </Text>
              <Text className="ml-1 text-[12px] font-medium text-white/90">
                · 47 completed jobs
              </Text>
            </View>
          </View>
        </View>

        {/* ================= 2. STATS GRID (2x2) ================= */}
        <View className="px-4 mt-3.5">
          {/* Row 1 */}
          <View className="flex-row gap-3">
            {/* Open Jobs */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowAvailableJobsModal(true)}
              className="flex-1 rounded-2xl bg-white p-3.5 border border-gray-100/90 shadow-2xs flex-row items-center justify-between"
            >
              <View>
                <Text className="text-[12px] font-semibold text-[#6B7280]">
                  Open Jobs
                </Text>
                <Text className="text-[24px] font-black text-[#111827] mt-0.5">
                  2
                </Text>
              </View>
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#FFFBEB]">
                <Ionicons name="location-outline" size={20} color="#D97706" />
              </View>
            </TouchableOpacity>

            {/* My Offers */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowOffersModal(true)}
              className="flex-1 rounded-2xl bg-white p-3.5 border border-gray-100/90 shadow-2xs flex-row items-center justify-between"
            >
              <View>
                <Text className="text-[12px] font-semibold text-[#6B7280]">
                  My Offers
                </Text>
                <Text className="text-[24px] font-black text-[#111827] mt-0.5">
                  1
                </Text>
              </View>
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF]">
                <Ionicons name="time-outline" size={20} color="#2563EB" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View className="flex-row gap-3 mt-3">
            {/* Active Jobs */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowJobDetailsModal(true)}
              className="flex-1 rounded-2xl bg-white p-3.5 border border-gray-100/90 shadow-2xs flex-row items-center justify-between"
            >
              <View>
                <Text className="text-[12px] font-semibold text-[#6B7280]">
                  Active Jobs
                </Text>
                <Text className="text-[24px] font-black text-[#111827] mt-0.5">
                  1
                </Text>
              </View>
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#ECFDF5]">
                <Ionicons name="bus-outline" size={20} color="#059669" />
              </View>
            </TouchableOpacity>

            {/* This Month */}
            <View className="flex-1 rounded-2xl bg-white p-3.5 border border-gray-100/90 shadow-2xs flex-row items-center justify-between">
              <View>
                <Text className="text-[12px] font-semibold text-[#6B7280]">
                  This Month
                </Text>
                <Text className="text-[21px] font-black text-[#111827] mt-0.5">
                  Rs. 42k
                </Text>
              </View>
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#FAF5FF]">
                <Ionicons name="trending-up" size={20} color="#9333EA" />
              </View>
            </View>
          </View>
        </View>

        {/* ================= 3. QUICK ACTIONS GRID (2x2) ================= */}
        <View className="px-4 mt-4">
          {/* Action Row 1 */}
          <View className="flex-row gap-3">
            {/* Available Jobs (Primary Highlighted Card) */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowAvailableJobsModal(true)}
              className="flex-1 h-[88px] items-center justify-center rounded-2xl bg-[#E68A00] shadow-sm"
              style={{
                elevation: 3,
                shadowColor: "#E68A00",
                shadowOpacity: 0.2,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              <Text className="text-2xl mb-0.5">🗺️</Text>
              <Text className="text-[13px] font-bold text-white">
                Available Jobs
              </Text>
            </TouchableOpacity>

            {/* Active Jobs */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowJobDetailsModal(true)}
              className="flex-1 h-[88px] items-center justify-center rounded-2xl bg-white border border-gray-100/80 shadow-2xs"
            >
              <Text className="text-2xl mb-0.5">🚚</Text>
              <Text className="text-[13px] font-bold text-[#1F2937]">
                Active Jobs
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Row 2 */}
          <View className="flex-row gap-3 mt-3">
            {/* My Offers */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowOffersModal(true)}
              className="flex-1 h-[88px] items-center justify-center rounded-2xl bg-white border border-gray-100/80 shadow-2xs"
            >
              <Text className="text-2xl mb-0.5">📋</Text>
              <Text className="text-[13px] font-bold text-[#1F2937]">
                My Offers
              </Text>
            </TouchableOpacity>

            {/* Profile */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowProfileModal(true)}
              className="flex-1 h-[88px] items-center justify-center rounded-2xl bg-white border border-gray-100/80 shadow-2xs"
            >
              <Text className="text-2xl mb-0.5">👤</Text>
              <Text className="text-[13px] font-bold text-[#1F2937]">
                Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= 4. ACTIVE JOB SECTION ================= */}
        <View className="mt-5 px-4">
          <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2.5">
            ACTIVE JOB
          </Text>

          {/* Active Job Card */}
          <View className="rounded-2xl bg-white p-4 border border-gray-100/90 shadow-2xs">
            {/* Top row: Status pill & Ref code */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center rounded-full bg-[#FEF3C7] px-2.5 py-1">
                <View className="h-2 w-2 rounded-full bg-[#D97706] mr-1.5" />
                <Text className="text-[11px] font-bold text-[#B45309]">
                  {jobStatus}
                </Text>
              </View>
              <Text className="text-[12px] font-semibold text-[#9CA3AF]">
                #GH-T1024
              </Text>
            </View>

            {/* Title: Fresh Cabbage · 100 kg */}
            <Text className="mt-2 text-[17px] font-extrabold text-[#111827]">
              Fresh Cabbage · 100 kg
            </Text>

            {/* Route Waypoints */}
            <View className="mt-2.5 space-y-1.5">
              {/* Pickup */}
              <View className="flex-row items-center">
                <View className="h-2 w-2 rounded-full bg-[#16A34A] mr-2" />
                <Text className="text-[12.5px] font-medium text-[#4B5563]" numberOfLines={1}>
                  Nuwara Eliya Farm, Hanguranketha Road
                </Text>
              </View>
              {/* Dropoff */}
              <View className="flex-row items-center">
                <View className="h-2 w-2 rounded-full bg-[#EF4444] mr-2" />
                <Text className="text-[12.5px] font-medium text-[#4B5563]" numberOfLines={1}>
                  Colombo Fresh Market, Colombo 07
                </Text>
              </View>
            </View>

            {/* Action Buttons Row */}
            <View className="mt-4 flex-row gap-2.5">
              {/* Confirm Pickup Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleConfirmPickup}
                className="flex-1 h-11 items-center justify-center rounded-xl bg-[#059669] shadow-xs"
              >
                <Text className="text-[13px] font-bold text-white">
                  Confirm Pickup
                </Text>
              </TouchableOpacity>

              {/* Update Status Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleUpdateStatus}
                className="flex-1 h-11 items-center justify-center rounded-xl bg-[#F59E0B] shadow-xs"
              >
                <Text className="text-[13px] font-bold text-white">
                  Update Status
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ================= 5. AVAILABLE JOBS SECTION ================= */}
        <View className="mt-5 px-4">
          {/* Section Header */}
          <View className="flex-row items-center justify-between mb-2.5">
            <Text className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280]">
              AVAILABLE JOBS
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowAvailableJobsModal(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text className="text-[12.5px] font-bold text-[#E68A00]">
                View all
              </Text>
            </TouchableOpacity>
          </View>

          {/* Job Card 1: #GH-T1025 */}
          <View className="mb-3 rounded-2xl bg-white p-4 border border-gray-100/90 shadow-2xs">
            <View className="flex-row items-center justify-between">
              <Text className="text-[12px] font-semibold text-[#9CA3AF]">
                #GH-T1025
              </Text>
              <View className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5">
                <Text className="text-[11px] font-bold text-[#B45309]">
                  Open
                </Text>
              </View>
            </View>

            <Text className="mt-1.5 text-[16px] font-extrabold text-[#111827]">
              Ripe Tomatoes · 150 kg
            </Text>

            <View className="mt-2 space-y-1.5">
              <View className="flex-row items-center">
                <View className="h-2 w-2 rounded-full bg-[#16A34A] mr-2" />
                <Text className="text-[12.5px] font-medium text-[#4B5563]" numberOfLines={1}>
                  Dambulla Agricultural Zone, Plot 14
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="h-2 w-2 rounded-full bg-[#EF4444] mr-2" />
                <Text className="text-[12.5px] font-medium text-[#4B5563]" numberOfLines={1}>
                  Colombo Fresh Market, Colombo 03
                </Text>
              </View>
            </View>

            <View className="mt-3 flex-row items-center justify-between pt-2 border-t border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text className="ml-1 text-[11.5px] font-medium text-[#6B7280]">
                  2026-08-31 · 06:00 AM
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleMakeOffer("#GH-T1025", "Ripe Tomatoes · 150 kg")}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text className="text-[12.5px] font-bold text-[#E68A00]">
                  Submit Offer →
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Job Card 2: #GH-T1020 */}
          <View className="mb-3 rounded-2xl bg-white p-4 border border-gray-100/90 shadow-2xs">
            <View className="flex-row items-center justify-between">
              <Text className="text-[12px] font-semibold text-[#9CA3AF]">
                #GH-T1020
              </Text>
              <View className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5">
                <Text className="text-[11px] font-bold text-[#B45309]">
                  Open
                </Text>
              </View>
            </View>

            <Text className="mt-1.5 text-[16px] font-extrabold text-[#111827]">
              Organic Carrots · 200 kg
            </Text>

            <View className="mt-2 space-y-1.5">
              <View className="flex-row items-center">
                <View className="h-2 w-2 rounded-full bg-[#16A34A] mr-2" />
                <Text className="text-[12.5px] font-medium text-[#4B5563]" numberOfLines={1}>
                  Nuwara Eliya Highlands Farm
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="h-2 w-2 rounded-full bg-[#EF4444] mr-2" />
                <Text className="text-[12.5px] font-medium text-[#4B5563]" numberOfLines={1}>
                  Kandy Supermart, City Center
                </Text>
              </View>
            </View>

            <View className="mt-3 flex-row items-center justify-between pt-2 border-t border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text className="ml-1 text-[11.5px] font-medium text-[#6B7280]">
                  2026-08-29 · 07:00 AM
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleMakeOffer("#GH-T1020", "Organic Carrots · 200 kg")}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text className="text-[12.5px] font-bold text-[#E68A00]">
                  Submit Offer →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ================= 6. PAYMENT SUMMARY CARD ================= */}
        <View className="mt-2 mb-4 px-4">
          <View className="rounded-2xl bg-[#F0FDF4] p-4 border border-[#A7F3D0]">
            <Text className="text-[13.5px] font-bold text-[#14532D] mb-3">
              Payment Summary
            </Text>

            <View className="flex-row items-center justify-between">
              {/* Pending Release */}
              <View className="flex-1 pr-3">
                <Text className="text-[12px] font-semibold text-[#059669]">
                  Pending Release
                </Text>
                <Text className="text-[22px] font-black text-[#065F46] mt-0.5">
                  Rs. 1,500
                </Text>
              </View>

              {/* Vertical Divider */}
              <View className="h-9 w-[1px] bg-[#A7F3D0]" />

              {/* This Month */}
              <View className="flex-1 pl-4">
                <Text className="text-[12px] font-semibold text-[#059669]">
                  This Month
                </Text>
                <Text className="text-[22px] font-black text-[#065F46] mt-0.5">
                  Rs. 42,000
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ================= 7. BOTTOM TAB BAR ================= */}
      <SafeAreaView edges={["bottom"]} className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200/80">
        <View className="flex-row items-center justify-around py-1.5">
          {/* Home Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab("home")}
            className="items-center px-4"
          >
            <Ionicons
              name={activeTab === "home" ? "home" : "home-outline"}
              size={22}
              color={activeTab === "home" ? "#E68A00" : "#9CA3AF"}
            />
            <Text
              className={`text-[11px] mt-0.5 ${activeTab === "home"
                  ? "font-bold text-[#E68A00]"
                  : "font-medium text-[#9CA3AF]"
                }`}
            >
              Home
            </Text>
            {/* Active orange underline indicator */}
            {activeTab === "home" && (
              <View className="h-[2px] w-6 rounded-full bg-[#E68A00] mt-1" />
            )}
          </TouchableOpacity>

          {/* Jobs Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab("jobs");
              setShowAvailableJobsModal(true);
            }}
            className="items-center px-4"
          >
            <Ionicons
              name={activeTab === "jobs" ? "location" : "location-outline"}
              size={22}
              color={activeTab === "jobs" ? "#E68A00" : "#9CA3AF"}
            />
            <Text
              className={`text-[11px] mt-0.5 ${activeTab === "jobs"
                  ? "font-bold text-[#E68A00]"
                  : "font-medium text-[#9CA3AF]"
                }`}
            >
              Jobs
            </Text>
            {activeTab === "jobs" && (
              <View className="h-[2px] w-6 rounded-full bg-[#E68A00] mt-1" />
            )}
          </TouchableOpacity>

          {/* Active Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab("active");
              setShowJobDetailsModal(true);
            }}
            className="items-center px-4"
          >
            <Ionicons
              name={activeTab === "active" ? "bus" : "bus-outline"}
              size={22}
              color={activeTab === "active" ? "#E68A00" : "#9CA3AF"}
            />
            <Text
              className={`text-[11px] mt-0.5 ${activeTab === "active"
                  ? "font-bold text-[#E68A00]"
                  : "font-medium text-[#9CA3AF]"
                }`}
            >
              Active
            </Text>
            {activeTab === "active" && (
              <View className="h-[2px] w-6 rounded-full bg-[#E68A00] mt-1" />
            )}
          </TouchableOpacity>

          {/* Profile Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab("profile");
              setShowProfileModal(true);
            }}
            className="items-center px-4"
          >
            <Ionicons
              name={activeTab === "profile" ? "person" : "person-outline"}
              size={22}
              color={activeTab === "profile" ? "#E68A00" : "#9CA3AF"}
            />
            <Text
              className={`text-[11px] mt-0.5 ${activeTab === "profile"
                  ? "font-bold text-[#E68A00]"
                  : "font-medium text-[#9CA3AF]"
                }`}
            >
              Profile
            </Text>
            {activeTab === "profile" && (
              <View className="h-[2px] w-6 rounded-full bg-[#E68A00] mt-1" />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ================= MODAL: AVAILABLE JOBS ================= */}
      <Modal
        visible={showAvailableJobsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAvailableJobsModal(false);
          setActiveTab("home");
        }}
      >
        <SafeAreaView className="flex-1 bg-[#F9FAFB]">
          <View className="px-5 py-3.5 flex-row items-center justify-between border-b border-gray-200 bg-white">
            <View>
              <Text className="text-lg font-bold text-gray-900">
                🗺️ Available Transport Jobs
              </Text>
              <Text className="text-xs text-gray-500">
                {availableJobsList.length} open requests available
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setShowAvailableJobsModal(false);
                setActiveTab("home");
              }}
              className="p-1 rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
            {availableJobsList.map((job) => (
              <View
                key={job.id}
                className="mb-4 rounded-2xl bg-white p-4 border border-gray-200/80 shadow-2xs"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-xs font-semibold text-gray-500">
                    {job.id}
                  </Text>
                  <View className="rounded-md bg-amber-50 px-2 py-0.5">
                    <Text className="text-[11px] font-bold text-amber-700">
                      Open for Bids
                    </Text>
                  </View>
                </View>

                <Text className="text-base font-bold text-gray-900">
                  {job.cropName} · {job.weight}
                </Text>

                <View className="my-2.5 space-y-1">
                  <Text className="text-xs text-gray-600">
                    📍 <Text className="font-semibold">From:</Text> {job.pickup}
                  </Text>
                  <Text className="text-xs text-gray-600">
                    🏁 <Text className="font-semibold">To:</Text> {job.dropoff}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    🕒 Pickup: {job.pickupTime}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                  <Text className="text-base font-extrabold text-[#16A34A]">
                    Est: {job.price}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleMakeOffer(job.id, `${job.cropName} · ${job.weight}`)}
                    className="rounded-xl bg-[#E68A00] px-4 py-2"
                  >
                    <Text className="text-xs font-bold text-white">
                      Submit Offer
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ================= MODAL: MY OFFERS ================= */}
      <Modal
        visible={showOffersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowOffersModal(false)}
      >
        <SafeAreaView className="flex-1 bg-[#F9FAFB]">
          <View className="px-5 py-3.5 flex-row items-center justify-between border-b border-gray-200 bg-white">
            <View>
              <Text className="text-lg font-bold text-gray-900">
                📋 My Transport Offers
              </Text>
              <Text className="text-xs text-gray-500">
                1 submitted quote under review
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowOffersModal(false)}
              className="p-1 rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <View className="p-4">
            <View className="rounded-2xl bg-white p-4 border border-gray-200/80 shadow-2xs">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs font-semibold text-gray-500">
                  #GH-T1019
                </Text>
                <View className="rounded-md bg-amber-50 px-2 py-0.5">
                  <Text className="text-[11px] font-bold text-amber-700">
                    Pending Farmer Approval
                  </Text>
                </View>
              </View>

              <Text className="text-base font-bold text-gray-900 mt-2">
                Red Potatoes · 500 kg
              </Text>
              <Text className="text-xs text-gray-600 mt-1">
                Nuwara Eliya → Colombo Wholesale Market
              </Text>

              <View className="mt-3 flex-row justify-between items-center pt-2.5 border-t border-gray-100">
                <Text className="text-xs text-gray-500">Your Quote:</Text>
                <Text className="text-sm font-extrabold text-[#16A34A]">
                  Rs. 22,000
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ================= MODAL: NOTIFICATIONS ================= */}
      <Modal
        visible={showNotifications}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowNotifications(false)}
      >
        <View className="flex-1 bg-black/40 justify-center px-4">
          <View className="bg-white rounded-3xl p-5 shadow-lg max-h-[80%]">
            <View className="flex-row justify-between items-center pb-3 border-b border-gray-100">
              <Text className="text-base font-bold text-gray-900">
                🔔 Recent Notifications
              </Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="py-3 space-y-3">
              <View className="p-3 bg-green-50 rounded-xl">
                <Text className="text-xs font-bold text-green-800">
                  Cargo Ready for Pickup
                </Text>
                <Text className="text-[12px] text-green-700 mt-0.5">
                  Farmer Sunil loaded 100 kg Cabbage in Nuwara Eliya.
                </Text>
              </View>

              <View className="p-3 bg-amber-50 rounded-xl">
                <Text className="text-xs font-bold text-amber-800">
                  New Transport Request
                </Text>
                <Text className="text-[12px] text-amber-700 mt-0.5">
                  150 kg Ripe Tomatoes available in Dambulla Zone.
                </Text>
              </View>

              <View className="p-3 bg-blue-50 rounded-xl">
                <Text className="text-xs font-bold text-blue-800">
                  Payment Received
                </Text>
                <Text className="text-[12px] text-blue-700 mt-0.5">
                  Rs. 18,500 transferred to your bank account for trip #GH-T1015.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: JOB DETAILS ================= */}
      <Modal
        visible={showJobDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowJobDetailsModal(false);
          setActiveTab("home");
        }}
      >
        <SafeAreaView className="flex-1 bg-[#F9FAFB]">
          <View className="px-5 py-3.5 flex-row items-center justify-between border-b border-gray-200 bg-white">
            <View>
              <Text className="text-lg font-bold text-gray-900">
                Active Job Details
              </Text>
              <Text className="text-xs text-gray-500">
                #GH-T1024 · Fresh Cabbage
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setShowJobDetailsModal(false);
                setActiveTab("home");
              }}
              className="p-1 rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
            <View className="rounded-2xl bg-white p-4 border border-gray-100 shadow-2xs mb-4">
              <Text className="text-xs font-semibold text-gray-500 uppercase">
                Cargo Summary
              </Text>
              <Text className="text-xl font-extrabold text-gray-900 mt-1">
                Fresh Cabbage · 100 kg
              </Text>
              <Text className="text-xs text-green-700 font-bold mt-1">
                Status: {jobStatus}
              </Text>

              <View className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                <Text className="text-xs text-gray-600">
                  📍 <Text className="font-bold">Pickup:</Text> Nuwara Eliya Farm, Hanguranketha Road
                </Text>
                <Text className="text-xs text-gray-600">
                  🏁 <Text className="font-bold">Dropoff:</Text> Colombo Fresh Market, Colombo 07
                </Text>
                <Text className="text-xs text-gray-600">
                  💰 <Text className="font-bold">Fare:</Text> Rs. 18,500
                </Text>
                <Text className="text-xs text-gray-600">
                  🛣️ <Text className="font-bold">Distance:</Text> 142 km
                </Text>
              </View>
            </View>

            {/* Status update buttons */}
            <View className="gap-3">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleConfirmPickup}
                className="rounded-2xl bg-[#059669] py-3.5 items-center justify-center shadow-xs"
              >
                <Text className="text-sm font-bold text-white">
                  Confirm Pickup
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleUpdateStatus}
                className="rounded-2xl bg-[#F59E0B] py-3.5 items-center justify-center shadow-xs"
              >
                <Text className="text-sm font-bold text-white">
                  Update Status
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ================= MODAL: DRIVER PROFILE ================= */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowProfileModal(false);
          setActiveTab("home");
        }}
      >
        <SafeAreaView className="flex-1 bg-[#F9FAFB]">
          <View className="px-5 py-3.5 flex-row items-center justify-between border-b border-gray-200 bg-white">
            <Text className="text-lg font-bold text-gray-900">
              Driver Profile
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowProfileModal(false);
                setActiveTab("home");
              }}
              className="p-1 rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
            {/* Driver Card */}
            <View className="rounded-2xl bg-white p-5 border border-gray-100 shadow-2xs items-center mb-4">
              <View className="h-16 w-16 rounded-full bg-[#E68A00] items-center justify-center mb-2">
                <Text className="text-2xl font-black text-white">R</Text>
              </View>
              <Text className="text-lg font-extrabold text-gray-900">
                Ruwan Bandara
              </Text>
              <Text className="text-xs font-semibold text-gray-500">
                transporter@greenhive.com
              </Text>
              <Text className="text-xs text-amber-700 font-bold mt-1">
                ⭐ 4.8 Rating (47 Completed Trips)
              </Text>
            </View>

            {/* Vehicle details */}
            <View className="rounded-2xl bg-white p-4 border border-gray-100 shadow-2xs mb-4">
              <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
                Registered Vehicle
              </Text>
              <View className="space-y-1.5">
                <Text className="text-xs text-gray-700">
                  🚚 <Text className="font-semibold">Type:</Text> Lorry (3 Ton Capacity)
                </Text>
                <Text className="text-xs text-gray-700">
                  🔢 <Text className="font-semibold">Plate:</Text> WP-LH-4821
                </Text>
                <Text className="text-xs text-gray-700">
                  🛡️ <Text className="font-semibold">Status:</Text> Green-Hive Verified
                </Text>
              </View>
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSignOut}
              className="rounded-2xl bg-red-50 border border-red-200 py-3.5 items-center justify-center mt-2"
            >
              <Text className="text-sm font-bold text-red-600">
                Log Out of Transporter Account
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default TransporterHomeScreen;
