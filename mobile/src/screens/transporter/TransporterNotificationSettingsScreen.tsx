import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Switch,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { SmoothScrollView } from "../../components/common/SmoothScrollView";
import { ThemedAlertModal, ThemedAlertModalType } from "../../components/common";
import { useTransporterTheme } from "../../context/TransporterThemeContext";
import {
  MOCK_TRANSPORTER_NOTIFICATION_SETTINGS,
  TransporterNotificationSettings,
  TRANSPORTER_API_ENDPOINTS,
  NOTIFICATION_SETTINGS_HEADER,
  NOTIFICATION_SETTINGS_CARDS,
  NOTIFICATION_SETTINGS_ACTIONS,
  NOTIFICATION_SETTINGS_ALERTS,
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

  // Centralized Backend API URL from data folder
  const SETTINGS_API_URL = TRANSPORTER_API_ENDPOINTS.notificationSettings;

  // Local settings state cloned from mock settings as default
  const [settings, setSettings] = useState<TransporterNotificationSettings>({
    ...MOCK_TRANSPORTER_NOTIFICATION_SETTINGS,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

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

  // Fetch settings from backend
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(SETTINGS_API_URL);
      const json = await response.json();
      if (json.success && json.data) {
        setSettings({
          newJobsPush: Boolean(json.data.newJobsPush),
          currentJobUpdatesPush: Boolean(json.data.currentJobUpdatesPush),
          offerStatusPush: Boolean(json.data.offerStatusPush),
          paymentPush: Boolean(json.data.paymentPush),
          soundAndVibration: Boolean(json.data.soundAndVibration),
        });
      }
    } catch (error) {
      console.log("Error fetching notification settings from backend:", error);
    } finally {
      setLoading(false);
    }
  }, [SETTINGS_API_URL]);

  // Refresh settings whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSettings();
    }, [fetchSettings])
  );

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
      // Keep shared mock updated for fallback
      MOCK_TRANSPORTER_NOTIFICATION_SETTINGS[key] = value;
      return next;
    });
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch(SETTINGS_API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await response.json();

      if (json.success) {
        // Persist to shared mock data for offline fallback
        Object.assign(MOCK_TRANSPORTER_NOTIFICATION_SETTINGS, settings);

        showAlert(
          NOTIFICATION_SETTINGS_ALERTS.saveSuccess.title,
          NOTIFICATION_SETTINGS_ALERTS.saveSuccess.message,
          {
            type: "success",
            primaryButtonText: NOTIFICATION_SETTINGS_ALERTS.saveSuccess.primaryButtonText,
            onPrimaryPress: () => {
              handleGoBack();
            },
          }
        );
      } else {
        showAlert(
          NOTIFICATION_SETTINGS_ALERTS.saveFailed.title,
          json.message || NOTIFICATION_SETTINGS_ALERTS.saveFailed.defaultMessage,
          { type: "error" }
        );
      }
    } catch (error) {
      console.log("Error saving notification settings:", error);
      showAlert(
        NOTIFICATION_SETTINGS_ALERTS.connectionError.title,
        NOTIFICATION_SETTINGS_ALERTS.connectionError.message,
        { type: "error" }
      );
    } finally {
      setSaving(false);
    }
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
                {NOTIFICATION_SETTINGS_HEADER.title}
              </Text>
              <Text className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400">
                {NOTIFICATION_SETTINGS_HEADER.subtitle}
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
              {NOTIFICATION_SETTINGS_CARDS.pushSectionTitle}
            </Text>

            {/* Toggle 1: New Jobs Push */}
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700">
              <View className="flex-row items-start flex-1 pr-3">
                <View className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 items-center justify-center mr-3 mt-0.5">
                  <Ionicons name="briefcase-outline" size={20} color="#E68A00" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-900 dark:text-white">
                    {NOTIFICATION_SETTINGS_CARDS.newJobs.title}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {NOTIFICATION_SETTINGS_CARDS.newJobs.description}
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
                    {NOTIFICATION_SETTINGS_CARDS.currentJob.title}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {NOTIFICATION_SETTINGS_CARDS.currentJob.description}
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
                    {NOTIFICATION_SETTINGS_CARDS.offerStatus.title}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {NOTIFICATION_SETTINGS_CARDS.offerStatus.description}
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
                    {NOTIFICATION_SETTINGS_CARDS.payment.title}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {NOTIFICATION_SETTINGS_CARDS.payment.description}
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

          {/* ================= 2. SOUND & VIBRATION ================= */}
          <View className="rounded-3xl bg-white dark:bg-slate-800 p-4 sm:p-5 border border-gray-100 dark:border-slate-700 shadow-2xs mb-4">
            <Text className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-3">
              {NOTIFICATION_SETTINGS_CARDS.soundSectionTitle}
            </Text>

            <View className="flex-row items-center justify-between py-1">
              <View className="flex-row items-start flex-1 pr-3">
                <View className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 items-center justify-center mr-3 mt-0.5">
                  <Ionicons name="volume-high-outline" size={20} color="#8B5CF6" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-900 dark:text-white">
                    {NOTIFICATION_SETTINGS_CARDS.sound.title}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {NOTIFICATION_SETTINGS_CARDS.sound.description}
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
            disabled={saving}
            onPress={handleSavePreferences}
            className={`w-full py-4 rounded-2xl sm:rounded-3xl bg-[#E68A00] flex-row items-center justify-center shadow-md mb-3 ${
              saving ? "opacity-80" : ""
            }`}
            style={{
              shadowColor: "#E68A00",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
            )}
            <Text className="text-sm sm:text-base font-bold text-white ml-2">
              {saving ? NOTIFICATION_SETTINGS_ACTIONS.savingButton : NOTIFICATION_SETTINGS_ACTIONS.saveButton}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleGoBack}
            className="w-full py-2.5 items-center justify-center"
          >
            <Text className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-slate-400">
              {NOTIFICATION_SETTINGS_ACTIONS.backToProfileButton}
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
