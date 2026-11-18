import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StatusBar,
    ScrollView,
    Alert,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface CreateAccountScreenProps {
    navigation: any;
    route: any;
}

const getRoleInfo = (rawRole?: string) => {
    const lower = (rawRole || "").toLowerCase();
    if (lower.includes("seller")) {
        return { icon: "🏪", label: "Retail Seller" };
    }
    if (lower.includes("transporter")) {
        return { icon: "🚛", label: "Transporter" };
    }
    return { icon: "🌾", label: "Farmer" };
};

const CreateAccountScreen = ({
    navigation,
    route,
}: CreateAccountScreenProps) => {
    const { height: screenHeight, width: screenWidth } = useWindowDimensions();
    const isSmallDevice = screenHeight < 700 || screenWidth < 380;

    const role = route?.params?.role ?? "Retail Seller";
    const roleInfo = getRoleInfo(role);

    const handleGoogleSignUp = () => {
        Alert.alert(
            "Google Sign In",
            "Google authentication will be available after setup."
        );
    };

    const handleEmailSignUp = () => {
        navigation.navigate("AccountDetailsScreen", {
            role: role,
        });
    };

    const handleBack = () => {
        if (navigation.canGoBack && navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate("RoleSelectionScreen");
        }
    };

    return (
        <View className="flex-1 bg-[#176B2C]">
            <StatusBar barStyle="light-content" backgroundColor="#176B2C" />

            {/* Top SafeArea for notch / status bar */}
            <SafeAreaView edges={["top"]} className="bg-[#176B2C]" />

            {/* Main content container */}
            <SafeAreaView
                edges={["bottom", "left", "right"]}
                className="flex-1 bg-[#F5F8F6]"
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    scrollEventThrottle={16}
                    decelerationRate="normal"
                    overScrollMode="never"
                    nestedScrollEnabled={true}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingBottom: isSmallDevice ? 24 : 36,
                    }}
                >
                    {/* ================= HEADER ================= */}
                    <View
                        className={`bg-[#176B2C] px-5 ${
                            isSmallDevice ? "pt-2 pb-8" : "pt-3 pb-10"
                        }`}
                    >
                        {/* Back Button */}
                        <TouchableOpacity
                            onPress={handleBack}
                            activeOpacity={0.7}
                            className="mb-2.5 -ml-1 flex-row items-center p-1 self-start"
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={20}
                                color="#FFFFFF"
                            />
                            <Text className="ml-1.5 text-sm font-semibold text-white">
                                Back
                            </Text>
                        </TouchableOpacity>

                        {/* Brand Logo */}
                        <Image
                            source={require("../../assets/logo.png")}
                            style={{
                                width: isSmallDevice ? 56 : 68,
                                height: isSmallDevice ? 40 : 50,
                            }}
                            className="mb-2"
                            resizeMode="contain"
                        />

                        {/* Step Indicator */}
                        <Text className="mb-0.5 text-xs font-semibold text-[#B9E2C1]">
                            Step 2 of 4
                        </Text>

                        {/* Title */}
                        <Text
                            className={`font-bold text-white mb-0.5 ${
                                isSmallDevice ? "text-xl" : "text-2xl"
                            }`}
                        >
                            Create your account
                        </Text>

                        {/* Dynamic Role Subtitle */}
                        <Text className="text-xs text-[#D9EEDC]">
                            Signing up as {roleInfo.icon} {roleInfo.label}
                        </Text>
                    </View>

                    {/* ================= BODY CARDS ================= */}
                    <View className="px-5">
                        <View
                            className="-mt-5 w-full self-center"
                            style={{ maxWidth: 440 }}
                        >
                            {/* Option 1: Continue with Google */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleGoogleSignUp}
                                className="flex-row items-center rounded-2xl border border-[#E5E9E6] bg-white p-4 shadow-sm"
                                style={{
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.06,
                                    shadowRadius: 4,
                                    elevation: 2,
                                }}
                            >
                                {/* Google Icon Circle */}
                                <View className="mr-3.5 h-12 w-12 items-center justify-center rounded-full border border-gray-100 bg-white">
                                    <Ionicons
                                        name="logo-google"
                                        size={22}
                                        color="#EA4335"
                                    />
                                </View>

                                {/* Text Content */}
                                <View className="flex-1 pr-2">
                                    <Text className="text-base font-bold text-[#1F2937]">
                                        Continue with Google
                                    </Text>
                                    <Text className="mt-0.5 text-xs text-[#6B7280]">
                                        Fast sign-up using your Google account
                                    </Text>
                                </View>

                                {/* Chevron Arrow */}
                                <Ionicons
                                    name="chevron-forward"
                                    size={18}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>

                            {/* Horizontal Divider */}
                            <View className="my-5 flex-row items-center justify-center px-2">
                                <View className="h-[1px] flex-1 bg-[#E2E8F0]" />
                                <Text className="mx-3 text-xs font-medium text-[#94A3B8]">
                                    or
                                </Text>
                                <View className="h-[1px] flex-1 bg-[#E2E8F0]" />
                            </View>

                            {/* Option 2: Sign up with Email */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleEmailSignUp}
                                className="flex-row items-center rounded-2xl border border-[#E5E9E6] bg-white p-4 shadow-sm"
                                style={{
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.06,
                                    shadowRadius: 4,
                                    elevation: 2,
                                }}
                            >
                                {/* Email Icon Circle */}
                                <View className="mr-3.5 h-12 w-12 items-center justify-center rounded-full border border-gray-100 bg-[#F8FAF9]">
                                    <Ionicons
                                        name="mail-outline"
                                        size={20}
                                        color="#4B5563"
                                    />
                                </View>

                                {/* Text Content */}
                                <View className="flex-1 pr-2">
                                    <Text className="text-base font-bold text-[#1F2937]">
                                        Sign up with Email
                                    </Text>
                                    <Text className="mt-0.5 text-xs text-[#6B7280]">
                                        Create an account with email & password
                                    </Text>
                                </View>

                                {/* Chevron Arrow */}
                                <Ionicons
                                    name="chevron-forward"
                                    size={18}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>

                            {/* Bottom Sign In Link */}
                            <View className="mt-8 flex-row items-center justify-center gap-1">
                                <Text className="text-sm text-[#6B7280]">
                                    Already have an account?
                                </Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate("Login")}
                                    activeOpacity={0.7}
                                    hitSlop={{
                                        top: 8,
                                        bottom: 8,
                                        left: 8,
                                        right: 8,
                                    }}
                                >
                                    <Text className="text-sm font-bold text-[#176B2C]">
                                        Sign In
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default CreateAccountScreen;

