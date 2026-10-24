import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
  useWindowDimensions,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SmoothScrollView } from "../../components/common/SmoothScrollView";

// Mock Data imported from dedicated transporter data folder
import {
  MOCK_TRANSPORTER_PROFILE,
  MOCK_TRANSPORTER_STATS,
  MOCK_ACTIVE_JOB,
  MOCK_AVAILABLE_JOBS,
  MOCK_MY_OFFERS,
  MOCK_PAYMENT_SUMMARY,
  MOCK_NOTIFICATIONS,
  AvailableTransportJob,
  ActiveTransportJob,
  TransportOffer,
  TransporterProfile,
  TransporterStats,
  PaymentSummaryData,
  TransporterNotificationItem,
} from "./data";
import { TransporterAvailableJobsScreen } from "./TransporterAvailableJobsScreen";
import { TransporterActiveJobScreen } from "./TransporterActiveJobScreen";

interface TransporterHomeScreenProps {
  navigation?: any;
}

export const TransporterHomeScreen = ({ navigation }: TransporterHomeScreenProps) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Responsive Breakpoints
  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;
  const isTablet = screenWidth >= 600;

  // Active bottom navigation tab
  const [activeTab, setActiveTab] = useState<"home" | "jobs" | "active" | "profile">("home");

  // Interactive Modals
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [selectedAvailableJob, setSelectedAvailableJob] = useState<AvailableTransportJob | null>(null);

  // Dynamic state loaded from mock data
  const [profile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);
  const [stats] = useState<TransporterStats>(MOCK_TRANSPORTER_STATS);
  const [activeJob, setActiveJob] = useState<ActiveTransportJob>(MOCK_ACTIVE_JOB);
  const [availableJobsList] = useState<AvailableTransportJob[]>(MOCK_AVAILABLE_JOBS);
  const [myOffersList] = useState<TransportOffer[]>(MOCK_MY_OFFERS);
  const [paymentSummary] = useState<PaymentSummaryData>(MOCK_PAYMENT_SUMMARY);
  const [notificationsList] = useState<TransporterNotificationItem[]>(MOCK_NOTIFICATIONS);

  const handleConfirmPickup = () => {
    Alert.alert(
      "Confirm Pickup",
      `Are you currently at ${activeJob.pickup} to confirm loading of ${activeJob.cropName} · ${activeJob.weight}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            setActiveJob((prev) => ({ ...prev, status: "In Transit" }));
            Alert.alert("Pickup Confirmed!", "Cargo is loaded. Trip status updated to 'In Transit'.");
          },
        },
      ]
    );
  };

  const handleUpdateStatus = () => {
    Alert.alert(
      "Update Delivery Status",
      `Select current status for job ${activeJob.id}:`,
      [
        {
          text: "In Progress",
          onPress: () => setActiveJob((prev) => ({ ...prev, status: "In Progress" })),
        },
        {
          text: "At Pickup Location",
          onPress: () => setActiveJob((prev) => ({ ...prev, status: "At Pickup" })),
        },
        {
          text: "In Transit on Highway",
          onPress: () => setActiveJob((prev) => ({ ...prev, status: "In Transit" })),
        },
        {
          text: `Delivered to Destination`,
          onPress: () => {
            setActiveJob((prev) => ({ ...prev, status: "Delivered" }));
            Alert.alert(
              "Delivery Completed!",
              `${activeJob.cropName} delivered. Payment of ${activeJob.price} has been added to your earnings.`
            );
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleMakeOffer = (jobId: string, cropInfo: string) => {
    const targetJob = availableJobsList.find((j) => j.id === jobId) || {
      id: jobId,
      cropName: cropInfo.split("·")[0]?.trim() || "Vegetable Cargo",
      weight: cropInfo.split("·")[1]?.trim() || "100 kg",
      pickup: "Dambulla Agricultural Hub",
      dropoff: "Colombo Fresh Market",
      pickupTime: "Today · 06:00 AM",
      status: "Open",
      price: "Rs. 2,200",
    } as AvailableTransportJob;

    if (navigation?.navigate) {
      navigation.navigate("TransporterSubmitOffer", { job: targetJob });
    } else {
      Alert.alert(
        "Submit Transport Offer",
        `Do you want to submit your standard rate offer for ${cropInfo} (${jobId})?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Submit Offer",
            onPress: () => {
              Alert.alert(
                "Offer Sent!",
                `Your quote for ${jobId} has been sent to the farmer. You will receive an alert once accepted.`
              );
            },
          },
        ]
      );
    }
  };

  const handleSubmitOfferFromModal = (job: AvailableTransportJob) => {
    setSelectedAvailableJob(null);
    if (navigation?.navigate) {
      navigation.navigate("TransporterSubmitOffer", { job });
    } else {
      handleMakeOffer(job.id, `${job.cropName} · ${job.weight}`);
    }
  };

  const getJobIdDisplay = (id?: string) => {
    if (!id) return "JOB #GH-T1025";
    const trimmed = id.trim();
    if (trimmed.toUpperCase().startsWith("JOB")) return trimmed;
    return `JOB ${trimmed}`;
  };

  const getJobDate = (job?: AvailableTransportJob | null) => {
    if (!job) return "2026-08-31";
    if (job.pickupDate) return job.pickupDate;
    if (job.pickupTime && job.pickupTime.includes("·")) {
      return job.pickupTime.split("·")[0].trim();
    }
    return "2026-08-31";
  };

  const getJobTime = (job?: AvailableTransportJob | null) => {
    if (!job) return "06:00 AM";
    if (job.pickupRequiredTime) return job.pickupRequiredTime;
    if (job.pickupTime && job.pickupTime.includes("·")) {
      return job.pickupTime.split("·")[1].trim();
    }
    return "06:00 AM";
  };

  const getSpecialInstructions = (job?: AvailableTransportJob | null) => {
    return (
      job?.specialInstructions ||
      "Fragile. Use padded transport. Early morning delivery required."
    );
  };

  const getPickupAddress = (job?: AvailableTransportJob | null) => {
    return (
      job?.pickupLocationDetail ||
      job?.pickup ||
      "Dambulla Agricultural Zone, Plot 14"
    );
  };

  const getDeliveryAddress = (job?: AvailableTransportJob | null) => {
    return (
      job?.dropoffLocationDetail ||
      job?.dropoff ||
      "Colombo Fresh Market, Colombo 03"
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

  if (activeTab === "jobs") {
    return (
      <TransporterAvailableJobsScreen
        navigation={navigation}
        onSelectTab={setActiveTab}
        activeTab={activeTab}
      />
    );
  }

  if (activeTab === "active") {
    return (
      <TransporterActiveJobScreen
        navigation={navigation}
        onSelectTab={setActiveTab}
        activeTab={activeTab}
      />
    );
  }

  return (
    <View className="flex-1 bg-[#F4F7F5]">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7F5" />

      {/* Top SafeArea Header */}
      <SafeAreaView edges={["top"]} className="bg-[#F4F7F5]">
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className={`px-4 sm:px-5 flex-row items-center justify-between ${
            isSmallDevice ? "pt-1 pb-2" : "pt-2 pb-2.5"
          }`}
        >
          {/* Left: App Logo & Dashboard Title */}
          <View className="flex-row items-center flex-1 pr-2">
            <View
              className={`rounded-xl bg-[#135228] items-center justify-center mr-2 sm:mr-2.5 shadow-xs overflow-hidden ${
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
              Dashboard
            </Text>
          </View>

          {/* Right: Notifications & Profile Avatar */}
          <View className="flex-row items-center space-x-2 sm:space-x-2.5 gap-2 sm:gap-2.5">
            {/* Notification Bell */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowNotifications(true)}
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
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowProfileModal(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className={`rounded-full bg-[#E68A00] items-center justify-center shadow-xs ${
                isExtraSmall ? "h-8 w-8" : isSmallDevice ? "h-8.5 w-8.5" : "h-9 w-9"
              }`}
            >
              <Text
                className={`font-bold text-white ${
                  isExtraSmall
                    ? "text-xs"
                    : isSmallDevice
                    ? "text-sm"
                    : "text-base"
                }`}
              >
                {profile.avatarLetter}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Scrollable Dashboard Body with Smooth Scrolling Physics */}
      <SmoothScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: isSmallDevice ? 32 : 44,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        bounces={Platform.OS === "ios"}
        overScrollMode={Platform.OS === "android" ? "always" : "never"}
      >
        <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}>
          {/* ================= 1. DRIVER PROFILE BANNER CARD ================= */}
        <View className="px-4 sm:px-5 mt-2">
          <View
            className={`relative overflow-hidden rounded-[24px] sm:rounded-[26px] bg-[#E68A00] shadow-sm ${
              isExtraSmall ? "p-3.5" : isSmallDevice ? "p-4" : "p-5"
            }`}
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
              <View
                className={`items-center justify-center rounded-2xl bg-white/25 shadow-xs ${
                  isExtraSmall
                    ? "h-11 w-11"
                    : isSmallDevice
                    ? "h-12 w-12"
                    : "h-14 w-14"
                }`}
              >
                <Text
                  className={`font-black text-white ${
                    isExtraSmall
                      ? "text-lg"
                      : isSmallDevice
                      ? "text-xl"
                      : "text-2xl"
                  }`}
                >
                  {profile.avatarLetter}
                </Text>
              </View>

              {/* Driver Info */}
              <View className="ml-3 flex-1 pr-1">
                <Text className="text-[11.5px] sm:text-[12px] font-medium text-[#FEF3C7]">
                  {profile.greeting}
                </Text>
                <Text
                  className={`font-extrabold text-white leading-tight mt-0.5 ${
                    isExtraSmall
                      ? "text-[16px]"
                      : isSmallDevice
                      ? "text-[18px]"
                      : "text-[21px]"
                  }`}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {profile.name}
                </Text>
                <Text
                  className="text-[11.5px] sm:text-[12px] font-medium text-[#FEF3C7] mt-0.5"
                  numberOfLines={1}
                >
                  {profile.vehicleType}
                </Text>
                {profile.isVerified && (
                  <View className="flex-row items-center mt-0.5">
                    <Ionicons name="checkmark-circle-outline" size={13} color="#FEF3C7" />
                    <Text className="ml-1 text-[11px] sm:text-[11.5px] font-medium text-[#FEF3C7]">
                      Verified Driver
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Centered Rating Pill */}
            <View
              className={`flex-row items-center justify-center self-center rounded-full bg-white/20 ${
                isExtraSmall
                  ? "mt-2.5 px-2.5 py-0.5"
                  : isSmallDevice
                  ? "mt-3 px-3 py-1"
                  : "mt-4 px-4 py-1.5"
              }`}
            >
              <Text className="text-xs sm:text-sm">⭐</Text>
              <Text className="ml-1 text-[11.5px] sm:text-[12.5px] font-extrabold text-white">
                {profile.rating.toFixed(1)}
              </Text>
              <Text
                className="ml-1 text-[11px] sm:text-[11.5px] font-medium text-white/90"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                · {profile.completedJobs} completed jobs
              </Text>
            </View>
          </View>
        </View>

        {/* ================= 2. STATS GRID (2x2) ================= */}
        <View className="px-4 sm:px-5 mt-3">
          {/* Row 1 */}
          <View className="flex-row gap-2 sm:gap-2.5">
            {/* Open Jobs */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab("jobs")}
              className={`flex-1 rounded-2xl bg-white border border-gray-100/90 shadow-2xs flex-row items-center justify-between ${
                isExtraSmall ? "p-2.5" : isSmallDevice ? "p-3" : "p-3.5"
              }`}
            >
              <View className="flex-1 pr-1">
                <Text className="text-[11px] sm:text-[11.5px] font-semibold text-[#6B7280]">
                  Open Jobs
                </Text>
                <Text
                  className={`font-black text-[#111827] mt-0.5 ${
                    isExtraSmall
                      ? "text-[18px]"
                      : isSmallDevice
                      ? "text-[20px]"
                      : "text-[24px]"
                  }`}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {stats.openJobsCount}
                </Text>
              </View>
              <View
                className={`items-center justify-center rounded-xl bg-[#FFFBEB] ${
                  isExtraSmall
                    ? "h-8 w-8"
                    : isSmallDevice
                    ? "h-9 w-9"
                    : "h-11 w-11"
                }`}
              >
                <Ionicons
                  name="location-outline"
                  size={isExtraSmall ? 16 : isSmallDevice ? 18 : 20}
                  color="#D97706"
                />
              </View>
            </TouchableOpacity>

            {/* My Offers */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowOffersModal(true)}
              className={`flex-1 rounded-2xl bg-white border border-gray-100/90 shadow-2xs flex-row items-center justify-between ${
                isExtraSmall ? "p-2.5" : isSmallDevice ? "p-3" : "p-3.5"
              }`}
            >
              <View className="flex-1 pr-1">
                <Text className="text-[11px] sm:text-[11.5px] font-semibold text-[#6B7280]">
                  My Offers
                </Text>
                <Text
                  className={`font-black text-[#111827] mt-0.5 ${
                    isExtraSmall
                      ? "text-[18px]"
                      : isSmallDevice
                      ? "text-[20px]"
                      : "text-[24px]"
                  }`}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {stats.myOffersCount}
                </Text>
              </View>
              <View
                className={`items-center justify-center rounded-xl bg-[#EFF6FF] ${
                  isExtraSmall
                    ? "h-8 w-8"
                    : isSmallDevice
                    ? "h-9 w-9"
                    : "h-11 w-11"
                }`}
              >
                <Ionicons
                  name="time-outline"
                  size={isExtraSmall ? 16 : isSmallDevice ? 18 : 20}
                  color="#2563EB"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View className="flex-row gap-2 sm:gap-2.5 mt-2 sm:mt-2.5">
            {/* Active Jobs */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowJobDetailsModal(true)}
              className={`flex-1 rounded-2xl bg-white border border-gray-100/90 shadow-2xs flex-row items-center justify-between ${
                isExtraSmall ? "p-2.5" : isSmallDevice ? "p-3" : "p-3.5"
              }`}
            >
              <View className="flex-1 pr-1">
                <Text className="text-[11px] sm:text-[11.5px] font-semibold text-[#6B7280]">
                  Active Jobs
                </Text>
                <Text
                  className={`font-black text-[#111827] mt-0.5 ${
                    isExtraSmall
                      ? "text-[18px]"
                      : isSmallDevice
                      ? "text-[20px]"
                      : "text-[24px]"
                  }`}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {stats.activeJobsCount}
                </Text>
              </View>
              <View
                className={`items-center justify-center rounded-xl bg-[#ECFDF5] ${
                  isExtraSmall
                    ? "h-8 w-8"
                    : isSmallDevice
                    ? "h-9 w-9"
                    : "h-11 w-11"
                }`}
              >
                <Ionicons
                  name="bus-outline"
                  size={isExtraSmall ? 16 : isSmallDevice ? 18 : 20}
                  color="#059669"
                />
              </View>
            </TouchableOpacity>

            {/* This Month */}
            <View
              className={`flex-1 rounded-2xl bg-white border border-gray-100/90 shadow-2xs flex-row items-center justify-between ${
                isExtraSmall ? "p-2.5" : isSmallDevice ? "p-3" : "p-3.5"
              }`}
            >
              <View className="flex-1 pr-1">
                <Text className="text-[11px] sm:text-[11.5px] font-semibold text-[#6B7280]">
                  This Month
                </Text>
                <Text
                  className={`font-black text-[#111827] mt-0.5 ${
                    isExtraSmall
                      ? "text-[15.5px]"
                      : isSmallDevice
                      ? "text-[17px]"
                      : "text-[21px]"
                  }`}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.65}
                >
                  {stats.thisMonthEarnings}
                </Text>
              </View>
              <View
                className={`items-center justify-center rounded-xl bg-[#FAF5FF] ${
                  isExtraSmall
                    ? "h-8 w-8"
                    : isSmallDevice
                    ? "h-9 w-9"
                    : "h-11 w-11"
                }`}
              >
                <Ionicons
                  name="trending-up"
                  size={isExtraSmall ? 16 : isSmallDevice ? 18 : 20}
                  color="#9333EA"
                />
              </View>
            </View>
          </View>
        </View>

        {/* ================= 3. QUICK ACTIONS GRID (2x2) ================= */}
        <View className="px-4 sm:px-5 mt-3 sm:mt-3.5">
          {/* Action Row 1 */}
          <View className="flex-row gap-2 sm:gap-2.5">
            {/* Available Jobs */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setActiveTab("jobs")}
              className={`flex-1 items-center justify-center rounded-2xl bg-[#E68A00] shadow-sm px-2 ${
                isExtraSmall
                  ? "h-[68px]"
                  : isSmallDevice
                  ? "h-[74px]"
                  : "h-[88px]"
              }`}
              style={{
                elevation: 3,
                shadowColor: "#E68A00",
                shadowOpacity: 0.2,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              <Text className={isSmallDevice ? "text-lg mb-0" : "text-2xl mb-0.5"}>🗺️</Text>
              <Text
                className={`font-bold text-white ${
                  isExtraSmall
                    ? "text-[10.5px]"
                    : isSmallDevice
                    ? "text-[11.5px]"
                    : "text-[13px]"
                }`}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Available Jobs
              </Text>
            </TouchableOpacity>

            {/* Active Jobs */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowJobDetailsModal(true)}
              className={`flex-1 items-center justify-center rounded-2xl bg-white border border-gray-100/80 shadow-2xs px-2 ${
                isExtraSmall
                  ? "h-[68px]"
                  : isSmallDevice
                  ? "h-[74px]"
                  : "h-[88px]"
              }`}
            >
              <Text className={isSmallDevice ? "text-lg mb-0" : "text-2xl mb-0.5"}>🚚</Text>
              <Text
                className={`font-bold text-[#1F2937] ${
                  isExtraSmall
                    ? "text-[10.5px]"
                    : isSmallDevice
                    ? "text-[11.5px]"
                    : "text-[13px]"
                }`}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Active Jobs
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Row 2 */}
          <View className="flex-row gap-2 sm:gap-2.5 mt-2 sm:mt-2.5">
            {/* My Offers */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowOffersModal(true)}
              className={`flex-1 items-center justify-center rounded-2xl bg-white border border-gray-100/80 shadow-2xs px-2 ${
                isExtraSmall
                  ? "h-[68px]"
                  : isSmallDevice
                  ? "h-[74px]"
                  : "h-[88px]"
              }`}
            >
              <Text className={isSmallDevice ? "text-lg mb-0" : "text-2xl mb-0.5"}>📋</Text>
              <Text
                className={`font-bold text-[#1F2937] ${
                  isExtraSmall
                    ? "text-[10.5px]"
                    : isSmallDevice
                    ? "text-[11.5px]"
                    : "text-[13px]"
                }`}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                My Offers
              </Text>
            </TouchableOpacity>

            {/* Profile */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowProfileModal(true)}
              className={`flex-1 items-center justify-center rounded-2xl bg-white border border-gray-100/80 shadow-2xs px-2 ${
                isExtraSmall
                  ? "h-[68px]"
                  : isSmallDevice
                  ? "h-[74px]"
                  : "h-[88px]"
              }`}
            >
              <Text className={isSmallDevice ? "text-lg mb-0" : "text-2xl mb-0.5"}>👤</Text>
              <Text
                className={`font-bold text-[#1F2937] ${
                  isExtraSmall
                    ? "text-[10.5px]"
                    : isSmallDevice
                    ? "text-[11.5px]"
                    : "text-[13px]"
                }`}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= 4. ACTIVE JOB SECTION ================= */}
        <View className="mt-4 px-4 sm:px-5">
          <Text className="text-[11.5px] sm:text-[12px] font-bold uppercase tracking-wider text-[#6B7280] mb-2 sm:mb-2.5">
            ACTIVE JOB
          </Text>

          {/* Active Job Card */}
          <View
            className={`rounded-2xl bg-white border border-gray-100/90 shadow-2xs ${
              isExtraSmall ? "p-3" : "p-3.5 sm:p-4"
            }`}
          >
            {/* Top row: Status pill & Ref code */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center rounded-full bg-[#FEF3C7] px-2.5 py-1">
                <View className="h-2 w-2 rounded-full bg-[#D97706] mr-1.5" />
                <Text className="text-[10.5px] sm:text-[11px] font-bold text-[#B45309]">
                  {activeJob.status}
                </Text>
              </View>
              <Text className="text-[11px] sm:text-[12px] font-semibold text-[#9CA3AF]">
                {activeJob.id}
              </Text>
            </View>

            {/* Title: Fresh Cabbage · 100 kg */}
            <Text
              className={`font-extrabold text-[#111827] mt-2 ${
                isExtraSmall
                  ? "text-[14px]"
                  : isSmallDevice
                  ? "text-[15px]"
                  : "text-[17px]"
              }`}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {activeJob.cropName} · {activeJob.weight}
            </Text>

            {/* Route Waypoints */}
            <View className="mt-2.5 space-y-1.5 gap-1.5">
              {/* Pickup */}
              <View className="flex-row items-center">
                <View className="h-2 w-2 rounded-full bg-[#16A34A] mr-2" />
                <Text
                  className={`font-medium text-[#4B5563] flex-1 ${
                    isSmallDevice ? "text-[11.5px]" : "text-[12.5px]"
                  }`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {activeJob.pickup}
                </Text>
              </View>
              {/* Dropoff */}
              <View className="flex-row items-center">
                <View className="h-2 w-2 rounded-full bg-[#EF4444] mr-2" />
                <Text
                  className={`font-medium text-[#4B5563] flex-1 ${
                    isSmallDevice ? "text-[11.5px]" : "text-[12.5px]"
                  }`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {activeJob.dropoff}
                </Text>
              </View>
            </View>

            {/* Action Buttons Row */}
            <View className="mt-3.5 flex-row gap-2 sm:gap-2.5">
              {/* Confirm Pickup Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleConfirmPickup}
                className={`flex-1 items-center justify-center rounded-xl bg-[#059669] shadow-xs px-2 ${
                  isExtraSmall ? "h-9" : isSmallDevice ? "h-10" : "h-11"
                }`}
              >
                <Text
                  className={`font-bold text-white ${
                    isExtraSmall
                      ? "text-[11px]"
                      : isSmallDevice
                      ? "text-[12px]"
                      : "text-[13px]"
                  }`}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  Confirm Pickup
                </Text>
              </TouchableOpacity>

              {/* Update Status Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleUpdateStatus}
                className={`flex-1 items-center justify-center rounded-xl bg-[#F59E0B] shadow-xs px-2 ${
                  isExtraSmall ? "h-9" : isSmallDevice ? "h-10" : "h-11"
                }`}
              >
                <Text
                  className={`font-bold text-white ${
                    isExtraSmall
                      ? "text-[11px]"
                      : isSmallDevice
                      ? "text-[12px]"
                      : "text-[13px]"
                  }`}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  Update Status
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ================= 5. AVAILABLE JOBS SECTION ================= */}
        <View className="mt-4 sm:mt-5 px-4 sm:px-5">
          {/* Section Header */}
          <View className="flex-row items-center justify-between mb-2.5">
            <Text className="text-[11.5px] sm:text-[12px] font-bold uppercase tracking-wider text-[#6B7280]">
              AVAILABLE JOBS
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveTab("jobs")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text className="text-[12px] sm:text-[12.5px] font-bold text-[#E68A00]">
                View all
              </Text>
            </TouchableOpacity>
          </View>

          {/* Render Available Jobs from Mock Data */}
          {availableJobsList.slice(0, 2).map((job) => (
            <TouchableOpacity
              key={job.id}
              activeOpacity={0.88}
              onPress={() => setSelectedAvailableJob(job)}
              className={`mb-3 rounded-2xl bg-white border border-gray-100/90 shadow-2xs ${
                isExtraSmall ? "p-3" : "p-3.5 sm:p-4"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-[11px] sm:text-[12px] font-semibold text-[#9CA3AF]">
                  {job.id}
                </Text>
                <View className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5">
                  <Text className="text-[10.5px] sm:text-[11px] font-bold text-[#B45309]">
                    {job.status}
                  </Text>
                </View>
              </View>

              <Text
                className={`font-extrabold text-[#111827] mt-1.5 ${
                  isExtraSmall
                    ? "text-[14px]"
                    : isSmallDevice
                    ? "text-[15px]"
                    : "text-[16px]"
                }`}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {job.cropName} · {job.weight}
              </Text>

              <View className="mt-2 space-y-1.5 gap-1.5">
                <View className="flex-row items-center">
                  <View className="h-2 w-2 rounded-full bg-[#16A34A] mr-2" />
                  <Text
                    className={`font-medium text-[#4B5563] flex-1 ${
                      isSmallDevice ? "text-[11.5px]" : "text-[12.5px]"
                    }`}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {job.pickup}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="h-2 w-2 rounded-full bg-[#EF4444] mr-2" />
                  <Text
                    className={`font-medium text-[#4B5563] flex-1 ${
                      isSmallDevice ? "text-[11.5px]" : "text-[12.5px]"
                    }`}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {job.dropoff}
                  </Text>
                </View>
              </View>

              <View className="mt-3 flex-row items-center justify-between pt-2 border-t border-gray-100">
                <View className="flex-row items-center flex-1 pr-2">
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text
                    className={`ml-1 font-medium text-[#6B7280] ${
                      isSmallDevice ? "text-[11px]" : "text-[11.5px]"
                    }`}
                    numberOfLines={1}
                  >
                    {job.pickupTime}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setSelectedAvailableJob(job)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text
                      className={`font-bold text-[#D97706] ${
                        isSmallDevice ? "text-[11.5px]" : "text-[12.5px]"
                      }`}
                    >
                      View Details &gt;
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleMakeOffer(job.id, `${job.cropName} · ${job.weight}`)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text
                      className={`font-bold text-[#E68A00] ml-2 ${
                        isSmallDevice ? "text-[11.5px]" : "text-[12.5px]"
                      }`}
                    >
                      Submit Offer →
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= 6. PAYMENT SUMMARY CARD ================= */}
        <View className="mt-2 mb-4 px-4 sm:px-5">
          <View
            className={`rounded-2xl bg-[#F0FDF4] border border-[#A7F3D0] ${
              isExtraSmall ? "p-3" : "p-3.5 sm:p-4"
            }`}
          >
            <Text className="text-[12.5px] sm:text-[13px] font-bold text-[#14532D] mb-2 sm:mb-2.5">
              Payment Summary
            </Text>

            <View className="flex-row items-center justify-between">
              {/* Pending Release */}
              <View className="flex-1 pr-2">
                <Text className="text-[11px] sm:text-[11.5px] font-semibold text-[#059669]">
                  Pending Release
                </Text>
                <Text
                  className={`font-black text-[#065F46] mt-0.5 ${
                    isExtraSmall
                      ? "text-[17px]"
                      : isSmallDevice
                      ? "text-[19px]"
                      : "text-[22px]"
                  }`}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  {paymentSummary.pendingRelease}
                </Text>
              </View>

              {/* Vertical Divider */}
              <View className="h-9 w-[1px] bg-[#A7F3D0]" />

              {/* This Month */}
              <View className="flex-1 pl-3">
                <Text className="text-[11px] sm:text-[11.5px] font-semibold text-[#059669]">
                  This Month
                </Text>
                <Text
                  className={`font-black text-[#065F46] mt-0.5 ${
                    isExtraSmall
                      ? "text-[17px]"
                      : isSmallDevice
                      ? "text-[19px]"
                      : "text-[22px]"
                  }`}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  {paymentSummary.thisMonth}
                </Text>
              </View>
            </View>
          </View>
        </View>
        </View>
      </SmoothScrollView>

      {/* ================= 7. BOTTOM TAB BAR ================= */}
      <SafeAreaView
        edges={["bottom"]}
        className="bg-white border-t border-gray-200/80"
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
            onPress={() => setActiveTab("home")}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name={activeTab === "home" ? "home" : "home-outline"}
              size={isSmallDevice ? 20 : 22}
              color={activeTab === "home" ? "#E68A00" : "#9CA3AF"}
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } ${
                activeTab === "home"
                  ? "font-bold text-[#E68A00]"
                  : "font-medium text-[#9CA3AF]"
              }`}
            >
              Home
            </Text>
            {activeTab === "home" && (
              <View
                className={`rounded-full bg-[#E68A00] mt-1 ${
                  isSmallDevice ? "h-[2px] w-5" : "h-[2px] w-6"
                }`}
              />
            )}
          </TouchableOpacity>

          {/* Jobs Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setActiveTab("jobs");
            }}
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
            onPress={() => {
              setActiveTab("active");
            }}
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
            onPress={() => {
              setActiveTab("profile");
              setShowProfileModal(true);
            }}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name={activeTab === "profile" ? "person" : "person-outline"}
              size={isSmallDevice ? 20 : 22}
              color={activeTab === "profile" ? "#E68A00" : "#9CA3AF"}
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } ${
                activeTab === "profile"
                  ? "font-bold text-[#E68A00]"
                  : "font-medium text-[#9CA3AF]"
              }`}
            >
              Profile
            </Text>
            {activeTab === "profile" && (
              <View
                className={`rounded-full bg-[#E68A00] mt-1 ${
                  isSmallDevice ? "h-[2px] w-5" : "h-[2px] w-6"
                }`}
              />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ================= MODAL: MY OFFERS ================= */}
      <Modal
        visible={showOffersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowOffersModal(false)}
      >
        <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#F9FAFB]">
          <View
            style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
            className="px-4 sm:px-5 py-3 sm:py-3.5 flex-row items-center justify-between border-b border-gray-200 bg-white"
          >
            <View className="flex-1 pr-2">
              <Text className="text-base sm:text-lg font-bold text-gray-900" numberOfLines={1}>
                📋 My Transport Offers
              </Text>
              <Text className="text-xs text-gray-500">
                {myOffersList.length} submitted quotes under review
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowOffersModal(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="p-1 rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <SmoothScrollView
            className="flex-1 p-3.5 sm:p-4"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={{
              paddingBottom: 40,
              flexGrow: 1,
            }}
          >
            <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}>
              {myOffersList.map((offer) => (
              <View
                key={offer.id}
                className="mb-3 rounded-2xl bg-white p-3.5 sm:p-4 border border-gray-200/80 shadow-2xs"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs font-semibold text-gray-500">
                    {offer.id}
                  </Text>
                  <View className="rounded-md bg-amber-50 px-2 py-0.5">
                    <Text className="text-[10.5px] sm:text-[11px] font-bold text-amber-700">
                      {offer.status}
                    </Text>
                  </View>
                </View>

                <Text className="text-sm sm:text-base font-bold text-gray-900 mt-2">
                  {offer.cropName} · {offer.weight}
                </Text>
                <Text className="text-xs text-gray-600 mt-1" numberOfLines={2}>
                  {offer.route}
                </Text>

                <View className="mt-3 flex-row justify-between items-center pt-2.5 border-t border-gray-100">
                  <Text className="text-xs text-gray-500">Your Quote:</Text>
                  <Text className="text-sm font-extrabold text-[#16A34A]">
                    {offer.quotePrice}
                  </Text>
                </View>
              </View>
            ))}
            </View>
          </SmoothScrollView>
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
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowNotifications(false)}
            className="absolute inset-0"
          />
          <View
            className={`bg-white rounded-3xl shadow-lg ${
              isSmallDevice ? "p-4" : "p-5"
            }`}
            style={{ maxWidth: 480, width: "100%", alignSelf: "center", maxHeight: "85%" }}
          >
            <View className="flex-row justify-between items-center pb-3 border-b border-gray-100">
              <Text className="text-base font-bold text-gray-900">
                🔔 Recent Notifications
              </Text>
              <TouchableOpacity
                onPress={() => setShowNotifications(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <SmoothScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: screenHeight * 0.42 }}
              contentContainerStyle={{ paddingVertical: 8 }}
              nestedScrollEnabled={true}
            >
              <View className="space-y-2.5 sm:space-y-3 gap-2.5 sm:gap-3">
                {notificationsList.map((notif) => (
                  <View
                    key={notif.id}
                    className={`p-3 rounded-xl ${
                      notif.type === "pickup"
                        ? "bg-green-50"
                        : notif.type === "request"
                        ? "bg-amber-50"
                        : "bg-blue-50"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        notif.type === "pickup"
                          ? "text-green-800"
                          : notif.type === "request"
                          ? "text-amber-800"
                          : "text-blue-800"
                      }`}
                    >
                      {notif.title}
                    </Text>
                    <Text
                      className={`text-[12px] mt-0.5 leading-snug ${
                        notif.type === "pickup"
                          ? "text-green-700"
                          : notif.type === "request"
                          ? "text-amber-700"
                          : "text-blue-700"
                      }`}
                    >
                      {notif.message}
                    </Text>
                  </View>
                ))}
              </View>
            </SmoothScrollView>

            {/* See More Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setShowNotifications(false);
                if (navigation?.navigate) {
                  navigation.navigate("TransporterNotifications");
                }
              }}
              className="mt-2.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50/70 items-center justify-center flex-row"
            >
              <Text className="text-xs font-bold text-[#D97706]">See More</Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color="#D97706"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>

            {/* Dismiss Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowNotifications(false)}
              className="mt-2 py-3 rounded-xl bg-[#E68A00] items-center justify-center shadow-xs"
            >
              <Text className="text-xs font-bold text-white">Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: AVAILABLE JOB DETAILS POPUP ================= */}
      <Modal
        visible={!!selectedAvailableJob}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedAvailableJob(null)}
      >
        <View className="flex-1 bg-black/45 justify-center items-center px-4 sm:px-5">
          {/* Backdrop Dismiss Area */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSelectedAvailableJob(null)}
            className="absolute inset-0"
          />

          {selectedAvailableJob && (
            <View
              style={{
                maxWidth: 440,
                width: "100%",
                maxHeight: isSmallDevice ? "95%" : "90%",
              }}
            >
              <SmoothScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 10 }}
                bounces={false}
              >
                <TouchableOpacity activeOpacity={1}>
                  {/* Main White Details Card */}
                  <View
                    className={`bg-white rounded-3xl border border-gray-100 shadow-xl ${
                      isExtraSmall ? "p-3.5" : isSmallDevice ? "p-4 sm:p-5" : "p-5 sm:p-6"
                    }`}
                    style={{
                      elevation: 8,
                      shadowColor: "#000",
                      shadowOpacity: 0.1,
                      shadowRadius: 18,
                      shadowOffset: { width: 0, height: 6 },
                    }}
                  >
                    {/* Header Row: JOB #GH-T1025 & Open badge */}
                    <View className="flex-row items-center justify-between">
                      <Text
                        className="text-xs sm:text-[13px] font-bold text-gray-400 tracking-wider flex-1 pr-2"
                        numberOfLines={1}
                      >
                        {getJobIdDisplay(selectedAvailableJob.id)}
                      </Text>
                      <View className="flex-row items-center bg-[#FEF3C7] px-2.5 py-1 rounded-full shrink-0">
                        <View className="h-2 w-2 rounded-full bg-[#E68A00] mr-1.5" />
                        <Text className="text-[10.5px] sm:text-xs font-bold text-[#B45309]">
                          {selectedAvailableJob.status || "Open"}
                        </Text>
                      </View>
                    </View>

                    {/* Title & Weight */}
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                      className={`font-black text-[#0F172A] tracking-tight mt-2 sm:mt-2.5 ${
                        isExtraSmall
                          ? "text-[18px]"
                          : isSmallDevice
                          ? "text-[20px]"
                          : "text-[24px]"
                      }`}
                    >
                      {selectedAvailableJob.cropName}
                    </Text>
                    <Text className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">
                      {selectedAvailableJob.weight}
                    </Text>

                    {/* ROUTE Section */}
                    <Text className="text-[10.5px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 sm:mt-5 mb-2 sm:mb-2.5">
                      ROUTE
                    </Text>

                    {/* Pickup Card */}
                    <View className="rounded-2xl bg-[#F0FDF4] p-3 sm:p-4">
                      <View className="flex-row items-center">
                        <View className="h-2.5 w-2.5 rounded-full bg-[#16A34A] mr-2" />
                        <Text className="text-xs sm:text-[13px] font-bold text-[#16A34A]">
                          Pickup
                        </Text>
                      </View>
                      <Text
                        numberOfLines={2}
                        className="text-xs sm:text-sm font-bold text-[#0F172A] mt-1 sm:mt-1.5 leading-snug"
                      >
                        {getPickupAddress(selectedAvailableJob)}
                      </Text>
                      <Text className="text-xs text-gray-500 font-medium mt-0.5" numberOfLines={1}>
                        Farmer: {selectedAvailableJob.farmerName || "Kamal Jayasinghe"}
                      </Text>
                    </View>

                    {/* Delivery Card */}
                    <View className="rounded-2xl bg-[#FEF2F2] p-3 sm:p-4 mt-2 sm:mt-2.5">
                      <View className="flex-row items-center">
                        <View className="h-2.5 w-2.5 rounded-full bg-[#EF4444] mr-2" />
                        <Text className="text-xs sm:text-[13px] font-bold text-[#DC2626]">
                          Delivery
                        </Text>
                      </View>
                      <Text
                        numberOfLines={2}
                        className="text-xs sm:text-sm font-bold text-[#0F172A] mt-1 sm:mt-1.5 leading-snug"
                      >
                        {getDeliveryAddress(selectedAvailableJob)}
                      </Text>
                      <Text className="text-xs text-gray-500 font-medium mt-0.5" numberOfLines={1}>
                        Seller: {selectedAvailableJob.sellerName || "Colombo Fresh Market"}
                      </Text>
                    </View>

                    {/* Required Date & Required Time (Two Columns) */}
                    <View className="flex-row items-center gap-2 sm:gap-3 mt-2.5 sm:mt-3">
                      <View className="flex-1 rounded-2xl bg-[#F8FAFC] p-2.5 sm:p-3.5 border border-slate-100">
                        <Text className="text-[10.5px] sm:text-xs font-medium text-gray-400">
                          Required Date
                        </Text>
                        <Text
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.75}
                          className="text-xs sm:text-[15px] font-bold text-[#0F172A] mt-0.5 sm:mt-1"
                        >
                          {getJobDate(selectedAvailableJob)}
                        </Text>
                      </View>

                      <View className="flex-1 rounded-2xl bg-[#F8FAFC] p-2.5 sm:p-3.5 border border-slate-100">
                        <Text className="text-[10.5px] sm:text-xs font-medium text-gray-400">
                          Required Time
                        </Text>
                        <Text
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.75}
                          className="text-xs sm:text-[15px] font-bold text-[#0F172A] mt-0.5 sm:mt-1"
                        >
                          {getJobTime(selectedAvailableJob)}
                        </Text>
                      </View>
                    </View>

                    {/* Special Instructions Card */}
                    <View className="rounded-2xl bg-[#FFFDF0] p-2.5 sm:p-3.5 mt-2.5 sm:mt-3 border border-[#FDE68A]">
                      <Text className="text-[11.5px] sm:text-[12.5px] font-bold text-[#D97706]">
                        Special Instructions
                      </Text>
                      <Text className="text-[11px] sm:text-[12.5px] text-[#92400E] font-medium mt-1 leading-relaxed">
                        {getSpecialInstructions(selectedAvailableJob)}
                      </Text>
                    </View>

                    {/* Payment Protected Card */}
                    <View className="rounded-2xl bg-[#F0FDF4] p-2.5 sm:p-3.5 mt-2.5 sm:mt-3 border border-[#BBF7D0]">
                      <View className="flex-row items-center">
                        <Text className="text-xs mr-1.5">🔒</Text>
                        <Text className="text-[11.5px] sm:text-[12.5px] font-bold text-[#16A34A]">
                          Payment Protected
                        </Text>
                      </View>
                      <Text className="text-[11px] sm:text-xs text-[#16A34A] font-medium mt-1 leading-relaxed">
                        Transportation payment is held by Green Hive and released upon
                        successful delivery confirmation.
                      </Text>
                    </View>
                  </View>

                  {/* Bottom Action Buttons Row */}
                  <View className="flex-row items-center gap-2.5 sm:gap-3 mt-3 sm:mt-3.5 w-full">
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setSelectedAvailableJob(null)}
                      className="flex-[0.4] py-3 sm:py-3.5 rounded-2xl bg-white border border-gray-200/90 items-center justify-center shadow-2xs"
                    >
                      <Text className="text-xs sm:text-base font-bold text-gray-800">
                        Back
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleSubmitOfferFromModal(selectedAvailableJob)}
                      className="flex-[0.6] py-3 sm:py-3.5 rounded-2xl bg-[#FF8C00] items-center justify-center shadow-xs"
                    >
                      <Text className="text-xs sm:text-base font-bold text-white">
                        Submit Offer
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </SmoothScrollView>
            </View>
          )}
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
        <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#F9FAFB]">
          <View
            style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
            className="px-4 sm:px-5 py-3 sm:py-3.5 flex-row items-center justify-between border-b border-gray-200 bg-white"
          >
            <View className="flex-1 pr-2">
              <Text className="text-base sm:text-lg font-bold text-gray-900" numberOfLines={1}>
                Active Job Details
              </Text>
              <Text className="text-xs text-gray-500" numberOfLines={1}>
                {activeJob.id} · {activeJob.cropName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setShowJobDetailsModal(false);
                setActiveTab("home");
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="p-1 rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <SmoothScrollView
            className="p-3.5 sm:p-4 flex-1"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={{
              paddingBottom: 40,
              flexGrow: 1,
            }}
          >
            <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}>
              <View className="rounded-2xl bg-white p-4 border border-gray-100 shadow-2xs mb-4">
              <Text className="text-xs font-semibold text-gray-500 uppercase">
                Cargo Summary
              </Text>
              <Text className="text-lg sm:text-xl font-extrabold text-gray-900 mt-1">
                {activeJob.cropName} · {activeJob.weight}
              </Text>
              <Text className="text-xs text-green-700 font-bold mt-1">
                Status: {activeJob.status}
              </Text>

              <View className="mt-4 pt-3 border-t border-gray-100 space-y-2 gap-2">
                <Text className="text-xs text-gray-600">
                  📍 <Text className="font-bold">Pickup:</Text> {activeJob.pickup}
                </Text>
                <Text className="text-xs text-gray-600">
                  🏁 <Text className="font-bold">Dropoff:</Text> {activeJob.dropoff}
                </Text>
                <Text className="text-xs text-gray-600">
                  💰 <Text className="font-bold">Fare:</Text> {activeJob.price}
                </Text>
                <Text className="text-xs text-gray-600">
                  🛣️ <Text className="font-bold">Distance:</Text> {activeJob.distance}
                </Text>
              </View>
            </View>

            {/* Status update buttons */}
            <View className="gap-2.5 sm:gap-3">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleConfirmPickup}
                className="rounded-2xl bg-[#059669] py-3 sm:py-3.5 items-center justify-center shadow-xs"
              >
                <Text className="text-sm font-bold text-white">
                  Confirm Pickup
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleUpdateStatus}
                className="rounded-2xl bg-[#F59E0B] py-3 sm:py-3.5 items-center justify-center shadow-xs"
              >
                <Text className="text-sm font-bold text-white">
                  Update Status
                </Text>
              </TouchableOpacity>
            </View>
            </View>
          </SmoothScrollView>
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
        <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#F9FAFB]">
          <View
            style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
            className="px-4 sm:px-5 py-3 sm:py-3.5 flex-row items-center justify-between border-b border-gray-200 bg-white"
          >
            <Text className="text-base sm:text-lg font-bold text-gray-900">
              Driver Profile
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowProfileModal(false);
                setActiveTab("home");
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="p-1 rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <SmoothScrollView
            className="p-3.5 sm:p-4 flex-1"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={{
              paddingBottom: 40,
              flexGrow: 1,
            }}
          >
            <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}>
              {/* Driver Card */}
            <View className="rounded-2xl bg-white p-4 sm:p-5 border border-gray-100 shadow-2xs items-center mb-4">
              <View className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#E68A00] items-center justify-center mb-2">
                <Text className="text-xl sm:text-2xl font-black text-white">
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
                ⭐ {profile.rating.toFixed(1)} Rating ({profile.completedJobs} Completed Trips)
              </Text>
            </View>

            {/* Vehicle details */}
            <View className="rounded-2xl bg-white p-3.5 sm:p-4 border border-gray-100 shadow-2xs mb-4">
              <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
                Registered Vehicle
              </Text>
              <View className="space-y-1.5 gap-1.5">
                <Text className="text-xs text-gray-700">
                  🚚 <Text className="font-semibold">Type:</Text> {profile.vehicleType}
                </Text>
                <Text className="text-xs text-gray-700">
                  🔢 <Text className="font-semibold">Plate:</Text> {profile.vehiclePlate}
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

export default TransporterHomeScreen;

