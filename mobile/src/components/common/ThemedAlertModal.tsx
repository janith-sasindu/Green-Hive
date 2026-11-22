import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ThemedAlertModalType = "warning" | "error" | "success" | "info";

export interface ThemedAlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: ThemedAlertModalType;
  primaryButtonText?: string;
  onPrimaryPress?: () => void;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
  onClose?: () => void;
}

export const ThemedAlertModal: React.FC<ThemedAlertModalProps> = ({
  visible,
  title,
  message,
  type = "warning",
  primaryButtonText = "Got It",
  onPrimaryPress,
  secondaryButtonText,
  onSecondaryPress,
  onClose,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;

  if (!visible) return null;

  // Icon and accent configurations based on type
  const config = {
    warning: {
      icon: "alert-circle" as const,
      iconColor: "#D97706",
      badgeBg: "bg-amber-50",
      badgeBorder: "border-amber-100",
      btnBg: "bg-[#FF8C00]",
      shadowColor: "#FF8C00",
    },
    error: {
      icon: "close-circle" as const,
      iconColor: "#EF4444",
      badgeBg: "bg-red-50",
      badgeBorder: "border-red-100",
      btnBg: "bg-red-500",
      shadowColor: "#EF4444",
    },
    success: {
      icon: "checkmark-circle" as const,
      iconColor: "#16A34A",
      badgeBg: "bg-emerald-50",
      badgeBorder: "border-emerald-100",
      btnBg: "bg-emerald-600",
      shadowColor: "#16A34A",
    },
    info: {
      icon: "information-circle" as const,
      iconColor: "#0284C7",
      badgeBg: "bg-sky-50",
      badgeBorder: "border-sky-100",
      btnBg: "bg-sky-600",
      shadowColor: "#0284C7",
    },
  }[type];

  const handlePrimary = () => {
    if (onPrimaryPress) {
      onPrimaryPress();
    } else if (onClose) {
      onClose();
    }
  };

  const handleSecondary = () => {
    if (onSecondaryPress) {
      onSecondaryPress();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose || handlePrimary}
    >
      <View className="flex-1 bg-black/55 justify-center items-center px-5 sm:px-6">
        {/* Backdrop Dismiss Area */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose || handlePrimary}
          className="absolute inset-0"
        />

        {/* Modal Dialog Card */}
        <View
          style={{
            maxWidth: 390,
            width: "100%",
            shadowColor: "#0F172A",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.18,
            shadowRadius: 24,
            elevation: 12,
          }}
          className={`bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 items-center ${
            isExtraSmall ? "p-4.5" : isSmallDevice ? "p-5" : "p-6"
          }`}
        >
          {/* Top Themed Icon Badge */}
          <View
            className={`rounded-full ${config.badgeBg} border-4 ${config.badgeBorder} items-center justify-center mb-3.5`}
            style={{
              width: isSmallDevice ? 54 : 62,
              height: isSmallDevice ? 54 : 62,
            }}
          >
            <Ionicons
              name={config.icon}
              size={isSmallDevice ? 28 : 34}
              color={config.iconColor}
            />
          </View>

          {/* Modal Title */}
          <Text
            className={`font-black text-[#0F172A] dark:text-white tracking-tight text-center mb-2 ${
              isExtraSmall
                ? "text-base"
                : isSmallDevice
                ? "text-[17px]"
                : "text-[19px]"
            }`}
          >
            {title}
          </Text>

          {/* Modal Message */}
          <Text
            className={`text-gray-600 dark:text-slate-300 font-medium text-center leading-relaxed px-1 mb-5 sm:mb-6 ${
              isExtraSmall ? "text-xs" : "text-xs sm:text-sm"
            }`}
          >
            {message}
          </Text>

          {/* Action Buttons */}
          {secondaryButtonText ? (
            <View className="flex-row items-center gap-2.5 sm:gap-3 w-full">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSecondary}
                className="flex-1 py-3 sm:py-3.5 rounded-2xl bg-gray-100 dark:bg-slate-700 items-center justify-center"
              >
                <Text className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-200">
                  {secondaryButtonText}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePrimary}
                className={`flex-1 py-3 sm:py-3.5 rounded-2xl ${config.btnBg} items-center justify-center shadow-xs`}
                style={{
                  shadowColor: config.shadowColor,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                <Text className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  {primaryButtonText}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handlePrimary}
              className={`w-full py-3.5 rounded-2xl ${config.btnBg} items-center justify-center shadow-xs`}
              style={{
                shadowColor: config.shadowColor,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <Text className="text-sm sm:text-base font-bold text-white tracking-wide">
                {primaryButtonText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ThemedAlertModal;
