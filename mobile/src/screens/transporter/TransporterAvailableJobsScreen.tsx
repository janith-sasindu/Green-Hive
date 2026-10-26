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
  Platform,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SmoothScrollView } from "../../components/common/SmoothScrollView";
import { useTransporterTheme } from "../../context/TransporterThemeContext";

// Mock Data imported from dedicated transporter data folder
import {
  MOCK_TRANSPORTER_PROFILE,
  MOCK_AVAILABLE_JOBS,
  MOCK_NOTIFICATIONS,
  AvailableTransportJob,
  TransporterProfile,
  TransporterNotificationItem,
} from "./data";
import { TransporterNotificationsScreen } from "./TransporterNotificationsScreen";
import { TransporterSubmitOfferScreen } from "./TransporterSubmitOfferScreen";

export interface TransporterAvailableJobsScreenProps {
  navigation?: any;
  onSelectTab?: (tab: "home" | "jobs" | "active" | "profile") => void;
  activeTab?: "home" | "jobs" | "active" | "profile";
  onPressSeeMoreNotifications?: () => void;
}

export const TransporterAvailableJobsScreen = ({
  navigation,
  onSelectTab,
  activeTab = "jobs",
  onPressSeeMoreNotifications,
}: TransporterAvailableJobsScreenProps) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { isDark, setDarkMode, toggleDarkMode, colors } = useTransporterTheme();

  // Responsive Breakpoints
  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;
  const isTablet = screenWidth >= 600;

  // State
  const [profile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);
  const avatarUri = MOCK_TRANSPORTER_PROFILE.avatarUri || profile.avatarUri;
  const [availableJobs, setAvailableJobs] =
    useState<AvailableTransportJob[]>(MOCK_AVAILABLE_JOBS);
  const [notifications] =
    useState<TransporterNotificationItem[]>(MOCK_NOTIFICATIONS);

  // Modals
  const [selectedJob, setSelectedJob] = useState<AvailableTransportJob | null>(
    null
  );
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsPage, setShowNotificationsPage] = useState(false);
  const [submittingOfferJob, setSubmittingOfferJob] =
    useState<AvailableTransportJob | null>(null);

  // Tab change handler
  const handleTabPress = (tab: "home" | "jobs" | "active" | "profile") => {
    if (tab === "jobs") {
      return;
    }
    if (onSelectTab) {
      onSelectTab(tab);
    } else if (tab === "home") {
      navigation?.navigate?.("TransporterHome");
    } else if (tab === "active") {
      navigation?.navigate?.("TransporterActiveJob");
    } else if (tab === "profile") {
      navigation?.navigate?.("TransporterProfile");
    }
  };

  const handleSeeMoreNotifications = () => {
    setShowNotificationsModal(false);
    if (onPressSeeMoreNotifications) {
      onPressSeeMoreNotifications();
    } else if (navigation?.navigate) {
      navigation.navigate("TransporterNotifications");
    } else {
      setShowNotificationsPage(true);
    }
  };

  const handleSubmitOffer = (job: AvailableTransportJob) => {
    setSelectedJob(null);
    if (navigation?.navigate) {
      navigation.navigate("TransporterSubmitOffer", { job });
    } else {
      setSubmittingOfferJob(job);
    }
  };

  const handleMakeOffer = (job: AvailableTransportJob) => {
    handleSubmitOffer(job);
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

  const handleCallFarmer = (job: AvailableTransportJob) => {
    Alert.alert(
      "Contact Farmer",
      `Call ${job.farmerName || "Farmer"} at ${
        job.farmerPhone || "+94 77 123 4567"
      }?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call", onPress: () => {} },
      ]
    );
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
            navigation?.navigate("Welcome");
          }
        },
      },
    ]);
  };

  if (submittingOfferJob) {
    return (
      <TransporterSubmitOfferScreen
        job={submittingOfferJob}
        navigation={navigation}
        onBack={() => setSubmittingOfferJob(null)}
        onSelectTab={onSelectTab}
      />
    );
  }

  if (showNotificationsPage) {
    return (
      <TransporterNotificationsScreen
        navigation={navigation}
        onBack={() => setShowNotificationsPage(false)}
        onSelectTab={onSelectTab}
      />
    );
  }

  return (
    <View className="flex-1 bg-[#F5F8F6] dark:bg-slate-900">
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.statusBg} />

      {/* ================= TOP HEADER ================= */}
      <SafeAreaView edges={["top"]} className="bg-[#F5F8F6] dark:bg-slate-900">
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className={`px-4 sm:px-5 flex-row items-center justify-between ${
            isSmallDevice ? "pt-1 pb-2" : "pt-2 pb-2.5"
          }`}
        >
          {/* Logo & Title */}
          <View className="flex-row items-center flex-1 pr-2">
            <View
              className={`rounded-xl bg-[#14532D] items-center justify-center mr-2 sm:mr-2.5 shadow-2xs overflow-hidden ${
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
              className={`font-black text-gray-900 dark:text-white tracking-tight flex-1 ${
                isExtraSmall
                  ? "text-[16px]"
                  : isSmallDevice
                  ? "text-[18px]"
                  : "text-[20px]"
              }`}
            >
              Available Jobs
            </Text>
          </View>

          {/* Right Action Icons */}
          <View className="flex-row items-center space-x-2 sm:space-x-2.5 gap-2 sm:gap-2.5">
            {/* Notification Bell */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowNotificationsModal(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="relative p-1.5 rounded-full"
            >
              <Ionicons
                name="notifications-outline"
                size={isExtraSmall ? 18 : isSmallDevice ? 20 : 23}
                color={colors.icon}
              />
              <View className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800" />
            </TouchableOpacity>

            {/* Profile Avatar Pill */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleTabPress("profile")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className={`rounded-full bg-[#E68A00] items-center justify-center shadow-xs overflow-hidden ${
                isExtraSmall ? "h-8 w-8" : isSmallDevice ? "h-8.5 w-8.5" : "h-9 w-9"
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
                    isExtraSmall ? "text-xs" : isSmallDevice ? "text-xs" : "text-sm"
                  }`}
                >
                  {profile.avatarLetter}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* ================= MAIN SCROLLABLE BODY ================= */}
      <SmoothScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: isSmallDevice ? 32 : 44,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}>
          {/* Subtitle count banner */}
        <View className="px-4 sm:px-5 pt-2 pb-2">
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            className={`font-medium text-gray-500 dark:text-slate-400 ${
              isSmallDevice ? "text-[12px]" : "text-[13.5px]"
            }`}
          >
            {availableJobs.length} transport jobs available near you
          </Text>
        </View>

        {/* Job Cards List */}
        <View className="px-4 sm:px-5 space-y-3 sm:space-y-3.5 gap-3 sm:gap-3.5">
          {availableJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              activeOpacity={0.88}
              onPress={() => setSelectedJob(job)}
              className={`rounded-3xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xs ${
                isExtraSmall ? "p-3.5" : isSmallDevice ? "p-4" : "p-5"
              }`}
              style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              {/* Header row: Job ID & Open Pill Badge */}
              <View className="flex-row items-center justify-between mb-1.5">
                <Text
                  className={`font-semibold text-gray-400 dark:text-slate-400 ${
                    isSmallDevice ? "text-[11px]" : "text-xs"
                  }`}
                  numberOfLines={1}
                >
                  {job.id}
                </Text>
                <View className="rounded-full bg-amber-100/70 dark:bg-amber-500/20 px-2.5 py-0.5">
                  <Text className="text-[10px] sm:text-[11px] font-bold text-amber-800 dark:text-amber-300">
                    {job.status}
                  </Text>
                </View>
              </View>

              {/* Crop Name */}
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                className={`font-extrabold text-gray-900 dark:text-white mb-2 sm:mb-2.5 ${
                  isExtraSmall
                    ? "text-[15px]"
                    : isSmallDevice
                    ? "text-[16px]"
                    : "text-[18px]"
                }`}
              >
                {job.cropName}
              </Text>

              {/* Details List */}
              <View className="space-y-1.5 sm:space-y-2 gap-1.5 sm:gap-2">
                {/* Weight row */}
                <View className="flex-row items-center">
                  <View className="w-5 items-center justify-center mr-2">
                    <Ionicons
                      name="cube-outline"
                      size={isSmallDevice ? 15 : 16}
                      color={colors.iconMuted}
                    />
                  </View>
                  <Text
                    className={`font-medium text-gray-600 dark:text-slate-300 ${
                      isSmallDevice ? "text-[11.5px]" : "text-xs"
                    }`}
                  >
                    {job.weight}
                  </Text>
                </View>

                {/* Pickup location row (green dot) */}
                <View className="flex-row items-center">
                  <View className="w-5 items-center justify-center mr-2">
                    <View className="h-2 w-2 rounded-full bg-[#16A34A]" />
                  </View>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className={`font-medium text-gray-600 dark:text-slate-300 flex-1 ${
                      isSmallDevice ? "text-[11.5px]" : "text-xs"
                    }`}
                  >
                    {job.pickup}
                  </Text>
                </View>

                {/* Dropoff location row (red dot) */}
                <View className="flex-row items-center">
                  <View className="w-5 items-center justify-center mr-2">
                    <View className="h-2 w-2 rounded-full bg-[#EF4444]" />
                  </View>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className={`font-medium text-gray-600 dark:text-slate-300 flex-1 ${
                      isSmallDevice ? "text-[11.5px]" : "text-xs"
                    }`}
                  >
                    {job.dropoff}
                  </Text>
                </View>
              </View>

              {/* Footer row: Date/Time and "View Job >" button */}
              <View className="flex-row items-center justify-between pt-2.5 sm:pt-3 mt-1 border-t border-gray-100/80 dark:border-slate-700">
                <View className="flex-row items-center flex-1 pr-2">
                  <Ionicons
                    name="time-outline"
                    size={isSmallDevice ? 13 : 14}
                    color={colors.iconMuted}
                  />
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    className={`font-medium text-gray-400 dark:text-slate-400 ml-1.5 flex-1 ${
                      isSmallDevice ? "text-[10.5px]" : "text-[11.5px]"
                    }`}
                  >
                    {job.pickupTime}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setSelectedJob(job)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="flex-row items-center py-1 pl-2"
                >
                  <Text
                    className={`font-bold text-[#D97706] dark:text-amber-400 ${
                      isSmallDevice ? "text-[11.5px]" : "text-xs"
                    }`}
                  >
                    View Job &gt;
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
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
              name={activeTab === "home" ? "home" : "home-outline"}
              size={isSmallDevice ? 20 : 22}
              color={activeTab === "home" ? "#E68A00" : colors.iconMuted}
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } ${
                activeTab === "home"
                  ? "font-bold text-[#E68A00]"
                  : "font-medium text-[#9CA3AF] dark:text-slate-400"
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

          {/* Jobs Tab (Active in screenshot) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("jobs")}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name={activeTab === "jobs" ? "location" : "location-outline"}
              size={isSmallDevice ? 20 : 22}
              color={activeTab === "jobs" ? "#E68A00" : colors.iconMuted}
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } ${
                activeTab === "jobs"
                  ? "font-bold text-[#E68A00]"
                  : "font-medium text-[#9CA3AF] dark:text-slate-400"
              }`}
            >
              Jobs
            </Text>
            {activeTab === "jobs" && (
              <View
                className={`rounded-full bg-[#E68A00] mt-1 ${
                  isSmallDevice ? "h-[2px] w-5" : "h-[2px] w-6"
                }`}
              />
            )}
          </TouchableOpacity>

          {/* Active Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("active")}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name={activeTab === "active" ? "bus" : "bus-outline"}
              size={isSmallDevice ? 20 : 22}
              color={activeTab === "active" ? "#E68A00" : colors.iconMuted}
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } ${
                activeTab === "active"
                  ? "font-bold text-[#E68A00]"
                  : "font-medium text-[#9CA3AF] dark:text-slate-400"
              }`}
            >
              Active
            </Text>
            {activeTab === "active" && (
              <View
                className={`rounded-full bg-[#E68A00] mt-1 ${
                  isSmallDevice ? "h-[2px] w-5" : "h-[2px] w-6"
                }`}
              />
            )}
          </TouchableOpacity>

          {/* Profile Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("profile")}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name={activeTab === "profile" ? "person" : "person-outline"}
              size={isSmallDevice ? 20 : 22}
              color={activeTab === "profile" ? "#E68A00" : colors.iconMuted}
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } ${
                activeTab === "profile"
                  ? "font-bold text-[#E68A00]"
                  : "font-medium text-[#9CA3AF] dark:text-slate-400"
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

      {/* ================= MODAL: AVAILABLE JOB DETAILS POPUP ================= */}
      <Modal
        visible={!!selectedJob}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedJob(null)}
      >
        <View className="flex-1 bg-black/45 justify-center items-center px-4 sm:px-5">
          {/* Backdrop Dismiss Area */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSelectedJob(null)}
            className="absolute inset-0"
          />

          {selectedJob && (
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
                    className={`bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-xl ${
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
                        className="text-xs sm:text-[13px] font-bold text-gray-400 dark:text-slate-400 tracking-wider flex-1 pr-2"
                        numberOfLines={1}
                      >
                        {getJobIdDisplay(selectedJob.id)}
                      </Text>
                      <View className="flex-row items-center bg-[#FEF3C7] dark:bg-amber-950/60 px-2.5 py-1 rounded-full shrink-0">
                        <View className="h-2 w-2 rounded-full bg-[#E68A00] mr-1.5" />
                        <Text className="text-[10.5px] sm:text-xs font-bold text-[#B45309] dark:text-amber-300">
                          {selectedJob.status || "Open"}
                        </Text>
                      </View>
                    </View>

                    {/* Title & Weight */}
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                      className={`font-black text-[#0F172A] dark:text-white tracking-tight mt-2 sm:mt-2.5 ${
                        isExtraSmall
                          ? "text-[18px]"
                          : isSmallDevice
                          ? "text-[20px]"
                          : "text-[24px]"
                      }`}
                    >
                      {selectedJob.cropName}
                    </Text>
                    <Text className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400 mt-0.5">
                      {selectedJob.weight}
                    </Text>

                    {/* ROUTE Section */}
                    <Text className="text-[10.5px] sm:text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mt-4 sm:mt-5 mb-2 sm:mb-2.5">
                      ROUTE
                    </Text>

                    {/* Pickup Card */}
                    <View className="rounded-2xl bg-[#F0FDF4] dark:bg-emerald-950/30 border border-transparent dark:border-emerald-800/40 p-3 sm:p-4">
                      <View className="flex-row items-center">
                        <View className="h-2.5 w-2.5 rounded-full bg-[#16A34A] mr-2" />
                        <Text className="text-xs sm:text-[13px] font-bold text-[#16A34A] dark:text-emerald-400">
                          Pickup
                        </Text>
                      </View>
                      <Text
                        numberOfLines={2}
                        className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-slate-100 mt-1 sm:mt-1.5 leading-snug"
                      >
                        {getPickupAddress(selectedJob)}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5" numberOfLines={1}>
                        Farmer: {selectedJob.farmerName || "Kamal Jayasinghe"}
                      </Text>
                    </View>

                    {/* Delivery Card */}
                    <View className="rounded-2xl bg-[#FEF2F2] dark:bg-rose-950/30 border border-transparent dark:border-rose-800/40 p-3 sm:p-4 mt-2 sm:mt-2.5">
                      <View className="flex-row items-center">
                        <View className="h-2.5 w-2.5 rounded-full bg-[#EF4444] mr-2" />
                        <Text className="text-xs sm:text-[13px] font-bold text-[#DC2626] dark:text-rose-400">
                          Delivery
                        </Text>
                      </View>
                      <Text
                        numberOfLines={2}
                        className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-slate-100 mt-1 sm:mt-1.5 leading-snug"
                      >
                        {getDeliveryAddress(selectedJob)}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5" numberOfLines={1}>
                        Seller: {selectedJob.sellerName || "Colombo Fresh Market"}
                      </Text>
                    </View>

                    {/* Required Date & Required Time (Two Columns) */}
                    <View className="flex-row items-center gap-2 sm:gap-3 mt-2.5 sm:mt-3">
                      <View className="flex-1 rounded-2xl bg-[#F8FAFC] dark:bg-slate-700/60 p-2.5 sm:p-3.5 border border-slate-100 dark:border-slate-600">
                        <Text className="text-[10.5px] sm:text-xs font-medium text-gray-400 dark:text-slate-400">
                          Required Date
                        </Text>
                        <Text
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.75}
                          className="text-xs sm:text-[15px] font-bold text-[#0F172A] dark:text-slate-100 mt-0.5 sm:mt-1"
                        >
                          {getJobDate(selectedJob)}
                        </Text>
                      </View>

                      <View className="flex-1 rounded-2xl bg-[#F8FAFC] dark:bg-slate-700/60 p-2.5 sm:p-3.5 border border-slate-100 dark:border-slate-600">
                        <Text className="text-[10.5px] sm:text-xs font-medium text-gray-400 dark:text-slate-400">
                          Required Time
                        </Text>
                        <Text
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.75}
                          className="text-xs sm:text-[15px] font-bold text-[#0F172A] dark:text-slate-100 mt-0.5 sm:mt-1"
                        >
                          {getJobTime(selectedJob)}
                        </Text>
                      </View>
                    </View>

                    {/* Special Instructions Card */}
                    <View className="rounded-2xl bg-[#FFFDF0] dark:bg-amber-950/30 p-2.5 sm:p-3.5 mt-2.5 sm:mt-3 border border-[#FDE68A] dark:border-amber-700/50">
                      <Text className="text-[11.5px] sm:text-[12.5px] font-bold text-[#D97706] dark:text-amber-400">
                        Special Instructions
                      </Text>
                      <Text className="text-[11px] sm:text-[12.5px] text-[#92400E] dark:text-amber-200 font-medium mt-1 leading-relaxed">
                        {getSpecialInstructions(selectedJob)}
                      </Text>
                    </View>

                    {/* Payment Protected Card */}
                    <View className="rounded-2xl bg-[#F0FDF4] dark:bg-emerald-950/30 p-2.5 sm:p-3.5 mt-2.5 sm:mt-3 border border-[#BBF7D0] dark:border-emerald-700/50">
                      <View className="flex-row items-center">
                        <Text className="text-xs mr-1.5">🔒</Text>
                        <Text className="text-[11.5px] sm:text-[12.5px] font-bold text-[#16A34A] dark:text-emerald-400">
                          Payment Protected
                        </Text>
                      </View>
                      <Text className="text-[11px] sm:text-xs text-[#16A34A] dark:text-emerald-300 font-medium mt-1 leading-relaxed">
                        Transportation payment is held by Green Hive and released upon
                        successful delivery confirmation.
                      </Text>
                    </View>
                  </View>

                  {/* Bottom Action Buttons Row */}
                  <View className="flex-row items-center gap-2.5 sm:gap-3 mt-3 sm:mt-3.5 w-full">
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setSelectedJob(null)}
                      className="flex-[0.4] py-3 sm:py-3.5 rounded-2xl bg-white dark:bg-slate-700 border border-gray-200/90 dark:border-slate-600 items-center justify-center shadow-2xs"
                    >
                      <Text className="text-xs sm:text-base font-bold text-gray-800 dark:text-slate-200">
                        Back
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleSubmitOffer(selectedJob)}
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

      {/* ================= MODAL: NOTIFICATIONS ================= */}
      <Modal
        visible={showNotificationsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowNotificationsModal(false)}
          className="flex-1 bg-black/40 justify-center px-4 sm:px-5"
        >
          <View
            style={{ maxWidth: 480, width: "100%", alignSelf: "center", maxHeight: "85%" }}
            className={`bg-white dark:bg-slate-800 rounded-3xl border border-transparent dark:border-slate-700 shadow-xl ${
              isSmallDevice ? "p-4" : "p-5"
            }`}
          >
            <View className="flex-row items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
              <View className="flex-row items-center">
                <Text
                  className={`font-bold text-gray-900 dark:text-white ${
                    isSmallDevice ? "text-base" : "text-lg"
                  }`}
                >
                  Notifications
                </Text>
                <View className="ml-2 bg-[#FEF3C7] dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                  <Text className="text-[10.5px] sm:text-xs font-bold text-amber-800 dark:text-amber-300">
                    {notifications.length} new
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowNotificationsModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="h-8 w-8 rounded-full bg-gray-100 dark:bg-slate-700 items-center justify-center"
              >
                <Ionicons name="close" size={18} color={colors.iconMuted} />
              </TouchableOpacity>
            </View>

            <SmoothScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: screenHeight * 0.42 }}
              contentContainerStyle={{ paddingVertical: 6 }}
              nestedScrollEnabled={true}
            >
              <View className="space-y-2.5 sm:space-y-3 gap-2.5 sm:gap-3">
                {notifications.map((notif) => (
                  <View
                    key={notif.id}
                    className="p-3 bg-gray-50 dark:bg-slate-700/60 rounded-2xl border border-gray-100 dark:border-slate-600"
                  >
                    <Text className="text-xs font-bold text-gray-800 dark:text-slate-100">
                      {notif.title}
                    </Text>
                    <Text className="text-xs text-gray-600 dark:text-slate-300 mt-0.5 leading-snug">
                      {notif.message}
                    </Text>
                  </View>
                ))}
              </View>
            </SmoothScrollView>

            {/* See More Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSeeMoreNotifications}
              className="mt-2.5 py-2.5 rounded-xl border border-amber-200 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/40 items-center justify-center flex-row"
            >
              <Text className="text-xs font-bold text-[#D97706] dark:text-amber-400">See More</Text>
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
              onPress={() => setShowNotificationsModal(false)}
              className="mt-2 py-3 rounded-xl bg-[#E68A00] items-center justify-center shadow-xs"
            >
              <Text className="text-xs font-bold text-white">Dismiss</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
              Driver Profile
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
                <View className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#E68A00] items-center justify-center mb-2 overflow-hidden">
                  {avatarUri ? (
                    <Image
                      source={{ uri: avatarUri }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-xl sm:text-2xl font-black text-white">
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
                  ⭐ {profile.rating.toFixed(1)} Rating ({profile.completedJobs}{" "}
                  Completed Trips)
                </Text>
              </View>

              {/* Vehicle details */}
              <View className="rounded-2xl bg-white dark:bg-slate-800 p-3.5 sm:p-4 border border-gray-100 dark:border-slate-700 shadow-2xs mb-4">
                <Text className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">
                  Registered Vehicle
                </Text>
                <View className="space-y-1.5 gap-1.5">
                  <Text className="text-xs text-gray-700 dark:text-slate-300">
                    🚚 <Text className="font-semibold">Type:</Text>{" "}
                    {profile.vehicleType}
                  </Text>
                  <Text className="text-xs text-gray-700 dark:text-slate-300">
                    🔢 <Text className="font-semibold">Plate:</Text>{" "}
                    {profile.vehiclePlate}
                  </Text>
                  <Text className="text-xs text-gray-700 dark:text-slate-300">
                    🛡️ <Text className="font-semibold">Status:</Text> Green-Hive
                    Verified
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
                        Dark Mode
                      </Text>
                      <Text className="text-[10.5px] text-gray-500 dark:text-slate-400">
                        {isDark ? "Dark theme is active" : "Light theme is active"}
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
                className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 py-3.5 items-center justify-center mt-2"
              >
                <Text className="text-sm font-bold text-red-600 dark:text-red-400">
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

export default TransporterAvailableJobsScreen;
