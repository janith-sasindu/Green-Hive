import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
  Alert,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  SmoothScrollView,
  ThemedAlertModal,
  ThemedAlertModalType,
} from "../../components/common";
import { useTransporterTheme } from "../../context/TransporterThemeContext";

// Data
import {
  MOCK_TRANSPORTER_PROFILE,
  MOCK_TRANSPORTER_VEHICLE_LICENSE,
  TransporterProfile,
  TransporterVehicleAndLicense,
} from "./data";

export interface TransporterVehicleLicenseScreenProps {
  navigation?: any;
  onBack?: () => void;
  onSelectTab?: (tab: "home" | "jobs" | "active" | "profile") => void;
  activeTab?: "home" | "jobs" | "active" | "profile";
}

const VEHICLE_TYPE_PRESETS = [
  "Lorry - 3 Ton",
  "Mini Lorry - 1.5 Ton",
  "Pickup Truck",
  "Van - 1 Ton",
  "Refrigerated Truck",
  "Heavy Lorry - 5 Ton",
];

export const TransporterVehicleLicenseScreen: React.FC<
  TransporterVehicleLicenseScreenProps
> = ({
  navigation,
  onBack,
  onSelectTab,
  activeTab = "profile",
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { isDark, colors } = useTransporterTheme();

  // Responsive breakpoints
  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;

  // Active filter tab
  const [activeSection, setActiveSection] = useState<
    "all" | "license" | "vehicle"
  >("all");

  // State
  const [profile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);
  const [data, setData] = useState<TransporterVehicleAndLicense>({
    ...MOCK_TRANSPORTER_VEHICLE_LICENSE,
  });

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLicenseNo, setEditLicenseNo] = useState(data.licenseNumber);
  const [editLicenseExpiry, setEditLicenseExpiry] = useState(data.licenseExpiry);
  const [editPlate, setEditPlate] = useState(data.vehiclePlate);
  const [editVehicleType, setEditVehicleType] = useState(data.vehicleType);
  const [editMakeModel, setEditMakeModel] = useState(data.vehicleMakeModel);
  const [editCapacity, setEditCapacity] = useState(String(data.maxCapacityKg));

  // Photo viewer modal
  const [previewPhotoUri, setPreviewPhotoUri] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");

  // Photo upload target state
  const [photoUploadTarget, setPhotoUploadTarget] = useState<
    "licenseFront" | "licenseBack" | "vehicle" | null
  >(null);
  const [showPhotoSourceModal, setShowPhotoSourceModal] = useState(false);

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
      primaryButtonText: options?.primaryButtonText || "OK",
      onPrimaryPress: options?.onPrimaryPress,
    });
  };

  // Header Back Button
  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate("TransporterProfile");
    }
  };

  // Tab Press Navigation
  const handleTabPress = (tab: "home" | "jobs" | "active" | "profile") => {
    if (onSelectTab) {
      onSelectTab(tab);
    } else if (tab === "home") {
      navigation?.navigate?.("TransporterHome");
    } else if (tab === "jobs") {
      navigation?.navigate?.("TransporterAvailableJobs");
    } else if (tab === "active") {
      navigation?.navigate?.("TransporterActiveJob");
    } else if (tab === "profile") {
      navigation?.navigate?.("TransporterProfile");
    }
  };

  // Photo Upload Handlers
  const handleInitiatePhotoUpload = (
    target: "licenseFront" | "licenseBack" | "vehicle"
  ) => {
    setPhotoUploadTarget(target);
    setShowPhotoSourceModal(true);
  };

  const handleTakePhoto = async () => {
    setShowPhotoSourceModal(false);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showAlert(
          "Camera Permission Required",
          "Please grant camera access to photograph your license or vehicle document.",
          { type: "warning" }
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updatePhoto(result.assets[0].uri);
      }
    } catch {
      showAlert("Camera Error", "Could not open camera on this device.", {
        type: "error",
      });
    }
  };

  const handlePickFromGallery = async () => {
    setShowPhotoSourceModal(false);
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert(
          "Gallery Permission Required",
          "Please allow photo library access to upload documents.",
          { type: "warning" }
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updatePhoto(result.assets[0].uri);
      }
    } catch {
      showAlert("Gallery Error", "Could not open photo library.", {
        type: "error",
      });
    }
  };

  const updatePhoto = (uri: string) => {
    if (!photoUploadTarget) return;

    setData((prev) => {
      const next = { ...prev };
      if (photoUploadTarget === "licenseFront") next.licenseFrontPhotoUri = uri;
      if (photoUploadTarget === "licenseBack") next.licenseBackPhotoUri = uri;
      if (photoUploadTarget === "vehicle") next.vehiclePhotoUri = uri;

      // Update shared mock
      Object.assign(MOCK_TRANSPORTER_VEHICLE_LICENSE, next);
      return next;
    });

    showAlert(
      "Document Uploaded",
      "Your document has been updated and sent to verification.",
      { type: "success" }
    );
  };

  // Save Edits Handler
  const handleSaveEdits = () => {
    if (!editPlate.trim() || !editLicenseNo.trim() || !editVehicleType.trim()) {
      showAlert(
        "Missing Information",
        "Vehicle Plate Number, Vehicle Type, and Driving License Number are required.",
        { type: "warning" }
      );
      return;
    }

    const updatedData: TransporterVehicleAndLicense = {
      ...data,
      licenseNumber: editLicenseNo.trim().toUpperCase(),
      licenseExpiry: editLicenseExpiry.trim(),
      vehiclePlate: editPlate.trim().toUpperCase(),
      vehicleType: editVehicleType.trim(),
      vehicleMakeModel: editMakeModel.trim(),
      maxCapacityKg: parseInt(editCapacity) || data.maxCapacityKg,
    };

    // Keep global mocks updated
    Object.assign(MOCK_TRANSPORTER_VEHICLE_LICENSE, updatedData);
    MOCK_TRANSPORTER_PROFILE.vehiclePlate = updatedData.vehiclePlate;
    MOCK_TRANSPORTER_PROFILE.vehicleType = updatedData.vehicleType;

    setData(updatedData);
    setShowEditModal(false);

    showAlert(
      "Details Updated!",
      "Your vehicle specifications and driving license information have been successfully updated.",
      { type: "success" }
    );
  };

  return (
    <View className="flex-1 bg-[#F5F8F6] dark:bg-slate-900">
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0F172A" : "#F5F8F6"}
      />

      {/* ================= 1. HEADER ================= */}
      <SafeAreaView edges={["top"]} className="bg-[#F5F8F6] dark:bg-slate-900">
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className={`flex-row items-center justify-between px-4 sm:px-5 ${
            isSmallDevice ? "py-2" : "py-2.5"
          }`}
        >
          {/* Left: Back Arrow and Title */}
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGoBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="p-1 -ml-1 mr-2.5 rounded-full"
            >
              <Ionicons
                name="arrow-back"
                size={isExtraSmall ? 22 : 24}
                color={isDark ? "#FFFFFF" : "#1E293B"}
              />
            </TouchableOpacity>
            <View>
              <Text
                className={`font-bold text-[#1E293B] dark:text-white ${
                  isExtraSmall ? "text-lg" : "text-xl"
                }`}
              >
                Vehicle & License
              </Text>
              <Text className="text-[11px] text-[#64748B] dark:text-slate-400">
                Official Registered Documents
              </Text>
            </View>
          </View>

          {/* Right: Edit Button & Verified Shield */}
          <View className="flex-row items-center space-x-2 gap-2">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowEditModal(true)}
              className="flex-row items-center bg-[#FF8C00]/10 dark:bg-amber-950/40 px-3 py-1.5 rounded-full border border-[#FF8C00]/30"
            >
              <Ionicons name="pencil" size={13} color="#FF8C00" />
              <Text className="text-xs font-bold text-[#FF8C00] ml-1">Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* ================= 2. MAIN SCROLLABLE CONTENT ================= */}
      <SmoothScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: screenWidth < 360 ? 12 : 16,
          paddingTop: 8,
          paddingBottom: 28,
          alignItems: "center",
        }}
      >
        <View style={{ maxWidth: 640, width: "100%" }}>
          {/* Top Verified Status Banner */}
          <View className="rounded-2xl bg-[#EDFAF2] dark:bg-emerald-950/30 border border-[#B9F0D2] dark:border-emerald-800/50 p-3.5 sm:p-4 mb-3.5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 pr-2">
                <View className="h-8 w-8 rounded-full bg-[#16A34A] items-center justify-center mr-2.5">
                  <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-[13.5px] sm:text-[14.5px] font-bold text-[#166534] dark:text-emerald-400">
                    Carrier Documents Verified
                  </Text>
                  <Text className="text-[11px] sm:text-[11.5px] text-[#16A34A] dark:text-emerald-300 mt-0.5">
                    Verified on {data.verificationDate} · Green-Hive Fleet Safety
                  </Text>
                </View>
              </View>
              <View className="px-2.5 py-1 rounded-full bg-[#16A34A] items-center justify-center">
                <Text className="text-[10.5px] font-bold text-white uppercase tracking-wider">
                  Active
                </Text>
              </View>
            </View>
          </View>

          {/* Filter Pills */}
          <View className="flex-row items-center space-x-2 gap-2 mb-4">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveSection("all")}
              className={`px-3 py-1.5 rounded-full ${
                activeSection === "all"
                  ? "bg-[#1E293B] dark:bg-white"
                  : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  activeSection === "all"
                    ? "text-white dark:text-slate-900"
                    : "text-gray-600 dark:text-slate-300"
                }`}
              >
                All Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveSection("license")}
              className={`px-3 py-1.5 rounded-full ${
                activeSection === "license"
                  ? "bg-[#1E293B] dark:bg-white"
                  : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  activeSection === "license"
                    ? "text-white dark:text-slate-900"
                    : "text-gray-600 dark:text-slate-300"
                }`}
              >
                Driver License
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveSection("vehicle")}
              className={`px-3 py-1.5 rounded-full ${
                activeSection === "vehicle"
                  ? "bg-[#1E293B] dark:bg-white"
                  : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  activeSection === "vehicle"
                    ? "text-white dark:text-slate-900"
                    : "text-gray-600 dark:text-slate-300"
                }`}
              >
                Vehicle Specs
              </Text>
            </TouchableOpacity>
          </View>

          {/* ================= SECTION A: DRIVER'S LICENSE ================= */}
          {(activeSection === "all" || activeSection === "license") && (
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Ionicons name="card-outline" size={18} color="#FF8C00" />
                  <Text className="text-sm font-bold text-gray-900 dark:text-white ml-2">
                    Sri Lanka Driving Licence
                  </Text>
                </View>
                <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                  <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                  <Text className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 ml-1">
                    {data.licenseStatus}
                  </Text>
                </View>
              </View>

              {/* Sri Lankan Smart Card Style License Card */}
              <View
                className="rounded-3xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 p-4 sm:p-5 shadow-xs overflow-hidden relative"
                style={{
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 3 },
                }}
              >
                {/* Decorative Top Accent Bar */}
                <View className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-full mb-3.5" />

                <View className="flex-row items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
                  <View className="flex-1 pr-2">
                    <Text className="text-[10px] sm:text-[10.5px] uppercase font-bold text-[#64748B] dark:text-slate-400 tracking-wider">
                      DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA
                    </Text>
                    <Text className="text-base sm:text-lg font-black text-gray-900 dark:text-white mt-0.5">
                      DRIVING LICENCE
                    </Text>
                  </View>
                  <View className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 items-center justify-center">
                    <Text className="text-xl">🇱🇰</Text>
                  </View>
                </View>

                {/* Driver Photo & Primary Details Row */}
                <View className="flex-row items-start mt-4">
                  {/* Driver Photo */}
                  <View className="h-20 w-18 sm:h-24 sm:w-20 rounded-xl bg-slate-100 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 overflow-hidden mr-3.5 items-center justify-center">
                    {profile.avatarUri ? (
                      <Image
                        source={{ uri: profile.avatarUri }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons
                        name="person"
                        size={36}
                        color={isDark ? "#94A3B8" : "#CBD5E1"}
                      />
                    )}
                  </View>

                  {/* Driver Text Info */}
                  <View className="flex-1">
                    <Text className="text-[10.5px] text-[#64748B] dark:text-slate-400 font-semibold uppercase">
                      1. Name
                    </Text>
                    <Text className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-2">
                      {data.driverName}
                    </Text>

                    <View className="flex-row items-center">
                      <View className="flex-1">
                        <Text className="text-[10px] text-[#64748B] dark:text-slate-400 font-semibold uppercase">
                          4d. Licence No
                        </Text>
                        <Text className="text-xs sm:text-sm font-extrabold text-[#FF8C00]">
                          {data.licenseNumber}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-[10px] text-[#64748B] dark:text-slate-400 font-semibold uppercase">
                          NIC No
                        </Text>
                        <Text className="text-xs font-bold text-gray-800 dark:text-slate-200">
                          {data.nicNumber}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Key Dates & Blood Group */}
                <View className="grid grid-cols-3 flex-row items-center justify-between mt-3.5 pt-3 border-t border-gray-100 dark:border-slate-700">
                  <View>
                    <Text className="text-[10px] text-[#64748B] dark:text-slate-400 uppercase font-semibold">
                      4a. Issued
                    </Text>
                    <Text className="text-xs font-bold text-gray-800 dark:text-slate-200 mt-0.5">
                      {data.licenseIssueDate}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-[10px] text-[#64748B] dark:text-slate-400 uppercase font-semibold">
                      4b. Expires
                    </Text>
                    <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {data.licenseExpiry}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-[10px] text-[#64748B] dark:text-slate-400 uppercase font-semibold">
                      Blood Group
                    </Text>
                    <Text className="text-xs font-bold text-red-500 mt-0.5">
                      {data.bloodGroup}
                    </Text>
                  </View>
                </View>

                {/* Vehicle Categories Endorsements */}
                <View className="mt-3.5 pt-3 border-t border-gray-100 dark:border-slate-700">
                  <Text className="text-[10.5px] text-[#64748B] dark:text-slate-400 uppercase font-semibold mb-2">
                    9. Authorized Vehicle Classes
                  </Text>
                  <View className="flex-row flex-wrap gap-1.5">
                    {data.licenseCategories.map((cat, idx) => (
                      <View
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/80 border border-gray-200/80 dark:border-slate-600"
                      >
                        <Text className="text-[11px] font-bold text-gray-800 dark:text-slate-200">
                          {cat}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Photo Previews: Front & Back */}
                <View className="mt-4 pt-3.5 border-t border-gray-100 dark:border-slate-700">
                  <Text className="text-[11px] text-[#64748B] dark:text-slate-400 uppercase font-semibold mb-2.5">
                    Scanned Card Previews
                  </Text>
                  <View className="flex-row gap-2.5">
                    {/* Front Photo */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        if (data.licenseFrontPhotoUri) {
                          setPreviewPhotoUri(data.licenseFrontPhotoUri);
                          setPreviewTitle("Driving Licence - Front Side");
                        } else {
                          handleInitiatePhotoUpload("licenseFront");
                        }
                      }}
                      className="flex-1 rounded-xl overflow-hidden h-28 bg-slate-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 relative items-center justify-center"
                    >
                      {data.licenseFrontPhotoUri ? (
                        <>
                          <Image
                            source={{ uri: data.licenseFrontPhotoUri }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                          <View className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/60 px-2 py-0.5 rounded flex-row items-center justify-between">
                            <Text className="text-[9.5px] font-bold text-white">
                              Front Card
                            </Text>
                            <Ionicons name="expand" size={11} color="#FFFFFF" />
                          </View>
                        </>
                      ) : (
                        <View className="items-center">
                          <Ionicons name="camera-outline" size={24} color="#94A3B8" />
                          <Text className="text-[10px] text-gray-500 mt-1">
                            Upload Front
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Back Photo */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        if (data.licenseBackPhotoUri) {
                          setPreviewPhotoUri(data.licenseBackPhotoUri);
                          setPreviewTitle("Driving Licence - Back Side");
                        } else {
                          handleInitiatePhotoUpload("licenseBack");
                        }
                      }}
                      className="flex-1 rounded-xl overflow-hidden h-28 bg-slate-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 relative items-center justify-center"
                    >
                      {data.licenseBackPhotoUri ? (
                        <>
                          <Image
                            source={{ uri: data.licenseBackPhotoUri }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                          <View className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/60 px-2 py-0.5 rounded flex-row items-center justify-between">
                            <Text className="text-[9.5px] font-bold text-white">
                              Back Card
                            </Text>
                            <Ionicons name="expand" size={11} color="#FFFFFF" />
                          </View>
                        </>
                      ) : (
                        <View className="items-center">
                          <Ionicons name="camera-outline" size={24} color="#94A3B8" />
                          <Text className="text-[10px] text-gray-500 mt-1">
                            Upload Back
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Change License Document Photo button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleInitiatePhotoUpload("licenseFront")}
                    className="mt-2.5 py-2 rounded-xl bg-gray-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 items-center justify-center flex-row"
                  >
                    <Ionicons
                      name="cloud-upload-outline"
                      size={15}
                      color={isDark ? "#CBD5E1" : "#4B5563"}
                    />
                    <Text className="text-xs font-semibold text-gray-700 dark:text-slate-200 ml-1.5">
                      Upload Updated Licence Document
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* ================= SECTION B: VEHICLE SPECIFICATIONS ================= */}
          {(activeSection === "all" || activeSection === "vehicle") && (
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Ionicons name="bus-outline" size={18} color="#FF8C00" />
                  <Text className="text-sm font-bold text-gray-900 dark:text-white ml-2">
                    Registered Transport Vehicle
                  </Text>
                </View>
                <Text className="text-xs font-bold text-[#FF8C00]">
                  {data.vehicleType}
                </Text>
              </View>

              <View
                className="rounded-3xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 p-4 sm:p-5 shadow-xs"
                style={{
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 3 },
                }}
              >
                {/* Sri Lankan Number Plate Display Box */}
                <View className="rounded-2xl bg-[#0F172A] p-3 sm:p-4 mb-4 border-2 border-amber-400/40 shadow-xs">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="bg-amber-400 px-2 py-1 rounded-md mr-2.5 items-center justify-center">
                        <Text className="text-xs font-black text-black">
                          {data.vehiclePlate.split("-")[0] || "WP"}
                        </Text>
                      </View>
                      <Text className="text-xl sm:text-2xl font-black text-white tracking-widest font-mono">
                        {data.vehiclePlate}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[10px] text-amber-300 font-bold uppercase">
                        Commercial Cargo
                      </Text>
                      <Text className="text-[11px] text-white/80">
                        {data.vehicleYear} Model
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Make & Specs Grid */}
                <View className="grid grid-cols-2 gap-2.5">
                  <View className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-700/60 border border-gray-100 dark:border-slate-600">
                    <Text className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">
                      Make & Model
                    </Text>
                    <Text className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                      {data.vehicleMakeModel}
                    </Text>
                  </View>

                  <View className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-700/60 border border-gray-100 dark:border-slate-600">
                    <Text className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">
                      Max Load Capacity
                    </Text>
                    <Text className="text-sm font-bold text-[#16A34A] dark:text-emerald-400 mt-0.5">
                      {data.maxCapacityKg.toLocaleString()} kg ({data.maxCapacityKg / 1000} Ton)
                    </Text>
                  </View>

                  <View className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-700/60 border border-gray-100 dark:border-slate-600">
                    <Text className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">
                      Cargo Bay Dimensions
                    </Text>
                    <Text className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                      {data.cargoDimensions}
                    </Text>
                  </View>

                  <View className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-700/60 border border-gray-100 dark:border-slate-600">
                    <Text className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">
                      Fuel & Color
                    </Text>
                    <Text className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                      {data.fuelType} · {data.vehicleColor}
                    </Text>
                  </View>
                </View>

                {/* Vehicle Photo Preview */}
                <View className="mt-3.5 pt-3 border-t border-gray-100 dark:border-slate-700">
                  <Text className="text-[11px] text-[#64748B] dark:text-slate-400 uppercase font-semibold mb-2">
                    Vehicle Photo
                  </Text>
                  {data.vehiclePhotoUri ? (
                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={() => {
                        setPreviewPhotoUri(data.vehiclePhotoUri || null);
                        setPreviewTitle(`Vehicle - ${data.vehiclePlate}`);
                      }}
                      className="rounded-2xl overflow-hidden h-40 bg-slate-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 relative"
                    >
                      <Image
                        source={{ uri: data.vehiclePhotoUri }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      <View className="absolute bottom-2 right-2 bg-black/60 px-2.5 py-1 rounded-md flex-row items-center">
                        <Ionicons name="expand" size={12} color="#FFFFFF" />
                        <Text className="text-[11px] text-white font-medium ml-1">
                          Tap to enlarge
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleInitiatePhotoUpload("vehicle")}
                    className="mt-2.5 py-2 rounded-xl bg-gray-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 items-center justify-center flex-row"
                  >
                    <Ionicons
                      name="camera-outline"
                      size={15}
                      color={isDark ? "#CBD5E1" : "#4B5563"}
                    />
                    <Text className="text-xs font-semibold text-gray-700 dark:text-slate-200 ml-1.5">
                      Update Vehicle Photo
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Edit / Update Primary Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowEditModal(true)}
            className="rounded-2xl bg-[#FF8C00] py-3.5 sm:py-4 items-center justify-center shadow-xs flex-row"
            style={{
              elevation: 3,
              shadowColor: "#FF8C00",
              shadowOpacity: 0.2,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
            }}
          >
            <Ionicons name="create-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text className="text-sm sm:text-base font-bold text-white tracking-wide">
              Update Vehicle & License Details
            </Text>
          </TouchableOpacity>
        </View>
      </SmoothScrollView>

      {/* ================= 3. BOTTOM TAB NAVIGATION ================= */}
      <SafeAreaView
        edges={["bottom"]}
        className="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800"
      >
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className={`flex-row justify-around items-center ${
            isSmallDevice ? "py-1.5" : "py-2"
          }`}
        >
          {/* Home Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("home")}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name="home-outline"
              size={isSmallDevice ? 20 : 22}
              color={colors.iconMuted}
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-medium text-[#9CA3AF] dark:text-slate-400`}
            >
              Home
            </Text>
          </TouchableOpacity>

          {/* Jobs Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("jobs")}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name="location-outline"
              size={isSmallDevice ? 20 : 22}
              color={colors.iconMuted}
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-medium text-[#9CA3AF] dark:text-slate-400`}
            >
              Jobs
            </Text>
          </TouchableOpacity>

          {/* Active Tab */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("active")}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name="bus-outline"
              size={isSmallDevice ? 20 : 22}
              color={colors.iconMuted}
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-medium text-[#9CA3AF] dark:text-slate-400`}
            >
              Active
            </Text>
          </TouchableOpacity>

          {/* Profile Tab (Active Highlighted) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("profile")}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name="person"
              size={isSmallDevice ? 20 : 22}
              color="#FF8C00"
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-bold text-[#FF8C00]`}
            >
              Profile
            </Text>
            {/* Active Indicator Underline */}
            <View className="h-0.5 w-5 bg-[#FF8C00] rounded-full mt-0.5" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ================= 4. EDIT DETAILS MODAL ================= */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#F9FAFB] dark:bg-slate-900">
          <View
            style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
            className="px-4 sm:px-5 py-3 sm:py-3.5 flex-row items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800"
          >
            <Text className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Edit Vehicle & License
            </Text>
            <TouchableOpacity
              onPress={() => setShowEditModal(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="p-1 rounded-full bg-gray-100 dark:bg-slate-700"
            >
              <Ionicons name="close" size={22} color={colors.iconMuted} />
            </TouchableOpacity>
          </View>

          <SmoothScrollView
            className="p-4 flex-1"
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}>
              {/* License Number Input */}
              <View className="mb-3.5">
                <Text className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Driving Licence Number *
                </Text>
                <TextInput
                  value={editLicenseNo}
                  onChangeText={setEditLicenseNo}
                  placeholder="e.g. B3849201"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 dark:text-white"
                />
              </View>

              {/* License Expiry Input */}
              <View className="mb-3.5">
                <Text className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Licence Expiry Date
                </Text>
                <TextInput
                  value={editLicenseExpiry}
                  onChangeText={setEditLicenseExpiry}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#94A3B8"
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white"
                />
              </View>

              {/* Vehicle Plate Input */}
              <View className="mb-3.5">
                <Text className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Vehicle Plate / Reg No *
                </Text>
                <TextInput
                  value={editPlate}
                  onChangeText={setEditPlate}
                  placeholder="e.g. WP-LH-4821"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-black text-gray-900 dark:text-white"
                />
              </View>

              {/* Vehicle Type Input */}
              <View className="mb-3.5">
                <Text className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Vehicle Type / Category *
                </Text>
                <TextInput
                  value={editVehicleType}
                  onChangeText={setEditVehicleType}
                  placeholder="e.g. Lorry - 3 Ton, Mini Lorry, Pickup..."
                  placeholderTextColor="#94A3B8"
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-900 dark:text-white mb-2"
                />

                {/* Quick Presets */}
                <View className="flex-row flex-wrap gap-1.5">
                  {VEHICLE_TYPE_PRESETS.map((type, idx) => {
                    const isSelected = editVehicleType === type;
                    return (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.7}
                        onPress={() => setEditVehicleType(type)}
                        className={`px-2.5 py-1 rounded-xl border ${
                          isSelected
                            ? "bg-[#FF8C00] border-[#FF8C00]"
                            : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            isSelected
                              ? "text-white font-bold"
                              : "text-gray-600 dark:text-slate-300"
                          }`}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Make & Model Input */}
              <View className="mb-3.5">
                <Text className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Vehicle Make & Model
                </Text>
                <TextInput
                  value={editMakeModel}
                  onChangeText={setEditMakeModel}
                  placeholder="e.g. Isuzu Elf NPR 71"
                  placeholderTextColor="#94A3B8"
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white"
                />
              </View>

              {/* Max Capacity Input */}
              <View className="mb-5">
                <Text className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Max Payload Capacity (kg)
                </Text>
                <TextInput
                  value={editCapacity}
                  onChangeText={setEditCapacity}
                  placeholder="3000"
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white"
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSaveEdits}
                className="py-3.5 rounded-2xl bg-[#FF8C00] items-center justify-center shadow-xs"
              >
                <Text className="text-sm font-bold text-white">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </SmoothScrollView>
        </SafeAreaView>
      </Modal>

      {/* ================= 5. FULL PHOTO PREVIEW MODAL ================= */}
      <Modal
        visible={!!previewPhotoUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewPhotoUri(null)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center p-4">
          <SafeAreaView edges={["top"]} className="w-full">
            <View className="flex-row items-center justify-between py-2 px-2">
              <Text className="text-white font-bold text-base" numberOfLines={1}>
                {previewTitle || "Document Preview"}
              </Text>
              <TouchableOpacity
                onPress={() => setPreviewPhotoUri(null)}
                className="h-9 w-9 rounded-full bg-white/20 items-center justify-center"
              >
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <View className="flex-1 w-full justify-center items-center">
            {previewPhotoUri && (
              <Image
                source={{ uri: previewPhotoUri }}
                className="w-full h-full max-h-[70vh] rounded-2xl"
                resizeMode="contain"
              />
            )}
          </View>

          <SafeAreaView edges={["bottom"]} className="w-full">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPreviewPhotoUri(null)}
              className="py-3 rounded-xl bg-white/20 items-center justify-center mt-2"
            >
              <Text className="text-white font-bold text-sm">Close Preview</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ================= 6. PHOTO SOURCE PICKER MODAL ================= */}
      <Modal
        visible={showPhotoSourceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoSourceModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowPhotoSourceModal(false)}
          className="flex-1 bg-black/50 justify-end sm:justify-center items-center p-4"
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{ maxWidth: 420, width: "100%" }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-xl border border-gray-100 dark:border-slate-700"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Upload Document Photo
              </Text>
              <TouchableOpacity
                onPress={() => setShowPhotoSourceModal(false)}
                className="h-8 w-8 rounded-full bg-gray-100 dark:bg-slate-700 items-center justify-center"
              >
                <Ionicons name="close" size={18} color={isDark ? "#CBD5E1" : "#4B5563"} />
              </TouchableOpacity>
            </View>

            {/* Option 1: Camera */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleTakePhoto}
              className="flex-row items-center p-3.5 mb-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40"
            >
              <View className="h-10 w-10 rounded-xl bg-[#FF8C00] items-center justify-center mr-3.5">
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                  Take Photo with Camera
                </Text>
                <Text className="text-xs text-gray-500 dark:text-slate-400">
                  Capture document directly with your camera
                </Text>
              </View>
            </TouchableOpacity>

            {/* Option 2: Gallery */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePickFromGallery}
              className="flex-row items-center p-3.5 mb-3 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-gray-200 dark:border-slate-600/60"
            >
              <View className="h-10 w-10 rounded-xl bg-blue-500 items-center justify-center mr-3.5">
                <Ionicons name="images" size={20} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                  Choose from Gallery
                </Text>
                <Text className="text-xs text-gray-500 dark:text-slate-400">
                  Pick an existing photo from device files
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowPhotoSourceModal(false)}
              className="py-3 rounded-xl bg-gray-100 dark:bg-slate-700 items-center justify-center"
            >
              <Text className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-200">
                Cancel
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ================= 7. THEMED ALERT MODAL ================= */}
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
            cb?.();
          }}
          onClose={() => setAlertConfig(null)}
        />
      )}
    </View>
  );
};

export default TransporterVehicleLicenseScreen;
