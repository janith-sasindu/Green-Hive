import React, { useState } from "react";
import {
  View,
  Text,
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
  MOCK_TRANSPORTER_PROFILE,
  AvailableTransportJob,
  TransporterProfile,
} from "./data";

export interface TransporterOfferSubmittedScreenProps {
  route?: {
    params?: {
      job?: AvailableTransportJob;
      offerData?: any;
    };
  };
  job?: AvailableTransportJob;
  navigation?: any;
  onBackToJobs?: () => void;
  onSelectTab?: (tab: "home" | "jobs" | "active" | "profile") => void;
}

export const TransporterOfferSubmittedScreen: React.FC<
  TransporterOfferSubmittedScreenProps
> = ({ route, job: propJob, navigation, onBackToJobs, onSelectTab }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Responsive Breakpoints
  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;

  // Selected job from route params or prop
  const job = route?.params?.job || propJob;

  // State
  const [profile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);
  const [showProfileModal, setShowProfileModal] = useState(false);
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

  // Navigation handlers
  const handleBackToJobs = () => {
    if (onBackToJobs) {
      onBackToJobs();
    } else if (navigation?.navigate) {
      navigation.navigate("TransporterAvailableJobs");
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleTabPress = (tab: "home" | "jobs" | "active" | "profile") => {
    if (onSelectTab) {
      onSelectTab(tab);
    } else if (tab === "home") {
      navigation?.navigate?.("TransporterHome");
    } else if (tab === "jobs") {
      handleBackToJobs();
    } else if (tab === "active") {
      navigation?.navigate?.("TransporterActiveJob");
    } else if (tab === "profile") {
      setShowProfileModal(true);
    }
  };

  const handleSignOut = () => {
    setShowProfileModal(false);
    setAlertConfig({
      visible: true,
      title: "Log Out",
      message: "Are you sure you want to log out of your driver account?",
      type: "warning",
      primaryButtonText: "Log Out",
      secondaryButtonText: "Cancel",
      onPrimaryPress: () => {
        setAlertConfig(null);
        if (navigation?.canGoBack && navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation?.navigate("Welcome");
        }
      },
      onSecondaryPress: () => {
        setAlertConfig(null);
      },
    });
  };

  return (
    <View className="flex-1 bg-[#F5F8F6]">
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
              onPress={handleBackToJobs}
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

      {/* ================= MAIN CONTENT ================= */}
      <SmoothScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: isSmallDevice ? 36 : 56,
          paddingHorizontal: isExtraSmall ? 16 : 24,
          paddingBottom: isSmallDevice ? 32 : 44,
        }}
      >
        <View style={{ maxWidth: 440, width: "100%", alignItems: "center" }}>
          {/* 1. Green Success Check Badge */}
          <View
            className="items-center justify-center shadow-sm"
            style={{
              width: isSmallDevice ? 56 : 64,
              height: isSmallDevice ? 56 : 64,
              borderRadius: 16,
              backgroundColor: "#22C55E",
              shadowColor: "#22C55E",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons
              name="checkmark"
              size={isSmallDevice ? 34 : 40}
              color="#FFFFFF"
            />
          </View>

          {/* 2. Offer Submitted Heading */}
          <Text
            className={`font-black text-[#0F172A] tracking-tight mt-5 mb-2 text-center ${
              isExtraSmall
                ? "text-[20px]"
                : isSmallDevice
                ? "text-[22px]"
                : "text-[24px]"
            }`}
          >
            Offer Submitted!
          </Text>

          {/* 3. Subtitle */}
          <Text className="text-xs sm:text-[13.5px] text-gray-500 font-medium text-center px-2 max-w-[320px] leading-relaxed">
            The seller will review your offer and notify you of their decision.
          </Text>

          {/* 4. Yellow Status Box */}
          <View
            className={`rounded-2xl bg-[#FFFDF0] border border-[#FDE68A] mt-6 sm:mt-7 w-full max-w-[340px] sm:max-w-[360px] ${
              isExtraSmall ? "p-3.5" : "p-4 sm:p-5"
            }`}
            style={{
              shadowColor: "#F59E0B",
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Text className="text-[13px] sm:text-sm font-bold text-[#D97706] mb-1">
              Offer Status: Under Review
            </Text>
            <Text className="text-[11.5px] sm:text-xs text-[#D97706]/90 font-medium leading-snug">
              You will be notified when the seller makes a decision
            </Text>
          </View>

          {/* 5. Back to Jobs Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleBackToJobs}
            className="rounded-full bg-[#FF8C00] py-3 sm:py-3.5 px-8 sm:px-10 mt-7 sm:mt-8 shadow-xs items-center justify-center min-w-[180px] sm:min-w-[200px]"
            style={{
              shadowColor: "#FF8C00",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="text-sm sm:text-base font-bold text-white tracking-wide">
              Back to Jobs
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
    </View>
  );
};

export default TransporterOfferSubmittedScreen;
