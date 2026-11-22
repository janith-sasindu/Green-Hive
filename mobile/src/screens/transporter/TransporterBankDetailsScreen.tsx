import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SmoothScrollView } from "../../components/common/SmoothScrollView";
import { ThemedAlertModal, ThemedAlertModalType } from "../../components/common";
import { useTransporterTheme } from "../../context/TransporterThemeContext";
import {
  MOCK_TRANSPORTER_BANK_ACCOUNT,
  POPULAR_SRI_LANKAN_BANKS,
  BANK_ACCOUNT_TYPES,
  TransporterBankAccount,
  TRANSPORTER_API_ENDPOINTS,
  BANK_DETAILS_HEADER,
  BANK_DETAILS_CARD,
  BANK_DETAILS_FORM,
  BANK_DETAILS_ACTIONS,
  BANK_DETAILS_SECURITY,
  BANK_DETAILS_ALERTS,
  BANK_DETAILS_LOADING,
  BANK_DETAILS_TABS,
} from "./data";

export interface TransporterBankDetailsScreenProps {
  navigation?: any;
  onBack?: () => void;
  onSelectTab?: (tab: "home" | "jobs" | "active" | "profile") => void;
  activeTab?: "home" | "jobs" | "active" | "profile";
}

export const TransporterBankDetailsScreen: React.FC<
  TransporterBankDetailsScreenProps
