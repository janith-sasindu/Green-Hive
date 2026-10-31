import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  useWindowDimensions,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { SmoothScrollView } from "../../components/common/SmoothScrollView";
import { ThemedAlertModal, ThemedAlertModalType } from "../../components/common";
import { useTransporterTheme } from "../../context/TransporterThemeContext";
import { MOCK_TRANSPORTER_PROFILE, TransporterProfile } from "./data";

export interface TransporterEditProfileScreenProps {
  navigation?: any;
  onBack?: () => void;
  onSave?: (updatedProfile: TransporterProfile) => void;
}

const VEHICLE_PRESETS = [
  "Lorry - 3 Ton",
  "Mini Lorry - 1.5 Ton",
  "Pickup Truck",
  "Van - 1 Ton",
  "Refrigerated Truck",
];

export const TransporterEditProfileScreen: React.FC<TransporterEditProfileScreenProps> = ({
  navigation,
  onBack,
  onSave,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { isDark, colors } = useTransporterTheme();

  // Responsive Breakpoints
  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;

  // Form Fields State
  const [name, setName] = useState(MOCK_TRANSPORTER_PROFILE.name || "");
  const [phone, setPhone] = useState(MOCK_TRANSPORTER_PROFILE.phone || "");
  const [email, setEmail] = useState(MOCK_TRANSPORTER_PROFILE.email || "");
  const [baseLocation, setBaseLocation] = useState(MOCK_TRANSPORTER_PROFILE.baseLocation || "Colombo");
  const [vehicleType, setVehicleType] = useState(MOCK_TRANSPORTER_PROFILE.vehicleType || "Lorry - 3 Ton");
  const [vehiclePlate, setVehiclePlate] = useState(MOCK_TRANSPORTER_PROFILE.vehiclePlate || "WP-LH-4821");
  const [avatarUri, setAvatarUri] = useState<string | undefined>(MOCK_TRANSPORTER_PROFILE.avatarUri);

  // Photo Modals & Processing State
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [tempPhotoUri, setTempPhotoUri] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  // Themed Alert Modal State
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    type?: ThemedAlertModalType;
    primaryButtonText?: string;
    onPrimaryPress?: () => void;
    secondaryButtonText?: string;
    onSecondaryPress?: () => void;
  } | null>(null);

  const showAlert = (
    title: string,
    message: string,
    options?: {
      type?: ThemedAlertModalType;
      primaryButtonText?: string;
      onPrimaryPress?: () => void;
      secondaryButtonText?: string;
      onSecondaryPress?: () => void;
    }
  ) => {
    setAlertConfig({
      title,
      message,
      type: options?.type || "warning",
      primaryButtonText: options?.primaryButtonText || "Got It",
      onPrimaryPress: options?.onPrimaryPress,
      secondaryButtonText: options?.secondaryButtonText,
      onSecondaryPress: options?.onSecondaryPress,
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

  // Photo handlers
  const handleUseCamera = async () => {
    setShowSourceModal(false);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showAlert(
          "Camera Permission Required",
          "GreenHive needs camera access to capture a picture for your profile. Please enable camera permission in your phone settings.",
          { type: "warning" }
        );
        return;
      }

      setIsProcessingPhoto(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setTempPhotoUri(result.assets[0].uri);
        setShowPreviewModal(true);
      }
    } catch (err) {
      showAlert(
        "Camera Error",
        "Could not launch camera. Please check your device settings and try again.",
        { type: "error" }
      );
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handlePickFromGallery = async () => {
    setShowSourceModal(false);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert(
          "Gallery Permission Required",
          "GreenHive needs photo library access to select a profile picture. Please enable gallery access in your device settings.",
          { type: "warning" }
        );
        return;
      }

      setIsProcessingPhoto(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setTempPhotoUri(result.assets[0].uri);
        setShowPreviewModal(true);
      }
    } catch (err) {
      showAlert(
        "Gallery Error",
        "Could not open photo library. Please check your permissions and try again.",
        { type: "error" }
      );
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleConfirmPhotoUpload = () => {
    if (!tempPhotoUri) return;
    setAvatarUri(tempPhotoUri);
    setShowPreviewModal(false);
    setTempPhotoUri(null);
  };

  const handleRemovePhoto = () => {
    setShowSourceModal(false);
    showAlert(
      "Remove Photo",
      "Are you sure you want to remove your profile photo and restore the initial letter?",
      {
        type: "warning",
        primaryButtonText: "Remove",
        onPrimaryPress: () => {
          setAvatarUri(undefined);
        },
        secondaryButtonText: "Cancel",
      }
    );
  };

  // Form Submission
  const handleSaveProfile = () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedLocation = baseLocation.trim();
    const trimmedVehicle = vehicleType.trim();
    const trimmedPlate = vehiclePlate.trim().toUpperCase();

    if (!trimmedName) {
      showAlert("Missing Name", "Please enter your full driver name.", { type: "warning" });
      return;
    }

    if (!trimmedPhone || trimmedPhone.length < 9) {
      showAlert("Invalid Phone Number", "Please enter a valid contact phone number.", { type: "warning" });
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      showAlert("Invalid Email", "Please enter a valid email address.", { type: "warning" });
      return;
    }

    if (!trimmedVehicle) {
      showAlert("Missing Vehicle Type", "Please specify your vehicle type.", { type: "warning" });
      return;
    }

    if (!trimmedPlate) {
      showAlert("Missing License Plate", "Please enter your vehicle license plate number.", { type: "warning" });
      return;
    }

    // Save to shared mock data
    MOCK_TRANSPORTER_PROFILE.name = trimmedName;
    MOCK_TRANSPORTER_PROFILE.avatarLetter = trimmedName.charAt(0).toUpperCase();
    MOCK_TRANSPORTER_PROFILE.phone = trimmedPhone;
    MOCK_TRANSPORTER_PROFILE.email = trimmedEmail;
    MOCK_TRANSPORTER_PROFILE.baseLocation = trimmedLocation;
    MOCK_TRANSPORTER_PROFILE.vehicleType = trimmedVehicle;
    MOCK_TRANSPORTER_PROFILE.vehiclePlate = trimmedPlate;

    if (avatarUri) {
      MOCK_TRANSPORTER_PROFILE.avatarUri = avatarUri;
    } else {
      delete MOCK_TRANSPORTER_PROFILE.avatarUri;
    }

    const updatedProfile: TransporterProfile = { ...MOCK_TRANSPORTER_PROFILE };

    showAlert(
      "Profile Updated!",
      "Your contact details, vehicle information, and profile picture have been updated successfully.",
      {
        type: "success",
        primaryButtonText: "Done",
        onPrimaryPress: () => {
          if (onSave) {
            onSave(updatedProfile);
          }
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
          {/* Back Button & Title */}
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
                Edit Profile
              </Text>
              <Text className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400">
                Update your contact & vehicle details
              </Text>
            </View>
          </View>

          {/* Quick Save Header Text Button */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleSaveProfile}
            className="px-3.5 py-1.5 rounded-full bg-[#E68A00]"
          >
            <Text className="text-xs font-bold text-white">Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Scrollable Form Body */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <SmoothScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: isSmallDevice ? 14 : 16,
            paddingTop: 8,
            paddingBottom: 48,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}>
            {/* ================= 1. AVATAR EDIT HERO CARD ================= */}
            <View className="items-center py-4 mb-4">
              <View className="relative">
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setShowSourceModal(true)}
                  className="rounded-full bg-[#E68A00] items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-md"
                  style={{
                    width: isSmallDevice ? 88 : 96,
                    height: isSmallDevice ? 88 : 96,
                    elevation: 5,
                  }}
                >
                  {avatarUri ? (
                    <Image
                      source={{ uri: avatarUri }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-3xl font-black text-white">
                      {name.trim() ? name.trim().charAt(0).toUpperCase() : "R"}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Camera Badge Icon */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setShowSourceModal(true)}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#E68A00] items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm"
                >
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowSourceModal(true)}
                className="mt-2.5 flex-row items-center"
              >
                <Ionicons name="pencil-outline" size={14} color="#E68A00" />
                <Text className="text-xs font-bold text-[#E68A00] ml-1">
                  Change Profile Picture
                </Text>
              </TouchableOpacity>
            </View>

            {/* ================= 2. PERSONAL & CONTACT DETAILS ================= */}
            <View className="rounded-3xl bg-white dark:bg-slate-800 p-4 sm:p-5 border border-gray-100 dark:border-slate-700 shadow-2xs mb-4">
              <View className="flex-row items-center mb-3.5 pb-2.5 border-b border-gray-100 dark:border-slate-700">
                <View className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 items-center justify-center mr-2.5">
                  <Ionicons name="person-outline" size={17} color="#E68A00" />
                </View>
                <Text className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  Personal & Contact Details
                </Text>
              </View>

              {/* Full Name */}
              <View className="mb-3.5">
                <Text className="text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
                  Full Name
                </Text>
                <View className="flex-row items-center px-3.5 py-2.5 sm:py-3 rounded-2xl bg-gray-50 dark:bg-slate-700/60 border border-gray-200/70 dark:border-slate-600">
                  <Ionicons name="person-outline" size={18} color={colors.icon} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white p-0"
                  />
                </View>
              </View>

              {/* Phone Number */}
              <View className="mb-3.5">
                <Text className="text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
                  Phone Number
                </Text>
                <View className="flex-row items-center px-3.5 py-2.5 sm:py-3 rounded-2xl bg-gray-50 dark:bg-slate-700/60 border border-gray-200/70 dark:border-slate-600">
                  <Ionicons name="call-outline" size={18} color={colors.icon} />
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="+94 7X XXX XXXX"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white p-0"
                  />
                </View>
              </View>

              {/* Email Address */}
              <View className="mb-3.5">
                <Text className="text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
                  Email Address
                </Text>
                <View className="flex-row items-center px-3.5 py-2.5 sm:py-3 rounded-2xl bg-gray-50 dark:bg-slate-700/60 border border-gray-200/70 dark:border-slate-600">
                  <Ionicons name="mail-outline" size={18} color={colors.icon} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="driver@transport.lk"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white p-0"
                  />
                </View>
              </View>

              {/* Base Location */}
              <View>
                <Text className="text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
                  Base Location
                </Text>
                <View className="flex-row items-center px-3.5 py-2.5 sm:py-3 rounded-2xl bg-gray-50 dark:bg-slate-700/60 border border-gray-200/70 dark:border-slate-600">
                  <Ionicons name="location-outline" size={18} color={colors.icon} />
                  <TextInput
                    value={baseLocation}
                    onChangeText={setBaseLocation}
                    placeholder="e.g. Colombo, Kandy, Dambulla"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white p-0"
                  />
                </View>
              </View>
            </View>

            {/* ================= 3. VEHICLE DETAILS ================= */}
            <View className="rounded-3xl bg-white dark:bg-slate-800 p-4 sm:p-5 border border-gray-100 dark:border-slate-700 shadow-2xs mb-6">
              <View className="flex-row items-center mb-3.5 pb-2.5 border-b border-gray-100 dark:border-slate-700">
                <View className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 items-center justify-center mr-2.5">
                  <Ionicons name="bus-outline" size={17} color="#3B82F6" />
                </View>
                <View>
                  <Text className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    Vehicle Details
                  </Text>
                  <Text className="text-[11px] text-gray-400 dark:text-slate-400">
                    Displayed on your driver profile and transport offers
                  </Text>
                </View>
              </View>

              {/* Vehicle Type */}
              <View className="mb-3.5">
                <Text className="text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
                  Vehicle Type / Capacity
                </Text>
                <View className="flex-row items-center px-3.5 py-2.5 sm:py-3 rounded-2xl bg-gray-50 dark:bg-slate-700/60 border border-gray-200/70 dark:border-slate-600 mb-2">
                  <Ionicons name="car-outline" size={18} color={colors.icon} />
                  <TextInput
                    value={vehicleType}
                    onChangeText={setVehicleType}
                    placeholder="e.g. Lorry - 3 Ton"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-2.5 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white p-0"
                  />
                </View>

                {/* Quick Presets Pills */}
                <View className="flex-row flex-wrap gap-1.5 mt-1">
                  {VEHICLE_PRESETS.map((preset) => {
                    const isSelected = vehicleType === preset;
                    return (
                      <TouchableOpacity
                        key={preset}
                        activeOpacity={0.7}
                        onPress={() => setVehicleType(preset)}
                        className={`px-2.5 py-1 rounded-full border ${
                          isSelected
                            ? "bg-[#FFF5E6] dark:bg-amber-950/60 border-[#E68A00]"
                            : "bg-gray-100 dark:bg-slate-700/60 border-transparent"
                        }`}
                      >
                        <Text
                          className={`text-[11px] font-semibold ${
                            isSelected ? "text-[#E68A00]" : "text-gray-600 dark:text-slate-300"
                          }`}
                        >
                          {preset}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Vehicle License Plate */}
              <View>
                <Text className="text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1.5">
                  Vehicle Registration Plate Number
                </Text>
                <View className="flex-row items-center px-3.5 py-2.5 sm:py-3 rounded-2xl bg-gray-50 dark:bg-slate-700/60 border border-gray-200/70 dark:border-slate-600">
                  <Ionicons name="document-text-outline" size={18} color={colors.icon} />
                  <TextInput
                    value={vehiclePlate}
                    onChangeText={(val) => setVehiclePlate(val.toUpperCase())}
                    autoCapitalize="characters"
                    placeholder="e.g. WP-LH-4821"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-2.5 text-xs sm:text-sm font-bold text-gray-900 dark:text-white p-0 tracking-wider"
                  />
                </View>
              </View>
            </View>

            {/* ================= 4. ACTION BUTTONS ================= */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSaveProfile}
              className="w-full py-4 rounded-2xl sm:rounded-3xl bg-[#E68A00] flex-row items-center justify-center shadow-md mb-3"
              style={{
                shadowColor: "#E68A00",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text className="text-sm sm:text-base font-bold text-white ml-2">
                Save Profile Changes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGoBack}
              className="w-full py-3 items-center justify-center"
            >
              <Text className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-slate-400">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </SmoothScrollView>
      </KeyboardAvoidingView>

      {/* ================= PHOTO SOURCE SELECTION MODAL ================= */}
      <Modal
        visible={showSourceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSourceModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-end sm:justify-center items-center p-0 sm:p-4">
          <TouchableOpacity
            activeOpacity={1}
            className="absolute inset-0"
            onPress={() => setShowSourceModal(false)}
          />
          <View
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border-t sm:border border-gray-100 dark:border-slate-700"
            style={{ elevation: 10 }}
          >
            <View className="items-center mb-3 sm:hidden">
              <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center space-x-3">
                <View className="h-10 w-10 rounded-full bg-[#FFF5E6] dark:bg-amber-950/40 items-center justify-center border border-amber-200/60 dark:border-amber-800/40">
                  <Ionicons name="camera" size={20} color="#E68A00" />
                </View>
                <View className="ml-3">
                  <Text className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    Update Photo
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-slate-400">
                    Capture or choose a new profile picture
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowSourceModal(false)}
                className="h-8 w-8 rounded-full bg-gray-100 dark:bg-slate-700 items-center justify-center"
              >
                <Ionicons name="close" size={18} color={isDark ? "#94A3B8" : "#6B7280"} />
              </TouchableOpacity>
            </View>

            {/* Option 1: Use Camera */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleUseCamera}
              disabled={isProcessingPhoto}
              className="flex-row items-center p-3.5 mb-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40"
            >
              <View className="h-11 w-11 rounded-xl bg-[#E68A00] items-center justify-center mr-3 shadow-xs">
                <Ionicons name="camera" size={22} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                  Use Camera
                </Text>
                <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Open camera to capture a picture
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={isDark ? "#94A3B8" : "#9CA3AF"} />
            </TouchableOpacity>

            {/* Option 2: Choose from Gallery */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePickFromGallery}
              disabled={isProcessingPhoto}
              className="flex-row items-center p-3.5 mb-2.5 rounded-2xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200/60 dark:border-slate-700"
            >
              <View className="h-11 w-11 rounded-xl bg-blue-500 items-center justify-center mr-3 shadow-xs">
                <Ionicons name="images" size={22} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                  Choose from Gallery
                </Text>
                <Text className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Select a picture from your device library
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={isDark ? "#94A3B8" : "#9CA3AF"} />
            </TouchableOpacity>

            {/* Option 3: Remove Current Photo */}
            {avatarUri && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleRemovePhoto}
                className="flex-row items-center p-3.5 mb-2.5 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40"
              >
                <View className="h-11 w-11 rounded-xl bg-red-500 items-center justify-center mr-3 shadow-xs">
                  <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-red-600 dark:text-red-400">
                    Remove Current Photo
                  </Text>
                  <Text className="text-xs text-red-400 dark:text-red-300 mt-0.5">
                    Revert back to default initial letter
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#EF4444" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowSourceModal(false)}
              className="mt-1 py-3.5 rounded-2xl bg-gray-100 dark:bg-slate-700 items-center justify-center"
            >
              <Text className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= IN-SCREEN PICTURE PREVIEW MODAL ================= */}
      <Modal
        visible={showPreviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowPreviewModal(false);
          setTempPhotoUri(null);
        }}
      >
        <View className="flex-1 bg-black/75 justify-center items-center p-4">
          <View
            className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-slate-700 items-center"
            style={{ elevation: 12 }}
          >
            <View className="items-center mb-4">
              <View className="h-12 w-12 rounded-full bg-[#FFF5E6] dark:bg-amber-950/40 items-center justify-center border border-amber-200/60 dark:border-amber-800/40 mb-2">
                <Ionicons name="person-circle-outline" size={28} color="#E68A00" />
              </View>
              <Text className="text-lg font-bold text-gray-900 dark:text-white text-center">
                Preview Picture
              </Text>
              <Text className="text-xs text-gray-500 dark:text-slate-400 text-center mt-1 px-2">
                Review your photo before setting it on your profile
              </Text>
            </View>

            <View className="my-2 items-center justify-center">
              <View
                className="rounded-full border-4 border-[#E68A00] p-1 shadow-lg bg-gray-100 dark:bg-slate-700"
                style={{
                  shadowColor: "#E68A00",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  elevation: 8,
                }}
              >
                {tempPhotoUri && (
                  <Image
                    source={{ uri: tempPhotoUri }}
                    style={{ width: 150, height: 150, borderRadius: 75 }}
                    resizeMode="cover"
                  />
                )}
              </View>

              <View className="flex-row items-center mt-3 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full border border-amber-200/50 dark:border-amber-800/40">
                <Ionicons name="sparkles" size={12} color="#E68A00" />
                <Text className="text-[11px] font-semibold text-[#E68A00] ml-1.5">
                  Looking sharp!
                </Text>
              </View>
            </View>

            <View className="w-full mt-4">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleConfirmPhotoUpload}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#E68A00] flex-row items-center justify-center shadow-md mb-2.5"
              >
                <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                <Text className="text-sm font-bold text-white ml-2">
                  Use as Profile Picture
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setShowPreviewModal(false);
                  setShowSourceModal(true);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gray-100 dark:bg-slate-700/80 border border-gray-200 dark:border-slate-600 flex-row items-center justify-center mb-1.5"
              >
                <Ionicons name="refresh-outline" size={17} color={isDark ? "#CBD5E1" : "#4B5563"} />
                <Text className="text-sm font-semibold text-gray-700 dark:text-slate-200 ml-2">
                  Retake or Choose Again
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setShowPreviewModal(false);
                  setTempPhotoUri(null);
                }}
                className="w-full py-2.5 items-center justify-center"
              >
                <Text className="text-xs font-medium text-gray-400 dark:text-slate-500">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
          secondaryButtonText={alertConfig.secondaryButtonText}
          onSecondaryPress={() => {
            const cb = alertConfig.onSecondaryPress;
            setAlertConfig(null);
            if (cb) cb();
          }}
          onClose={() => setAlertConfig(null)}
        />
      )}
    </View>
  );
};

export default TransporterEditProfileScreen;
