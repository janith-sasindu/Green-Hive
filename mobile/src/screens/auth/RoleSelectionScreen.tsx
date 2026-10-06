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

interface RoleSelectionScreenProps {
    navigation: any;
}

interface RoleCardProps {
    icon: string;
    title: string;
    description: string;
    onPress: () => void;
}

const RoleCard = ({
    icon,
    title,
    description,
    onPress,
}: RoleCardProps) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className="mb-3.5 flex-row items-center rounded-2xl bg-white p-4 shadow-sm border border-gray-100/60"
        >
            {/* Icon Container */}
            <View className="mr-3.5 h-12 w-12 items-center justify-center rounded-xl bg-[#F0F7F2]">
                <Text className="text-2xl">{icon}</Text>
            </View>

            {/* Text Content */}
            <View className="flex-1 pr-2">
                <Text className="mb-0.5 text-base font-bold text-[#1F2937]">
                    {title}
                </Text>

                <Text className="text-xs leading-5 text-[#6B7280]">
                    {description}
                </Text>
            </View>

            {/* Chevron Arrow */}
            <Ionicons
                name="chevron-forward"
                size={18}
                color="#D1D5DB"
            />
        </TouchableOpacity>
    );
};

const RoleSelectionScreen = ({
    navigation,
}: RoleSelectionScreenProps) => {
    const { height: screenHeight } = useWindowDimensions();
    const isSmallDevice = screenHeight < 700;

    const handleRoleSelect = (role: string) => {
        navigation.navigate("CreateAccount", {
            role: role,
        });
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
                        onPress={() => navigation.navigate("Welcome")}
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
                        Step 1 of 4
                    </Text>

                    {/* Title */}
                    <Text className={`font-bold text-white mb-0.5 ${isSmallDevice ? "text-xl" : "text-2xl"}`}>
                        Choose your role
                    </Text>

                    {/* Subtitle */}
                    <Text className="text-xs text-[#D9EEDC]">
                        How will you use Green Hive?
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
                    {/* Farmer */}
                    <RoleCard
                        icon="🌾"
                        title="Farmer"
                        description="List and sell your farm produce directly to buyers"
                        onPress={() => handleRoleSelect("Farmer")}
                    />

                    {/* Retail Seller */}
                    <RoleCard
                        icon="🏪"
                        title="Retail Seller"
                        description="Browse and purchase farm products for your business"
                        onPress={() => handleRoleSelect("Retail Seller")}
                    />

                    {/* Transporter */}
                    <RoleCard
                        icon="🚚"
                        title="Transporter"
                        description="Offer transport services for agricultural goods"
                        onPress={() => handleRoleSelect("Transporter")}
                    />

                    {/* Sign In Footer */}
                    <View className="mt-auto pt-6 mb-4 flex-row items-center justify-center gap-1">
                        <Text className="text-xs text-[#6B7280]">
                            Already have an account?
                        </Text>

                        <TouchableOpacity
                            onPress={() => navigation.navigate("Login")}
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

export default RoleSelectionScreen;
