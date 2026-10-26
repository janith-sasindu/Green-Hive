import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Switch,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SmoothScrollView } from "../../components/common/SmoothScrollView";
import { ThemedAlertModal, ThemedAlertModalType } from "../../components/common";
import { useTransporterTheme } from "../../context/TransporterThemeContext";
import {
  MOCK_TRANSPORTER_NOTIFICATION_SETTINGS,
  TransporterNotificationSettings,
} from "./data";

export interface TransporterNotificationSettingsScreenProps {
  navigation?: any;
  onBack?: () => void;
}

export const TransporterNotificationSettingsScreen: React.FC<TransporterNotificationSettingsScreenProps> = ({
  navigation,
  onBack,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { isDark, colors } = useTransporterTheme();

  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;

  // Local settings state cloned from mock settings
  const [settings, setSettings] = useState<TransporterNotificationSettings>({
    ...MOCK_TRANSPORTER_NOTIFICATION_SETTINGS,
  });

  // Themed Alert State
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    type?: ThemedAlertModalType;
    primaryButtonText?: string;
    onPrimaryPress?: () => void;
  } | null>(null);

  const showAlert = (
    title: string,
    message: string,
    options?: {
      type?: ThemedAlertModalType;
      primaryButtonText?: string;
      onPrimaryPress?: () => void;
    }
  ) => {
    setAlertConfig({
      title,
      message,
      type: options?.type || "info",
      primaryButtonText: options?.primaryButtonText || "Got It",
      onPrimaryPress: options?.onPrimaryPress,
    });
  };

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate("TransporterProfile");
    }
  };

  const handleNavigateToInbox = () => {
    if (navigation?.navigate) {
      navigation.navigate("TransporterNotifications");
    }
  };

  const handleToggle = (key: keyof TransporterNotificationSettings, value: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      // Keep shared mock updated
      MOCK_TRANSPORTER_NOTIFICATION_SETTINGS[key] = value;
      return next;
    });
  };

  const handleSavePreferences = () => {
    // Persist to shared mock data
    Object.assign(MOCK_TRANSPORTER_NOTIFICATION_SETTINGS, settings);

    showAlert(
      "Notification Settings Saved",
      "Your notification preferences have been saved successfully.",
      {
        type: "success",
        primaryButtonText: "Done",
        onPrimaryPress: () => {
          handleGoBack();
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

      {/* Header */}
      <SafeAreaView edges={["top"]} className="bg-[#F5F8F6] dark:bg-slate-900">
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className={`px-4 sm:px-5 flex-row items-center justify-between ${
            isSmallDevice ? "pt-1 pb-1.5" : "pt-2 pb-2.5"
          }`}
        >
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGoBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="p-1 -ml-1 mr-2 rounded-full"
            >
              <Ionicons
                name="arrow-back"
                size={isExtraSmall ? 22 : 24}
                color={isDark ? "#FFFFFF" : "#1F2937"}
              />
            </TouchableOpacity>
            <View>
              <Text className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Notification Settings
              </Text>
              <Text className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400">
                Manage phone push alerts
              </Text>
            </View>
          </View>

          {/* Inbox Link Icon */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleNavigateToInbox}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="h-9 w-9 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 items-center justify-center shadow-2xs"
          >
            <Ionicons name="notifications-outline" size={19} color={colors.icon} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Content Body */}
      <SmoothScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: isSmallDevice ? 14 : 16,
          paddingTop: 10,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}>
          {/* ================= 1. PUSH ALERTS CARD ================= */}
          <View className="rounded-3xl bg-white dark:bg-slate-800 p-4 sm:p-5 border border-gray-100 dark:border-slate-700 shadow-2xs mb-4">
            <Text className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-3">
              Phone Push Alert Types
            </Text>

            {/* Toggle 1: New Jobs Push */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700">
              <View className="flex-row items-start flex-1 pr-3">
                <View className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 items-center justify-center mr-3 mt-0.5">
                  <Ionicons name="briefcase-outline" size={20} color="#E68A00" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-900 dark:text-white">
                    New Jobs Notifications
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Alert on phone when new transport jobs are posted near you
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.newJobsPush}
                onValueChange={(val) => handleToggle("newJobsPush", val)}
                trackColor={{ false: isDark ? "#334155" : "#E5E7EB", true: "#E68A00" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={isDark ? "#334155" : "#E5E7EB"}
                style={{
                  transform: [
                    { scaleX: isSmallDevice ? 0.85 : 0.95 },
                    { scaleY: isSmallDevice ? 0.85 : 0.95 },
                  ],
                }}
              />
            </View>

            {/* Toggle 2: Current Job Updates Push */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700">
              <View className="flex-row items-start flex-1 pr-3">
                <View className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 items-center justify-center mr-3 mt-0.5">
                  <Ionicons name="bus-outline" size={20} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-900 dark:text-white">
                    Current Job Updates
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Alert on phone for active trip milestones, pickup, and updates
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.currentJobUpdatesPush}
                onValueChange={(val) => handleToggle("currentJobUpdatesPush", val)}
                trackColor={{ false: isDark ? "#334155" : "#E5E7EB", true: "#E68A00" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={isDark ? "#334155" : "#E5E7EB"}
                style={{
                  transform: [
                    { scaleX: isSmallDevice ? 0.85 : 0.95 },
                    { scaleY: isSmallDevice ? 0.85 : 0.95 },
                  ],
                }}
              />
            </View>

            {/* Toggle 3: Offer Status Push */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700">
              <View className="flex-row items-start flex-1 pr-3">
                <View className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 items-center justify-center mr-3 mt-0.5">
                  <Ionicons name="pricetag-outline" size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-900 dark:text-white">
                    Offer Acceptance & Bids
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Alert on phone when a farmer accepts or counters your offer
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.offerStatusPush}
                onValueChange={(val) => handleToggle("offerStatusPush", val)}
                trackColor={{ false: isDark ? "#334155" : "#E5E7EB", true: "#E68A00" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={isDark ? "#334155" : "#E5E7EB"}
                style={{
                  transform: [
                    { scaleX: isSmallDevice ? 0.85 : 0.95 },
                    { scaleY: isSmallDevice ? 0.85 : 0.95 },
                  ],
                }}
              />
            </View>

            {/* Toggle 4: Payment Push */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-start flex-1 pr-3">
                <View className="h-10 w-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 items-center justify-center mr-3 mt-0.5">
                  <Ionicons name="cash-outline" size={20} color="#14B8A6" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-900 dark:text-white">
                    Payment Releases
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Alert on phone when earnings are credited to your account
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.paymentPush}
                onValueChange={(val) => handleToggle("paymentPush", val)}
                trackColor={{ false: isDark ? "#334155" : "#E5E7EB", true: "#E68A00" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={isDark ? "#334155" : "#E5E7EB"}
                style={{
                  transform: [
                    { scaleX: isSmallDevice ? 0.85 : 0.95 },
                    { scaleY: isSmallDevice ? 0.85 : 0.95 },
                  ],
                }}
              />
            </View>
          </View>

          {/* ================= 3. SOUND & VIBRATION ================= */}
          <View className="rounded-3xl bg-white dark:bg-slate-800 p-4 sm:p-5 border border-gray-100 dark:border-slate-700 shadow-2xs mb-4">
            <Text className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-3">
              Alert Sounds
            </Text>

            <View className="flex-row items-center justify-between py-1">
              <View className="flex-row items-start flex-1 pr-3">
                <View className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 items-center justify-center mr-3 mt-0.5">
                  <Ionicons name="volume-high-outline" size={20} color="#8B5CF6" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-900 dark:text-white">
                    Sound & Vibration
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Play phone ringtone and vibrate on arrival
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.soundAndVibration}
                onValueChange={(val) => handleToggle("soundAndVibration", val)}
                trackColor={{ false: isDark ? "#334155" : "#E5E7EB", true: "#E68A00" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={isDark ? "#334155" : "#E5E7EB"}
                style={{
                  transform: [
                    { scaleX: isSmallDevice ? 0.85 : 0.95 },
                    { scaleY: isSmallDevice ? 0.85 : 0.95 },
                  ],
                }}
              />
            </View>
          </View>

          {/* ================= 3. SAVE BUTTON ================= */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSavePreferences}
            className="w-full py-4 rounded-2xl sm:rounded-3xl bg-[#E68A00] flex-row items-center justify-center shadow-md mb-3"
            style={{
              shadowColor: "#E68A00",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
            <Text className="text-sm sm:text-base font-bold text-white ml-2">
              Save Notification Preferences
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleGoBack}
            className="w-full py-2.5 items-center justify-center"
          >
            <Text className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-slate-400">
              Back to Profile
            </Text>
          </TouchableOpacity>
        </View>
      </SmoothScrollView>

      {/* Themed Alert Modal */}
      {alertConfig && (
        <ThemedAlertModal
          visible={!!alertConfig}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          primaryButtonText={alertConfig.primaryButtonText}
          onPrimaryPress={() => {
            const cb = alertConfig.onPrimaryPress;
            setAlertConfig(null);
            if (cb) cb();
          }}
          onClose={() => setAlertConfig(null)}
        />
      )}
    </View>
  );
};

export default TransporterNotificationSettingsScreen;
