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
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface AccountDetailsScreenProps {
    navigation: any;
    route: any;
}

const AccountDetailsScreen = ({
    navigation,
    route,
}: AccountDetailsScreenProps) => {
    const { height: screenHeight, width: screenWidth } = useWindowDimensions();
    const isSmallDevice = screenHeight < 700;

    const role = route?.params?.role ?? "Farmer";

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleContinue = () => {
        setError("");

        if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
            setError("Please complete all fields.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        navigation.navigate("IdentityVerificationScreen", {
            role,
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
        });
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
                    className="flex-1"
                >
                    <ScrollView
                        className="flex-1"
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: isSmallDevice ? 20 : 32,
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
                                <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
                                <Text className="ml-1.5 text-xs text-white">Back</Text>
                            </TouchableOpacity>

                            <Text className="mb-0.5 text-xs font-medium text-[#C6E6CC]">
                                Step 3 of 4
                            </Text>

                            <Text
                                className={`font-bold text-white ${
                                    isSmallDevice ? "text-lg" : "text-xl"
                                }`}
                            >
                                Create Account
                            </Text>

                            <Text className="mt-0.5 text-xs text-[#D9EEDC]">
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
                                    <Text className="mb-1.5 text-[11px] font-medium text-[#334155]">
                                        Password
                                    </Text>

                                    <View
                                        className={`${
                                            isSmallDevice ? "h-[38px]" : "h-[42px]"
                                        } flex-row items-center rounded-[11px] border border-[#E0E5EB] px-2.5 bg-white`}
                                    >
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={isSmallDevice ? 15 : 16}
                                            color="#94A3B8"
                                        />

                                        <TextInput
                                            className="ml-2 flex-1 py-0 text-[12px] text-[#334155]"
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
                                                size={isSmallDevice ? 15 : 16}
                                                color="#94A3B8"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Validation message */}
                                {error ? (
                                    <Text className="mb-3 text-[11px] text-red-600">
                                        {error}
                                    </Text>
                                ) : null}

                                {/* Continue */}
                                <TouchableOpacity
                                    onPress={handleContinue}
                                    activeOpacity={0.8}
                                    className={`${
                                        isSmallDevice ? "h-[42px]" : "h-[46px]"
                                    } items-center justify-center rounded-[12px] bg-[#00A844] shadow-sm`}
                                >
                                    <Text className="text-[13px] font-semibold text-white">
                                        Continue
                                    </Text>
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
            <Text className="mb-1.5 text-[11px] font-medium text-[#334155]">
                {label}
            </Text>

            <View
                className={`${
                    isSmallDevice ? "h-[38px]" : "h-[42px]"
                } flex-row items-center rounded-[11px] border border-[#E0E5EB] px-2.5 bg-white`}
            >
                <Ionicons name={icon} size={isSmallDevice ? 15 : 16} color="#94A3B8" />

                <TextInput
                    className="ml-2 flex-1 py-0 text-[12px] text-[#334155]"
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
