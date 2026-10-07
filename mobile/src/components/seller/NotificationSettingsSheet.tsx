import React, { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NOTIFICATION_CATEGORIES, NOTIFICATION_CATEGORY_ORDER } from '../../constants/notificationCategories';
import { useSeller } from '../../context/SellerContext';
import type { NotificationSettings } from '../../types/seller';
import { BottomSheet } from './BottomSheet';
import { useSellerTheme } from './theme';
import { PrimaryButton, ink } from './ui';

interface NotificationSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

const withAll = (enabled: boolean): NotificationSettings => ({
  orders: enabled,
  payments: enabled,
  transportation: enabled,
  fulfillment: enabled,
  promotions: enabled,
  security: enabled,
});

export const NotificationSettingsSheet = ({ visible, onClose }: NotificationSettingsSheetProps) => {
  const theme = useSellerTheme();
  const { notificationSettings, saveNotificationSettings } = useSeller();
  const [draft, setDraft] = useState(notificationSettings);

  // Start from the saved preferences every time the sheet is opened
  useEffect(() => {
    if (visible) setDraft(notificationSettings);
  }, [visible, notificationSettings]);

  const enabledCount = NOTIFICATION_CATEGORY_ORDER.filter((category) => draft[category]).length;
  const allEnabled = enabledCount === NOTIFICATION_CATEGORY_ORDER.length;
  const summary = allEnabled
    ? 'All notifications on'
    : enabledCount === 0
      ? 'All notifications off'
      : 'Some notifications off';

  const handleSave = () => {
    saveNotificationSettings(draft);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Notification Settings"
      icon="bell"
      footer={<PrimaryButton label="Save Preferences" onPress={handleSave} />}
    >
      <View className="flex-row items-center bg-gray-50 px-5 py-3.5 dark:bg-slate-900">
        <Feather name={allEnabled ? 'bell' : 'bell-off'} size={18} color={theme.iconMuted} />
        <Text className={`ml-3 flex-1 text-sm font-bold ${ink.strong}`}>{summary}</Text>
        <Switch
          value={allEnabled}
          onValueChange={(enabled) => setDraft(withAll(enabled))}
          trackColor={theme.switchTrack}
          thumbColor="#ffffff"
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
              <Text className={`text-[15px] font-semibold ${ink.strong}`}>{meta.label}</Text>
              <Text className={`text-xs ${ink.faint}`}>{meta.description}</Text>
            </View>
            <Switch
              value={draft[category]}
              onValueChange={(enabled) => setDraft({ ...draft, [category]: enabled })}
              trackColor={theme.switchTrack}
              thumbColor="#ffffff"
              accessibilityLabel={`${meta.label} notifications`}
            />
          </View>
        );
      })}
    </BottomSheet>
  );
};
