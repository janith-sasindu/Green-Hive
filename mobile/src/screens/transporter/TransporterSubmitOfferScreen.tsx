import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SmoothScrollView } from "../../components/common/SmoothScrollView";

// Data
import {
  MOCK_TRANSPORTER_PROFILE,
  MOCK_AVAILABLE_JOBS,
  AvailableTransportJob,
  TransporterProfile,
} from "./data";

export interface TransporterSubmitOfferScreenProps {
  route?: {
    params?: {
      job?: AvailableTransportJob;
    };
  };
  job?: AvailableTransportJob;
  navigation?: any;
  onBack?: () => void;
  onSelectTab?: (tab: "home" | "jobs" | "active" | "profile") => void;
  onSubmitSuccess?: (offerData: {
    jobId: string;
    cost: string;
    deliveryTime: string;
    notes: string;
  }) => void;
}

export const TransporterSubmitOfferScreen: React.FC<
  TransporterSubmitOfferScreenProps
> = ({
  route,
  job: propJob,
  navigation,
  onBack,
  onSelectTab,
  onSubmitSuccess,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Responsive Breakpoints
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;

  // Selected job from route params, prop, or fallback
  const job: AvailableTransportJob =
    route?.params?.job || propJob || MOCK_AVAILABLE_JOBS[0];

  // State
  const [profile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);
  const [cost, setCost] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [notes, setNotes] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Helper formatting functions
  const getJobIdDisplay = (id?: string) => {
    if (!id) return "JOB #GH-T1025";
    const trimmed = id.trim();
    if (trimmed.toUpperCase().startsWith("JOB")) return trimmed;
    return `JOB ${trimmed}`;
  };

  const getTimeString = (targetJob: AvailableTransportJob) => {
    if (targetJob.pickupDate && targetJob.pickupRequiredTime) {
      return `${targetJob.pickupDate} at ${targetJob.pickupRequiredTime}`;
    }
    if (targetJob.pickupTime) {
      return targetJob.pickupTime.replace("·", "at").trim();
    }
    return "2026-08-31 at 06:00 AM";
  };

  const getPickupAddress = (targetJob: AvailableTransportJob) => {
    return (
      targetJob.pickupLocationDetail ||
      targetJob.pickup ||
      "Dambulla Agricultural Zone, Plot 14"
    );
  };

  const getDeliveryAddress = (targetJob: AvailableTransportJob) => {
    return (
      targetJob.dropoffLocationDetail ||
      targetJob.dropoff ||
      "Colombo Fresh Market, Colombo 03"
    );
  };

  const getSpecialInstructions = (targetJob: AvailableTransportJob) => {
    return (
      targetJob.specialInstructions ||
      "Fragile. Use padded transport. Early morning delivery required."
    );
  };

  // Navigation handlers
  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate("TransporterAvailableJobs");
    }
  };

  const handleTabPress = (tab: "home" | "jobs" | "active" | "profile") => {
    if (onSelectTab) {
      onSelectTab(tab);
    } else if (tab === "home") {
      navigation?.navigate?.("TransporterHome");
    } else if (tab === "jobs") {
      handleGoBack();
    }
  };

  const handleSubmitOffer = () => {
    if (!cost.trim()) {
      Alert.alert(
        "Missing Transportation Cost",
        "Please enter your proposed transportation cost (in Rs.) before submitting."
      );
      return;
    }

    const offerData = {
      jobId: job.id,
      cost: cost.trim(),
      deliveryTime: deliveryTime.trim() || getTimeString(job),
      notes: notes.trim(),
    };

    if (onSubmitSuccess) {
      onSubmitSuccess(offerData);
    }

    Alert.alert(
      "Offer Submitted!",
      `Your transport offer of Rs. ${cost.trim()} for ${job.cropName} (${getJobIdDisplay(
        job.id
      )}) has been sent successfully.\n\nYou will be notified once the offer is accepted.`,
      [
        {
          text: "Done",
          onPress: () => {
            handleGoBack();
          },
        },
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
    <KeyboardAvoidingView
      className="flex-1 bg-[#F5F8F6]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8F6" />

      {/* ================= TOP HEADER ================= */}
      <SafeAreaView edges={["top"]} className="bg-[#F5F8F6]">
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className="px-4 sm:px-5 pt-2 pb-2.5 flex-row items-center justify-between"
        >
          {/* Back Button & Title */}
          <View className="flex-row items-center flex-1 pr-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGoBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="mr-3 p-1 rounded-full"
            >
              <Ionicons
                name="arrow-back"
                size={isSmallDevice ? 22 : 24}
                color="#0F172A"
              />
            </TouchableOpacity>

            <Text
              numberOfLines={1}
              className={`font-black text-[#0F172A] tracking-tight ${
                isSmallDevice ? "text-[18px]" : "text-[20px]"
              }`}
            >
              Submit Offer
            </Text>
          </View>

          {/* Right Action Icons: Notification Bell & Profile Avatar */}
          <View className="flex-row items-center space-x-2.5 sm:space-x-3 gap-2.5 sm:gap-3">
            {/* Notification Bell */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (navigation?.navigate) {
                  navigation.navigate("TransporterNotifications");
                }
              }}
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

            {/* Profile Avatar Pill ("R") */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowProfileModal(true)}
              className={`rounded-full bg-[#E68A00] items-center justify-center shadow-2xs ${
                isSmallDevice ? "h-8 w-8" : "h-9 w-9"
              }`}
            >
              <Text className="text-white font-black text-sm">
                {profile.avatarLetter}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* ================= MAIN SCROLLABLE CONTENT ================= */}
      <SmoothScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          maxWidth: 640,
          width: "100%",
          alignSelf: "center",
          paddingHorizontal: isSmallDevice ? 14 : 18,
          paddingTop: 10,
          paddingBottom: 24,
        }}
      >
        {/* ================= 1. JOB SUMMARY CARD (Yellow/Amber Theme) ================= */}
        <View
          className="rounded-3xl bg-[#FFFDF5] p-4 sm:p-5 border border-[#FDE68A] shadow-xs"
          style={{
            shadowColor: "#F59E0B",
            shadowOpacity: 0.08,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          {/* Job ID Tag */}
          <Text className="text-xs sm:text-[13px] font-bold text-[#D97706] tracking-wider uppercase">
            {getJobIdDisplay(job.id)}
          </Text>

          {/* Crop Name & Weight */}
          <Text className="text-[17px] sm:text-[19px] font-black text-[#0F172A] tracking-tight mt-1 mb-2.5">
            {job.cropName} · {job.weight}
          </Text>

          {/* Route details: Pickup */}
          <View className="flex-row items-start mt-1">
            <View className="h-2 w-2 rounded-full bg-[#16A34A] mr-2.5 mt-1.5" />
            <Text className="text-xs sm:text-[13px] text-gray-700 font-medium flex-1 leading-snug">
              {getPickupAddress(job)}
            </Text>
          </View>

          {/* Route details: Dropoff */}
          <View className="flex-row items-start mt-1.5">
            <View className="h-2 w-2 rounded-full bg-[#EF4444] mr-2.5 mt-1.5" />
            <Text className="text-xs sm:text-[13px] text-gray-700 font-medium flex-1 leading-snug">
              {getDeliveryAddress(job)}
            </Text>
          </View>

          {/* Date & Time */}
          <View className="flex-row items-center mt-2.5">
            <Ionicons
              name="time-outline"
              size={14}
              color="#9CA3AF"
              style={{ marginRight: 6 }}
            />
            <Text className="text-xs sm:text-[12.5px] text-gray-500 font-medium">
              {getTimeString(job)}
            </Text>
          </View>

          {/* Special Instructions Callout */}
          <View className="rounded-xl bg-[#FEF9C3] p-3 mt-3">
            <Text className="text-[11.5px] sm:text-xs text-[#B45309] font-medium leading-relaxed">
              {getSpecialInstructions(job)}
            </Text>
          </View>
        </View>

        {/* ================= 2. YOUR OFFER FORM CARD ================= */}
        <View
          className="rounded-3xl bg-white p-5 sm:p-6 border border-gray-100 shadow-sm mt-4"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <Text className="text-[17px] sm:text-[19px] font-black text-[#0F172A] tracking-tight mb-4">
            Your Offer
          </Text>

          {/* Field 1: Transportation Cost */}
          <View className="mb-4">
            <Text className="text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
              Transportation Cost (Rs.) <Text className="text-gray-700">*</Text>
            </Text>
            <TextInput
              value={cost}
              onChangeText={setCost}
              placeholder="e.g. 2000"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm sm:text-base text-gray-900 font-semibold"
            />
          </View>

          {/* Field 2: Estimated Delivery Date & Time */}
          <View className="mb-4">
            <Text className="text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
              Estimated Delivery Date & Time
            </Text>
            <TextInput
              value={deliveryTime}
              onChangeText={setDeliveryTime}
              placeholder={getTimeString(job)}
              placeholderTextColor="#9CA3AF"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm sm:text-base text-gray-900 font-medium"
            />
          </View>

          {/* Field 3: Additional Notes */}
          <View>
            <Text className="text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
              Additional Notes
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Vehicle type, cool chain capability, experience with similar cargo..."
              placeholderTextColor="#9CA3AF"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm sm:text-base text-gray-900 font-medium min-h-[96px]"
            />
          </View>
        </View>

        {/* ================= 3. ACTION BUTTONS: CANCEL & SUBMIT OFFER ================= */}
        <View className="flex-row items-center gap-3 mt-4 w-full">
          {/* Cancel Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleGoBack}
            className="flex-1 py-3.5 sm:py-4 rounded-2xl bg-white border border-gray-200/90 items-center justify-center shadow-2xs"
          >
            <Text className="text-sm sm:text-base font-bold text-gray-800">
              Cancel
            </Text>
          </TouchableOpacity>

          {/* Submit Offer Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmitOffer}
            className="flex-1 py-3.5 sm:py-4 rounded-2xl bg-[#FF8C00] items-center justify-center shadow-xs"
          >
            <Text className="text-sm sm:text-base font-bold text-white">
              Submit Offer
            </Text>
          </TouchableOpacity>
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
            className="items-center px-3 sm:px-4 min-w-[54px]"
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

          {/* Jobs Tab (ACTIVE) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("jobs")}
            className="items-center px-3 sm:px-4 min-w-[54px]"
          >
            <Ionicons
              name="location"
              size={isSmallDevice ? 20 : 22}
              color="#E68A00"
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-bold text-[#E68A00]`}
            >
              Jobs
            </Text>
            {/* Active Indicator Bar */}
            <View className="h-0.5 w-4 bg-[#E68A00] rounded-full mt-0.5" />
          </TouchableOpacity>

          {/* Active Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("active")}
            className="items-center px-3 sm:px-4 min-w-[54px]"
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
            className="items-center px-3 sm:px-4 min-w-[54px]"
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

          <SmoothScrollView
            contentContainerStyle={{
              maxWidth: 640,
              width: "100%",
              alignSelf: "center",
              padding: 16,
              paddingBottom: 40,
            }}
          >
            {/* Driver Card */}
            <View className="rounded-2xl bg-white p-5 border border-gray-100 shadow-2xs items-center mb-4">
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
          </SmoothScrollView>
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default TransporterSubmitOfferScreen;
