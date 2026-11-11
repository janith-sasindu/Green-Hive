import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Modal,
  Switch,
  Image,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  SmoothScrollView,
  ThemedAlertModal,
  ThemedAlertModalType,
} from "../../components/common";
import { useTransporterTheme } from "../../context/TransporterThemeContext";

// Data
import {
  MOCK_TRANSPORTER_PROFILE,
  MOCK_AVAILABLE_JOBS,
  MOCK_MY_OFFERS,
  DEFAULT_OFFER_NOTE,
  AvailableTransportJob,
  TransporterProfile,
  TransportOffer,
  TRANSPORTER_API_ENDPOINTS,
  SUBMIT_OFFER_TEXTS,
  SUBMIT_OFFER_PLACEHOLDERS,
  SUBMIT_OFFER_MESSAGES,
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
    offerId?: number | string;
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
    const { isDark, toggleDarkMode, colors } = useTransporterTheme();

    // Responsive Breakpoints
    const isExtraSmall = screenWidth < 360;
    const isSmallDevice = screenWidth < 380 || screenHeight < 700;

    // Selected job from route params, prop, or fallback
    const job: AvailableTransportJob =
      route?.params?.job || propJob || MOCK_AVAILABLE_JOBS[0];

    // State
    const [profile, setProfile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);
    const [cost, setCost] = useState("");
    const [costError, setCostError] = useState("");
    const [deliveryTime, setDeliveryTime] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    // Fetch live transporter profile
    const fetchProfile = useCallback(async () => {
      try {
        const response = await fetch(TRANSPORTER_API_ENDPOINTS.profile);
        const json = await response.json();
        if (json.success && json.data) {
          setProfile((prev) => ({
            ...prev,
            ...json.data,
          }));
        }
      } catch (err) {
        console.log("Error loading profile in submit offer screen:", err);
      }
    }, []);

    useEffect(() => {
      fetchProfile();
    }, [fetchProfile]);

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

    const defaultFallbackJob = MOCK_AVAILABLE_JOBS[0];

    // Helper formatting functions
    const getJobIdDisplay = (id?: string) => {
      const prefix = SUBMIT_OFFER_TEXTS.jobSummarySection.jobPrefix;
      if (!id) return `${prefix} ${defaultFallbackJob.id}`;
      const trimmed = id.trim();
      if (trimmed.toUpperCase().startsWith(prefix)) return trimmed;
      return `${prefix} ${trimmed}`;
    };

    const getTimeString = (targetJob: AvailableTransportJob) => {
      if (targetJob.pickupDate && targetJob.pickupRequiredTime) {
        return `${targetJob.pickupDate} at ${targetJob.pickupRequiredTime}`;
      }
      if (targetJob.pickupTime) {
        return targetJob.pickupTime.replace("·", "at").trim();
      }
      return `${defaultFallbackJob.pickupDate} at ${defaultFallbackJob.pickupRequiredTime}`;
    };

    const getPickupAddress = (targetJob: AvailableTransportJob) => {
      return (
        targetJob.pickupLocationDetail ||
        targetJob.pickup ||
        defaultFallbackJob.pickup
      );
    };

    const getDeliveryAddress = (targetJob: AvailableTransportJob) => {
      return (
        targetJob.dropoffLocationDetail ||
        targetJob.dropoff ||
        defaultFallbackJob.dropoff
      );
    };

    const getSpecialInstructions = (targetJob: AvailableTransportJob) => {
      return (
        targetJob.specialInstructions ||
        defaultFallbackJob.specialInstructions ||
        SUBMIT_OFFER_TEXTS.jobSummarySection.specialInstructionsFallback
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

    // Submit Offer to Live Backend API
    const handleSubmitOffer = async () => {
      if (isSubmitting) return;

      const trimmedCost = cost.trim();

      // Validation: Transportation Cost must be filled
      if (!trimmedCost) {
        setCostError(SUBMIT_OFFER_MESSAGES.validation.missingCost.inputError);
        showAlert(
          SUBMIT_OFFER_MESSAGES.validation.missingCost.alertTitle,
          SUBMIT_OFFER_MESSAGES.validation.missingCost.alertMessage,
          {
            type: "warning",
            primaryButtonText: SUBMIT_OFFER_MESSAGES.validation.missingCost.primaryButton,
          }
        );
        return;
      }

      const numericCost = parseFloat(trimmedCost.replace(/[^0-9.]/g, ""));
      if (isNaN(numericCost) || numericCost <= 0) {
        setCostError(SUBMIT_OFFER_MESSAGES.validation.invalidCost.inputError);
        showAlert(
          SUBMIT_OFFER_MESSAGES.validation.invalidCost.alertTitle,
          SUBMIT_OFFER_MESSAGES.validation.invalidCost.alertMessage,
          {
            type: "warning",
            primaryButtonText: SUBMIT_OFFER_MESSAGES.validation.invalidCost.primaryButton,
          }
        );
        return;
      }

      // Clear error
      setCostError("");
      setIsSubmitting(true);

      const estDelivery = deliveryTime.trim() || getTimeString(job);
      const noteText = notes.trim();

      try {
        const targetJobId = job.dbId ?? encodeURIComponent(job.id);
        const endpoint = TRANSPORTER_API_ENDPOINTS.jobOffers(targetJobId);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quotePrice: numericCost,
            estimatedDelivery: estDelivery,
            notes: noteText,
          }),
        });

        const json = await response.json();

        if (json.success) {
          const offerData = {
            jobId: job.id,
            cost: trimmedCost,
            deliveryTime: estDelivery,
            notes: noteText,
            offerId: json.data?.offerId,
          };

          const newOffer: TransportOffer = {
            id: job.id.startsWith("Job") ? job.id : `Job ${job.id}`,
            title: "Transportation Offer",
            cropName: job.cropName,
            weight: job.weight,
            route: `${job.pickup?.split(",")[0] || "Origin"} → ${job.dropoff?.split(",")[0] || "Destination"}`,
            quotePrice: trimmedCost.startsWith("Rs.") ? trimmedCost : `Rs. ${trimmedCost}`,
            estimatedDelivery: estDelivery,
            notes: noteText || DEFAULT_OFFER_NOTE,
            submittedDate: new Date().toISOString().split("T")[0],
            status: "Submitted",
            sellerName: job.sellerName,
            pickupLocation: job.pickup,
            dropoffLocation: job.dropoff,
          };

          const existingIdx = MOCK_MY_OFFERS.findIndex((o) => o.id === newOffer.id);
          if (existingIdx >= 0) {
            MOCK_MY_OFFERS[existingIdx] = newOffer;
          } else {
            MOCK_MY_OFFERS.unshift(newOffer);
          }

          if (onSubmitSuccess) {
            onSubmitSuccess(offerData);
          }

          if (navigation?.navigate) {
            navigation.navigate("TransporterOfferSubmitted", { job, offerData });
          } else {
            setIsSubmitted(true);
          }
        } else if (response.status === 409) {
          // Duplicate pending offer
          showAlert(
            SUBMIT_OFFER_MESSAGES.api.duplicateOffer.title,
            json.message || SUBMIT_OFFER_MESSAGES.api.duplicateOffer.message,
            {
              type: "warning",
              primaryButtonText: SUBMIT_OFFER_MESSAGES.api.duplicateOffer.primaryButton,
            }
          );
        } else {
          showAlert(
            SUBMIT_OFFER_MESSAGES.api.submitError.title,
            json.message || SUBMIT_OFFER_MESSAGES.api.submitError.message,
            {
              type: "error",
              primaryButtonText: SUBMIT_OFFER_MESSAGES.api.submitError.primaryButton,
            }
          );
        }
      } catch (error) {
        console.log("Error submitting transport offer:", error);
        showAlert(
          SUBMIT_OFFER_MESSAGES.api.submitError.title,
          SUBMIT_OFFER_MESSAGES.api.submitError.message,
          {
            type: "error",
            primaryButtonText: SUBMIT_OFFER_MESSAGES.api.submitError.primaryButton,
          }
        );
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleSignOut = () => {
      setShowProfileModal(false);
      showAlert(
        SUBMIT_OFFER_MESSAGES.alerts.logOut.title,
        SUBMIT_OFFER_MESSAGES.alerts.logOut.message,
        {
          type: "warning",
          primaryButtonText: SUBMIT_OFFER_MESSAGES.alerts.logOut.primaryButton,
          secondaryButtonText: SUBMIT_OFFER_MESSAGES.alerts.logOut.secondaryButton,
          onPrimaryPress: () => {
            if (navigation?.canGoBack && navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation?.navigate("Welcome");
            }
          },
        }
      );
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
        className="flex-1 bg-[#F5F8F6] dark:bg-slate-900"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={isDark ? "#0F172A" : "#F5F8F6"}
        />

        {/* ================= TOP HEADER ================= */}
        <SafeAreaView edges={["top"]} className="bg-[#F5F8F6] dark:bg-slate-900">
          <View
            style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
            className={`px-4 sm:px-5 flex-row items-center justify-between ${isSmallDevice ? "pt-1 pb-2" : "pt-2 pb-2.5"
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
                  color={isDark ? "#FFFFFF" : "#0F172A"}
                />
              </TouchableOpacity>

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                className={`font-black text-[#0F172A] dark:text-white tracking-tight flex-1 ${isExtraSmall
                    ? "text-[16px]"
                    : isSmallDevice
                      ? "text-[18px]"
                      : "text-[20px]"
                  }`}
              >
                {SUBMIT_OFFER_TEXTS.headerTitle}
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
                  color={colors.iconMuted}
                />
                <View className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </TouchableOpacity>

              {/* Profile Avatar Pill */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowProfileModal(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className={`rounded-full bg-[#E68A00] items-center justify-center shadow-2xs overflow-hidden ${isExtraSmall ? "h-8 w-8" : isSmallDevice ? "h-8.5 w-8.5" : "h-9 w-9"
                  }`}
              >
                {profile.avatarUri ? (
                  <Image
                    source={{ uri: profile.avatarUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text
                    className={`text-white font-black ${isExtraSmall ? "text-xs" : isSmallDevice ? "text-xs" : "text-sm"
                      }`}
                  >
                    {profile.avatarLetter}
                  </Text>
                )}
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
            {/* ================= 1. JOB SUMMARY CARD ================= */}
            <View
              className={`rounded-3xl bg-[#FFFDF5] dark:bg-slate-800 border border-[#FDE68A] dark:border-slate-700 shadow-xs ${isExtraSmall ? "p-3.5" : isSmallDevice ? "p-4" : "p-4 sm:p-5"
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
                className="text-xs sm:text-[13px] font-bold text-[#D97706] dark:text-amber-400 tracking-wider uppercase"
                numberOfLines={1}
              >
                {getJobIdDisplay(job.id)}
              </Text>

              {/* Crop Name & Weight */}
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                className={`font-black text-[#0F172A] dark:text-white tracking-tight mt-1 mb-2 sm:mb-2.5 ${isExtraSmall
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
                  className="text-xs sm:text-[13px] text-gray-700 dark:text-slate-300 font-medium flex-1 leading-snug"
                >
                  {getPickupAddress(job)}
                </Text>
              </View>

              {/* Route details: Dropoff */}
              <View className="flex-row items-start mt-1.5">
                <View className="h-2 w-2 rounded-full bg-[#EF4444] mr-2.5 mt-1.5 shrink-0" />
                <Text
                  numberOfLines={2}
                  className="text-xs sm:text-[13px] text-gray-700 dark:text-slate-300 font-medium flex-1 leading-snug"
                >
                  {getDeliveryAddress(job)}
                </Text>
              </View>

              {/* Date & Time */}
              <View className="flex-row items-center mt-2 sm:mt-2.5">
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={colors.iconMuted}
                  style={{ marginRight: 6 }}
                />
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                  className="text-xs sm:text-[12.5px] text-gray-500 dark:text-slate-400 font-medium flex-1"
                >
                  {getTimeString(job)}
                </Text>
              </View>

              {/* Special Instructions Callout */}
              <View className="rounded-xl bg-[#FEF9C3] dark:bg-amber-950/40 border border-transparent dark:border-amber-700/40 p-2.5 sm:p-3 mt-2.5 sm:mt-3">
                <Text className="text-[11px] sm:text-xs text-[#B45309] dark:text-amber-300 font-medium leading-relaxed">
                  {getSpecialInstructions(job)}
                </Text>
              </View>
            </View>

            {/* ================= 2. YOUR OFFER FORM CARD ================= */}
            <View
              className={`rounded-3xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm mt-3.5 sm:mt-4 ${isExtraSmall ? "p-3.5" : isSmallDevice ? "p-4 sm:p-5" : "p-5 sm:p-6"
                }`}
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <Text
                className={`font-black text-[#0F172A] dark:text-white tracking-tight mb-3 sm:mb-4 ${isExtraSmall
                    ? "text-[16px]"
                    : isSmallDevice
                      ? "text-[17px]"
                      : "text-[19px]"
                  }`}
              >
                {SUBMIT_OFFER_TEXTS.formSection.title}
              </Text>

              {/* Field 1: Transportation Cost */}
              <View className="mb-3.5 sm:mb-4">
                <Text className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                  {SUBMIT_OFFER_TEXTS.formSection.costLabel}{" "}
                  <Text className="text-gray-700 dark:text-slate-300">
                    {SUBMIT_OFFER_TEXTS.formSection.costRequiredAsterisk}
                  </Text>
                </Text>
                <TextInput
                  value={cost}
                  onChangeText={(text) => {
                    setCost(text);
                    if (costError) setCostError("");
                  }}
                  placeholder={SUBMIT_OFFER_PLACEHOLDERS.cost}
                  placeholderTextColor={colors.textFaint}
                  keyboardType="numeric"
                  className={`w-full rounded-2xl border ${costError
                      ? "border-red-500 bg-red-50/20 dark:bg-red-950/20"
                      : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    } px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 dark:text-white font-semibold`}
                />
                {costError ? (
                  <Text className="text-xs text-red-500 font-semibold mt-1.5 ml-1">
                    {costError}
                  </Text>
                ) : null}
              </View>

              {/* Field 2: Estimated Delivery Date & Time */}
              <View className="mb-3.5 sm:mb-4">
                <Text className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                  {SUBMIT_OFFER_TEXTS.formSection.deliveryTimeLabel}
                </Text>
                <TextInput
                  value={deliveryTime}
                  onChangeText={setDeliveryTime}
                  placeholder={getTimeString(job) || SUBMIT_OFFER_PLACEHOLDERS.defaultDeliveryTime}
                  placeholderTextColor={colors.textFaint}
                  className="w-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 dark:text-white font-medium"
                />
              </View>

              {/* Field 3: Additional Notes */}
              <View>
                <Text className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                  {SUBMIT_OFFER_TEXTS.formSection.additionalNotesLabel}
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder={SUBMIT_OFFER_PLACEHOLDERS.notes}
                  placeholderTextColor={colors.textFaint}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="w-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 dark:text-white font-medium min-h-[80px] sm:min-h-[96px]"
                />
              </View>
            </View>

            {/* ================= 3. ACTION BUTTONS: CANCEL & SUBMIT OFFER ================= */}
            <View className="flex-row items-center gap-2.5 sm:gap-3 mt-3.5 sm:mt-4 w-full">
              {/* Cancel Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleGoBack}
                className="flex-1 py-3 sm:py-3.5 rounded-2xl bg-white dark:bg-slate-700 border border-gray-200/90 dark:border-slate-600 items-center justify-center shadow-2xs"
              >
                <Text className="text-xs sm:text-base font-bold text-gray-800 dark:text-slate-200">
                  {SUBMIT_OFFER_TEXTS.buttons.cancel}
                </Text>
              </TouchableOpacity>

              {/* Submit Offer Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={isSubmitting}
                onPress={handleSubmitOffer}
                className={`flex-1 py-3 sm:py-3.5 rounded-2xl bg-[#FF8C00] flex-row items-center justify-center shadow-xs ${isSubmitting ? "opacity-75" : ""
                  }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
                ) : null}
                <Text className="text-xs sm:text-base font-bold text-white">
                  {isSubmitting
                    ? SUBMIT_OFFER_TEXTS.buttons.submitting
                    : SUBMIT_OFFER_TEXTS.buttons.submitOffer}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SmoothScrollView>

        {/* ================= BOTTOM NAVIGATION BAR (Auto-hides on keyboard) ================= */}
        {!isKeyboardVisible && (
          <SafeAreaView
            edges={["bottom"]}
            className="bg-white dark:bg-slate-800 border-t border-gray-200/60 dark:border-slate-700"
          >
            <View
              style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
              className={`flex-row items-center justify-around ${isSmallDevice ? "pt-1.5 pb-0.5" : "pt-2 pb-1"
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
                  color={colors.iconMuted}
                />
                <Text
                  className={`mt-0.5 ${isSmallDevice ? "text-[10px]" : "text-[11px]"
                    } font-medium text-[#9CA3AF] dark:text-slate-400`}
                >
                  {SUBMIT_OFFER_TEXTS.bottomTabs.home}
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
                  className={`mt-0.5 ${isSmallDevice ? "text-[10px]" : "text-[11px]"
                    } font-bold text-[#E68A00]`}
                >
                  {SUBMIT_OFFER_TEXTS.bottomTabs.jobs}
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
                  color={colors.iconMuted}
                />
                <Text
                  className={`mt-0.5 ${isSmallDevice ? "text-[10px]" : "text-[11px]"
                    } font-medium text-[#9CA3AF] dark:text-slate-400`}
                >
                  {SUBMIT_OFFER_TEXTS.bottomTabs.active}
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
                  color={colors.iconMuted}
                />
                <Text
                  className={`mt-0.5 ${isSmallDevice ? "text-[10px]" : "text-[11px]"
                    } font-medium text-[#9CA3AF] dark:text-slate-400`}
                >
                  {SUBMIT_OFFER_TEXTS.bottomTabs.profile}
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
          <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#F9FAFB] dark:bg-slate-900">
            <View
              style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
              className="px-4 sm:px-5 py-3 sm:py-3.5 flex-row items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800"
            >
              <Text className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {SUBMIT_OFFER_TEXTS.profileModal.title}
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
                <View className="rounded-2xl bg-white dark:bg-slate-800 p-4 sm:p-5 border border-gray-100 dark:border-slate-700 shadow-2xs items-center mb-4">
                  <View
                    className={`rounded-full bg-[#E68A00] items-center justify-center mb-2 overflow-hidden ${isSmallDevice ? "h-14 w-14" : "h-16 w-16"
                      }`}
                  >
                    {profile.avatarUri ? (
                      <Image
                        source={{ uri: profile.avatarUri }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text
                        className={`font-black text-white ${isSmallDevice ? "text-xl" : "text-2xl"
                          }`}
                      >
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
                    ⭐ {profile.rating.toFixed(1)} {SUBMIT_OFFER_TEXTS.profileModal.ratingSuffix} ({profile.completedJobs}{" "}
                    {SUBMIT_OFFER_TEXTS.profileModal.completedTripsSuffix})
                  </Text>
                </View>

                {/* Vehicle details */}
                <View className="rounded-2xl bg-white dark:bg-slate-800 p-3.5 sm:p-4 border border-gray-100 dark:border-slate-700 shadow-2xs mb-4">
                  <Text className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">
                    {SUBMIT_OFFER_TEXTS.profileModal.registeredVehicleSection}
                  </Text>
                  <View className="space-y-1.5 gap-1.5">
                    <Text className="text-xs text-gray-700 dark:text-slate-300">
                      🚚 <Text className="font-semibold">{SUBMIT_OFFER_TEXTS.profileModal.typeLabel}</Text>{" "}
                      {profile.vehicleType}
                    </Text>
                    <Text className="text-xs text-gray-700 dark:text-slate-300">
                      🔢 <Text className="font-semibold">{SUBMIT_OFFER_TEXTS.profileModal.plateLabel}</Text>{" "}
                      {profile.vehiclePlate}
                    </Text>
                    <Text className="text-xs text-gray-700 dark:text-slate-300">
                      🛡️ <Text className="font-semibold">{SUBMIT_OFFER_TEXTS.profileModal.statusLabel}</Text>{" "}
                      {SUBMIT_OFFER_TEXTS.profileModal.verifiedBadge}
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
                          {SUBMIT_OFFER_TEXTS.profileModal.darkModeTitle}
                        </Text>
                        <Text className="text-[10.5px] text-gray-500 dark:text-slate-400">
                          {isDark
                            ? SUBMIT_OFFER_TEXTS.profileModal.darkModeActive
                            : SUBMIT_OFFER_TEXTS.profileModal.lightModeActive}
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={isDark}
                      onValueChange={toggleDarkMode}
                      trackColor={{ false: "#D1D5DB", true: "#E68A00" }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>

                {/* Sign Out Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSignOut}
                  className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 py-3 sm:py-3.5 items-center justify-center mt-2"
                >
                  <Text className="text-sm font-bold text-red-600 dark:text-red-400">
                    {SUBMIT_OFFER_TEXTS.profileModal.logOutButton}
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
