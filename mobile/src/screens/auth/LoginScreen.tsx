import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StatusBar,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { verifyMockLogin } from "../../data/mockAuth";

interface LoginScreenProps {
    navigation: any;
}

type DemoRole = "Farmer" | "Seller" | "Transporter";

const LoginScreen = ({ navigation }: LoginScreenProps) => {
    const { height: screenHeight, width: screenWidth } = useWindowDimensions();
    const isSmallDevice = screenHeight < 700 || screenWidth < 380;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Sign in with email and password
    const handleSignIn = async () => {
        if (!email.trim() || !password) {
            Alert.alert(
                "Missing information",
                "Please enter your username/email and password."
            );
            return;
        }

        setLoading(true);

        try {
            const result = verifyMockLogin(email, password);

            if (result.success && result.data) {
                const userRole = (result.data.user.role || "").toUpperCase();
                if (userRole === "SELLER") {
                    navigation.navigate("SellerHome");
                } else if (userRole === "TRANSPORTER") {
                    navigation.navigate("TransporterHome");
                } else {
                    navigation.navigate("FarmerHome");
                }
            } else {
                Alert.alert(
                    "Login failed",
                    result.error || "Invalid username or password."
                );
            }
        } catch {
            Alert.alert(
                "Login failed",
                "Unable to sign in. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Forgot password
    const handleForgotPassword = () => {
        navigation.navigate("ForgotPassword");
    };

    // Google sign in
    const handleGoogleSignIn = () => {
        Alert.alert(
            "Google Sign In",
            "Google authentication will be available after setup."
        );
    };

    // Quick demo access
    const handleDemoAccess = (role: DemoRole) => {
        const demoRoutes: Record<DemoRole, string> = {
            Farmer: "FarmerHome",
            Seller: "SellerHome",
            Transporter: "TransporterHome",
        };

        navigation.navigate(demoRoutes[role]);
    };

    return (
        <View className="flex-1 bg-[#176B2C]">
            <StatusBar barStyle="light-content" backgroundColor="#176B2C" />

            {/* Top SafeArea ensures notch / status bar area matches header */}
            <SafeAreaView edges={["top"]} className="bg-[#176B2C]" />

            {/* Main content area with bottom safe area */}
            <SafeAreaView
                edges={["bottom", "left", "right"]}
                className="flex-1 bg-[#F4F8F5]"
            >
                <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <ScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        bounces={false}
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: isSmallDevice ? 20 : 32,
                        }}
                    >
                        {/* ================= HEADER ================= */}
                        <View
                            className={`bg-[#176B2C] px-5 ${
                                isSmallDevice ? "pt-2 pb-7" : "pt-3 pb-8"
                            }`}
                        >
                            {/* Back */}
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                activeOpacity={0.7}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                className="mb-2.5 flex-row items-center self-start"
                            >
                                <Ionicons
                                    name="arrow-back"
                                    size={20}
                                    color="#FFFFFF"
                                />
                                <Text className="ml-1.5 text-base text-white">
                                    Back
                                </Text>
                            </TouchableOpacity>

                            {/* Green Hive Logo */}
                            <Image
                                source={require("../../assets/logo.png")}
                                style={{
                                    width: isSmallDevice ? 56 : 68,
                                    height: isSmallDevice ? 40 : 50,
                                }}
                                className="mb-1"
                                resizeMode="contain"
                            />

                            {/* Brand tagline */}
                            <Text
                                className={`mb-2 font-extrabold text-[#D5E8D7] ${
                                    isSmallDevice
                                        ? "text-[11px] tracking-[0.8px]"
                                        : "text-[13px] tracking-[1.4px]"
                                }`}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                CONNECT · TRADE · TRANSPORT · GROW
                            </Text>

                            {/* Header title */}
                            <Text
                                className={`font-bold text-white ${
                                    isSmallDevice ? "text-[24px]" : "text-[27px]"
                                }`}
                            >
                                Welcome back
                            </Text>

                            <Text className="mt-0.5 text-base text-[#D9EEDC]">
                                Sign in to your account
                            </Text>
                        </View>

                        {/* ================= LOGIN CARD ================= */}
                        <View className="px-4">
                            <View
                                className={`-mt-5 w-full self-center rounded-[20px] border border-[#E5E9E6] bg-white shadow-lg ${
                                    isSmallDevice ? "p-4" : "p-5"
                                }`}
                                style={{ maxWidth: 440 }}
                            >
                                {/* Email label */}
                                <Text className="mb-1.5 text-[15px] font-bold text-[#344054]">
                                    Username / Email
                                </Text>

                                {/* Email input */}
                                <View
                                    className={`mb-3.5 flex-row items-center rounded-[11px] border border-[#E0E5EB] px-3 bg-white ${
                                        isSmallDevice ? "h-[44px]" : "h-[48px]"
                                    }`}
                                >
                                    <Ionicons
                                        name="mail-outline"
                                        size={18}
                                        color="#94A3B8"
                                    />

                                    <TextInput
                                        className="ml-2.5 flex-1 h-full text-[15px] text-[#344054]"
                                        style={{ height: "100%" }}
                                        placeholder="your@email.com"
                                        placeholderTextColor="#9AA39D"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        autoComplete="username"
                                        returnKeyType="next"
                                    />
                                </View>

                                {/* Password label */}
                                <Text className="mb-1.5 text-[15px] font-bold text-[#344054]">
                                    Password
                                </Text>

                                {/* Password input */}
                                <View
                                    className={`flex-row items-center rounded-[11px] border border-[#E0E5EB] px-3 bg-white ${
                                        isSmallDevice ? "h-[44px]" : "h-[48px]"
                                    }`}
                                >
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={18}
                                        color="#94A3B8"
                                    />

                                    <TextInput
                                        className="ml-2.5 flex-1 h-full text-[15px] text-[#344054]"
                                        style={{ height: "100%" }}
                                        placeholder="Enter your password"
                                        placeholderTextColor="#9AA39D"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoComplete="current-password"
                                        returnKeyType="done"
                                        onSubmitEditing={handleSignIn}
                                    />

                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        activeOpacity={0.7}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        className="p-1"
                                    >
                                        <Ionicons
                                            name={
                                                showPassword
                                                    ? "eye-off-outline"
                                                    : "eye-outline"
                                            }
                                            size={18}
                                            color="#94A3B8"
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Forgot password */}
                                <TouchableOpacity
                                    onPress={handleForgotPassword}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    className="mb-3.5 mt-2.5 self-end"
                                >
                                    <Text className="text-[15px] font-bold text-[#237D32]">
                                        Forgot Password?
                                    </Text>
                                </TouchableOpacity>

                                {/* Sign in button */}
                                <TouchableOpacity
                                    onPress={handleSignIn}
                                    disabled={loading}
                                    activeOpacity={0.85}
                                    className={`items-center justify-center rounded-[13px] ${
                                        isSmallDevice ? "h-[46px]" : "h-[52px]"
                                    } ${
                                        loading ? "bg-[#78A981]" : "bg-[#176B2C]"
                                    }`}
                                    style={{
                                        elevation: 4,
                                        shadowColor: "#000000",
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.15,
                                        shadowRadius: 3,
                                    }}
                                >
                                    <Text className="text-[18px] font-bold text-white">
                                        {loading ? "Signing In..." : "Sign In"}
                                    </Text>
                                </TouchableOpacity>

                                {/* OR divider */}
                                <View className="my-3 flex-row items-center justify-center">
                                    <View className="h-[1px] flex-1 bg-gray-200" />
                                    <Text className="mx-3 text-[14px] uppercase font-semibold text-[#98A2B3]">
                                        or
                                    </Text>
                                    <View className="h-[1px] flex-1 bg-gray-200" />
                                </View>

                                {/* Google sign in */}
                                <TouchableOpacity
                                    onPress={handleGoogleSignIn}
                                    activeOpacity={0.7}
                                    className={`flex-row items-center justify-center rounded-[12px] border border-[#E0E5EB] bg-white ${
                                        isSmallDevice ? "h-[44px]" : "h-[48px]"
                                    }`}
                                >
                                    <Text className="mr-2.5 text-[22px] font-bold text-[#4285F4]">
                                        G
                                    </Text>

                                    <Text className="text-[15px] font-medium text-[#475467]">
                                        Continue with Google
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* ================= QUICK DEMO ACCESS ================= */}
                        <View
                            className="mt-4 px-4 w-full self-center"
                            style={{ maxWidth: 440 }}
                        >
                            <Text className="mb-2 text-center text-[14px] font-extrabold tracking-[0.5px] text-[#98A2B3]">
                                QUICK DEMO ACCESS
                            </Text>

                            <View className="flex-row gap-2">
                                {/* Farmer */}
                                <TouchableOpacity
                                    onPress={() => handleDemoAccess("Farmer")}
                                    activeOpacity={0.7}
                                    className={`flex-1 items-center justify-center rounded-[11px] border border-[#C7E8CB] bg-[#EAF6EB] ${
                                        isSmallDevice ? "h-[54px]" : "h-[64px]"
                                    }`}
                                >
                                    <Text className="mb-0.5 text-[18px]">🌾</Text>
                                    <Text
                                        className="text-[13px] font-bold text-[#237D32]"
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                    >
                                        Farmer
                                    </Text>
                                </TouchableOpacity>

                                {/* Seller */}
                                <TouchableOpacity
                                    onPress={() => handleDemoAccess("Seller")}
                                    activeOpacity={0.7}
                                    className={`flex-1 items-center justify-center rounded-[11px] border border-[#BFDBFE] bg-[#EFF6FF] ${
                                        isSmallDevice ? "h-[54px]" : "h-[64px]"
                                    }`}
                                >
                                    <Text className="mb-0.5 text-[18px]">🏪</Text>
                                    <Text
                                        className="text-[13px] font-bold text-[#2563EB]"
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                    >
                                        Seller
                                    </Text>
                                </TouchableOpacity>

                                {/* Transporter */}
                                <TouchableOpacity
                                    onPress={() => handleDemoAccess("Transporter")}
                                    activeOpacity={0.7}
                                    className={`flex-1 items-center justify-center rounded-[11px] border border-[#FDE68A] bg-[#FFFBEB] ${
                                        isSmallDevice ? "h-[54px]" : "h-[64px]"
                                    }`}
                                >
                                    <Text className="mb-0.5 text-[18px]">🚚</Text>
                                    <Text
                                        className="text-[13px] font-bold text-[#D97706]"
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                    >
                                        Transporter
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Demo information */}
                            <Text className="mt-2 text-center text-[13px] text-[#98A2B3]">
                                No signup needed — tap to explore
                            </Text>
                        </View>

                        {/* ================= SIGN UP ================= */}
                        <View className="mt-4 mb-2 flex-row items-center justify-center">
                            <Text className="text-[15px] text-[#667085]">
                                Don't have an account?{" "}
                            </Text>

                            <TouchableOpacity
                                onPress={() => navigation.navigate("RoleSelection")}
                                activeOpacity={0.7}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Text className="text-[15px] font-bold text-[#237D32]">
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

export default LoginScreen;
