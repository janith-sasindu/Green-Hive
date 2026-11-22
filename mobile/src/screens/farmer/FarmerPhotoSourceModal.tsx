import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FarmerPhotoSourceModalProps {
  visible: boolean;
  isDark: boolean;
  title: string;
  subtitle: string;
  hasPhoto?: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onRemove?: () => void;
}

export const FarmerPhotoSourceModal = ({
  visible,
  isDark,
  title,
  subtitle,
  hasPhoto = false,
  onClose,
  onCamera,
  onGallery,
  onRemove,
}: FarmerPhotoSourceModalProps) => {
  const mutedText = isDark ? "#8DB898" : "#6B7280";
  const sheetBackground = isDark ? "#1C2B1F" : "#FFFFFF";
  const borderColor = isDark ? "#2A3D2E" : "#E5E7EB";
  const accent = isDark ? "#4ADE80" : "#166534";
  const accentSoft = isDark ? "#14371E" : "#F0FDF4";
  const accentBorder = isDark ? "#276738" : "#86EFAC";
  const primaryText = isDark ? "#E8F5EA" : "#111827";
  const controlBackground = isDark ? "#2A3D2E" : "#F3F4F6";
  const galleryBackground = isDark ? "#12213A" : "#F8FAFC";
  const cancelText = isDark ? "#D1FAE5" : "#374151";

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/55">
        <View
          className="rounded-t-3xl px-5 pt-3"
          style={{ backgroundColor: sheetBackground, paddingBottom: 24 }}
        >
          <View className="mb-4 items-center">
            <View className="h-1 w-10 rounded-full bg-gray-400 dark:bg-slate-500" />
          </View>

          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                className="h-12 w-12 items-center justify-center rounded-full border"
                style={{ borderColor: accentBorder, backgroundColor: accentSoft }}
              >
                <Ionicons name="camera" size={24} color={accent} />
              </View>
              <View className="ml-3">
                <Text className="text-xl font-bold" style={{ color: primaryText }}>{title}</Text>
                <Text className="mt-0.5 text-sm" style={{ color: mutedText }}>
                  {subtitle}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close photo options"
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: controlBackground }}
            >
              <Ionicons name="close" size={24} color={mutedText} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={onCamera}
            activeOpacity={0.85}
            accessibilityRole="button"
            className="mb-3 flex-row items-center rounded-3xl border px-5 py-4"
            style={{ borderColor: accentBorder, backgroundColor: accentSoft }}
          >
            <View
              className="h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: accent }}
            >
              <Ionicons name="camera" size={29} color="#FFFFFF" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold" style={{ color: primaryText }}>Use Camera</Text>
              <Text className="mt-0.5 text-sm" style={{ color: mutedText }}>
                Open camera to capture a picture
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={mutedText} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onGallery}
            activeOpacity={0.85}
            accessibilityRole="button"
            className="mb-3 flex-row items-center rounded-3xl border px-5 py-4"
            style={{ borderColor, backgroundColor: galleryBackground }}
          >
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB] dark:bg-[#3B82F6]">
              <Ionicons name="images" size={29} color="#FFFFFF" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold" style={{ color: primaryText }}>
                Choose from Gallery
              </Text>
              <Text className="mt-0.5 text-sm" style={{ color: mutedText }}>
                Select a picture from your device library
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={mutedText} />
          </TouchableOpacity>

          {hasPhoto && onRemove && (
            <TouchableOpacity
              onPress={onRemove}
              activeOpacity={0.85}
              className="mb-3 items-center rounded-3xl border border-red-200 bg-red-50 py-4 dark:border-red-500/30 dark:bg-red-500/10"
            >
              <Text className="text-sm font-bold text-red-600 dark:text-red-400">Remove Photo</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            className="items-center rounded-3xl py-4"
            style={{ backgroundColor: controlBackground }}
          >
            <Text className="text-base font-bold" style={{ color: cancelText }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
