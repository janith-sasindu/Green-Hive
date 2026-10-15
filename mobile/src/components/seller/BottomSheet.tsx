import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FeatherIconName, useSellerTheme } from './theme';
import { ink } from './ui';

const SLIDE_DISTANCE = 320;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  icon?: FeatherIconName;
  /** Pinned below the scrollable content, e.g. the save button. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const BottomSheet = ({ visible, onClose, title, icon, footer, children }: BottomSheetProps) => {
  const insets = useSafeAreaInsets();
  const theme = useSellerTheme();
  const translateY = useRef(new Animated.Value(SLIDE_DISTANCE)).current;

  // The backdrop fades in with the Modal while the sheet itself slides up
  useEffect(() => {
    if (!visible) return;
    translateY.setValue(SLIDE_DISTANCE);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      {/* Padding on Android too: a translucent Modal window is not resized by the keyboard */}
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          style={StyleSheet.absoluteFill}
          className="bg-black/50"
          onPress={onClose}
          accessibilityLabel={`Close ${title}`}
        />
        <Animated.View
          style={{
            maxHeight: '90%',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: theme.surface,
            transform: [{ translateY }],
          }}
        >
          <View className="items-center pt-3">
            <View className="h-1 w-10 rounded-full bg-gray-300 dark:bg-slate-600" />
          </View>
          <View className="flex-row items-center border-b border-gray-100 px-5 pb-4 pt-3 dark:border-slate-700">
            {icon && <Feather name={icon} size={18} color={Colors.primary} style={{ marginRight: 8 }} />}
            <Text className={`flex-1 text-lg font-bold ${ink.strong}`}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Feather name="x" size={20} color={theme.iconMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>

          <View style={{ paddingBottom: Math.max(insets.bottom, 16) }} className="px-5 pt-3">
            {footer}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
