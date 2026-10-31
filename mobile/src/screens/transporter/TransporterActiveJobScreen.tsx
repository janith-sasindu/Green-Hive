import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Modal,
  Switch,
  useWindowDimensions,
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
  MOCK_ACTIVE_JOB,
  MOCK_TRANSPORTER_PROFILE,
  MOCK_NOTIFICATIONS,
  ActiveTransportJob,
  TransporterProfile,
  TransporterNotificationItem,
} from "./data";

export interface TransporterActiveJobScreenProps {
  navigation?: any;
  route?: {
    params?: {
      job?: ActiveTransportJob;
    };
  };
  job?: ActiveTransportJob;
  onSelectTab?: (tab: "home" | "jobs" | "active" | "profile") => void;
  activeTab?: "home" | "jobs" | "active" | "profile";
  onPressNotifications?: () => void;
}

export const TransporterActiveJobScreen: React.FC<
  TransporterActiveJobScreenProps
> = ({
  navigation,
  route,
  job: propJob,
  onSelectTab,
  activeTab = "active",
  onPressNotifications,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { isDark, toggleDarkMode, colors } = useTransporterTheme();

  // Responsive Breakpoints
  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;
  const isTablet = screenWidth >= 600;

  const initialJob: ActiveTransportJob =
    route?.params?.job || propJob || MOCK_ACTIVE_JOB;
  const [currentJob, setCurrentJob] = useState<ActiveTransportJob>(initialJob);

  React.useEffect(() => {
    if (route?.params?.job) {
      setCurrentJob(route.params.job);
    }
  }, [route?.params?.job]);
  const [profile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);
  const avatarUri = MOCK_TRANSPORTER_PROFILE.avatarUri || profile.avatarUri;
  const [notificationsList] =
    useState<TransporterNotificationItem[]>(MOCK_NOTIFICATIONS);

  // Modals & Feedback
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
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

  // Status Colors & Badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return {
          bg: isDark ? "bg-amber-950/60 border border-amber-800/40" : "bg-[#FEF3C7]",
          text: isDark ? "text-amber-300" : "text-[#D97706]",
          dot: isDark ? "bg-amber-400" : "bg-[#D97706]",
        };
      case "At Pickup":
        return {
          bg: isDark ? "bg-blue-950/60 border border-blue-800/40" : "bg-[#EFF6FF]",
          text: isDark ? "text-blue-300" : "text-[#2563EB]",
          dot: isDark ? "bg-blue-400" : "bg-[#2563EB]",
        };
      case "In Transit":
        return {
          bg: isDark ? "bg-sky-950/60 border border-sky-800/40" : "bg-[#E0F2FE]",
          text: isDark ? "text-sky-300" : "text-[#0284C7]",
          dot: isDark ? "bg-sky-400" : "bg-[#0284C7]",
        };
      case "Delivered":
        return {
          bg: isDark ? "bg-emerald-950/60 border border-emerald-800/40" : "bg-[#DCFCE7]",
          text: isDark ? "text-emerald-300" : "text-[#16A34A]",
          dot: isDark ? "bg-emerald-400" : "bg-[#16A34A]",
        };
      default:
        return {
          bg: isDark ? "bg-amber-950/60 border border-amber-800/40" : "bg-[#FEF3C7]",
          text: isDark ? "text-amber-300" : "text-[#D97706]",
          dot: isDark ? "bg-amber-400" : "bg-[#D97706]",
        };
    }
  };

  const statusStyle = getStatusColor(currentJob.status);

  // Tab Navigation Handler
  const handleTabPress = (tab: "home" | "jobs" | "active" | "profile") => {
    if (tab === "active") {
      return; // Already on active tab
    }
    if (onSelectTab) {
      onSelectTab(tab);
    } else if (tab === "home") {
      navigation?.navigate?.("TransporterHome");
    } else if (tab === "jobs") {
      navigation?.navigate?.("TransporterAvailableJobs");
    } else if (tab === "profile") {
      navigation?.navigate?.("TransporterProfile");
    }
  };

  // Notification Button Handler
  const handleNotificationPress = () => {
    if (onPressNotifications) {
      onPressNotifications();
    } else if (navigation?.navigate) {
      navigation.navigate("TransporterNotifications");
    } else {
      setShowNotificationsModal(true);
    }
  };

  // Pickup Confirmation Action
  const handleConfirmPickup = () => {
    if (currentJob.status === "Delivered") {
      showAlert("Trip Completed", "This cargo delivery is already completed.", {
        type: "info",
      });
      return;
    }

    if (currentJob.status === "In Transit") {
      showAlert(
        "Cargo Already Picked Up",
        `You have already picked up ${currentJob.cropName} · ${currentJob.weight}. Currently in transit to ${currentJob.dropoff}.`,
        {
          type: "info",
          primaryButtonText: "View Pickup Details",
          secondaryButtonText: "Close",
          onPrimaryPress: () => {
            navigation?.navigate?.("TransporterConfirmPickup", { job: currentJob });
          },
        }
      );
      return;
    }

    if (navigation?.navigate) {
      navigation.navigate("TransporterConfirmPickup", { job: currentJob });
    }
  };

  // Delivery Confirmation Action
  const handleConfirmDelivery = () => {
    if (currentJob.status === "Delivered") {
      showAlert(
        "Job Already Delivered",
        `This shipment has already been successfully delivered and payment of ${currentJob.price} was released.`,
        {
          type: "success",
          primaryButtonText: "View Delivery Proof",
          secondaryButtonText: "Close",
          onPrimaryPress: () => {
            navigation?.navigate?.("TransporterConfirmDelivery", { job: currentJob });
          },
        }
      );
      return;
    }

    if (currentJob.status === "In Progress" || currentJob.status === "At Pickup") {
      showAlert(
        "Pickup Confirmation Required",
        "Please confirm cargo pickup at the farm before confirming delivery to the seller.",
        {
          type: "warning",
          primaryButtonText: "Confirm Pickup First",
          secondaryButtonText: "Proceed Anyway",
          onPrimaryPress: () => {
            navigation?.navigate?.("TransporterConfirmPickup", { job: currentJob });
          },
          onSecondaryPress: () => {
            navigation?.navigate?.("TransporterConfirmDelivery", { job: currentJob });
          },
        }
      );
      return;
    }

    if (navigation?.navigate) {
      navigation.navigate("TransporterConfirmDelivery", { job: currentJob });
    }
  };

  // Sign Out Handler
  const handleSignOut = () => {
    setShowProfileModal(false);
    showAlert(
      "Log Out",
      "Are you sure you want to log out of your transporter account?",
      {
        type: "warning",
        primaryButtonText: "Log Out",
        secondaryButtonText: "Cancel",
        onPrimaryPress: () => {
          if (navigation?.canGoBack && navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation?.navigate?.("Welcome");
          }
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-[#F4F7F5] dark:bg-slate-900">
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0F172A" : "#F4F7F5"}
      />

      {/* ================= 1. TOP HEADER ================= */}
      <SafeAreaView edges={["top"]} className="bg-[#F4F7F5] dark:bg-slate-900">
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className={`px-4 sm:px-5 flex-row items-center justify-between ${
            isSmallDevice ? "pt-1 pb-2" : "pt-2 pb-2.5"
          }`}
        >
          {/* Left: Green-Hive Logo & Title */}
          <View className="flex-row items-center flex-1 pr-2">
            <View
              className="mr-2.5 items-center justify-center"
              style={{
                width: isExtraSmall ? 33 : isSmallDevice ? 38 : 43,
                height: isExtraSmall ? 28 : isSmallDevice ? 32 : 36,
              }}
            >
              <Image
                source={require("../../assets/logo-icon.png")}
                resizeMode="contain"
                style={{
                  width: isExtraSmall ? 33 : isSmallDevice ? 38 : 43,
                  height: isExtraSmall ? 28 : isSmallDevice ? 32 : 36,
                }}
              />
            </View>
            <Text
              className={`font-black text-[#0F172A] dark:text-white tracking-tight ${
                isExtraSmall
                  ? "text-[16px]"
                  : isSmallDevice
                  ? "text-[17px]"
                  : "text-[19px]"
              }`}
            >
              Active Job
            </Text>
          </View>

          {/* Right: Notification Bell & Profile Avatar */}
          <View className="flex-row items-center space-x-2 sm:space-x-2.5 gap-2 sm:gap-2.5">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleNotificationPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className={`items-center justify-center rounded-xl bg-white/80 dark:bg-slate-800 border border-gray-200/60 dark:border-slate-700 shadow-2xs relative ${
                isExtraSmall ? "h-8 w-8" : isSmallDevice ? "h-9 w-9" : "h-10 w-10"
              }`}
            >
              <Ionicons
                name="notifications-outline"
                size={isExtraSmall ? 18 : isSmallDevice ? 20 : 21}
                color={colors.iconMuted}
              />
              {/* Unread indicator dot */}
              <View className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleTabPress("profile")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className={`items-center justify-center rounded-full bg-[#E68A00] shadow-2xs overflow-hidden ${
                isExtraSmall ? "h-8 w-8" : isSmallDevice ? "h-9 w-9" : "h-10 w-10"
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
                  className={`font-black text-white ${
                    isExtraSmall ? "text-xs" : "text-sm"
                  }`}
                >
                  {profile.avatarLetter}
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
          {/* Status Row: • In Progress and #GH-T1024 */}
          <View className="flex-row items-center justify-between mb-3.5 mt-1 px-0.5">
            <View
              className={`flex-row items-center px-3 py-1 rounded-full ${statusStyle.bg}`}
            >
              <View
                className={`h-2 w-2 rounded-full mr-1.5 ${statusStyle.dot}`}
              />
              <Text
                className={`text-[12px] font-bold ${statusStyle.text}`}
              >
                {currentJob.status}
              </Text>
            </View>

            <Text className="text-[13px] font-semibold text-[#6B7280] dark:text-slate-400">
              {currentJob.id}
            </Text>
          </View>

          {/* ================= CARD 1: CROP & ROUTE DETAILS ================= */}
          <View
            className={`rounded-3xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xs mb-3 ${
              isExtraSmall ? "p-3.5" : "p-4 sm:p-5"
            }`}
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            {/* Crop Header */}
            <Text
              className={`font-black text-[#111827] dark:text-white tracking-tight mb-3 sm:mb-3.5 ${
                isExtraSmall ? "text-[16px]" : "text-[18px]"
              }`}
            >
              {currentJob.cropName} · {currentJob.weight}
            </Text>

            {/* Sub-Card: Farmer / Pickup */}
            <View className="rounded-2xl bg-[#F0FDF4] dark:bg-emerald-950/30 p-3 sm:p-3.5 mb-2.5 border border-[#DCFCE7]/60 dark:border-emerald-800/40">
              <View className="flex-row items-center mb-1">
                <Ionicons name="person-outline" size={13.5} color="#16A34A" />
                <Text className="text-[11.5px] sm:text-xs font-bold text-[#16A34A] dark:text-emerald-400 ml-1.5">
                  Farmer / Pickup
                </Text>
              </View>
              <Text className="text-[14px] sm:text-[15px] font-bold text-[#111827] dark:text-slate-100">
                {currentJob.farmerName}
              </Text>
              <Text className="text-[11.5px] sm:text-xs text-[#6B7280] dark:text-slate-400 font-normal mt-0.5">
                {currentJob.pickup}
              </Text>
            </View>

            {/* Sub-Card: Seller / Delivery */}
            <View className="rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/30 p-3 sm:p-3.5 border border-[#DBEAFE]/60 dark:border-blue-800/40">
              <View className="flex-row items-center mb-1">
                <Ionicons name="person-outline" size={13.5} color="#2563EB" />
                <Text className="text-[11.5px] sm:text-xs font-bold text-[#2563EB] dark:text-blue-400 ml-1.5">
                  Seller / Delivery
                </Text>
              </View>
              <Text className="text-[14px] sm:text-[15px] font-bold text-[#111827] dark:text-slate-100">
                {currentJob.sellerName || "Colombo Fresh Market"}
              </Text>
              <Text className="text-[11.5px] sm:text-xs text-[#6B7280] dark:text-slate-400 font-normal mt-0.5">
                {currentJob.dropoff}
              </Text>
            </View>

            {/* Sub-Card: Pickup Proof Photo */}
            {currentJob.proofPhotoUri && (
              <View className="rounded-2xl bg-[#F0FDF4] dark:bg-emerald-950/30 p-3 sm:p-3.5 mt-2.5 border border-[#DCFCE7]/60 dark:border-emerald-800/40">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Ionicons name="camera-outline" size={13.5} color="#16A34A" />
                    <Text className="text-[11.5px] sm:text-xs font-bold text-[#16A34A] dark:text-emerald-400 ml-1.5">
                      Pickup Proof Attached
                    </Text>
                  </View>
                  {currentJob.pickupTimestamp && (
                    <Text className="text-[10.5px] text-[#6B7280] dark:text-slate-400">
                      {currentJob.pickupTimestamp}
                    </Text>
                  )}
                </View>
                <Image
                  source={{ uri: currentJob.proofPhotoUri }}
                  className="w-full h-36 rounded-xl"
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Sub-Card: Delivery Proof Photo & Notes */}
            {currentJob.deliveryProofPhotoUri && (
              <View className="rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/30 p-3 sm:p-3.5 mt-2.5 border border-[#DBEAFE]/60 dark:border-blue-800/40">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-done-circle" size={15} color="#2563EB" />
                    <Text className="text-[11.5px] sm:text-xs font-bold text-[#2563EB] dark:text-blue-400 ml-1.5">
                      Delivery Proof & Handover
                    </Text>
                  </View>
                  {currentJob.deliveryTimestamp && (
                    <Text className="text-[10.5px] text-[#6B7280] dark:text-slate-400">
                      {currentJob.deliveryTimestamp}
                    </Text>
                  )}
                </View>
                <Image
                  source={{ uri: currentJob.deliveryProofPhotoUri }}
                  className="w-full h-36 rounded-xl"
                  resizeMode="cover"
                />
                {currentJob.deliveryNotes && (
                  <View className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-900/50">
                    <Text className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium italic">
                      Note: "{currentJob.deliveryNotes}"
                    </Text>
                  </View>
                )}
                {currentJob.receiverName && (
                  <Text className="text-[11px] text-[#1E293B] dark:text-slate-200 font-semibold mt-1">
                    Received by: {currentJob.receiverName}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* ================= CARD 2: YOUR EARNINGS ================= */}
          <View
            className={`rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xs mb-3 ${
              isExtraSmall ? "p-3.5" : "p-4 sm:p-4.5"
            }`}
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Text className="text-[11.5px] sm:text-xs text-[#9CA3AF] dark:text-slate-400 font-medium">
              Your Earnings
            </Text>
            <Text
              className={`font-black text-[#16A34A] dark:text-emerald-400 tracking-tight mt-1 mb-1.5 ${
                isExtraSmall ? "text-[22px]" : "text-[26px]"
              }`}
            >
              {currentJob.price}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-xs mr-1 text-[#6B7280]">🔒</Text>
              <Text className="text-[11.5px] sm:text-xs text-[#6B7280] dark:text-slate-400 font-medium">
                Held by Green Hive · Released on delivery
              </Text>
            </View>
          </View>

          {/* ================= CARD 3: SPECIAL INSTRUCTIONS ================= */}
          <View className="rounded-2xl bg-[#FFFDF0] dark:bg-amber-950/30 border border-[#FDE68A] dark:border-amber-700/50 p-3.5 sm:p-4 mb-5">
            <Text className="text-[12px] sm:text-[13px] font-bold text-[#D97706] dark:text-amber-400 mb-1">
              Special Instructions
            </Text>
            <Text className="text-[11.5px] sm:text-[12.5px] text-[#92400E] dark:text-amber-200 font-medium leading-relaxed">
              {currentJob.specialInstructions ||
                "Handle with care. Keep cool. Arrive by 8 AM for market opening."}
            </Text>
          </View>

          {/* ================= 3. ACTION BUTTONS ================= */}
          {/* Button 1: Confirm Pickup */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleConfirmPickup}
            className={`w-full rounded-2xl flex-row items-center justify-center mb-3 shadow-xs ${
              currentJob.status === "In Transit" ||
              currentJob.status === "Delivered"
                ? "bg-[#16A34A]/80 opacity-80"
                : "bg-[#00A859]"
            } ${isExtraSmall ? "py-3" : "py-3.5 sm:py-4"}`}
            style={{
              elevation: 3,
              shadowColor: "#00A859",
              shadowOpacity: 0.2,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
            }}
          >
            <Ionicons
              name="cube-outline"
              size={isExtraSmall ? 18 : 20}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text
              className={`font-bold text-white tracking-wide ${
                isExtraSmall ? "text-[14px]" : "text-[15.5px]"
              }`}
            >
              {currentJob.status === "In Transit" ||
              currentJob.status === "Delivered"
                ? "Pickup Confirmed"
                : "Confirm Pickup"}
            </Text>
          </TouchableOpacity>

          {/* Button 2: Confirm Delivery */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleConfirmDelivery}
            className={`w-full rounded-2xl flex-row items-center justify-center shadow-xs ${
              currentJob.status === "Delivered"
                ? "bg-[#16A34A]"
                : "bg-[#FF8C00]"
            } ${isExtraSmall ? "py-3" : "py-3.5 sm:py-4"}`}
            style={{
              elevation: 3,
              shadowColor: currentJob.status === "Delivered" ? "#16A34A" : "#FF8C00",
              shadowOpacity: 0.2,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
            }}
          >
            <Ionicons
              name={currentJob.status === "Delivered" ? "checkmark-circle" : "checkmark-done-circle-outline"}
              size={isExtraSmall ? 18 : 20}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text
              className={`font-bold text-white tracking-wide ${
                isExtraSmall ? "text-[14px]" : "text-[15.5px]"
              }`}
            >
              {currentJob.status === "Delivered"
                ? "Delivery Completed ✓"
                : "Confirm Delivery"}
            </Text>
          </TouchableOpacity>
        </View>
      </SmoothScrollView>

      {/* ================= 4. BOTTOM NAVIGATION BAR ================= */}
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

          {/* Active Tab (CURRENT / ACTIVE TAB HIGHLIGHTED) */}
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
          className="flex-1 bg-black/40 justify-center items-center px-4"
        >
          <View
            style={{ maxWidth: 400, width: "100%" }}
            className="rounded-3xl bg-white dark:bg-slate-800 p-4 sm:p-5 border border-gray-100 dark:border-slate-700 shadow-xl"
          >
            <View className="flex-row items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700 mb-3">
              <View className="flex-row items-center">
                <Ionicons name="notifications" size={20} color="#FF8C00" />
                <Text className="text-base font-bold text-gray-900 dark:text-white ml-2">
                  Notifications
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowNotificationsModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="p-1 rounded-full bg-gray-100 dark:bg-slate-700"
              >
                <Ionicons name="close" size={18} color={colors.iconMuted} />
              </TouchableOpacity>
            </View>

            <View className="space-y-2.5 gap-2.5">
              {notificationsList.slice(0, 3).map((item) => (
                <View
                  key={item.id}
                  className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/60 border border-gray-100 dark:border-slate-600"
                >
                  <Text className="text-xs font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </Text>
                  <Text className="text-[11px] text-gray-600 dark:text-slate-300 mt-0.5">
                    {item.message}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setShowNotificationsModal(false);
                if (navigation?.navigate) {
                  navigation.navigate("TransporterNotifications");
                }
              }}
              className="mt-4 py-2.5 rounded-xl bg-[#FF8C00] items-center justify-center shadow-xs"
            >
              <Text className="text-xs font-bold text-white">
                View All Notifications
              </Text>
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

      {/* ================= THEMED ALERT MODAL ================= */}
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

export default TransporterActiveJobScreen;
