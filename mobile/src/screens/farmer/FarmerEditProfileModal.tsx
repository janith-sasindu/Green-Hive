import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { isValidEmail, isValidPhone } from "../../utils/validation";

export interface FarmerProfileData {
  name: string;
  role: string;
  location: string;
  phone: string;
  email: string;
  memberSince: string;
  avatarLetter: string;
  rating: number;
  completedSales: number;
  totalEarnings: string;
  activeListings: string;
}

interface FarmerEditProfileModalProps {
  visible: boolean;
  profile: FarmerProfileData;
  isDark: boolean;
  onClose: () => void;
  onSave: (profile: FarmerProfileData) => void;
}

interface ProfileFieldProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences";
  error?: string;
}

const ProfileField = ({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
  error,
}: ProfileFieldProps) => (
  <View className="mb-3.5">
    <Text className="mb-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300">{label}</Text>
    <View
      className={`flex-row items-center rounded-2xl border px-3.5 py-2.5 ${
        error ? "border-red-300 dark:border-red-500/60" : "border-gray-200/70 dark:border-slate-600"
      } bg-gray-50 dark:bg-slate-700/60`}
    >
      <Ionicons name={icon} size={18} color="#6B7280" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        className="ml-2.5 flex-1 p-0 text-sm font-semibold text-gray-900 dark:text-white"
      />
    </View>
    {error && <Text className="mt-1 text-[11px] text-red-500">{error}</Text>}
  </View>
);

export const FarmerEditProfileModal = ({
  visible,
  profile,
  isDark,
  onClose,
  onSave,
}: FarmerEditProfileModalProps) => {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [location, setLocation] = useState(profile.location);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(profile.name);
    setPhone(profile.phone);
    setEmail(profile.email);
    setLocation(profile.location);
    setShowErrors(false);
  }, [visible, profile]);

  const trimmedName = name.trim();
  const trimmedLocation = location.trim();
  const nameError = trimmedName ? undefined : "Enter your full name.";
  const phoneError = isValidPhone(phone) ? undefined : "Enter a valid phone number.";
  const emailError = isValidEmail(email) ? undefined : "Enter a valid email address.";
  const locationError = trimmedLocation ? undefined : "Enter your farm location.";

  const handleSave = () => {
    if (nameError || phoneError || emailError || locationError) {
      setShowErrors(true);
      return;
    }

    onSave({
      ...profile,
      name: trimmedName,
      avatarLetter: trimmedName.charAt(0).toUpperCase(),
      phone: phone.trim(),
      email: email.trim(),
      location: trimmedLocation,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end"
      >
        <View className="max-h-[92%] rounded-t-3xl bg-white dark:bg-slate-900">
          <View className="flex-row items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-700">
            <View>
              <Text className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</Text>
              <Text className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                Update your personal and farm details
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close edit profile"
              className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800"
            >
              <Ionicons name="close" size={20} color={isDark ? "#CBD5E1" : "#4B5563"} />
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, paddingBottom: 28 }}
          >
            <ProfileField
              label="Full Name"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              error={showErrors ? nameError : undefined}
            />
            <ProfileField
              label="Phone Number"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              placeholder="+94 71 234 5678"
              keyboardType="phone-pad"
              error={showErrors ? phoneError : undefined}
            />
            <ProfileField
              label="Email Address"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={showErrors ? emailError : undefined}
            />
            <ProfileField
              label="Farm Location"
              icon="location-outline"
              value={location}
              onChangeText={setLocation}
              placeholder="Enter your farm location"
              error={showErrors ? locationError : undefined}
            />

            <View className="mt-2 flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                accessibilityRole="button"
                className="flex-1 items-center rounded-2xl border border-gray-200 py-3.5 dark:border-slate-600"
              >
                <Text className="text-sm font-bold text-gray-600 dark:text-slate-300">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                accessibilityRole="button"
                className="flex-1 items-center rounded-2xl bg-[#166534] py-3.5"
              >
                <Text className="text-sm font-bold text-white">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
