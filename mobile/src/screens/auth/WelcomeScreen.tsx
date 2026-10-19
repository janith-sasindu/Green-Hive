import React from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface WelcomeScreenProps {
    navigation?: any;
}

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
    const { height: screenHeight, width: screenWidth } = useWindowDimensions();
    const isSmallDevice = screenHeight < 700 || screenWidth < 380;

    const logoWidth = Math.min(screenWidth - 48, isSmallDevice ? 270 : 340);
    const logoHeight = Math.round(logoWidth * (216 / 360));

    const handleGetStarted = () => {
        navigation?.navigate("FarmerHome");
    };

    const handleSignIn = () => {
        navigation?.navigate("Login");
    };

    const handleQuickDemo = (role: "farmer" | "seller" | "transporter") => {
        switch (role) {
            case "farmer":
                navigation?.navigate("FarmerHome");
                break;
            case "seller":
                navigation?.navigate("SellerHome");
                break;
            case "transporter":
                navigation?.navigate("TransporterHome");
                break;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#1c5d26]" edges={["top", "bottom"]}>
            <StatusBar barStyle="light-content" backgroundColor="#1c5d26" />

            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                bounces={false}
                showsVerticalScrollIndicator={false}
            >
                {/* Top Section */}
                <View
                    className={`items-center justify-center px-6 ${
                        isSmallDevice ? "py-4" : "py-8 flex-1"
                    }`}
                >
                    {/* Logo */}
                    <Image
                        source={require("../../assets/logo.png")}
                        style={{
                            width: logoWidth,
                            height: logoHeight,
                            maxWidth: "100%",
                        }}
                        resizeMode="contain"
                        className="mb-4"
                    />

                    {/* Tagline */}
                    <Text
                        className={`mb-2 text-center font-extrabold tracking-wider text-white ${
                            isSmallDevice ? "text-base" : "text-lg"
                        }`}
                    >
                        CONNECT • TRADE • TRANSPORT • GROW
                    </Text>

                    {/* Subtitle */}
                    <Text
                        className={`text-center font-normal leading-relaxed text-[#d1e7d4] px-2 ${
                            isSmallDevice ? "text-base" : "text-lg"
                        }`}
                    >
                        Sri Lanka's agricultural marketplace — connecting farmers, sellers & transporters
                    </Text>
                </View>

                {/* Bottom Card */}
                <View className="rounded-t-[36px] bg-white px-6 pt-6 pb-8 shadow-lg">
                    {/* Platform Features Section */}
                    <View
                        className={`rounded-2xl bg-[#F8FAF8] border border-[#E8F0E8] ${
                            isSmallDevice ? "mb-4 px-3 py-2.5" : "mb-6 px-3.5 py-3.5"
                        }`}
                    >

                        {/* Feature Items 2x2 Grid */}
                        <View className="flex-row justify-between">
                            {/* Left Column */}
                            <View className="flex-1 pr-1 gap-3">
                                <View className="flex-row items-center">
                                    <View className="mr-2 h-7 w-7 items-center justify-center rounded-lg bg-[#E8F5E9]">
                                        <Text className="text-sm">🌿</Text>
                                    </View>
                                    <Text
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                        className="flex-1 text-[13px] font-bold text-gray-800"
                                    >
                                        Farm Fresh
                                    </Text>
                                </View>

                                <View className="flex-row items-center">
                                    <View className="mr-2 h-7 w-7 items-center justify-center rounded-lg bg-[#E8F5E9]">
                                        <Text className="text-sm">🚛</Text>
                                    </View>
                                    <Text
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                        className="flex-1 text-[13px] font-bold text-gray-800"
                                    >
                                        Transport Network
                                    </Text>
                                </View>
                            </View>

                            {/* Right Column */}
                            <View className="flex-1 pl-1 gap-3">
                                <View className="flex-row items-center">
                                    <View className="mr-2 h-7 w-7 items-center justify-center rounded-lg bg-[#E8F5E9]">
                                        <Text className="text-sm">🔒</Text>
                                    </View>
                                    <Text
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                        className="flex-1 text-[13px] font-bold text-gray-800"
                                    >
                                        Secure Payment
                                    </Text>
                                </View>

                                <View className="flex-row items-center">
                                    <View className="mr-2 h-7 w-7 items-center justify-center rounded-lg bg-[#E8F5E9]">
                                        <Text className="text-sm">✅</Text>
                                    </View>
                                    <Text
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                        className="flex-1 text-[13px] font-bold text-gray-800"
                                    >
                                        Verified Users
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="gap-3">
                        <TouchableOpacity
                            onPress={handleGetStarted}
                            activeOpacity={0.8}
                            className="items-center justify-center rounded-2xl bg-[#1c5d26] py-4 shadow-sm"
                        >
                            <Text className="text-base font-bold text-white">
                                Get Started
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSignIn}
                            activeOpacity={0.8}
                            className="items-center justify-center rounded-2xl bg-[#e8f5e9] py-4 shadow-sm"
                        >
                            <Text className="text-base font-bold text-[#1c5d26]">
                                Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Quick Demo Section */}
                    <View className="mt-7">
                        <View className="flex-row justify-between gap-2">
                            {/* Farmer */}
                            <TouchableOpacity
                                onPress={() => handleQuickDemo("farmer")}
                                activeOpacity={0.7}
                                className="flex-1 items-center justify-center rounded-xl border border-[#c8e6c9] bg-[#e8f5e9] py-3 px-1"
                            >
                                <Text
                                    className={`font-bold text-[#1c5d26] ${
                                        isSmallDevice ? "text-[11px]" : "text-xs"
                                    }`}
                                    numberOfLines={1}
                                >
                                    🌾 Farmer
                                </Text>
                            </TouchableOpacity>

                            {/* Retail Seller */}
                            <TouchableOpacity
                                onPress={() => handleQuickDemo("seller")}
                                activeOpacity={0.7}
                                className="flex-1 items-center justify-center rounded-xl border border-[#bfdbfe] bg-[#eff6ff] py-3 px-1"
                            >
                                <Text
                                    className={`font-bold text-[#1d4ed8] ${
                                        isSmallDevice ? "text-[11px]" : "text-xs"
                                    }`}
                                    numberOfLines={1}
                                >
                                    🏪 Retail Seller
                                </Text>
                            </TouchableOpacity>

                            {/* Transporter */}
                            <TouchableOpacity
                                onPress={() => handleQuickDemo("transporter")}
                                activeOpacity={0.7}
                                className="flex-1 items-center justify-center rounded-xl border border-[#fde68a] bg-[#fffbeb] py-3 px-1"
                            >
                                <Text
                                    className={`font-bold text-[#b45309] ${
                                        isSmallDevice ? "text-[11px]" : "text-xs"
                                    }`}
                                    numberOfLines={1}
                                >
                                    🚛 Transporter
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
