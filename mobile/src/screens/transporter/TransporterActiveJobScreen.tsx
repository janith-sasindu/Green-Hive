import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Modal,
  useWindowDimensions,
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

  // Responsive Breakpoints
  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;
  const isTablet = screenWidth >= 600;

  // Active Job Data
  const initialJob: ActiveTransportJob =
    route?.params?.job || propJob || MOCK_ACTIVE_JOB;
  const [currentJob, setCurrentJob] = useState<ActiveTransportJob>(initialJob);
  const [profile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);
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
          bg: "bg-[#FEF3C7]",
          text: "text-[#D97706]",
          dot: "bg-[#D97706]",
        };
      case "At Pickup":
        return {
          bg: "bg-[#EFF6FF]",
          text: "text-[#2563EB]",
          dot: "bg-[#2563EB]",
        };
      case "In Transit":
        return {
          bg: "bg-[#E0F2FE]",
          text: "text-[#0284C7]",
          dot: "bg-[#0284C7]",
        };
      case "Delivered":
        return {
          bg: "bg-[#DCFCE7]",
          text: "text-[#16A34A]",
          dot: "bg-[#16A34A]",
        };
      default:
        return {
          bg: "bg-[#FEF3C7]",
          text: "text-[#D97706]",
          dot: "bg-[#D97706]",
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
        { type: "info" }
      );
      return;
    }

    showAlert(
      "Confirm Cargo Pickup",
      `Are you currently at ${currentJob.pickup} and ready to confirm loading ${currentJob.cropName} · ${currentJob.weight}?`,
      {
        type: "info",
        primaryButtonText: "Confirm Pickup",
        secondaryButtonText: "Cancel",
        onPrimaryPress: () => {
          setCurrentJob((prev) => ({ ...prev, status: "In Transit" }));
          setTimeout(() => {
            showAlert(
              "Pickup Confirmed!",
              `Cargo is safely loaded. Your trip status is now 'In Transit'. Please proceed to ${currentJob.dropoff}.`,
              { type: "success" }
            );
          }, 350);
        },
      }
    );
  };

  // Delivery Confirmation Action
  const handleConfirmDelivery = () => {
    if (currentJob.status === "Delivered") {
      showAlert(
        "Job Already Delivered",
        `This shipment has already been successfully delivered and payment of ${currentJob.price} was released.`,
        { type: "success" }
      );
      return;
    }

    if (currentJob.status === "In Progress" || currentJob.status === "At Pickup") {
      showAlert(
        "Pickup Confirmation Required",
        "Please confirm cargo pickup at the farm before confirming delivery to the seller.",
        {
          type: "warning",
          primaryButtonText: "Understood",
        }
      );
      return;
    }

    showAlert(
      "Confirm Delivery Completion",
      `Are you at ${currentJob.dropoff} to deliver ${currentJob.cropName} · ${currentJob.weight} to ${
        currentJob.sellerName || "the receiver"
      }?`,
      {
        type: "warning",
        primaryButtonText: "Confirm Delivery",
        secondaryButtonText: "Cancel",
        onPrimaryPress: () => {
          setCurrentJob((prev) => ({ ...prev, status: "Delivered" }));
          setTimeout(() => {
            showAlert(
              "Delivery Completed!",
              `Excellent! Delivery has been confirmed by the seller. Your earnings of ${currentJob.price} have been credited to your wallet.`,
              { type: "success" }
            );
          }, 350);
        },
      }
    );
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
    <View className="flex-1 bg-[#F4F7F5]">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7F5" />

      {/* ================= 1. TOP HEADER ================= */}
      <SafeAreaView edges={["top"]} className="bg-[#F4F7F5]">
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className={`px-4 sm:px-5 flex-row items-center justify-between ${
            isSmallDevice ? "pt-1 pb-2" : "pt-2 pb-2.5"
          }`}
        >
          {/* Left: Green-Hive Logo & Title */}
          <View className="flex-row items-center flex-1 pr-2">
            <View
              className={`rounded-xl bg-[#135228] items-center justify-center mr-2.5 shadow-xs overflow-hidden ${
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
              className={`font-black text-[#0F172A] tracking-tight ${
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
              className={`items-center justify-center rounded-xl bg-white/80 border border-gray-200/60 shadow-2xs relative ${
                isExtraSmall ? "h-8 w-8" : isSmallDevice ? "h-9 w-9" : "h-10 w-10"
              }`}
            >
              <Ionicons
                name="notifications-outline"
                size={isExtraSmall ? 18 : isSmallDevice ? 20 : 21}
                color="#4B5563"
              />
              {/* Unread indicator dot */}
              <View className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleTabPress("profile")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className={`items-center justify-center rounded-full bg-[#E68A00] shadow-2xs ${
                isExtraSmall ? "h-8 w-8" : isSmallDevice ? "h-9 w-9" : "h-10 w-10"
              }`}
            >
              <Text
                className={`font-black text-white ${
                  isExtraSmall ? "text-xs" : "text-sm"
                }`}
              >
                {profile.avatarLetter}
              </Text>
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

            <Text className="text-[13px] font-semibold text-[#6B7280]">
              {currentJob.id}
            </Text>
          </View>

          {/* ================= CARD 1: CROP & ROUTE DETAILS ================= */}
          <View
            className={`rounded-3xl bg-white border border-gray-100 shadow-xs mb-3 ${
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
              className={`font-black text-[#111827] tracking-tight mb-3 sm:mb-3.5 ${
                isExtraSmall ? "text-[16px]" : "text-[18px]"
              }`}
            >
              {currentJob.cropName} · {currentJob.weight}
            </Text>

            {/* Sub-Card: Farmer / Pickup */}
            <View className="rounded-2xl bg-[#F0FDF4] p-3 sm:p-3.5 mb-2.5 border border-[#DCFCE7]/60">
              <View className="flex-row items-center mb-1">
                <Ionicons name="person-outline" size={13.5} color="#16A34A" />
                <Text className="text-[11.5px] sm:text-xs font-bold text-[#16A34A] ml-1.5">
                  Farmer / Pickup
                </Text>
              </View>
              <Text className="text-[14px] sm:text-[15px] font-bold text-[#111827]">
                {currentJob.farmerName}
              </Text>
              <Text className="text-[11.5px] sm:text-xs text-[#6B7280] font-normal mt-0.5">
                {currentJob.pickup}
              </Text>
            </View>

            {/* Sub-Card: Seller / Delivery */}
            <View className="rounded-2xl bg-[#EFF6FF] p-3 sm:p-3.5 border border-[#DBEAFE]/60">
              <View className="flex-row items-center mb-1">
                <Ionicons name="person-outline" size={13.5} color="#2563EB" />
                <Text className="text-[11.5px] sm:text-xs font-bold text-[#2563EB] ml-1.5">
                  Seller / Delivery
                </Text>
              </View>
              <Text className="text-[14px] sm:text-[15px] font-bold text-[#111827]">
                {currentJob.sellerName || "Colombo Fresh Market"}
              </Text>
              <Text className="text-[11.5px] sm:text-xs text-[#6B7280] font-normal mt-0.5">
                {currentJob.dropoff}
              </Text>
            </View>
          </View>

          {/* ================= CARD 2: YOUR EARNINGS ================= */}
          <View
            className={`rounded-2xl bg-white border border-gray-100 shadow-xs mb-3 ${
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
            <Text className="text-[11.5px] sm:text-xs text-[#9CA3AF] font-medium">
              Your Earnings
            </Text>
            <Text
              className={`font-black text-[#16A34A] tracking-tight mt-1 mb-1.5 ${
                isExtraSmall ? "text-[22px]" : "text-[26px]"
              }`}
            >
              {currentJob.price}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-xs mr-1 text-[#6B7280]">🔒</Text>
              <Text className="text-[11.5px] sm:text-xs text-[#6B7280] font-medium">
                Held by Green Hive · Released on delivery
              </Text>
            </View>
          </View>

          {/* ================= CARD 3: SPECIAL INSTRUCTIONS ================= */}
          <View className="rounded-2xl bg-[#FFFDF0] border border-[#FDE68A] p-3.5 sm:p-4 mb-5">
            <Text className="text-[12px] sm:text-[13px] font-bold text-[#D97706] mb-1">
              Special Instructions
            </Text>
            <Text className="text-[11.5px] sm:text-[12.5px] text-[#92400E] font-medium leading-relaxed">
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
            className={`w-full rounded-2xl items-center justify-center shadow-xs ${
              currentJob.status === "Delivered"
                ? "bg-[#16A34A]"
                : "bg-[#FF8C00]"
            } ${isExtraSmall ? "py-3" : "py-3.5 sm:py-4"}`}
            style={{
              elevation: 3,
              shadowColor: "#FF8C00",
              shadowOpacity: 0.2,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
            }}
          >
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

          {/* Jobs Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("jobs")}
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
            className="rounded-3xl bg-white p-4 sm:p-5 border border-gray-100 shadow-xl"
          >
            <View className="flex-row items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <View className="flex-row items-center">
                <Ionicons name="notifications" size={20} color="#FF8C00" />
                <Text className="text-base font-bold text-gray-900 ml-2">
                  Notifications
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowNotificationsModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="p-1 rounded-full bg-gray-100"
              >
                <Ionicons name="close" size={18} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <View className="space-y-2.5 gap-2.5">
              {notificationsList.slice(0, 3).map((item) => (
                <View
                  key={item.id}
                  className="p-2.5 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <Text className="text-xs font-bold text-gray-900">
                    {item.title}
                  </Text>
                  <Text className="text-[11px] text-gray-600 mt-0.5">
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
            className="p-3.5 sm:p-4 flex-1"
            contentContainerStyle={{
              paddingBottom: 40,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
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
                className="rounded-2xl bg-red-50 border border-red-200 py-3.5 items-center justify-center mt-2"
              >
                <Text className="text-sm font-bold text-red-600">
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
