import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
  useWindowDimensions,
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
  MOCK_ACTIVE_JOB,
  TransporterProfile,
} from "./data";

export interface TransporterHelpSupportScreenProps {
  navigation?: any;
  onBack?: () => void;
  onSelectTab?: (tab: "home" | "jobs" | "active" | "profile") => void;
  activeTab?: "home" | "jobs" | "active" | "profile";
}

export interface SupportTicketItem {
  id: string;
  category: string;
  subject: string;
  message: string;
  imageUri?: string;
  status: "Pending" | "In Review" | "Resolved";
  submittedAt: string;
  adminReply?: string;
}

const PROBLEM_CATEGORIES = [
  { id: "payment", label: "Payment & Wallet", icon: "wallet-outline" },
  { id: "trip", label: "Trip & Delivery Issue", icon: "bus-outline" },
  { id: "pickup", label: "Farm Pickup Discrepancy", icon: "cube-outline" },
  { id: "account", label: "Account & Verification", icon: "shield-checkmark-outline" },
  { id: "technical", label: "App Bug / Technical", icon: "bug-outline" },
  { id: "other", label: "Other Inquiry", icon: "help-circle-outline" },
];

export const TransporterHelpSupportScreen: React.FC<
  TransporterHelpSupportScreenProps
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

  const [profile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<string>("payment");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [relatedJobId, setRelatedJobId] = useState<string>(MOCK_ACTIVE_JOB.id);
  const [attachedPhotoUri, setAttachedPhotoUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Tab: New Message vs My Inquiries
  const [activeViewTab, setActiveViewTab] = useState<"compose" | "history">(
    "compose"
  );

  // Mock list of past submitted inquiries
  const [pastTickets, setPastTickets] = useState<SupportTicketItem[]>([
    {
      id: "#SUP-8104",
      category: "Payment & Wallet",
      subject: "Highway toll charge reimbursement for Colombo trip",
      message:
        "Expressway toll of Rs. 400 was incurred during transit from Nuwara Eliya. Receipt attached.",
      status: "Resolved",
      submittedAt: "Oct 28, 2026 · 11:20 AM",
      adminReply:
        "Toll fee of Rs. 400 has been credited to your transporter wallet. Thank you!",
    },
    {
      id: "#SUP-7942",
      category: "Trip & Delivery Issue",
      subject: "Receiver delayed gate entry at Colombo Fresh Market",
      message: "Waited 45 mins at unloading bay 3 due to gate security delay.",
      status: "Resolved",
      submittedAt: "Oct 19, 2026 · 08:45 AM",
      adminReply:
        "Issue acknowledged with destination hub manager. Unloading prioritized.",
    },
  ]);

  // Modals
  const [showPhotoSourceModal, setShowPhotoSourceModal] = useState(false);
  const [previewPhotoUri, setPreviewPhotoUri] = useState<string | null>(null);

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

  // Photo handlers
  const handleTakePhoto = async () => {
    setShowPhotoSourceModal(false);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showAlert(
          "Camera Permission Required",
          "Please grant camera access to take a photo of the issue.",
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
        setAttachedPhotoUri(result.assets[0].uri);
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
          "Please allow photo library access to attach screenshots or photos.",
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
        setAttachedPhotoUri(result.assets[0].uri);
      }
    } catch {
      showAlert("Gallery Error", "Could not open photo library.", {
        type: "error",
      });
    }
  };

  // Sample screenshot / photo for testing
  const handleUseSamplePhoto = () => {
    setShowPhotoSourceModal(false);
    setAttachedPhotoUri(
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80"
    );
  };

  const handleRemovePhoto = () => {
    setAttachedPhotoUri(null);
  };

  // Submit Problem Form to Admins
  const handleSubmitProblem = () => {
    if (!subject.trim()) {
      showAlert(
        "Subject Required",
        "Please provide a brief subject or title for your problem.",
        { type: "warning" }
      );
      return;
    }

    if (!message.trim()) {
      showAlert(
        "Message Details Required",
        "Please describe your problem or issue in detail so our admin team can assist you.",
        { type: "warning" }
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const ticketId = `#SUP-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      const timeStr = `${now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} · ${now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;

      const matchedCategory =
        PROBLEM_CATEGORIES.find((c) => c.id === selectedCategory)?.label ||
        "Support Inquiry";

      const newTicket: SupportTicketItem = {
        id: ticketId,
        category: matchedCategory,
        subject: subject.trim(),
        message: message.trim(),
        imageUri: attachedPhotoUri || undefined,
        status: "Pending",
        submittedAt: timeStr,
      };

      setPastTickets((prev) => [newTicket, ...prev]);

      // Reset form
      setSubject("");
      setMessage("");
      setAttachedPhotoUri(null);

      showAlert(
        "Message Sent to Admins!",
        `Your support request ${ticketId} has been successfully submitted. An administrator will review your message and reach out to you within 15–30 minutes.`,
        {
          type: "success",
          primaryButtonText: "View Inquiry History",
          onPrimaryPress: () => {
            setActiveViewTab("history");
          },
        }
      );
    }, 700);
  };

  return (
    <View className="flex-1 bg-[#F5F8F6] dark:bg-slate-900">
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0F172A" : "#F5F8F6"}
      />

      {/* ================= 1. TOP HEADER ================= */}
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
                Help & Support
              </Text>
              <Text className="text-[11px] text-[#64748B] dark:text-slate-400">
                Direct Contact with Green-Hive Admin
              </Text>
            </View>
          </View>

          {/* Right: Admin Online Status Badge */}
          <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <View className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />
            <Text className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              Admin Online
            </Text>
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
          {/* Mode Switcher: Send Message vs My Inquiries */}
          <View className="flex-row p-1 rounded-2xl bg-gray-200/70 dark:bg-slate-800 mb-4">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveViewTab("compose")}
              className={`flex-1 py-2 sm:py-2.5 rounded-xl items-center justify-center flex-row ${
                activeViewTab === "compose"
                  ? "bg-white dark:bg-slate-700 shadow-2xs"
                  : ""
              }`}
            >
              <Ionicons
                name="chatbox-ellipses-outline"
                size={16}
                color={
                  activeViewTab === "compose"
                    ? "#FF8C00"
                    : isDark
                    ? "#94A3B8"
                    : "#64748B"
                }
              />
              <Text
                className={`text-xs sm:text-sm font-bold ml-1.5 ${
                  activeViewTab === "compose"
                    ? "text-[#FF8C00]"
                    : "text-gray-600 dark:text-slate-400"
                }`}
              >
                Send Message
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveViewTab("history")}
              className={`flex-1 py-2 sm:py-2.5 rounded-xl items-center justify-center flex-row ${
                activeViewTab === "history"
                  ? "bg-white dark:bg-slate-700 shadow-2xs"
                  : ""
              }`}
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={
                  activeViewTab === "history"
                    ? "#FF8C00"
                    : isDark
                    ? "#94A3B8"
                    : "#64748B"
                }
              />
              <Text
                className={`text-xs sm:text-sm font-bold ml-1.5 ${
                  activeViewTab === "history"
                    ? "text-[#FF8C00]"
                    : "text-gray-600 dark:text-slate-400"
                }`}
              >
                My Inquiries ({pastTickets.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* ================= VIEW 1: COMPOSE PROBLEM MESSAGE ================= */}
          {activeViewTab === "compose" ? (
            <View className="rounded-3xl bg-white dark:bg-slate-800 p-4 sm:p-5 border border-gray-100 dark:border-slate-700 shadow-xs mb-4">
              <View className="mb-3.5">
                <Text className="text-base font-bold text-gray-900 dark:text-white">
                  Send Your Problem to Admins
                </Text>
                <Text className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                  Describe what went wrong. You can also attach an optional screenshot or photo evidence.
                </Text>
              </View>

              {/* 1. Category Selector */}
              <View className="mb-4">
                <Text className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Problem Topic *
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {PROBLEM_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        activeOpacity={0.7}
                        onPress={() => setSelectedCategory(cat.id)}
                        className={`flex-row items-center px-3 py-2 rounded-xl border ${
                          isSelected
                            ? "bg-[#FFF5E6] dark:bg-amber-950/50 border-[#FF8C00]"
                            : "bg-gray-50 dark:bg-slate-700/60 border-gray-200/80 dark:border-slate-600"
                        }`}
                      >
                        <Ionicons
                          name={cat.icon as any}
                          size={15}
                          color={
                            isSelected
                              ? "#FF8C00"
                              : isDark
                              ? "#CBD5E1"
                              : "#64748B"
                          }
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          className={`text-xs font-semibold ${
                            isSelected
                              ? "text-[#FF8C00] font-bold"
                              : "text-gray-700 dark:text-slate-300"
                          }`}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. Related Active Job (optional helper) */}
              <View className="mb-4">
                <Text className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Related Transport Job (optional)
                </Text>
                <View className="flex-row items-center bg-gray-50 dark:bg-slate-700/60 border border-gray-200/80 dark:border-slate-600 rounded-xl px-3.5 py-2.5">
                  <Ionicons
                    name="bus-outline"
                    size={17}
                    color={isDark ? "#94A3B8" : "#64748B"}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    value={relatedJobId}
                    onChangeText={setRelatedJobId}
                    placeholder="e.g. #GH-T1024 (leave blank if general)"
                    placeholderTextColor="#94A3B8"
                    className="flex-1 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white p-0"
                  />
                </View>
              </View>

              {/* 3. Subject / Title */}
              <View className="mb-4">
                <Text className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Subject / Summary *
                </Text>
                <View className="bg-gray-50 dark:bg-slate-700/60 border border-gray-200/80 dark:border-slate-600 rounded-xl px-3.5 py-2.5">
                  <TextInput
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="e.g., Payment delayed for Job #1024 or Incorrect weight"
                    placeholderTextColor="#94A3B8"
                    className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white p-0"
                  />
                </View>
              </View>

              {/* 4. Message Description */}
              <View className="mb-4">
                <Text className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Message Description *
                </Text>
                <View className="bg-gray-50 dark:bg-slate-700/60 border border-gray-200/80 dark:border-slate-600 rounded-xl p-3.5">
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Please write the details of your problem here. Include any timestamps, location, or issue details..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    className="text-xs sm:text-sm text-gray-900 dark:text-white p-0 min-h-[110px]"
                  />
                </View>
              </View>

              {/* 5. Optional Image / Screenshot Attachment */}
              <View className="mb-5">
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Upload Image Evidence (Optional)
                  </Text>
                  <Text className="text-[11px] text-[#64748B] dark:text-slate-400">
                    Optional
                  </Text>
                </View>

                {attachedPhotoUri ? (
                  /* Attached Photo Preview */
                  <View className="rounded-2xl bg-gray-50 dark:bg-slate-700/40 p-3 border border-emerald-300 dark:border-emerald-800 shadow-2xs">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <Ionicons
                          name="checkmark-circle"
                          size={13}
                          color="#16A34A"
                        />
                        <Text className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 ml-1">
                          Image Attached
                        </Text>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleRemovePhoto}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        className="flex-row items-center px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40"
                      >
                        <Ionicons name="trash" size={13} color="#EF4444" />
                        <Text className="text-xs font-bold text-red-500 ml-1">
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Image Preview Box */}
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setPreviewPhotoUri(attachedPhotoUri)}
                      className="rounded-xl overflow-hidden h-40 bg-slate-100 dark:bg-slate-900 relative"
                    >
                      <Image
                        source={{ uri: attachedPhotoUri }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-md flex-row items-center">
                        <Ionicons name="expand" size={11} color="#FFFFFF" />
                        <Text className="text-[10.5px] text-white font-medium ml-1">
                          Tap to enlarge
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Change photo button */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setShowPhotoSourceModal(true)}
                      className="mt-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 items-center justify-center flex-row"
                    >
                      <Ionicons
                        name="camera-outline"
                        size={15}
                        color={isDark ? "#CBD5E1" : "#4B5563"}
                      />
                      <Text className="text-xs font-semibold text-gray-700 dark:text-slate-200 ml-1.5">
                        Change / Retake Image
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Empty Upload Box */
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => setShowPhotoSourceModal(true)}
                    className="rounded-2xl border-2 border-dashed border-[#CBD5E1] dark:border-slate-600 bg-gray-50 dark:bg-slate-700/30 py-5 px-4 items-center justify-center"
                  >
                    <View className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/40 items-center justify-center mb-1.5">
                      <Ionicons name="image-outline" size={20} color="#FF8C00" />
                    </View>
                    <Text className="text-xs sm:text-sm font-bold text-gray-800 dark:text-slate-200">
                      Add Screenshot or Photo
                    </Text>
                    <Text className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                      Optional · JPG or PNG up to 10MB
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSubmitProblem}
                disabled={isSubmitting}
                className="rounded-2xl bg-[#FF8C00] py-3.5 sm:py-4 items-center justify-center shadow-xs flex-row"
                style={{
                  elevation: 3,
                  shadowColor: "#FF8C00",
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                }}
              >
                <Ionicons
                  name={isSubmitting ? "hourglass-outline" : "send"}
                  size={17}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {isSubmitting ? "Sending to Admin..." : "Send Message to Admin"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ================= VIEW 2: MY PAST INQUIRIES ================= */
            <View className="space-y-3 gap-3 mb-4">
              <View className="flex-row items-center justify-between px-1">
                <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Past Inquiries & Responses
                </Text>
                <Text className="text-xs font-semibold text-[#FF8C00]">
                  {pastTickets.length} submitted
                </Text>
              </View>

              {pastTickets.map((ticket) => (
                <View
                  key={ticket.id}
                  className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-gray-100 dark:border-slate-700 shadow-2xs"
                >
                  <View className="flex-row items-center justify-between pb-2.5 border-b border-gray-100 dark:border-slate-700 mb-2.5">
                    <View className="flex-row items-center">
                      <Text className="text-xs font-black text-[#FF8C00] mr-2">
                        {ticket.id}
                      </Text>
                      <View className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-700">
                        <Text className="text-[10.5px] font-semibold text-gray-700 dark:text-slate-300">
                          {ticket.category}
                        </Text>
                      </View>
                    </View>
                    <View
                      className={`px-2 py-0.5 rounded-full ${
                        ticket.status === "Resolved"
                          ? "bg-emerald-50 dark:bg-emerald-950/40"
                          : "bg-amber-50 dark:bg-amber-950/40"
                      }`}
                    >
                      <Text
                        className={`text-[10.5px] font-bold ${
                          ticket.status === "Resolved"
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {ticket.status}
                      </Text>
                    </View>
                  </View>

                  {/* Subject & User Message */}
                  <Text className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    {ticket.subject}
                  </Text>
                  <Text className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                    {ticket.message}
                  </Text>

                  {/* Attached Image Thumbnail if exists */}
                  {ticket.imageUri && (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setPreviewPhotoUri(ticket.imageUri || null)}
                      className="mt-2.5 rounded-xl overflow-hidden h-24 w-36 bg-slate-100 dark:bg-slate-900 relative"
                    >
                      <Image
                        source={{ uri: ticket.imageUri }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      <View className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded flex-row items-center">
                        <Ionicons name="expand" size={10} color="#FFFFFF" />
                        <Text className="text-[9.5px] text-white ml-0.5">Proof</Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Admin Reply Card */}
                  {ticket.adminReply && (
                    <View className="mt-3 p-3 rounded-xl bg-[#F0FDF4] dark:bg-emerald-950/30 border border-[#DCFCE7] dark:border-emerald-800/40">
                      <View className="flex-row items-center mb-1">
                        <Ionicons name="shield-checkmark" size={13} color="#16A34A" />
                        <Text className="text-[11px] font-bold text-[#166534] dark:text-emerald-300 ml-1">
                          Admin Response:
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-800 dark:text-slate-200">
                        {ticket.adminReply}
                      </Text>
                    </View>
                  )}

                  <Text className="text-[10px] text-gray-400 dark:text-slate-500 mt-2.5">
                    Submitted: {ticket.submittedAt}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* User Contact Summary Card */}
          <View className="rounded-2xl bg-gray-50 dark:bg-slate-800/60 p-3.5 border border-gray-200/80 dark:border-slate-700 mt-1 mb-2">
            <Text className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Your Registered Contact
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="person-circle-outline" size={18} color="#FF8C00" />
                <Text className="text-xs font-bold text-gray-900 dark:text-white ml-1.5">
                  {profile.name}
                </Text>
              </View>
              <Text className="text-xs text-gray-600 dark:text-slate-300">
                {profile.phone}
              </Text>
            </View>
          </View>
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

      {/* ================= 4. PHOTO SOURCE PICKER MODAL ================= */}
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
              <View>
                <Text className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Add Photo / Screenshot
                </Text>
                <Text className="text-xs text-gray-500 dark:text-slate-400">
                  Optional image attachment for your problem
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPhotoSourceModal(false)}
                className="h-8 w-8 rounded-full bg-gray-100 dark:bg-slate-700 items-center justify-center"
              >
                <Ionicons
                  name="close"
                  size={18}
                  color={isDark ? "#CBD5E1" : "#4B5563"}
                />
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
                  Snap a picture of the issue on site
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.iconMuted}
              />
            </TouchableOpacity>

            {/* Option 2: Gallery */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePickFromGallery}
              className="flex-row items-center p-3.5 mb-2.5 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-gray-200 dark:border-slate-600/60"
            >
              <View className="h-10 w-10 rounded-xl bg-blue-500 items-center justify-center mr-3.5">
                <Ionicons name="images" size={20} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                  Choose from Gallery
                </Text>
                <Text className="text-xs text-gray-500 dark:text-slate-400">
                  Select a saved screenshot or photo
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.iconMuted}
              />
            </TouchableOpacity>

            {/* Option 3: Sample Receipt/Issue Photo */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleUseSamplePhoto}
              className="flex-row items-center p-3.5 mb-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40"
            >
              <View className="h-10 w-10 rounded-xl bg-[#16A34A] items-center justify-center mr-3.5">
                <Ionicons name="document-attach" size={20} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900 dark:text-white">
                  Use Sample Issue Photo
                </Text>
                <Text className="text-xs text-gray-500 dark:text-slate-400">
                  Quick demo attachment for simulator
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.iconMuted}
              />
            </TouchableOpacity>

            {/* Cancel Button */}
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

      {/* ================= 5. FULL PHOTO ENLARGED PREVIEW MODAL ================= */}
      <Modal
        visible={!!previewPhotoUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewPhotoUri(null)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center p-4">
          <SafeAreaView edges={["top"]} className="w-full">
            <View className="flex-row items-center justify-between py-2 px-2">
              <Text className="text-white font-bold text-base">
                Attached Photo Evidence
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

      {/* ================= 6. THEMED ALERT MODAL ================= */}
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

export default TransporterHelpSupportScreen;
