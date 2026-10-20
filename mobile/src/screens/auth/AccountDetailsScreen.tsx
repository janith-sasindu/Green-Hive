import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { registerMockUser } from "../../data/mockAuth";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface AccountDetailsScreenProps {
    navigation: any;
    route: any;
}

const AccountDetailsScreen = ({
    navigation,
    route,
}: AccountDetailsScreenProps) => {
    const { height: screenHeight, width: screenWidth } = useWindowDimensions();
    const isSmallDevice = screenHeight < 700 || screenWidth < 380;

    const role = route?.params?.role ?? "Farmer";

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [document, setDocument] =
        useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleUploadDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "image/jpeg",
                    "image/png",
                    "application/pdf",
                ],
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (result.canceled) return;

            const selectedFile = result.assets[0];

            if (selectedFile.size != null && selectedFile.size > MAX_FILE_SIZE) {
                Alert.alert(
                    "File too large",
                    "Please select a JPG, PNG, or PDF file up to 10 MB."
                );
                return;
            }

            setDocument(selectedFile);
        } catch {
            Alert.alert(
                "Upload error",
                "Unable to select your document. Please try again."
            );
        }
    };

    const handleContinue = async () => {
        setError("");

        if (!fullName.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!phone.trim()) {
            setError("Please enter your phone number.");
            return;
        }

        if (!password) {
            setError("Please enter a password.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (!document) {
            setError("Please upload your National ID Card to continue.");
            Alert.alert(
                "National ID required",
                "Please upload a clear photo or scan of your National Identity Card."
            );
            return;
        }

        setUploading(true);

        try {
            // Determine role-based home screen destination
            const roleKey = role.toLowerCase();
            let destination = "FarmerHome";
            if (roleKey.includes("seller")) {
                destination = "SellerHome";
            } else if (roleKey.includes("transporter")) {
                destination = "TransporterHome";
            }

            // Register user in mock auth storage so they can sign in later
            registerMockUser({
                fullName,
                email,
                phone,
                password,
                role,
            });

            Alert.alert(
                "Account Created Successfully!",
                `Welcome to Green-Hive! Your registration as a ${role} is complete.`,
                [
                    {
                        text: "Get Started",
                        onPress: () => navigation.navigate(destination),
                    },
                ]
            );
        } catch {
            Alert.alert(
                "Registration failed",
                "Unable to create your account. Please try again."
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <View className="flex-1 bg-[#176B2C]">
            <StatusBar barStyle="light-content" backgroundColor="#176B2C" />

            {/* Top SafeArea ensures status bar / notch area is solid green */}
            <SafeAreaView edges={["top"]} className="bg-[#176B2C]" />

            {/* Main content area */}
            <SafeAreaView
                edges={["bottom", "left", "right"]}
                className="flex-1 bg-[#F5F8F6]"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
                    className="flex-1"
                >
                    <ScrollView
                        className="flex-1"
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        bounces={true}
                        scrollEventThrottle={16}
                        decelerationRate="normal"
                        overScrollMode="never"
                        nestedScrollEnabled={true}
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: isSmallDevice ? 32 : 48,
                        }}
                    >
                        {/* Green header banner */}
                        <View
                            className={`bg-[#176B2C] px-5 ${
                                isSmallDevice ? "pt-2 pb-7" : "pt-3 pb-9"
                            }`}
                        >
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                activeOpacity={0.7}
                                className="mb-2.5 flex-row items-center self-start"
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            >
                                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                                <Text className="ml-1.5 text-base text-white">Back</Text>
                            </TouchableOpacity>

                            <Text className={`mb-1 font-semibold text-[#B9E2C1] ${isSmallDevice ? "text-base" : "text-lg"}`}>
                                Step 2 of 2
                            </Text>

                            <Text
                                className={`font-bold text-white mb-1 ${
                                    isSmallDevice ? "text-2xl" : "text-3xl"
                                }`}
                            >
                                Create Account
                            </Text>

                            <Text className={`text-[#D9EEDC] ${isSmallDevice ? "text-base" : "text-lg"}`}>
                                Registering as a {role.toLowerCase()}
                            </Text>
                        </View>

                        {/* Form card overlapping the header */}
                        <View className="px-4">
                            <View
                                className={`-mt-5 w-full self-center rounded-[20px] border border-[#E7EBE8] bg-white shadow-sm ${
                                    isSmallDevice ? "p-4" : "p-5"
                                }`}
                                style={{ maxWidth: 440 }}
                            >
                                {/* Full Name */}
                                <FormField
                                    label="Full Name"
                                    icon="person-outline"
                                    placeholder="Your full name"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    autoCapitalize="words"
                                    autoComplete="name"
                                    isSmallDevice={isSmallDevice}
                                />

                                {/* Email */}
                                <FormField
                                    label="Email Address"
                                    icon="mail-outline"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    isSmallDevice={isSmallDevice}
                                />

                                {/* Phone */}
                                <FormField
                                    label="Phone Number"
                                    icon="call-outline"
                                    placeholder="+94 77 000 0000"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    autoComplete="tel"
                                    isSmallDevice={isSmallDevice}
                                />

                                {/* Password */}
                                <View className={isSmallDevice ? "mb-3" : "mb-3.5"}>
                                    <Text className="mb-1.5 text-[13px] font-semibold text-[#344054]">
                                        Password
                                    </Text>

                                    <View
                                        className={`${
                                            isSmallDevice ? "h-[42px]" : "h-[46px]"
                                        } flex-row items-center rounded-[11px] border border-[#E0E5EB] px-2.5 bg-white`}
                                    >
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={isSmallDevice ? 16 : 18}
                                            color="#94A3B8"
                                        />

                                        <TextInput
                                            className="ml-2 flex-1 h-full text-[14px] text-[#344054]"
                                            style={{ height: "100%" }}
                                            placeholder="Create password (min 8 characters)"
                                            placeholderTextColor="#9AA39D"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                            autoCapitalize="none"
                                            autoComplete="new-password"
                                        />

                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            className="p-1"
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Ionicons
                                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                                size={isSmallDevice ? 16 : 18}
                                                color="#94A3B8"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* National ID Card Required Info Box */}
                                <View className="mb-4 rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] p-3.5">
                                    <Text className="mb-1 text-[13px] font-bold text-[#1D4ED8]">
                                        National ID Card Required
                                    </Text>
                                    <Text className="text-[11px] leading-[16px] text-[#2563EB]">
                                        Upload a clear photo of your National Identity Card (front side).
                                    </Text>
                                </View>

                                {/* Upload National ID Card Label */}
                                <Text className="mb-2 text-[13px] font-semibold text-[#344054]">
                                    Upload National ID Card
                                </Text>

                                {/* Dashed Upload Box */}
                                <TouchableOpacity
                                    onPress={handleUploadDocument}
                                    activeOpacity={0.7}
                                    className={`mb-4 items-center justify-center rounded-[14px] border border-dashed px-3 ${
                                        isSmallDevice ? "min-h-[135px] py-3.5" : "min-h-[155px] py-4"
                                    } ${
                                        document
                                            ? "border-[#86C99A] bg-[#F4FBF5]"
                                            : "border-[#DCE2E8] bg-white"
                                    }`}
                                >
                                    {document ? (
                                        <>
                                            <View className="mb-2.5 h-11 w-11 items-center justify-center rounded-full bg-[#E1F4E5]">
                                                <Ionicons
                                                    name="document-text-outline"
                                                    size={23}
                                                    color="#16853A"
                                                />
                                            </View>

                                            <Text
                                                className="mb-1 max-w-full text-center text-[12px] font-semibold text-[#334155]"
                                                numberOfLines={2}
                                            >
                                                {document.name}
                                            </Text>

                                            <Text className="mb-2 text-[10px] text-[#8A96A5]">
                                                {document.size != null
                                                    ? `${(document.size / (1024 * 1024)).toFixed(2)} MB`
                                                    : "File selected"}
                                            </Text>

                                            <View className="flex-row items-center">
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={14}
                                                    color="#16853A"
                                                />
                                                <Text className="ml-1 text-[11px] font-medium text-[#16853A]">
                                                    Document selected
                                                </Text>
                                            </View>

                                            <Text className="mt-1.5 text-[10px] text-[#64748B]">
                                                Tap to choose another file
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <View className="mb-2.5 h-[44px] w-[44px] items-center justify-center rounded-full bg-[#F3F4F6]">
                                                <Ionicons
                                                    name="document-attach-outline"
                                                    size={22}
                                                    color="#94A3B8"
                                                />
                                            </View>

                                            <Text className="mb-1 text-center text-[12px] font-medium text-[#475569]">
                                                Tap to upload National ID Card
                                            </Text>

                                            <Text className="text-center text-[10px] text-[#94A3B8]">
                                                JPG, PNG or PDF up to 10 MB
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {/* Validation message */}
                                {error ? (
                                    <View className="mb-3.5 flex-row items-center rounded-lg border border-red-200 bg-red-50 p-2.5">
                                        <Ionicons
                                            name="alert-circle-outline"
                                            size={16}
                                            color="#DC2626"
                                        />
                                        <Text className="ml-2 flex-1 text-[12px] font-medium text-red-600">
                                            {error}
                                        </Text>
                                    </View>
                                ) : null}

                                {/* Continue Button */}
                                <TouchableOpacity
                                    onPress={handleContinue}
                                    disabled={uploading}
                                    activeOpacity={0.8}
                                    className={`${
                                        isSmallDevice ? "h-[46px]" : "h-[50px]"
                                    } flex-row items-center justify-center rounded-[14px] bg-[#176B2C] shadow-sm ${
                                        uploading ? "opacity-75" : ""
                                    }`}
                                >
                                    {uploading ? (
                                        <>
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                            <Text className="ml-2 text-[15px] font-bold text-white">
                                                Please wait...
                                            </Text>
                                        </>
                                    ) : (
                                        <Text className="text-[16px] font-bold text-white">
                                            Continue
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

interface FormFieldProps {
    label: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    placeholder: string;
    value: string;
    onChangeText: (value: string) => void;
    keyboardType?: "default" | "email-address" | "phone-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    autoComplete?: "name" | "email" | "tel";
    isSmallDevice?: boolean;
}

const FormField = ({
    label,
    icon,
    placeholder,
    value,
    onChangeText,
    keyboardType = "default",
    autoCapitalize = "sentences",
    autoComplete,
    isSmallDevice = false,
}: FormFieldProps) => {
    return (
        <View className={isSmallDevice ? "mb-3" : "mb-3.5"}>
            <Text className="mb-1.5 text-[13px] font-semibold text-[#344054]">
                {label}
            </Text>

            <View
                className={`${
                    isSmallDevice ? "h-[42px]" : "h-[46px]"
                } flex-row items-center rounded-[11px] border border-[#E0E5EB] px-2.5 bg-white`}
            >
                <Ionicons name={icon} size={isSmallDevice ? 16 : 18} color="#94A3B8" />

                <TextInput
                    className="ml-2 flex-1 h-full text-[14px] text-[#344054]"
                    style={{ height: "100%" }}
                    placeholder={placeholder}
                    placeholderTextColor="#9AA39D"
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoComplete={autoComplete}
                />
            </View>
        </View>
    );
};

export default AccountDetailsScreen;
