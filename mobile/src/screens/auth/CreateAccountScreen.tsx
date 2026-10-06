import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StatusBar,
    ScrollView,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface CreateAccountScreenProps {
    navigation: any;
    route: any;
}

const CreateAccountScreen = ({
    navigation,
    route,
}: CreateAccountScreenProps) => {
    const { height: screenHeight } = useWindowDimensions();
    const isSmallDevice = screenHeight < 700;

    // Get the role selected from Step 1
    const selectedRole = route?.params?.role || "Farmer";

    // Role icons
    const roleIcons: Record<string, string> = {
        Farmer: "🌾",
        "Retail Seller": "🏪",
        Transporter: "🚚",
    };
    const roleIcon = roleIcons[selectedRole] || "🌾";

    // Google Sign Up
    const handleGoogleSignUp = () => {
        console.log("Continue with Google");
        // TODO: Implement Google authentication here
    };

    // Email Sign Up
    const handleEmailSignUp = () => {
        navigation.navigate("EmailRegistration", {
            role: selectedRole,
        });
    };

    // Go Back
    const handleBack = () => {
        navigation.goBack();
    };

    // Sign In
    const handleSignIn = () => {
        navigation.navigate("Login");
    };

    return (
        <View className="flex-1 bg-[#176B2C]">
            <StatusBar barStyle="light-content" backgroundColor="#176B2C" />

            {/* Top SafeArea for Header */}
            <SafeAreaView edges={["top"]} className="bg-[#176B2C]">
                {/* Header Container */}
                <View className={`px-5 items-start ${isSmallDevice ? "pt-2 pb-4" : "pt-3 pb-6"}`}>
                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={handleBack}
                        activeOpacity={0.7}
                        className="mb-2 -ml-1 p-1"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Logo under Back Button */}
                    <Image
                        source={require("../../assets/logo.png")}
                        style={{
                            width: isSmallDevice ? 90 : 120,
                            height: isSmallDevice ? 54 : 72,
                        }}
                        className="mb-2 -ml-2.5 self-start"
                        resizeMode="contain"
                    />

                    {/* Step */}
                    <Text className="mb-0.5 text-xs font-semibold text-[#B9E2C1]">
                        Step 2 of 4
                    </Text>

                    {/* Title */}
                    <Text className={`font-bold text-white mb-0.5 ${isSmallDevice ? "text-xl" : "text-2xl"}`}>
                        Create your account
                    </Text>

                    {/* Subtitle with Selected Role */}
                    <Text className="text-xs text-[#D9EEDC]">
                        Signing up as <Text className="font-semibold text-white">{roleIcon} {selectedRole}</Text>
                    </Text>
                </View>
            </SafeAreaView>

            {/* Body Content Container */}
            <SafeAreaView edges={["bottom"]} className="flex-1 bg-[#F5F8F6] rounded-t-[32px]">
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    className="px-5 pt-6"
                >
                    {/* Google Sign Up */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleGoogleSignUp}
                        className="mb-4 flex-row items-center rounded-2xl bg-white p-4 shadow-sm border border-gray-100/60"
                    >
                        {/* Google Icon Container */}
                        <View className="mr-3.5 h-12 w-12 items-center justify-center rounded-xl bg-white border border-gray-100 shadow-2xs">
                            <Text className="text-2xl font-bold text-[#4285F4]">G</Text>
                        </View>

                        {/* Google Text */}
                        <View className="flex-1 pr-2">
                            <Text className="mb-0.5 text-base font-bold text-[#1F2937]">
                                Continue with Google
                            </Text>
                            <Text className="text-xs leading-5 text-[#6B7280]">
                                Fast sign-up using your Google account
                            </Text>
                        </View>

                        {/* Arrow */}
                        <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="#D1D5DB"
                        />
                    </TouchableOpacity>

                    {/* OR Divider */}
                    <View className="my-3 flex-row items-center px-2">
                        <View className="h-[1px] flex-1 bg-gray-200" />
                        <Text className="mx-4 text-xs font-semibold text-gray-400 uppercase">
                            or
                        </Text>
                        <View className="h-[1px] flex-1 bg-gray-200" />
                    </View>

                    {/* Email Sign Up */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleEmailSignUp}
                        className="mb-4 flex-row items-center rounded-2xl bg-white p-4 shadow-sm border border-gray-100/60"
                    >
                        {/* Email Icon Container */}
                        <View className="mr-3.5 h-12 w-12 items-center justify-center rounded-xl bg-[#F0F7F2]">
                            <Ionicons
                                name="mail-outline"
                                size={22}
                                color="#176B2C"
                            />
                        </View>

                        {/* Email Text */}
                        <View className="flex-1 pr-2">
                            <Text className="mb-0.5 text-base font-bold text-[#1F2937]">
                                Sign up with Email
                            </Text>
                            <Text className="text-xs leading-5 text-[#6B7280]">
                                Create an account with email & password
                            </Text>
                        </View>

                        {/* Arrow */}
                        <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="#D1D5DB"
                        />
                    </TouchableOpacity>

                    {/* Sign In Footer */}
                    <View className="mt-auto pt-6 mb-4 flex-row items-center justify-center gap-1">
                        <Text className="text-xs text-[#6B7280]">
                            Already have an account?
                        </Text>

                        <TouchableOpacity
                            onPress={handleSignIn}
                            activeOpacity={0.7}
                        >
                            <Text className="text-xs font-bold text-[#176B2C]">
                                Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default CreateAccountScreen;