> = ({ navigation, onBack, onSelectTab, activeTab = "profile" }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { isDark, colors } = useTransporterTheme();

  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;

  // Local account state initialized from mock data
  const [bankAccount, setBankAccount] = useState<TransporterBankAccount>({
    ...MOCK_TRANSPORTER_BANK_ACCOUNT,
  });

  // Screen & Form States
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [holderName, setHolderName] = useState(bankAccount.accountHolderName);
  const [bankName, setBankName] = useState(bankAccount.bankName);
  const [branchName, setBranchName] = useState(bankAccount.branchName);
  const [branchCode, setBranchCode] = useState(bankAccount.branchCode);
  const [accountNumber, setAccountNumber] = useState(bankAccount.accountNumber);
  const [accountType, setAccountType] = useState(bankAccount.accountType);
  const [isSaving, setIsSaving] = useState(false);

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

  // Hydrate live bank account from backend
  useEffect(() => {
    let isMounted = true;

    const fetchLiveBankDetails = async () => {
      try {
        const res = await fetch(TRANSPORTER_API_ENDPOINTS.bankDetails);
        if (isMounted && res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const liveAccount: TransporterBankAccount = {
              ...MOCK_TRANSPORTER_BANK_ACCOUNT,
              ...json.data,
            };
            setBankAccount(liveAccount);
            setHolderName(liveAccount.accountHolderName);
            setBankName(liveAccount.bankName);
            setBranchName(liveAccount.branchName);
            setBranchCode(liveAccount.branchCode);
            setAccountNumber(liveAccount.accountNumber);
            setAccountType(liveAccount.accountType);
          }
        }
      } catch (err) {
        console.warn("Could not load live bank details:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLiveBankDetails();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation?.navigate) {
      navigation.navigate("TransporterProfile");
    }
  };

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

  const handleSelectBankPreset = (selected: string) => {
    setBankName(selected);
  };

  const handleSelectType = (selectedType: string) => {
    setAccountType(selectedType);
  };

  const handleSaveBankDetails = async () => {
    const trimmedHolder = holderName.trim();
    const trimmedBank = bankName.trim();
    const trimmedBranch = branchName.trim();
    const trimmedAccountNo = accountNumber.trim().replace(/\s+/g, "");

    if (!trimmedHolder) {
      showAlert(
        BANK_DETAILS_ALERTS.missingHolderName.title,
        BANK_DETAILS_ALERTS.missingHolderName.message,
        {
          type: "warning",
          primaryButtonText: BANK_DETAILS_ALERTS.missingHolderName.buttonText,
        }
      );
      return;
    }

    if (!trimmedBank) {
      showAlert(
        BANK_DETAILS_ALERTS.missingBankName.title,
        BANK_DETAILS_ALERTS.missingBankName.message,
        {
          type: "warning",
          primaryButtonText: BANK_DETAILS_ALERTS.missingBankName.buttonText,
        }
      );
      return;
    }

    if (!trimmedBranch) {
      showAlert(
        BANK_DETAILS_ALERTS.missingBranchName.title,
        BANK_DETAILS_ALERTS.missingBranchName.message,
        {
          type: "warning",
          primaryButtonText: BANK_DETAILS_ALERTS.missingBranchName.buttonText,
        }
      );
      return;
    }

    if (!trimmedAccountNo || trimmedAccountNo.length < 6) {
      showAlert(
        BANK_DETAILS_ALERTS.invalidAccountNumber.title,
        BANK_DETAILS_ALERTS.invalidAccountNumber.message,
        {
          type: "warning",
          primaryButtonText: BANK_DETAILS_ALERTS.invalidAccountNumber.buttonText,
        }
      );
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch(TRANSPORTER_API_ENDPOINTS.bankDetails, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountHolderName: trimmedHolder,
          bankName: trimmedBank,
          branchName: trimmedBranch,
          branchCode: branchCode.trim() || "016",
          accountNumber: trimmedAccountNo,
          accountType: accountType,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || BANK_DETAILS_ALERTS.saveFailure.message);
      }

      const updatedAccount: TransporterBankAccount = {
        ...bankAccount,
        ...(json.data || {}),
        accountHolderName: trimmedHolder,
        bankName: trimmedBank,
        branchName: trimmedBranch,
        branchCode: branchCode.trim() || "016",
        accountNumber: trimmedAccountNo,
        accountType: accountType,
        isVerified: true,
        verificationStatus: "Verified",
      };

      // Persist to shared mock store for instant tab switches
      Object.assign(MOCK_TRANSPORTER_BANK_ACCOUNT, updatedAccount);
      setBankAccount(updatedAccount);
      setIsEditing(false);

      showAlert(
        BANK_DETAILS_ALERTS.saveSuccess.title,
        BANK_DETAILS_ALERTS.saveSuccess.message,
        {
          type: "success",
          primaryButtonText: BANK_DETAILS_ALERTS.saveSuccess.buttonText,
        }
      );
    } catch (err: any) {
      console.error("Failed to save bank details:", err);
      showAlert(
        BANK_DETAILS_ALERTS.saveFailure.title,
        err?.message || BANK_DETAILS_ALERTS.saveFailure.message,
        {
          type: "error",
          primaryButtonText: BANK_DETAILS_ALERTS.saveFailure.buttonText,
        }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatMaskedAccount = (num: string) => {
    if (!num) return BANK_DETAILS_CARD.maskedFallback;
    if (num.length <= 4) return num;
    const last4 = num.slice(-4);
    const masked = "•".repeat(Math.min(8, num.length - 4));
    return `${masked} ${last4}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#F5F8F6] dark:bg-slate-900"
    >
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
          {/* Back button and title */}
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGoBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={BANK_DETAILS_HEADER.backAccessibilityLabel}
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
                {BANK_DETAILS_HEADER.title}
              </Text>
              <Text className="text-[11px] text-[#64748B] dark:text-slate-400">
                {BANK_DETAILS_HEADER.subtitle}
              </Text>
            </View>
          </View>

          {/* Toggle Edit button */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setIsEditing(!isEditing)}
            className="flex-row items-center bg-amber-50 dark:bg-amber-950/50 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800"
          >
            <Ionicons
              name={isEditing ? "close-outline" : "create-outline"}
              size={14}
              color="#D97706"
              style={{ marginRight: 4 }}
            />
            <Text className="text-xs font-bold text-amber-700 dark:text-amber-400">
              {isEditing
                ? BANK_DETAILS_HEADER.cancelButton
                : BANK_DETAILS_HEADER.editButton}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ================= 2. SCROLLABLE CONTENT ================= */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color="#E68A00" />
          <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-3">
            {BANK_DETAILS_LOADING.message}
          </Text>
        </View>
      ) : (
        <SmoothScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: screenWidth < 360 ? 12 : 16,
            paddingTop: 8,
            paddingBottom: 32,
            alignItems: "center",
          }}
        >
          <View style={{ maxWidth: 640, width: "100%" }}>
            {/* ================= ATM / BANK CARD DISPLAY ================= */}
            <View
              className="rounded-3xl p-5 mb-5 relative overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1E293B" : "#0F172A",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.22,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              {/* Ambient Background Accents */}
              <View className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-amber-500/10 pointer-events-none" />
              <View className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-emerald-500/10 pointer-events-none" />

              {/* Top row: Chip Icon and Status */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="h-8 w-11 rounded-md bg-amber-400/80 items-center justify-center mr-2 border border-amber-300">
                    <Ionicons name="card" size={18} color="#78350F" />
                  </View>
                  <Text className="text-xs font-semibold text-slate-300">
                    {bankAccount.payoutMethod || BANK_DETAILS_CARD.fallbackPayoutMethod}
                  </Text>
                </View>

                {/* Verified Badge */}
                <View className="flex-row items-center bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  <Ionicons name="shield-checkmark" size={12} color="#4ADE80" />
                  <Text className="text-[11px] font-bold text-emerald-400 ml-1">
                    {bankAccount.verificationStatus || BANK_DETAILS_CARD.verifiedStatus}
                  </Text>
                </View>
              </View>

              {/* Bank Name */}
              <Text
                numberOfLines={1}
                className="text-base sm:text-lg font-bold text-white mb-2"
              >
                {bankAccount.bankName}
              </Text>

              {/* Account Number */}
              <Text className="text-lg sm:text-xl font-mono font-bold text-amber-300 tracking-wider mb-4">
                {formatMaskedAccount(bankAccount.accountNumber)}
              </Text>

              {/* Bottom row: Holder name, Branch, Type */}
              <View className="flex-row items-end justify-between pt-2 border-t border-slate-700/60">
                <View className="flex-1 pr-2">
                  <Text className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    {BANK_DETAILS_CARD.accountHolderLabel}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-xs sm:text-sm font-bold text-slate-100 mt-0.5"
                  >
                    {bankAccount.accountHolderName}
                  </Text>
                </View>

                <View className="items-end">
                  <Text className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    {BANK_DETAILS_CARD.branchTypeLabel}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5"
                  >
                    {bankAccount.branchName} ({bankAccount.accountType})
                  </Text>
                </View>
              </View>
            </View>

            {/* ================= EDIT / ENTER FORM ================= */}
            <View className="rounded-3xl bg-white dark:bg-slate-800 p-4 sm:p-5 border border-gray-100 dark:border-slate-700 shadow-xs mb-4">
              <View className="flex-row items-center justify-between mb-3.5">
                <View>
                  <Text className="text-base font-bold text-gray-900 dark:text-white">
                    {isEditing
                      ? BANK_DETAILS_FORM.editTitle
                      : BANK_DETAILS_FORM.viewTitle}
                  </Text>
                  <Text className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                    {isEditing
                      ? BANK_DETAILS_FORM.editSubtitle
                      : BANK_DETAILS_FORM.viewSubtitle}
                  </Text>
                </View>
              </View>

              {/* Field 1: Account Holder Name */}
              <View className="mb-4">
                <Text className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {BANK_DETAILS_FORM.holderNameLabel}
                </Text>
                <View className="flex-row items-center bg-gray-50 dark:bg-slate-700/60 border border-gray-200/80 dark:border-slate-600 rounded-xl px-3.5 py-2.5">
                  <Ionicons
                    name="person-outline"
                    size={17}
                    color={isDark ? "#94A3B8" : "#64748B"}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    value={holderName}
                    onChangeText={setHolderName}
                    editable={isEditing}
                    placeholder={BANK_DETAILS_FORM.holderNamePlaceholder}
                    placeholderTextColor="#94A3B8"
                    className="flex-1 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white p-0"
                  />
                </View>
              </View>

              {/* Field 2: Bank Name */}
              <View className="mb-4">
                <Text className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {BANK_DETAILS_FORM.bankNameLabel}
                </Text>
                <View className="flex-row items-center bg-gray-50 dark:bg-slate-700/60 border border-gray-200/80 dark:border-slate-600 rounded-xl px-3.5 py-2.5">
                  <Ionicons
                    name="business-outline"
                    size={17}
                    color={isDark ? "#94A3B8" : "#64748B"}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    value={bankName}
                    onChangeText={setBankName}
                    editable={isEditing}
                    placeholder={BANK_DETAILS_FORM.bankNamePlaceholder}
                    placeholderTextColor="#94A3B8"
                    className="flex-1 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white p-0"
                  />
                </View>

                {/* Bank quick selection presets (visible when editing) */}
                {isEditing && (
                  <View className="mt-2.5">
                    <Text className="text-[11px] font-medium text-gray-500 dark:text-slate-400 mb-1.5">
                      {BANK_DETAILS_FORM.bankPresetsPrompt}
                    </Text>
                    <View className="flex-row flex-wrap gap-1.5">
                      {POPULAR_SRI_LANKAN_BANKS.slice(0, 6).map((preset) => {
                        const isSelected = bankName === preset;
                        return (
                          <TouchableOpacity
                            key={preset}
                            activeOpacity={0.7}
                            onPress={() => handleSelectBankPreset(preset)}
                            className={`px-2.5 py-1 rounded-lg border ${
                              isSelected
                                ? "bg-amber-100 dark:bg-amber-950/60 border-amber-400"
                                : "bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600"
                            }`}
                          >
                            <Text
                              className={`text-[11px] font-semibold ${
                                isSelected
                                  ? "text-amber-800 dark:text-amber-300 font-bold"
                                  : "text-gray-700 dark:text-slate-300"
                              }`}
                            >
                              {preset}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>

              {/* Field 3: Branch Name & Code (Row) */}
              <View className="flex-row gap-2.5 mb-4">
                {/* Branch Name */}
                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {BANK_DETAILS_FORM.branchNameLabel}
                  </Text>
                  <View className="flex-row items-center bg-gray-50 dark:bg-slate-700/60 border border-gray-200/80 dark:border-slate-600 rounded-xl px-3 py-2.5">
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={isDark ? "#94A3B8" : "#64748B"}
                      style={{ marginRight: 6 }}
                    />
                    <TextInput
                      value={branchName}
                      onChangeText={setBranchName}
                      editable={isEditing}
                      placeholder={BANK_DETAILS_FORM.branchNamePlaceholder}
                      placeholderTextColor="#94A3B8"
                      className="flex-1 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white p-0"
                    />
                  </View>
                </View>

                {/* Branch Code */}
                <View style={{ width: screenWidth < 360 ? 90 : 110 }}>
                  <Text className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    {BANK_DETAILS_FORM.branchCodeLabel}
                  </Text>
                  <View className="bg-gray-50 dark:bg-slate-700/60 border border-gray-200/80 dark:border-slate-600 rounded-xl px-3 py-2.5">
                    <TextInput
                      value={branchCode}
                      onChangeText={setBranchCode}
                      editable={isEditing}
                      placeholder={BANK_DETAILS_FORM.branchCodePlaceholder}
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white p-0 text-center"
                    />
                  </View>
                </View>
              </View>

              {/* Field 4: Account Number */}
              <View className="mb-4">
                <Text className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {BANK_DETAILS_FORM.accountNumberLabel}
                </Text>
                <View className="flex-row items-center bg-gray-50 dark:bg-slate-700/60 border border-gray-200/80 dark:border-slate-600 rounded-xl px-3.5 py-2.5">
                  <Ionicons
                    name="keypad-outline"
                    size={17}
                    color={isDark ? "#94A3B8" : "#64748B"}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    editable={isEditing}
                    placeholder={BANK_DETAILS_FORM.accountNumberPlaceholder}
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    className="flex-1 text-xs sm:text-sm font-mono font-bold text-gray-900 dark:text-white p-0 tracking-wide"
                  />
                </View>
              </View>

              {/* Field 5: Account Type Selector */}
              <View className="mb-5">
                <Text className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  {BANK_DETAILS_FORM.accountTypeLabel}
                </Text>
                <View className="flex-row gap-2">
                  {BANK_ACCOUNT_TYPES.map((type) => {
                    const isSelected = accountType === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        activeOpacity={0.8}
                        disabled={!isEditing}
                        onPress={() => handleSelectType(type)}
                        className={`flex-1 py-2.5 rounded-xl items-center justify-center border ${
                          isSelected
                            ? "bg-amber-500 border-amber-600 shadow-2xs"
                            : "bg-gray-50 dark:bg-slate-700/60 border-gray-200/80 dark:border-slate-600"
                        }`}
                      >
                        <Text
                          className={`text-xs sm:text-sm font-bold ${
                            isSelected
                              ? "text-white"
                              : "text-gray-700 dark:text-slate-300"
                          }`}
                        >
                          {type} {BANK_DETAILS_FORM.accountTypeSuffix}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Save Button (when editing) */}
              {isEditing ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSaveBankDetails}
                  disabled={isSaving}
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#E68A00] flex-row items-center justify-center shadow-xs"
                  style={{
                    shadowColor: "#E68A00",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.25,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  {isSaving ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-sm sm:text-base font-bold text-white">
                        {BANK_DETAILS_ACTIONS.savingButton}
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-sm sm:text-base font-bold text-white">
                        {BANK_DETAILS_ACTIONS.saveButton}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsEditing(true)}
                  className="w-full py-3 rounded-xl bg-gray-100 dark:bg-slate-700 items-center justify-center flex-row"
                >
                  <Ionicons
                    name="pencil"
                    size={15}
                    color={isDark ? "#CBD5E1" : "#4B5563"}
                    style={{ marginRight: 6 }}
                  />
                  <Text className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200">
                    {BANK_DETAILS_ACTIONS.editButton}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ================= 3. SECURITY & PAYOUT INFORMATION ================= */}
            <View className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 p-4 mb-4">
              <View className="flex-row items-center mb-1.5">
                <Ionicons name="shield-checkmark" size={17} color="#16A34A" />
                <Text className="text-xs font-bold text-emerald-800 dark:text-emerald-300 ml-1.5">
                  {BANK_DETAILS_SECURITY.title}
                </Text>
              </View>
              <Text className="text-xs text-emerald-900 dark:text-emerald-200/90 leading-relaxed">
                {BANK_DETAILS_SECURITY.description}
              </Text>
            </View>
          </View>
        </SmoothScrollView>
      )}

      {/* ================= 4. BOTTOM NAVIGATION TAB BAR ================= */}
      <SafeAreaView
        edges={["bottom"]}
        className="bg-white dark:bg-slate-800 border-t border-gray-200/80 dark:border-slate-700"
      >
        <View
          style={{ maxWidth: 640, width: "100%", alignSelf: "center" }}
          className={`flex-row items-center justify-around ${
            isSmallDevice ? "pt-1.5 pb-0.5" : "pt-2 pb-1"
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
              {BANK_DETAILS_TABS.home}
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
              {BANK_DETAILS_TABS.jobs}
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
              {BANK_DETAILS_TABS.active}
            </Text>
          </TouchableOpacity>

          {/* Profile Tab (Active) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleTabPress("profile")}
            className="items-center px-2.5 sm:px-4 min-w-[50px] sm:min-w-[54px]"
          >
            <Ionicons
              name="person"
              size={isSmallDevice ? 20 : 22}
              color="#E68A00"
            />
            <Text
              className={`mt-0.5 ${
                isSmallDevice ? "text-[10px]" : "text-[11px]"
              } font-bold text-[#E68A00]`}
            >
              {BANK_DETAILS_TABS.profile}
            </Text>
            {/* Active Indicator Underline */}
            <View className="h-0.5 w-5 bg-[#E68A00] rounded-full mt-0.5" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

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
          onClose={() => setAlertConfig(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default TransporterBankDetailsScreen;
