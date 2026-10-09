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
    const { height: screenHeight } = useWindowDimensions();
    const isSmallDevice = screenHeight < 700;

    const handleGetStarted = () => {
        navigation?.navigate("RoleSelection");
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
                        isSmallDevice ? "py-6" : "py-10 flex-1"
                    }`}
                >
                    {/* Logo */}
                    <Image
                        source={require("../../assets/logo.png")}
                        style={{
                            width: isSmallDevice ? 160 : 200,
                            height: isSmallDevice ? 90 : 120,
                        }}
                        resizeMode="contain"
                        className="mb-4"
                    />

                    {/* Tagline */}
                    <Text className="mb-2 text-center text-xs font-extrabold tracking-widest text-white">
                        CONNECT • TRADE • TRANSPORT • GROW
                    </Text>

                    {/* Subtitle */}
                    <Text className="text-center text-xs font-normal leading-relaxed text-[#d1e7d4] px-2">
                        Sri Lanka's agricultural marketplace — connecting farmers, sellers & transporters
                    </Text>
                </View>

                {/* Bottom Card */}
                <View className="rounded-t-[36px] bg-white px-6 pt-6 pb-8 shadow-lg">
                    {/* Feature Badges */}
                    <View className="flex-row flex-wrap justify-center gap-2 mb-6">
                        <View className="rounded-full bg-[#e8f5e9] px-3.5 py-1.5">
                            <Text className="text-xs font-semibold text-[#1c5d26]">
                                🌿 Farm Fresh
                            </Text>
                        </View>
                        <View className="rounded-full bg-[#e8f5e9] px-3.5 py-1.5">
                            <Text className="text-xs font-semibold text-[#1c5d26]">
                                🔒 Secure Payment
                            </Text>
                        </View>
                        <View className="rounded-full bg-[#e8f5e9] px-3.5 py-1.5">
                            <Text className="text-xs font-semibold text-[#1c5d26]">
                                🚛 Transport Network
                            </Text>
                        </View>
                        <View className="rounded-full bg-[#e8f5e9] px-3.5 py-1.5">
                            <Text className="text-xs font-semibold text-[#1c5d26]">
                                ✅ Verified Users
                            </Text>
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
                        {/* <Text className="mb-3 text-center text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                            Quick Demo Access
                        </Text> */}
                        <View className="flex-row justify-between gap-2">
                            {/* Farmer */}
                            <TouchableOpacity
                                onPress={() => handleQuickDemo("farmer")}
                                activeOpacity={0.7}
                                className="flex-1 items-center justify-center rounded-xl border border-[#c8e6c9] bg-[#e8f5e9] py-3"
                            >
                                <Text
                                    className="text-xs font-bold text-[#1c5d26]"
                                    numberOfLines={1}
                                >
                                    🌾 Farmer
                                </Text>
                            </TouchableOpacity>

                            {/* Retail Seller */}
                            <TouchableOpacity
                                onPress={() => handleQuickDemo("seller")}
                                activeOpacity={0.7}
                                className="flex-1 items-center justify-center rounded-xl border border-[#bfdbfe] bg-[#eff6ff] py-3"
                            >
                                <Text
                                    className="text-xs font-bold text-[#1d4ed8]"
                                    numberOfLines={1}
                                >
                                    🏪 Retail Seller
                                </Text>
                            </TouchableOpacity>

                            {/* Transporter */}
                            <TouchableOpacity
                                onPress={() => handleQuickDemo("transporter")}
                                activeOpacity={0.7}
                                className="flex-1 items-center justify-center rounded-xl border border-[#fde68a] bg-[#fffbeb] py-3"
                            >
                                <Text
                                    className="text-xs font-bold text-[#b45309]"
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
