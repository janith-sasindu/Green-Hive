import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_ORDER,
} from "../../constants/notificationCategories";
import type { NotificationCategory, NotificationSettings } from "../../types/seller";

interface FarmerNotificationSettingsModalProps {
  visible: boolean;
  isDark: boolean;
  settings: NotificationSettings;
  onClose: () => void;
  onSave: (settings: NotificationSettings) => void;
}

const withAll = (enabled: boolean): NotificationSettings =>
  NOTIFICATION_CATEGORY_ORDER.reduce(
    (settings, category) => ({ ...settings, [category]: enabled }),
    {} as NotificationSettings
  );

export const FarmerNotificationSettingsModal = ({
  visible,
  isDark,
  settings,
  onClose,
  onSave,
}: FarmerNotificationSettingsModalProps) => {
  const [draft, setDraft] = useState<NotificationSettings>(settings);

  useEffect(() => {
    if (visible) setDraft(settings);
  }, [visible, settings]);

  const enabledCount = NOTIFICATION_CATEGORY_ORDER.filter(
    (category) => draft[category]
  ).length;
  const allEnabled = enabledCount === NOTIFICATION_CATEGORY_ORDER.length;
  const summary =
    enabledCount === 0
      ? "All notifications off"
      : allEnabled
        ? "All notifications on"
        : "Some notifications off";
  const switchTrackColor = {
    false: isDark ? "#334155" : "#D1D5DB",
    true: "#166534",
  };
  const iconColor = isDark ? "#A7D9B0" : "#4B5563";

  const toggleCategory = (category: NotificationCategory, enabled: boolean) => {
    setDraft((current) => ({ ...current, [category]: enabled }));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[92%] rounded-t-3xl bg-white dark:bg-slate-900">
          <View className="flex-row items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-700">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-950/40">
                <Ionicons name="notifications-outline" size={20} color="#166534" />
              </View>
              <View className="ml-3">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  Notification Settings
                </Text>
                <Text className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                  Manage your farmer alerts
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close notification settings"
              className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800"
            >
              <Ionicons name="close" size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 28 }}
          >
            <View className="flex-row items-center bg-gray-50 px-5 py-3.5 dark:bg-slate-800">
              <Ionicons
                name={allEnabled ? "notifications-outline" : "notifications-off-outline"}
                size={20}
                color={iconColor}
              />
              <Text className="ml-3 flex-1 text-sm font-bold text-gray-900 dark:text-white">
                {summary}
              </Text>
              <Switch
                value={allEnabled}
                onValueChange={(enabled) => setDraft(withAll(enabled))}
                trackColor={switchTrackColor}
                thumbColor="#FFFFFF"
                accessibilityLabel="Turn all notifications on or off"
              />
            </View>

            {NOTIFICATION_CATEGORY_ORDER.map((category) => {
              const meta = NOTIFICATION_CATEGORIES[category];
              return (
                <View
                  key={category}
                  className="flex-row items-center border-t border-gray-100 px-5 py-3.5 dark:border-slate-700"
                >
                  <Text className="text-xl">{meta.emoji}</Text>
                  <View className="ml-3 flex-1 pr-3">
                    <Text className="text-[15px] font-semibold text-gray-900 dark:text-white">
                      {meta.label}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-slate-400">
                      {meta.description}
                    </Text>
                  </View>
                  <Switch
                    value={draft[category]}
                    onValueChange={(enabled) => toggleCategory(category, enabled)}
                    trackColor={switchTrackColor}
                    thumbColor="#FFFFFF"
                    accessibilityLabel={`${meta.label} notifications`}
                  />
                </View>
              );
            })}

            <View className="flex-row gap-3 px-5 pt-4">
              <TouchableOpacity
                onPress={onClose}
                accessibilityRole="button"
                className="flex-1 items-center rounded-2xl border border-gray-200 py-3.5 dark:border-slate-600"
              >
                <Text className="text-sm font-bold text-gray-600 dark:text-slate-300">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  onSave(draft);
                  onClose();
                }}
                accessibilityRole="button"
                className="flex-1 items-center rounded-2xl bg-[#166534] py-3.5"
              >
                <Text className="text-sm font-bold text-white">Save Preferences</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
