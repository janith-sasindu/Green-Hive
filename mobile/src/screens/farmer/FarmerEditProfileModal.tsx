import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
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
import * as ImagePicker from "expo-image-picker";
import { isValidEmail, isValidPhone } from "../../utils/validation";
import { FarmerPhotoSourceModal } from "./FarmerPhotoSourceModal";

export interface FarmerProfileData {
  name: string;
  role: string;
  location: string;
  phone: string;
  email: string;
  memberSince: string;
  avatarLetter: string;
  avatarUri?: string;
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
  onReopen?: () => void;
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
  isDark: boolean;
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
  isDark,
}: ProfileFieldProps) => (
  <View className="mb-3.5">
    <Text
      className="mb-1.5 text-xs font-semibold"
      style={{ color: isDark ? "#B7D8BD" : "#4B5563" }}
    >
      {label}
    </Text>
    <View
      className="flex-row items-center rounded-2xl border px-3.5 py-2.5"
      style={{
        borderColor: error ? (isDark ? "#F87171" : "#FCA5A5") : isDark ? "#2A3D2E" : "#E5E7EB",
        backgroundColor: isDark ? "#1E3324" : "#F9FAFB",
      }}
    >
      <Ionicons name={icon} size={18} color={isDark ? "#A7D9B0" : "#4B5563"} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#94A3B8" : "#9CA3AF"}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        className="ml-2.5 flex-1 p-0 text-sm font-semibold"
        style={{ color: isDark ? "#E8F5EA" : "#111827" }}
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
  onReopen,
  onSave,
}: FarmerEditProfileModalProps) => {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [location, setLocation] = useState(profile.location);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(profile.avatarUri);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [photoSourceVisible, setPhotoSourceVisible] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const surface = isDark ? "#1C2B1F" : "#FFFFFF";
  const border = isDark ? "#2A3D2E" : "#F3F4F6";
  const primaryText = isDark ? "#E8F5EA" : "#111827";
  const mutedText = isDark ? "#8DB898" : "#6B7280";

  useEffect(() => {
    if (!visible) return;
    setName(profile.name);
    setPhone(profile.phone);
    setEmail(profile.email);
    setLocation(profile.location);
    setAvatarUri(profile.avatarUri);
    setPreviewUri(null);
    setShowErrors(false);
  }, [visible, profile]);

  const handleTakePhoto = async () => {
    setPhotoSourceVisible(false);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Allow camera access in your device settings to take a profile photo."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets.length > 0) {
        setPreviewUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Camera Error", "Could not open the camera. Please try again.");
    } finally {
      onReopen?.();
    }
  };

  const handleChoosePhoto = async () => {
    setPhotoSourceVisible(false);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Gallery Permission Required",
          "Allow photo library access in your device settings to choose a profile photo."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets.length > 0) {
        setPreviewUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Gallery Error", "Could not open the photo library. Please try again.");
    } finally {
      onReopen?.();
    }
  };

  const openPhotoOptions = () => {
    onClose();
    setTimeout(() => setPhotoSourceVisible(true), 250);
  };

  const closePhotoOptions = () => {
    setPhotoSourceVisible(false);
    onReopen?.();
  };


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
      avatarUri,
      phone: phone.trim(),
      email: email.trim(),
      location: trimmedLocation,
    });
    onClose();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end"
      >
        <View className="max-h-[92%] rounded-t-3xl" style={{ backgroundColor: surface }}>
          <View
            className="flex-row items-center justify-between border-b px-5 py-4"
            style={{ borderBottomColor: border }}
          >
            <View>
              <Text className="text-xl font-bold" style={{ color: primaryText }}>Edit Profile</Text>
              <Text className="mt-0.5 text-xs" style={{ color: mutedText }}>
                Update your personal and farm details
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close edit profile"
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: isDark ? "#2A3D2E" : "#F3F4F6" }}
            >
              <Ionicons name="close" size={20} color={isDark ? "#CBD5E1" : "#4B5563"} />
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, paddingBottom: 28 }}
          >
            <View className="items-center pb-4">
              <Text className="mb-3 text-sm font-bold" style={{ color: primaryText }}>
                Profile Picture
              </Text>
              <View className="relative">
                <TouchableOpacity
                  onPress={openPhotoOptions}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Change profile picture"
                  className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#166534] shadow-md dark:border-slate-800"
                >
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} className="h-full w-full" resizeMode="cover" />
                  ) : (
                    <Text className="text-3xl font-black text-white">
                      {name.trim() ? name.trim().charAt(0).toUpperCase() : "S"}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={openPhotoOptions}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Upload profile picture"
                  className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#166534] dark:border-slate-800"
                >
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <Text className="mt-1 text-[11px]" style={{ color: mutedText }}>
                Add a clear photo so buyers can recognize your farmer profile
              </Text>
              <TouchableOpacity onPress={openPhotoOptions} activeOpacity={0.7} className="mt-2 flex-row items-center">
                <Ionicons name="cloud-upload-outline" size={14} color="#166534" />
                <Text className="ml-1 text-xs font-bold text-[#166534] dark:text-green-400">
                  Change Profile Picture
                </Text>
              </TouchableOpacity>
            </View>

            <ProfileField
              label="Full Name"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              error={showErrors ? nameError : undefined}
              isDark={isDark}
            />
            <ProfileField
              label="Phone Number"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              placeholder="+94 71 234 5678"
              keyboardType="phone-pad"
              error={showErrors ? phoneError : undefined}
              isDark={isDark}
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
              isDark={isDark}
            />
            <ProfileField
              label="Farm Location"
              icon="location-outline"
              value={location}
              onChangeText={setLocation}
              placeholder="Enter your farm location"
              error={showErrors ? locationError : undefined}
              isDark={isDark}
            />

            <View className="mt-2 flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                accessibilityRole="button"
                className="flex-1 items-center rounded-2xl border py-3.5"
                style={{ borderColor: border }}
              >
                <Text className="text-sm font-bold" style={{ color: mutedText }}>Cancel</Text>
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

      <Modal
        visible={previewUri !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/75 px-5">
          <View
            className="w-full max-w-sm items-center rounded-3xl p-6"
            style={{ backgroundColor: surface }}
          >
            <Ionicons name="person-circle-outline" size={32} color="#166534" />
            <Text className="mt-2 text-lg font-bold" style={{ color: primaryText }}>
              Preview Picture
            </Text>
            <Text className="mt-1 text-center text-xs" style={{ color: mutedText }}>
              Review your photo before setting it on your profile
            </Text>
            {previewUri && (
              <Image
                source={{ uri: previewUri }}
                className="my-5 h-36 w-36 rounded-full border-4 border-[#166534]"
                resizeMode="cover"
              />
            )}
            <TouchableOpacity
              onPress={() => {
                if (previewUri) setAvatarUri(previewUri);
                setPreviewUri(null);
              }}
              className="w-full items-center rounded-2xl bg-[#166534] py-3.5"
            >
              <Text className="text-sm font-bold text-white">Use as Profile Picture</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setPreviewUri(null);
                openPhotoOptions();
              }}
              className="mt-2 w-full items-center rounded-2xl py-3"
              style={{ backgroundColor: isDark ? "#1E3324" : "#F3F4F6" }}
            >
              <Text className="text-sm font-semibold" style={{ color: primaryText }}>
                Retake or Choose Again
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPreviewUri(null)} className="mt-2 py-2">
              <Text className="text-xs" style={{ color: mutedText }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <FarmerPhotoSourceModal
        visible={photoSourceVisible}
        isDark={isDark}
        title="Update Photo"
        subtitle="Capture or choose a new profile picture"
        hasPhoto={Boolean(avatarUri)}
        onClose={closePhotoOptions}
        onCamera={handleTakePhoto}
        onGallery={handleChoosePhoto}
        onRemove={() => {
          setPhotoSourceVisible(false);
          setAvatarUri(undefined);
          onReopen?.();
        }}
      />
    </>
  );
};
