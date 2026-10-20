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

// Mock Data imported from dedicated transporter data folder
import {
  MOCK_TRANSPORTER_PROFILE,
  MOCK_AVAILABLE_JOBS,
  MOCK_NOTIFICATIONS,
  AvailableTransportJob,
  TransporterProfile,
  TransporterNotificationItem,
} from "./data";

export interface TransporterAvailableJobsScreenProps {
  navigation?: any;
  onSelectTab?: (tab: "home" | "jobs" | "active" | "profile") => void;
  activeTab?: "home" | "jobs" | "active" | "profile";
}

export const TransporterAvailableJobsScreen = ({
  navigation,
  onSelectTab,
  activeTab = "jobs",
}: TransporterAvailableJobsScreenProps) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Responsive Breakpoints
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;
  const isTablet = screenWidth >= 600;

  // State
  const [profile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);
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

  // Tab change handler
  const handleTabPress = (tab: "home" | "jobs" | "active" | "profile") => {
    if (onSelectTab) {
      onSelectTab(tab);
    } else if (tab === "home") {
      navigation?.navigate?.("TransporterHome");
    }
  };

  const handleMakeOffer = (job: AvailableTransportJob) => {
    Alert.alert(
      "Submit Transport Offer",
      `Submit standard bid for ${job.cropName} · ${job.weight}?\nRoute: ${job.pickup} → ${job.dropoff}\nEstimated Payout: ${job.price}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Bid",
          onPress: () => {
            setSelectedJob(null);
            Alert.alert(
              "Offer Submitted!",
              `Your bid for ${job.id} (${job.cropName}) was sent to the farmer.`
            );
          },
        },
      ]
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

  return (
    <View className="flex-1 bg-[#F5F8F6]">
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8F6" />

      {/* ================= TOP HEADER ================= */}
      <SafeAreaView edges={["top"]} className="bg-[#F5F8F6]">
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className={`px-4 sm:px-5 flex-row items-center justify-between ${
            isSmallDevice ? "pt-1.5 pb-2" : "pt-2 pb-2.5"
          }`}
        >
          {/* Logo & Title */}
          <View className="flex-row items-center flex-1 pr-2">
            <View
              className={`rounded-xl bg-[#14532D] items-center justify-center mr-2.5 sm:mr-3 shadow-2xs overflow-hidden ${
                isSmallDevice ? "h-8 w-8" : "h-9 w-9"
              }`}
            >
              <Image
                source={require("../../assets/logo.png")}
                className={isSmallDevice ? "h-7 w-7" : "h-8 w-8"}
                resizeMode="contain"
              />
            </View>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              className={`font-black text-gray-900 tracking-tight flex-1 ${
                isSmallDevice ? "text-[18px]" : "text-[20px]"
              }`}
            >
              Available Jobs
            </Text>
          </View>

          {/* Right Action Icons */}
          <View className="flex-row items-center space-x-2.5 sm:space-x-3 gap-2.5 sm:gap-3">
            {/* Notification Bell */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowNotificationsModal(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="relative p-1.5 rounded-full"
            >
              <Ionicons
                name="notifications-outline"
                size={isSmallDevice ? 21 : 23}
                color="#4B5563"
              />
              <View className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </TouchableOpacity>

            {/* Profile Avatar Pill */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowProfileModal(true)}
              className={`rounded-full bg-[#E68A00] items-center justify-center shadow-xs ${
                isSmallDevice ? "h-8 w-8" : "h-9 w-9"
              }`}
            >
              <Text
                className={`font-extrabold text-white ${
                  isSmallDevice ? "text-xs" : "text-sm"
                }`}
              >
                {profile.avatarLetter}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* ================= MAIN SCROLLABLE BODY ================= */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          maxWidth: 640,
          width: "100%",
          alignSelf: "center",
          paddingBottom: isSmallDevice ? 28 : 36,
        }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        decelerationRate="normal"
        overScrollMode="never"
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Subtitle count banner */}
        <View className="px-4 sm:px-5 pt-2.5 pb-2.5">
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className={`font-medium text-gray-500 ${
              isSmallDevice ? "text-[12.5px]" : "text-[14px]"
            }`}
          >
            {availableJobs.length} transport jobs available near you
          </Text>
        </View>

        {/* Job Cards List */}
        <View className="px-4 sm:px-5 space-y-3.5 sm:space-y-4 gap-3.5 sm:gap-4">
          {availableJobs.map((job) => (
            <View
              key={job.id}
              className={`rounded-3xl bg-white border border-gray-100 shadow-xs ${
                isSmallDevice ? "p-4" : "p-5"
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
                  className={`font-semibold text-gray-400 ${
                    isSmallDevice ? "text-[11px]" : "text-xs"
                  }`}
                >
                  {job.id}
                </Text>
                <View className="rounded-full bg-amber-100/70 px-2.5 py-0.5">
                  <Text className="text-[10.5px] sm:text-[11px] font-bold text-amber-800">
                    {job.status}
                  </Text>
                </View>
              </View>

              {/* Crop Name */}
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                className={`font-extrabold text-gray-900 mb-2 sm:mb-2.5 ${
                  isSmallDevice ? "text-[16px]" : "text-[18px]"
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
                      color="#6B7280"
                    />
                  </View>
                  <Text
                    className={`font-medium text-gray-600 ${
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
                    className={`font-medium text-gray-600 flex-1 ${
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
                    className={`font-medium text-gray-600 flex-1 ${
                      isSmallDevice ? "text-[11.5px]" : "text-xs"
                    }`}
                  >
                    {job.dropoff}
                  </Text>
                </View>
              </View>

              {/* Footer row: Date/Time and "View Job >" button */}
              <View className="flex-row items-center justify-between pt-2.5 sm:pt-3 mt-1 border-t border-gray-100/80">
                <View className="flex-row items-center flex-1 pr-2">
                  <Ionicons
                    name="time-outline"
                    size={isSmallDevice ? 13 : 14}
                    color="#9CA3AF"
                  />
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    className={`font-medium text-gray-400 ml-1.5 flex-1 ${
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
                    className={`font-bold text-[#D97706] ${
                      isSmallDevice ? "text-[11.5px]" : "text-xs"
                    }`}
                  >
                    View Job &gt;
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

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
            className="items-center px-3 sm:px-4 min-w-[54px]"
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

          {/* Jobs Tab (Active in screenshot) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("jobs")}
            className="items-center px-3 sm:px-4 min-w-[54px]"
          >
            <Ionicons
              name={activeTab === "jobs" ? "location" : "location-outline"}
              size={isSmallDevice ? 20 : 22}
              color={activeTab === "jobs" ? "#E68A00" : "#9CA3AF"}
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } ${
                activeTab === "jobs"
                  ? "font-bold text-[#E68A00]"
                  : "font-medium text-[#9CA3AF]"
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
            className="items-center px-3 sm:px-4 min-w-[54px]"
          >
            <Ionicons
              name={activeTab === "active" ? "bus" : "bus-outline"}
              size={isSmallDevice ? 20 : 22}
              color={activeTab === "active" ? "#E68A00" : "#9CA3AF"}
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } ${
                activeTab === "active"
                  ? "font-bold text-[#E68A00]"
                  : "font-medium text-[#9CA3AF]"
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
            className="items-center px-3 sm:px-4 min-w-[54px]"
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

      {/* ================= MODAL: JOB DETAILS & BIDDING ================= */}
      <Modal
        visible={!!selectedJob}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedJob(null)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
            className={`bg-white rounded-t-3xl shadow-2xl ${
              isSmallDevice ? "p-4 max-h-[90%]" : "p-6 max-h-[85%]"
            }`}
          >
            {/* Modal Drag handle */}
            <View className="items-center mb-2.5">
              <View className="h-1.5 w-12 rounded-full bg-gray-300" />
            </View>

            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <Text className="text-sm font-bold text-gray-500 mr-2">
                  {selectedJob?.id}
                </Text>
                <View className="rounded-full bg-amber-100 px-2.5 py-0.5">
                  <Text className="text-[11px] font-bold text-amber-800">
                    Open for Bids
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedJob(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="h-8 w-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              className="py-3"
              bounces={true}
            >
              {/* Crop & Quantity */}
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                className={`font-extrabold text-gray-900 ${
                  isSmallDevice ? "text-lg" : "text-xl"
                }`}
              >
                {selectedJob?.cropName}
              </Text>
              <Text className="text-xs sm:text-sm font-semibold text-gray-500 mb-3 sm:mb-4">
                Total Cargo Weight: {selectedJob?.weight}
              </Text>

              {/* Route Card */}
              <View className="rounded-2xl bg-gray-50 p-3.5 sm:p-4 border border-gray-200/70 mb-3.5 sm:mb-4">
                <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Trip Route & Schedule
                </Text>

                <View className="flex-row items-start mb-2.5">
                  <View className="h-2.5 w-2.5 rounded-full bg-[#16A34A] mt-1 mr-2.5" />
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold text-gray-400">
                      PICKUP LOCATION
                    </Text>
                    <Text
                      numberOfLines={2}
                      className="text-xs sm:text-sm font-semibold text-gray-800"
                    >
                      {selectedJob?.pickup}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start mb-2.5">
                  <View className="h-2.5 w-2.5 rounded-full bg-[#EF4444] mt-1 mr-2.5" />
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold text-gray-400">
                      DROPOFF DESTINATION
                    </Text>
                    <Text
                      numberOfLines={2}
                      className="text-xs sm:text-sm font-semibold text-gray-800"
                    >
                      {selectedJob?.dropoff}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between pt-2 border-t border-gray-200/60 mt-1">
                  <Text className="text-[11px] sm:text-xs text-gray-500">
                    🕒 {selectedJob?.pickupTime}
                  </Text>
                  <Text className="text-[11px] sm:text-xs font-bold text-gray-700">
                    🛣️ {selectedJob?.distance || "Approx. 120 km"}
                  </Text>
                </View>
              </View>

              {/* Farmer & Payout summary */}
              <View className="flex-row items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] mb-3.5 sm:mb-4">
                <View className="flex-1 pr-2">
                  <Text className="text-[11px] text-gray-500">Farmer Contact</Text>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    className="text-xs sm:text-sm font-bold text-gray-900"
                  >
                    {selectedJob?.farmerName || "Registered Farmer"}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => selectedJob && handleCallFarmer(selectedJob)}
                  className="rounded-xl bg-white border border-[#86EFAC] px-3 py-1.5 flex-row items-center shadow-2xs"
                >
                  <Ionicons name="call" size={13} color="#16A34A" />
                  <Text className="text-xs font-bold text-[#16A34A] ml-1.5">
                    Call
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Est. Payout Banner */}
              <View className="flex-row items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 mb-4 sm:mb-5">
                <View>
                  <Text className="text-[10.5px] sm:text-xs font-bold text-amber-700 uppercase">
                    Estimated Trip Payout
                  </Text>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    className={`font-black text-amber-900 ${
                      isSmallDevice ? "text-lg" : "text-xl"
                    }`}
                  >
                    {selectedJob?.price}
                  </Text>
                </View>
                <Text className="text-[11px] sm:text-xs text-amber-700 font-medium max-w-[120px] text-right">
                  Protected by Green-Hive Escrow
                </Text>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => selectedJob && handleMakeOffer(selectedJob)}
                className={`w-full rounded-2xl bg-[#E68A00] items-center justify-center shadow-xs mb-2.5 ${
                  isSmallDevice ? "py-3" : "py-3.5"
                }`}
              >
                <Text className="text-sm font-bold text-white">
                  Submit Bid / Offer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSelectedJob(null)}
                className="w-full rounded-2xl bg-gray-100 py-2.5 sm:py-3 items-center justify-center"
              >
                <Text className="text-xs font-bold text-gray-600">Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
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
            style={{ maxWidth: 480, width: "100%", alignSelf: "center" }}
            className={`bg-white rounded-3xl shadow-xl ${
              isSmallDevice ? "p-4" : "p-5"
            }`}
          >
            <View className="flex-row items-center justify-between pb-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <Text
                  className={`font-bold text-gray-900 ${
                    isSmallDevice ? "text-base" : "text-lg"
                  }`}
                >
                  Notifications
                </Text>
                <View className="ml-2 bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                  <Text className="text-[10.5px] sm:text-xs font-bold text-amber-800">
                    {notifications.length} new
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowNotificationsModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="h-8 w-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="py-3 space-y-2.5 sm:space-y-3 gap-2.5 sm:gap-3">
              {notifications.map((notif) => (
                <View
                  key={notif.id}
                  className="p-3 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <Text className="text-xs font-bold text-gray-800">
                    {notif.title}
                  </Text>
                  <Text className="text-xs text-gray-600 mt-0.5">
                    {notif.message}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setShowNotificationsModal(false)}
              className="mt-2 py-3 rounded-xl bg-[#E68A00] items-center justify-center"
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
        <SafeAreaView className="flex-1 bg-[#F9FAFB]">
          <View
            style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
            className="px-5 py-3.5 flex-row items-center justify-between border-b border-gray-200 bg-white"
          >
            <Text className="text-lg font-bold text-gray-900">
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

          <ScrollView
            className="p-4 flex-1"
            contentContainerStyle={{
              maxWidth: 640,
              width: "100%",
              alignSelf: "center",
              paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Driver Card */}
            <View className="rounded-2xl bg-white p-5 border border-gray-100 shadow-2xs items-center mb-4">
              <View className="h-16 w-16 rounded-full bg-[#E68A00] items-center justify-center mb-2">
                <Text className="text-2xl font-black text-white">
                  {profile.avatarLetter}
                </Text>
              </View>
              <Text className="text-lg font-extrabold text-gray-900">
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
            <View className="rounded-2xl bg-white p-4 border border-gray-100 shadow-2xs mb-4">
              <Text className="text-xs font-bold text-gray-500 uppercase mb-2">
                Registered Vehicle
              </Text>
              <View className="space-y-1.5">
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

export default TransporterAvailableJobsScreen;
