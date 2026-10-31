import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SmoothScrollView } from "../../components/common/SmoothScrollView";
import { ThemedAlertModal, ThemedAlertModalType } from "../../components/common";
import { useTransporterTheme } from "../../context/TransporterThemeContext";
import {
  MOCK_MY_OFFERS,
  MOCK_TRANSPORTER_PROFILE,
  TransportOffer,
  TransporterProfile,
} from "./data";

export interface TransporterMyOffersScreenProps {
  navigation?: any;
  onBack?: () => void;
  onSelectTab?: (tab: "home" | "jobs" | "active" | "profile" | "offers") => void;
  activeTab?: string;
}

export const TransporterMyOffersScreen: React.FC<TransporterMyOffersScreenProps> = ({
  navigation,
  onBack,
  onSelectTab,
  activeTab = "home",
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { isDark, colors } = useTransporterTheme();

  // Responsive breakpoints
  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;

  // State
  const [profile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);
  const [offers, setOffers] = useState<TransportOffer[]>(MOCK_MY_OFFERS);
  const [selectedFilter, setSelectedFilter] = useState<"All" | "Submitted" | "Accepted">("All");

  // Alert Modal State
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

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (onSelectTab) {
      onSelectTab("home");
    } else if (navigation?.navigate) {
      navigation.navigate("TransporterHome");
    }
  };

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

  const handleWithdrawOffer = (offerId: string) => {
    setAlertConfig({
      visible: true,
      title: "Withdraw Offer",
      message: `Are you sure you want to withdraw your submitted offer for ${offerId}? The seller will no longer be able to accept your quote.`,
      type: "warning",
      primaryButtonText: "Withdraw",
      secondaryButtonText: "Keep Offer",
      onPrimaryPress: () => {
        setOffers((prev) => prev.filter((o) => o.id !== offerId));
        setAlertConfig({
          visible: true,
          title: "Offer Withdrawn",
          message: `Your transport offer for ${offerId} has been successfully withdrawn.`,
          type: "success",
          primaryButtonText: "OK",
          onPrimaryPress: () => setAlertConfig(null),
        });
      },
      onSecondaryPress: () => setAlertConfig(null),
    });
  };

  // Filtered offers list
  const filteredOffers = offers.filter((item) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Submitted") {
      return (
        item.status === "Submitted" ||
        item.status === "Under Review" ||
        item.status === "Pending Farmer Approval"
      );
    }
    if (selectedFilter === "Accepted") {
      return item.status === "Accepted";
    }
    return true;
  });

  const submittedCount = offers.filter(
    (o) =>
      o.status === "Submitted" ||
      o.status === "Under Review" ||
      o.status === "Pending Farmer Approval"
  ).length;
  const acceptedCount = offers.filter((o) => o.status === "Accepted").length;

  return (
    <View className="flex-1 bg-[#F4F7F5] dark:bg-slate-900">
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.statusBg}
      />

      {/* ================= TOP SAFEAREA HEADER ================= */}
      <SafeAreaView edges={["top"]} className="bg-[#F4F7F5] dark:bg-slate-900">
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
              className={`mr-2.5 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 shadow-2xs ${
                isExtraSmall ? "h-8 w-8" : isSmallDevice ? "h-9 w-9" : "h-10 w-10"
              }`}
            >
              <Ionicons
                name="chevron-back"
                size={isExtraSmall ? 18 : isSmallDevice ? 20 : 22}
                color={colors.icon}
              />
            </TouchableOpacity>

            <View className="flex-1">
              <Text
                numberOfLines={1}
                className={`font-black text-[#111827] dark:text-white tracking-tight ${
                  isExtraSmall
                    ? "text-[16px]"
                    : isSmallDevice
                    ? "text-[18px]"
                    : "text-[20px]"
                }`}
              >
                Transport Offers
              </Text>
              <Text className="text-[11px] sm:text-[11.5px] font-medium text-[#6B7280] dark:text-slate-400">
                Submitted to seller job cards
              </Text>
            </View>
          </View>

          {/* Right: Driver Avatar */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleTabPress("profile")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className={`rounded-full bg-[#E68A00] items-center justify-center shadow-xs overflow-hidden ${
              isExtraSmall ? "h-8 w-8" : isSmallDevice ? "h-8.5 w-8.5" : "h-9 w-9"
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
                className={`font-bold text-white ${
                  isExtraSmall
                    ? "text-xs"
                    : isSmallDevice
                    ? "text-xs"
                    : "text-sm"
                }`}
              >
                {profile.avatarLetter}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className="px-4 sm:px-5 pb-2.5 pt-1 flex-row gap-2"
        >
          {/* All */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedFilter("All")}
            className={`px-3 py-1.5 rounded-full border ${
              selectedFilter === "All"
                ? "bg-[#E68A00] border-[#E68A00]"
                : "bg-white dark:bg-slate-800 border-gray-200/90 dark:border-slate-700"
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                selectedFilter === "All"
                  ? "text-white"
                  : "text-[#4B5563] dark:text-slate-300"
              }`}
            >
              All ({offers.length})
            </Text>
          </TouchableOpacity>

          {/* Submitted */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedFilter("Submitted")}
            className={`px-3 py-1.5 rounded-full border ${
              selectedFilter === "Submitted"
                ? "bg-[#2563EB] border-[#2563EB]"
                : "bg-white dark:bg-slate-800 border-gray-200/90 dark:border-slate-700"
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                selectedFilter === "Submitted"
                  ? "text-white"
                  : "text-[#4B5563] dark:text-slate-300"
              }`}
            >
              Submitted ({submittedCount})
            </Text>
          </TouchableOpacity>

          {/* Accepted */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedFilter("Accepted")}
            className={`px-3 py-1.5 rounded-full border ${
              selectedFilter === "Accepted"
                ? "bg-[#059669] border-[#059669]"
                : "bg-white dark:bg-slate-800 border-gray-200/90 dark:border-slate-700"
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                selectedFilter === "Accepted"
                  ? "text-white"
                  : "text-[#4B5563] dark:text-slate-300"
              }`}
            >
              Accepted ({acceptedCount})
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ================= SCROLLABLE LIST OF SUBMITTED OFFERS ================= */}
      <SmoothScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: isSmallDevice ? 32 : 44,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        bounces={Platform.OS === "ios"}
      >
        <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}>
          {filteredOffers.length === 0 ? (
            <View className="items-center justify-center py-16 px-6">
              <View className="h-16 w-16 rounded-full bg-white dark:bg-slate-800 items-center justify-center shadow-xs border border-gray-100 dark:border-slate-700 mb-3.5">
                <Text className="text-2xl">📋</Text>
              </View>
              <Text className="text-base font-bold text-[#111827] dark:text-white text-center">
                No Transport Offers Found
              </Text>
              <Text className="text-xs text-[#6B7280] dark:text-slate-400 text-center mt-1 max-w-[280px]">
                You haven't submitted any offers in this category yet.
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleTabPress("jobs")}
                className="mt-5 rounded-full bg-[#E68A00] px-6 py-2.5 shadow-xs"
              >
                <Text className="text-xs font-bold text-white">
                  Browse Available Jobs
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredOffers.map((offer) => {
              const isAccepted = offer.status === "Accepted";
              const isSubmitted =
                offer.status === "Submitted" ||
                offer.status === "Under Review" ||
                offer.status === "Pending Farmer Approval";

              return (
                <View
                  key={offer.id}
                  className="mb-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100/90 dark:border-slate-700 p-4 shadow-2xs"
                  style={{
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  {/* Top Line: Job #ID and Status Pill Badge */}
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[12.5px] sm:text-[13px] font-semibold text-[#6B7280] dark:text-slate-400">
                      {offer.id.startsWith("Job") ? offer.id : `Job ${offer.id}`}
                    </Text>

                    {/* Status Badge */}
                    {isAccepted ? (
                      <View className="flex-row items-center rounded-full bg-[#ECFDF5] dark:bg-emerald-500/20 px-2.5 py-1">
                        <View className="h-2 w-2 rounded-full bg-[#059669] mr-1.5" />
                        <Text className="text-[11px] font-bold text-[#059669] dark:text-emerald-400">
                          Accepted
                        </Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center rounded-full bg-[#EFF6FF] dark:bg-blue-500/20 px-2.5 py-1">
                        <View className="h-2 w-2 rounded-full bg-[#2563EB] mr-1.5" />
                        <Text className="text-[11px] font-bold text-[#2563EB] dark:text-blue-400">
                          Submitted
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Title */}
                  <Text className="font-extrabold text-[#111827] dark:text-white text-[16.5px] sm:text-[17.5px] mt-1.5">
                    {offer.title || "Transportation Offer"}
                  </Text>

                  {/* Cargo info subtitle if available */}
                  {(offer.cropName || offer.weight) && (
                    <Text className="text-[12px] font-medium text-[#4B5563] dark:text-slate-300 mt-0.5">
                      {offer.cropName} {offer.weight ? `· ${offer.weight}` : ""}
                    </Text>
                  )}

                  {/* Two Columns: Your Cost & Est. Delivery */}
                  <View className="flex-row items-start justify-between mt-3.5 pt-1">
                    {/* Your Cost */}
                    <View className="flex-1 pr-2">
                      <Text className="text-[11.5px] font-medium text-[#6B7280] dark:text-slate-400">
                        Your Cost
                      </Text>
                      <Text className="text-[16px] sm:text-[17px] font-black text-[#059669] dark:text-emerald-400 mt-0.5">
                        {offer.quotePrice}
                      </Text>
                    </View>

                    {/* Est. Delivery */}
                    <View className="flex-1 items-end pl-2">
                      <Text className="text-[11.5px] font-medium text-[#6B7280] dark:text-slate-400">
                        Est. Delivery
                      </Text>
                      <Text className="text-[12.5px] sm:text-[13px] font-bold text-[#1F2937] dark:text-slate-200 mt-0.5 text-right">
                        {offer.estimatedDelivery || "2026-08-31 08:00 AM"}
                      </Text>
                    </View>
                  </View>

                  {/* Note Bubble (Italic callout box matching design) */}
                  <View className="mt-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-700/60 p-3 border border-slate-100/90 dark:border-slate-700/40">
                    <Text className="text-[12px] sm:text-[12.5px] italic text-[#4B5563] dark:text-slate-300 leading-relaxed">
                      {offer.notes ||
                        "I have refrigerated vehicle available. On-time delivery guaranteed."}
                    </Text>
                  </View>

                  {/* Footer Line: Submitted Date & Actions */}
                  <View className="mt-3 flex-row items-center justify-between pt-1">
                    <Text className="text-[11px] sm:text-[11.5px] font-medium text-[#9CA3AF] dark:text-slate-400">
                      Submitted {offer.submittedDate || "2026-08-28"}
                    </Text>

                    {/* Action button */}
                    {isAccepted ? (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleTabPress("active")}
                        className="flex-row items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 border border-emerald-200 dark:border-emerald-800"
                      >
                        <Text className="text-[11.5px] font-bold text-[#059669] dark:text-emerald-400">
                          Active Trip →
                        </Text>
                      </TouchableOpacity>
                    ) : isSubmitted ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleWithdrawOffer(offer.id)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        className="flex-row items-center px-2 py-1"
                      >
                        <Text className="text-[11.5px] font-semibold text-red-500 dark:text-red-400">
                          Withdraw
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
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
              name="home-outline"
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
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-medium text-[#9CA3AF] dark:text-slate-400`}
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

      {/* Themed Alert Modal */}
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
        />
      )}
    </View>
  );
};

export default TransporterMyOffersScreen;
