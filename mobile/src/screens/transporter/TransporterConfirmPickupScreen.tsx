import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
  Alert,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  SmoothScrollView,
  ThemedAlertModal,
  ThemedAlertModalType,
} from "../../components/common";
import { useTransporterTheme } from "../../context/TransporterThemeContext";

// Data
import {
  MOCK_ACTIVE_JOB,
  MOCK_TRANSPORTER_PROFILE,
  ActiveTransportJob,
  TransporterProfile,
} from "./data";

export interface TransporterConfirmPickupScreenProps {
  navigation?: any;
  route?: {
    params?: {
      job?: ActiveTransportJob;
    };
  };
  job?: ActiveTransportJob;
  onSelectTab?: (tab: "home" | "jobs" | "active" | "profile") => void;
  activeTab?: "home" | "jobs" | "active" | "profile";
  onBack?: () => void;
  onConfirmSuccess?: (job: ActiveTransportJob) => void;
}

export const TransporterConfirmPickupScreen: React.FC<
  TransporterConfirmPickupScreenProps
> = ({
  navigation,
  route,
  job: propJob,
  onSelectTab,
  activeTab = "active",
  onBack,
  onConfirmSuccess,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { isDark, colors } = useTransporterTheme();

  // Responsive breakpoints
  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;

  // Initial job data
  const initialJob: ActiveTransportJob =
    route?.params?.job || propJob || MOCK_ACTIVE_JOB;
  const [currentJob, setCurrentJob] = useState<ActiveTransportJob>(initialJob);
  const [profile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);

  // Form states
  const getFormattedNow = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} · ${timeStr}`;
  };

  const [timestamp, setTimestamp] = useState<string>(getFormattedNow());
  const [notes, setNotes] = useState<string>("");
  const [proofPhotoUri, setProofPhotoUri] = useState<string | null>(null);

  // Modals & Feedback
  const [showSourceModal, setShowSourceModal] = useState<boolean>(false);
  const [showPhotoPreviewModal, setShowPhotoPreviewModal] =
    useState<boolean>(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);

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
      type: options?.type || "info",
      primaryButtonText: options?.primaryButtonText || "OK",
      onPrimaryPress: options?.onPrimaryPress,
      secondaryButtonText: options?.secondaryButtonText,
      onSecondaryPress: options?.onSecondaryPress,
    });
  };

  // Header Back Button
  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate("TransporterActiveJob");
    }
  };

  // Tab Press Navigation
  const handleTabPress = (tab: "home" | "jobs" | "active" | "profile") => {
    if (onSelectTab) {
      onSelectTab(tab);
    } else if (tab === "home") {
      navigation?.navigate?.("TransporterHome");
    } else if (tab === "jobs") {
      navigation?.navigate?.("TransporterAvailableJobs");
    } else if (tab === "active") {
      navigation?.navigate?.("TransporterActiveJob");
    } else if (tab === "profile") {
      navigation?.navigate?.("TransporterProfile");
    }
  };

  const handleNotificationPress = () => {
    if (navigation?.navigate) {
      navigation.navigate("TransporterNotifications");
    }
  };

  // Photo handlers
  const handleTakePhoto = async () => {
    setShowSourceModal(false);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showAlert(
          "Camera Permission Required",
          "Green-Hive needs camera access to capture proof photo of the loaded cargo. Please allow camera access in your device settings.",
          { type: "warning" }
        );
        return;
      }

      setIsProcessingPhoto(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProofPhotoUri(result.assets[0].uri);
      }
    } catch (err) {
      showAlert(
        "Camera Error",
        "Could not launch camera. Please check your device settings or choose from gallery.",
        { type: "error" }
      );
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handlePickFromGallery = async () => {
    setShowSourceModal(false);
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert(
          "Gallery Permission Required",
          "Green-Hive needs photo library access to select proof of cargo pickup. Please allow photo library access in your settings.",
          { type: "warning" }
        );
        return;
      }

      setIsProcessingPhoto(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProofPhotoUri(result.assets[0].uri);
      }
    } catch (err) {
      showAlert(
        "Gallery Error",
        "Could not access photos. Please check device permissions and try again.",
        { type: "error" }
      );
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  // Sample photo for quick simulator/demo testing
  const handleUseSampleProof = () => {
    setShowSourceModal(false);
    // Use high quality produce image from Unsplash
    setProofPhotoUri(
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"
    );
  };

  const handleRemovePhoto = () => {
    setProofPhotoUri(null);
  };

  // Confirm Pickup action
  const handleConfirmPickup = () => {
    const updatedJob: ActiveTransportJob = {
      ...currentJob,
      status: "In Transit",
      proofPhotoUri: proofPhotoUri || undefined,
      pickupTimestamp: timestamp,
      pickupNotes: notes.trim() || undefined,
    };

    // Update global mock for persistence
    Object.assign(MOCK_ACTIVE_JOB, updatedJob);
    setCurrentJob(updatedJob);

    showAlert(
      "Pickup Confirmed!",
      `Cargo has been verified and successfully loaded at ${
        currentJob.pickup || "the farm"
      }. Job status is now 'In Transit'. Please proceed to ${currentJob.dropoff}.`,
      {
        type: "success",
        primaryButtonText: "View Trip",
        onPrimaryPress: () => {
          if (onConfirmSuccess) {
            onConfirmSuccess(updatedJob);
          } else if (navigation?.navigate) {
            navigation.navigate("TransporterActiveJob", { job: updatedJob });
          } else {
            handleGoBack();
          }
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-[#F5F8F6] dark:bg-slate-900">
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0F172A" : "#F5F8F6"}
      />

      {/* ================= 1. HEADER ================= */}
      <SafeAreaView edges={["top"]} className="bg-[#F5F8F6] dark:bg-slate-900">
        <View
          style={{ maxWidth: 540, width: "100%", alignSelf: "center" }}
          className={`flex-row items-center justify-between px-4 sm:px-5 ${
            isSmallDevice ? "py-2" : "py-2.5"
          }`}
        >
          {/* Left: Back Arrow and Title */}
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGoBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="p-1 -ml-1 mr-2.5 rounded-full"
            >
              <Ionicons
                name="arrow-back"
                size={isExtraSmall ? 22 : 24}
                color={isDark ? "#FFFFFF" : "#1E293B"}
              />
            </TouchableOpacity>
            <Text
              className={`font-bold text-[#1E293B] dark:text-white ${
                isExtraSmall ? "text-lg" : "text-xl"
              }`}
            >
              Confirm Pickup
            </Text>
          </View>

          {/* Right: Notification Bell & Profile Avatar */}
          <View className="flex-row items-center space-x-2.5 gap-2.5">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleNotificationPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="items-center justify-center relative p-1.5"
            >
              <Ionicons
                name="notifications-outline"
                size={isExtraSmall ? 22 : 24}
                color={isDark ? "#94A3B8" : "#64748B"}
              />
              {/* Unread indicator red dot */}
              <View className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-slate-900" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleTabPress("profile")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="items-center justify-center rounded-full bg-[#E68A00] h-9 w-9 shadow-xs overflow-hidden"
            >
              {profile.avatarUri ? (
                <Image
                  source={{ uri: profile.avatarUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="font-black text-white text-sm">
                  {profile.avatarLetter || "R"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* ================= 2. MAIN SCROLLABLE CONTENT ================= */}
      <SmoothScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: screenWidth < 360 ? 12 : 16,
          paddingTop: 8,
          paddingBottom: 28,
          alignItems: "center",
        }}
      >
        <View style={{ maxWidth: 540, width: "100%" }}>
          {/* Farm Pickup Banner Card */}
          <View className="rounded-2xl bg-[#EDFAF2] dark:bg-emerald-950/30 border border-[#B9F0D2] dark:border-emerald-800/50 p-3.5 sm:p-4 mb-3.5">
            <View className="flex-row items-center">
              <Text className="text-base mr-2">📦</Text>
              <Text className="text-[14.5px] sm:text-[15px] font-bold text-[#166534] dark:text-emerald-400">
                Confirm Pickup at Farm
              </Text>
            </View>
            <Text className="text-[12.5px] sm:text-[13px] font-medium text-[#16A34A] dark:text-emerald-300 mt-1 pl-6">
              {currentJob.pickup || "Nuwara Eliya Farm, Hanguranketha Road"}
            </Text>
          </View>

          {/* Cargo Details Card */}
          <View className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-gray-100 dark:border-slate-700/80 shadow-2xs mb-4">
            <Text className="text-[15px] sm:text-base font-bold text-[#1E293B] dark:text-white mb-3">
              Cargo Details
            </Text>

            <View className="flex-row items-center">
              {/* Product */}
              <View className="flex-1">
                <Text className="text-xs text-[#64748B] dark:text-slate-400 mb-1">
                  Product
                </Text>
                <Text className="text-[14.5px] sm:text-[15px] font-bold text-[#1E293B] dark:text-white">
                  {currentJob.cropName || "Fresh Cabbage"}
                </Text>
              </View>

              {/* Quantity */}
              <View className="flex-1">
                <Text className="text-xs text-[#64748B] dark:text-slate-400 mb-1">
                  Quantity
                </Text>
                <Text className="text-[14.5px] sm:text-[15px] font-bold text-[#1E293B] dark:text-white">
                  {currentJob.weight || "100 kg"}
                </Text>
              </View>
            </View>
          </View>

          {/* Timestamp Input Section */}
          <View className="mb-4">
            <Text className="text-[13.5px] sm:text-sm font-semibold text-[#334155] dark:text-slate-200 mb-1.5">
              Timestamp
            </Text>
            <View className="flex-row items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-3 shadow-2xs">
              <TextInput
                value={timestamp}
                onChangeText={setTimestamp}
                placeholder="Pickup date and time"
                placeholderTextColor="#94A3B8"
                className="flex-1 text-[13.5px] sm:text-sm text-[#1E293B] dark:text-white p-0"
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setTimestamp(getFormattedNow())}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="pl-2"
              >
                <Ionicons
                  name="time-outline"
                  size={19}
                  color={isDark ? "#94A3B8" : "#64748B"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes (optional) Section */}
          <View className="mb-4">
            <Text className="text-[13.5px] sm:text-sm font-semibold text-[#334155] dark:text-slate-200 mb-1.5">
              Notes (optional)
            </Text>
            <View className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3.5 shadow-2xs">
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Any observations or notes..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="text-[13.5px] sm:text-sm text-[#1E293B] dark:text-white p-0 min-h-[80px]"
              />
            </View>
          </View>

          {/* Upload Proof Photo Section */}
          <View className="mb-5">
            {proofPhotoUri ? (
              /* Uploaded Image Preview */
              <View className="rounded-2xl bg-white dark:bg-slate-800 p-3.5 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
                <View className="flex-row items-center justify-between mb-2.5">
                  <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                    <Ionicons
                      name="checkmark-circle"
                      size={15}
                      color="#059669"
                    />
                    <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 ml-1.5">
                      Proof Photo Attached
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleRemovePhoto}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    className="flex-row items-center px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950/30"
                  >
                    <Ionicons name="trash-outline" size={14} color="#EF4444" />
                    <Text className="text-xs font-bold text-red-500 ml-1">
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Image Display */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setShowPhotoPreviewModal(true)}
                  className="rounded-xl overflow-hidden h-44 sm:h-52 bg-slate-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 relative"
                >
                  <Image
                    source={{ uri: proofPhotoUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-2 right-2 bg-black/60 px-2.5 py-1 rounded-md flex-row items-center">
                    <Ionicons name="expand-outline" size={13} color="#FFFFFF" />
                    <Text className="text-[11px] text-white font-medium ml-1">
                      Tap to enlarge
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Change photo button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowSourceModal(true)}
                  className="mt-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 items-center justify-center flex-row"
                >
                  <Ionicons
                    name="camera-outline"
                    size={16}
                    color={isDark ? "#E2E8F0" : "#4B5563"}
                  />
                  <Text className="text-xs font-semibold text-gray-700 dark:text-slate-200 ml-1.5">
                    Retake / Change Photo
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Empty Upload Box matching screenshot */
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setShowSourceModal(true)}
                disabled={isProcessingPhoto}
                className="rounded-2xl border-2 border-dashed border-[#CBD5E1] dark:border-slate-600 bg-[#F8FAFC] dark:bg-slate-800/40 py-8 px-4 items-center justify-center shadow-2xs"
              >
                <View className="items-center justify-center">
                  <Ionicons name="camera-outline" size={42} color="#94A3B8" />
                  <Text className="text-[15px] font-semibold text-[#475569] dark:text-slate-300 mt-2.5">
                    Upload Proof Photo
                  </Text>
                  <Text className="text-xs text-[#94A3B8] dark:text-slate-400 mt-1">
                    Optional but recommended
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Confirm Pickup Action Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleConfirmPickup}
            className="rounded-2xl bg-[#FF9800] py-3.5 sm:py-4 items-center justify-center shadow-sm active:scale-[0.99] transition-transform"
          >
            <Text className="text-base font-bold text-white tracking-wide">
              Confirm Pickup
            </Text>
          </TouchableOpacity>
        </View>
      </SmoothScrollView>

      {/* ================= 3. BOTTOM TAB NAVIGATION ================= */}
      <SafeAreaView
        edges={["bottom"]}
        className="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800"
      >
        <View
          style={{ maxWidth: 540, width: "100%", alignSelf: "center" }}
          className={`flex-row justify-around items-center ${
            isSmallDevice ? "py-1.5" : "py-2"
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
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-medium text-[#9CA3AF] dark:text-slate-400`}
            >
              Home
            </Text>
          </TouchableOpacity>

          {/* Jobs Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("jobs")}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name="location-outline"
              size={isSmallDevice ? 20 : 22}
              color={colors.iconMuted}
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-medium text-[#9CA3AF] dark:text-slate-400`}
            >
              Jobs
            </Text>
          </TouchableOpacity>

          {/* Active Tab (Highlighted Active with orange bar) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("active")}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name="bus"
              size={isSmallDevice ? 20 : 22}
              color="#FF8C00"
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-bold text-[#FF8C00]`}
            >
              Active
            </Text>
            {/* Active Indicator Underline */}
            <View className="h-0.5 w-5 bg-[#FF8C00] rounded-full mt-0.5" />
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
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-medium text-[#9CA3AF] dark:text-slate-400`}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ================= 4. PHOTO SOURCE SELECTION MODAL ================= */}
      <Modal
        visible={showSourceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSourceModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowSourceModal(false)}
          className="flex-1 bg-black/50 justify-end sm:justify-center items-center p-4"
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{ maxWidth: 420, width: "100%" }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-xl border border-gray-100 dark:border-slate-700"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Add Proof Photo
                </Text>
                <Text className="text-xs text-gray-500 dark:text-slate-400">
                  Select an option to capture or upload loaded cargo proof
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowSourceModal(false)}
                className="h-8 w-8 rounded-full bg-gray-100 dark:bg-slate-700 items-center justify-center"
              >
                <Ionicons
                  name="close"
                  size={18}
                  color={isDark ? "#CBD5E1" : "#4B5563"}
                />
              </TouchableOpacity>
            </View>

            {/* Option 1: Camera */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleTakePhoto}
              className="flex-row items-center p-3.5 mb-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40"
            >
              <View className="h-10 w-10 rounded-xl bg-[#FF9800] items-center justify-center mr-3.5">
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                  Take Photo with Camera
                </Text>
                <Text className="text-xs text-gray-500 dark:text-slate-400">
                  Capture cargo picture on-site
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.iconMuted}
              />
            </TouchableOpacity>

            {/* Option 2: Gallery */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePickFromGallery}
              className="flex-row items-center p-3.5 mb-2.5 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-gray-200 dark:border-slate-600/60"
            >
              <View className="h-10 w-10 rounded-xl bg-blue-500 items-center justify-center mr-3.5">
                <Ionicons name="images" size={20} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                  Choose from Gallery
                </Text>
                <Text className="text-xs text-gray-500 dark:text-slate-400">
                  Select existing photo from device
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.iconMuted}
              />
            </TouchableOpacity>

            {/* Option 3: Sample Proof Photo */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleUseSampleProof}
              className="flex-row items-center p-3.5 mb-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40"
            >
              <View className="h-10 w-10 rounded-xl bg-[#059669] items-center justify-center mr-3.5">
                <Ionicons name="leaf" size={20} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                  Use Sample Cargo Photo
                </Text>
                <Text className="text-xs text-gray-500 dark:text-slate-400">
                  Quick demo proof for simulator
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.iconMuted}
              />
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowSourceModal(false)}
              className="py-3 rounded-xl bg-gray-100 dark:bg-slate-700 items-center justify-center"
            >
              <Text className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-200">
                Cancel
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ================= 5. FULL PHOTO ENLARGED PREVIEW MODAL ================= */}
      <Modal
        visible={showPhotoPreviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoPreviewModal(false)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center p-4">
          <SafeAreaView edges={["top"]} className="w-full">
            <View className="flex-row items-center justify-between py-2 px-2">
              <Text className="text-white font-bold text-base">
                Pickup Cargo Proof
              </Text>
              <TouchableOpacity
                onPress={() => setShowPhotoPreviewModal(false)}
                className="h-9 w-9 rounded-full bg-white/20 items-center justify-center"
              >
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <View className="flex-1 w-full justify-center items-center">
            {proofPhotoUri && (
              <Image
                source={{ uri: proofPhotoUri }}
                className="w-full h-full max-h-[70vh] rounded-2xl"
                resizeMode="contain"
              />
            )}
          </View>

          <SafeAreaView edges={["bottom"]} className="w-full">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowPhotoPreviewModal(false)}
              className="py-3 rounded-xl bg-white/20 items-center justify-center mt-2"
            >
              <Text className="text-white font-bold text-sm">Close Preview</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ================= 6. THEMED ALERT MODAL ================= */}
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
    </View>
  );
};

export default TransporterConfirmPickupScreen;
