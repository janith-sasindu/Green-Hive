
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StatusBar,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { verifyMockLogin } from "../../data/mockAuth";

interface LoginScreenProps {
    navigation: any;
}

type DemoRole = "Farmer" | "Seller" | "Transporter";

const LoginScreen = ({ navigation }: LoginScreenProps) => {
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
                navigation.navigate("FarmerHome");
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
        <SafeAreaView className="flex-1 bg-[#F4F8F5]">
            <StatusBar
                barStyle="light-content"
                backgroundColor="#176B2C"
            />

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
                >
                    {/* ================= HEADER ================= */}
                    <View className="h-[174px] bg-[#176B2C] px-3 pt-2">
                        {/* Back */}
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                            className="mb-3 flex-row items-center self-start"
                        >
                            <Ionicons
                                name="arrow-back"
                                size={16}
                                color="#FFFFFF"
                            />

                            <Text className="ml-2 text-[10px] text-white">
                                Back
                            </Text>
                        </TouchableOpacity>

                        {/* Green Hive Logo */}
                        <Image
                            source={require("../../assets/logo.png")}
                            className="mb-1 h-[35px] w-[45px]"
                            resizeMode="contain"
                        />

                        {/* Brand tagline */}
                        <Text className="mb-3 text-[10px] font-extrabold tracking-[1.5px] text-[#D5E8D7]">
                            CONNECT · TRADE · TRANSPORT · GROW
                        </Text>

                        {/* Header title */}
                        <Text className="text-[16px] font-bold text-white">
                            Welcome back
                        </Text>

                        <Text className="mt-1 text-[11px] text-[#D9EEDC]">
                            Sign in to your account
                        </Text>
                    </View>

                    {/* ================= LOGIN CARD ================= */}
                    <View className="-mt-5 mx-3 rounded-[20px] border border-[#E5E9E6] bg-white px-5 pb-5 pt-5 shadow-lg">

                        {/* Email label */}
                        <Text className="mb-1.5 text-[11px] font-bold text-[#344054]">
                            Username / Email
                        </Text>

                        {/* Email input */}
                        <View className="mb-3.5 h-[36px] flex-row items-center rounded-[11px] border border-[#E0E5EB] px-2.5">
                            <Ionicons
                                name="mail-outline"
                                size={15}
                                color="#94A3B8"
                            />

                            <TextInput
                                className="ml-2 flex-1 py-0 text-[11px] text-[#344054]"
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
                        <Text className="mb-1.5 text-[11px] font-bold text-[#344054]">
                            Password
                        </Text>

                        {/* Password input */}
                        <View className="h-[36px] flex-row items-center rounded-[11px] border border-[#E0E5EB] px-2.5">
                            <Ionicons
                                name="lock-closed-outline"
                                size={15}
                                color="#94A3B8"
                            />

                            <TextInput
                                className="ml-2 flex-1 py-0 text-[11px] text-[#344054]"
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
                                className="p-1"
                            >
                                <Ionicons
                                    name={
                                        showPassword
                                            ? "eye-off-outline"
                                            : "eye-outline"
                                    }
                                    size={15}
                                    color="#94A3B8"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Forgot password */}
                        <TouchableOpacity
                            onPress={handleForgotPassword}
                            activeOpacity={0.7}
                            className="mb-4 mt-3 self-end"
                        >
                            <Text className="text-[10px] font-bold text-[#237D32]">
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>

                        {/* Sign in button */}
                        <TouchableOpacity
                            onPress={handleSignIn}
                            disabled={loading}
                            activeOpacity={0.85}
                            className={`h-[44px] items-center justify-center rounded-[13px] ${loading ? "bg-[#78A981]" : "bg-[#176B2C]"
                                }`}
                            style={{
                                elevation: 5,
                                shadowColor: "#000000",
                                shadowOffset: { width: 0, height: 3 },
                                shadowOpacity: 0.17,
                                shadowRadius: 4,
                            }}
                        >
                            <Text className="text-[13px] font-bold text-white">
                                {loading ? "Signing In..." : "Sign In"}
                            </Text>
                        </TouchableOpacity>

                        {/* OR divider */}
                        <View className="my-3.5 flex-row items-center justify-center">
                            <Text className="text-[10px] text-[#98A2B3]">
                                or
                            </Text>
                        </View>

                        {/* Google sign in */}
                        <TouchableOpacity
                            onPress={handleGoogleSignIn}
                            activeOpacity={0.7}
                            className="h-[39px] flex-row items-center justify-center rounded-[12px] border border-[#E0E5EB] bg-white"
                        >
                            <Text className="mr-2 text-[19px] font-bold text-[#4285F4]">
                                G
                            </Text>

                            <Text className="text-[11px] font-medium text-[#475467]">
                                Continue with Google
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* ================= QUICK DEMO ACCESS ================= */}
                    <View className="mt-4 px-3">
                        <Text className="mb-2 text-center text-[10px] font-extrabold tracking-[0.5px] text-[#98A2B3]">
                            QUICK DEMO ACCESS
                        </Text>

                        <View className="flex-row gap-2">
                            {/* Farmer */}
                            <TouchableOpacity
                                onPress={() => handleDemoAccess("Farmer")}
                                activeOpacity={0.7}
                                className="h-[54px] flex-1 items-center justify-center rounded-[11px] border border-[#C7E8CB] bg-[#EAF6EB]"
                            >
                                <Text className="mb-1 text-[14px]">🌾</Text>

                                <Text className="text-[9px] font-bold text-[#237D32]">
                                    Farmer
                                </Text>
                            </TouchableOpacity>

                            {/* Seller */}
                            <TouchableOpacity
                                onPress={() => handleDemoAccess("Seller")}
                                activeOpacity={0.7}
                                className="h-[54px] flex-1 items-center justify-center rounded-[11px] border border-[#BFDBFE] bg-[#EFF6FF]"
                            >
                                <Text className="mb-1 text-[14px]">🏪</Text>

                                <Text className="text-[9px] font-bold text-[#2563EB]">
                                    Seller
                                </Text>
                            </TouchableOpacity>

                            {/* Transporter */}
                            <TouchableOpacity
                                onPress={() => handleDemoAccess("Transporter")}
                                activeOpacity={0.7}
                                className="h-[54px] flex-1 items-center justify-center rounded-[11px] border border-[#FDE68A] bg-[#FFFBEB]"
                            >
                                <Text className="mb-1 text-[14px]">🚚</Text>

                                <Text className="text-[9px] font-bold text-[#D97706]">
                                    Transporter
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Demo information */}
                        <Text className="mt-2.5 text-center text-[9px] text-[#98A2B3]">
                            No signup needed — tap to explore
                        </Text>
                    </View>

                    {/* ================= SIGN UP ================= */}
                    <View className="mt-5 flex-row items-center justify-center">
                        <Text className="text-[11px] text-[#667085]">
                            Don't have an account?
                        </Text>

                        <TouchableOpacity
                            onPress={() => navigation.navigate("RoleSelection")}
                            activeOpacity={0.7}
                        >
                            <Text className="text-[11px] font-bold text-[#237D32]">
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;
