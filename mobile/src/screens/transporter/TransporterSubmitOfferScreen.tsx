import React, { useState, useEffect } from "react";
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
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  SmoothScrollView,
  ThemedAlertModal,
  ThemedAlertModalType,
} from "../../components/common";

// Data
import {
  MOCK_TRANSPORTER_PROFILE,
  MOCK_AVAILABLE_JOBS,
  AvailableTransportJob,
  TransporterProfile,
} from "./data";
import { TransporterOfferSubmittedScreen } from "./TransporterOfferSubmittedScreen";

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
  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;
  const isTablet = screenWidth >= 600;

  // Selected job from route params, prop, or fallback
  const job: AvailableTransportJob =
    route?.params?.job || propJob || MOCK_AVAILABLE_JOBS[0];

  // State
  const [profile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);
  const [cost, setCost] = useState("");
  const [costError, setCostError] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Themed Alert / Error Popup state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: ThemedAlertModalType;
    primaryButtonText?: string;
    onPrimaryPress?: () => void;
    secondaryButtonText?: string;
    onSecondaryPress?: () => void;
  } | null>(null);

  const showAlert = (
    title: string,
    message: string,
    options?: {
      type?: ThemedAlertModalType;
      primaryButtonText?: string;
      onPrimaryPress?: () => void;
      secondaryButtonText?: string;
      onSecondaryPress?: () => void;
    }
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type: options?.type || "warning",
      primaryButtonText: options?.primaryButtonText || "Got It",
      onPrimaryPress: () => {
        setAlertConfig(null);
        options?.onPrimaryPress?.();
      },
      secondaryButtonText: options?.secondaryButtonText,
      onSecondaryPress: () => {
        setAlertConfig(null);
        options?.onSecondaryPress?.();
      },
    });
  };

  // Reset form when target job changes
  useEffect(() => {
    setIsSubmitted(false);
    setCost("");
    setCostError("");
    setDeliveryTime("");
    setNotes("");
  }, [job?.id]);

  // Keyboard listener to prevent bottom tab occlusion when typing
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
    } else if (tab === "active") {
      navigation?.navigate?.("TransporterActiveJob");
    } else if (tab === "profile") {
      setShowProfileModal(true);
    }
  };

  const handleSubmitOffer = () => {
    const trimmedCost = cost.trim();

    // Validation: Transportation Cost must be filled
    if (!trimmedCost) {
      setCostError("Please enter your proposed transportation cost.");
      showAlert(
        "Missing Transportation Cost",
        "Please enter your proposed transportation cost (in Rs.) before submitting.",
        { type: "warning", primaryButtonText: "Got It" }
      );
      return;
    }

    const numericCost = parseFloat(trimmedCost.replace(/[^0-9.]/g, ""));
    if (isNaN(numericCost) || numericCost <= 0) {
      setCostError("Please enter a valid amount greater than 0.");
      showAlert(
        "Invalid Transportation Cost",
        "Please enter a valid transportation cost amount greater than 0.",
        { type: "warning", primaryButtonText: "Got It" }
      );
      return;
    }

    // Clear error
    setCostError("");

    const offerData = {
      jobId: job.id,
      cost: trimmedCost,
      deliveryTime: deliveryTime.trim() || getTimeString(job),
      notes: notes.trim(),
    };

    if (onSubmitSuccess) {
      onSubmitSuccess(offerData);
    }

    if (navigation?.navigate) {
      navigation.navigate("TransporterOfferSubmitted", { job, offerData });
    } else {
      // Switch to the dedicated Offer Submitted confirmation screen for standalone/fallback mode
      setIsSubmitted(true);
    }
  };

  const handleSignOut = () => {
    setShowProfileModal(false);
    showAlert("Log Out", "Are you sure you want to log out of your driver account?", {
      type: "warning",
      primaryButtonText: "Log Out",
      secondaryButtonText: "Cancel",
      onPrimaryPress: () => {
        if (navigation?.canGoBack && navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation?.navigate("Welcome");
        }
      },
    });
  };

  if (isSubmitted) {
    return (
      <TransporterOfferSubmittedScreen
        job={job}
        navigation={navigation}
        onBackToJobs={handleGoBack}
        onSelectTab={onSelectTab}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F5F8F6]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8F6" />

      {/* ================= TOP HEADER ================= */}
      <SafeAreaView edges={["top"]} className="bg-[#F5F8F6]">
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className={`px-4 sm:px-5 flex-row items-center justify-between ${
            isSmallDevice ? "pt-1 pb-2" : "pt-2 pb-2.5"
          }`}
        >
          {/* Back Button & Title */}
          <View className="flex-row items-center flex-1 pr-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGoBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="mr-2.5 p-1 rounded-full"
            >
              <Ionicons
                name="arrow-back"
                size={isExtraSmall ? 20 : isSmallDevice ? 22 : 24}
                color="#0F172A"
              />
            </TouchableOpacity>

            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              className={`font-black text-[#0F172A] tracking-tight flex-1 ${
                isExtraSmall
                  ? "text-[16px]"
                  : isSmallDevice
                  ? "text-[18px]"
                  : "text-[20px]"
              }`}
            >
              Submit Offer
            </Text>
          </View>

          {/* Right Action Icons: Notification Bell & Profile Avatar */}
          <View className="flex-row items-center space-x-2 sm:space-x-2.5 gap-2 sm:gap-2.5">
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
                size={isExtraSmall ? 18 : isSmallDevice ? 20 : 23}
                color="#4B5563"
              />
              <View className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </TouchableOpacity>

            {/* Profile Avatar Pill ("R") */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowProfileModal(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className={`rounded-full bg-[#E68A00] items-center justify-center shadow-2xs ${
                isExtraSmall ? "h-8 w-8" : isSmallDevice ? "h-8.5 w-8.5" : "h-9 w-9"
              }`}
            >
              <Text
                className={`text-white font-black ${
                  isExtraSmall ? "text-xs" : isSmallDevice ? "text-xs" : "text-sm"
                }`}
              >
                {profile.avatarLetter}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* ================= MAIN SCROLLABLE CONTENT ================= */}
      <SmoothScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: isExtraSmall ? 12 : isSmallDevice ? 14 : 18,
          paddingTop: 8,
          paddingBottom: isSmallDevice ? 32 : 44,
          flexGrow: 1,
        }}
      >
          <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}>
            {/* ================= 1. JOB SUMMARY CARD (Yellow/Amber Theme) ================= */}
            <View
              className={`rounded-3xl bg-[#FFFDF5] border border-[#FDE68A] shadow-xs ${
                isExtraSmall ? "p-3.5" : isSmallDevice ? "p-4" : "p-4 sm:p-5"
              }`}
              style={{
                shadowColor: "#F59E0B",
                shadowOpacity: 0.08,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              {/* Job ID Tag */}
              <Text
                className="text-xs sm:text-[13px] font-bold text-[#D97706] tracking-wider uppercase"
                numberOfLines={1}
              >
                {getJobIdDisplay(job.id)}
              </Text>

              {/* Crop Name & Weight */}
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                className={`font-black text-[#0F172A] tracking-tight mt-1 mb-2 sm:mb-2.5 ${
                  isExtraSmall
                    ? "text-[15px]"
                    : isSmallDevice
                    ? "text-[16px]"
                    : "text-[18px]"
                }`}
              >
                {job.cropName} · {job.weight}
              </Text>

              {/* Route details: Pickup */}
              <View className="flex-row items-start mt-1">
                <View className="h-2 w-2 rounded-full bg-[#16A34A] mr-2.5 mt-1.5 shrink-0" />
                <Text
                  numberOfLines={2}
                  className="text-xs sm:text-[13px] text-gray-700 font-medium flex-1 leading-snug"
                >
                  {getPickupAddress(job)}
                </Text>
              </View>

              {/* Route details: Dropoff */}
              <View className="flex-row items-start mt-1.5">
                <View className="h-2 w-2 rounded-full bg-[#EF4444] mr-2.5 mt-1.5 shrink-0" />
                <Text
                  numberOfLines={2}
                  className="text-xs sm:text-[13px] text-gray-700 font-medium flex-1 leading-snug"
                >
                  {getDeliveryAddress(job)}
                </Text>
              </View>

              {/* Date & Time */}
              <View className="flex-row items-center mt-2 sm:mt-2.5">
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="#9CA3AF"
                  style={{ marginRight: 6 }}
                />
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                  className="text-xs sm:text-[12.5px] text-gray-500 font-medium flex-1"
                >
                  {getTimeString(job)}
                </Text>
              </View>

              {/* Special Instructions Callout */}
              <View className="rounded-xl bg-[#FEF9C3] p-2.5 sm:p-3 mt-2.5 sm:mt-3">
                <Text className="text-[11px] sm:text-xs text-[#B45309] font-medium leading-relaxed">
                  {getSpecialInstructions(job)}
                </Text>
              </View>
            </View>

            {/* ================= 2. YOUR OFFER FORM CARD ================= */}
            <View
              className={`rounded-3xl bg-white border border-gray-100 shadow-sm mt-3.5 sm:mt-4 ${
                isExtraSmall ? "p-3.5" : isSmallDevice ? "p-4 sm:p-5" : "p-5 sm:p-6"
              }`}
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <Text
                className={`font-black text-[#0F172A] tracking-tight mb-3 sm:mb-4 ${
                  isExtraSmall
                    ? "text-[16px]"
                    : isSmallDevice
                    ? "text-[17px]"
                    : "text-[19px]"
                }`}
              >
                Your Offer
              </Text>

              {/* Field 1: Transportation Cost */}
              <View className="mb-3.5 sm:mb-4">
                <Text className="text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                  Transportation Cost (Rs.) <Text className="text-gray-700">*</Text>
                </Text>
                <TextInput
                  value={cost}
                  onChangeText={(text) => {
                    setCost(text);
                    if (costError) setCostError("");
                  }}
                  placeholder="e.g. 2000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  className={`w-full rounded-2xl border ${
                    costError
                      ? "border-red-500 bg-red-50/20"
                      : "border-gray-200 bg-white"
                  } px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 font-semibold`}
                />
                {costError ? (
                  <Text className="text-xs text-red-500 font-semibold mt-1.5 ml-1">
                    {costError}
                  </Text>
                ) : null}
              </View>

              {/* Field 2: Estimated Delivery Date & Time */}
              <View className="mb-3.5 sm:mb-4">
                <Text className="text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                  Estimated Delivery Date & Time
                </Text>
                <TextInput
                  value={deliveryTime}
                  onChangeText={setDeliveryTime}
                  placeholder={getTimeString(job)}
                  placeholderTextColor="#9CA3AF"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 font-medium"
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
                  placeholder="Vehicle type, cool chain capability, cargo care notes..."
                  placeholderTextColor="#9CA3AF"
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 font-medium min-h-[80px] sm:min-h-[96px]"
                />
              </View>
            </View>

            {/* ================= 3. ACTION BUTTONS: CANCEL & SUBMIT OFFER ================= */}
            <View className="flex-row items-center gap-2.5 sm:gap-3 mt-3.5 sm:mt-4 w-full">
              {/* Cancel Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleGoBack}
                className="flex-1 py-3 sm:py-3.5 rounded-2xl bg-white border border-gray-200/90 items-center justify-center shadow-2xs"
              >
                <Text className="text-xs sm:text-base font-bold text-gray-800">
                  Cancel
                </Text>
              </TouchableOpacity>

              {/* Submit Offer Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSubmitOffer}
                className="flex-1 py-3 sm:py-3.5 rounded-2xl bg-[#FF8C00] items-center justify-center shadow-xs"
              >
                <Text className="text-xs sm:text-base font-bold text-white">
                  Submit Offer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SmoothScrollView>

      {/* ================= BOTTOM NAVIGATION BAR (Auto-hides on keyboard) ================= */}
      {!isKeyboardVisible && (
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

            {/* Jobs Tab (ACTIVE) */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleTabPress("jobs")}
              className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
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
      )}

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
            className="flex-1"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={{
              padding: 14,
              paddingBottom: 40,
              flexGrow: 1,
            }}
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

      {/* ================= THEMED ALERT / ERROR POPUP MODAL ================= */}
      {alertConfig && (
        <ThemedAlertModal
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          primaryButtonText={alertConfig.primaryButtonText}
          onPrimaryPress={alertConfig.onPrimaryPress}
          secondaryButtonText={alertConfig.secondaryButtonText}
          onSecondaryPress={alertConfig.onSecondaryPress}
          onClose={() => setAlertConfig(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default TransporterSubmitOfferScreen;
