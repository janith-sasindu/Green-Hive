import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Image,
    StatusBar,
    ScrollView,
} from "react-native";
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
            className="mb-4 flex-row items-center rounded-2xl bg-white p-4 shadow-sm border border-gray-100/60"
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
    const handleRoleSelect = (role: string) => {
        if (role === "Farmer") {
            navigation.navigate("FarmerRegistration");
        } else if (role === "Retail Seller") {
            navigation.navigate("SellerRegistration");
        } else if (role === "Transporter") {
            navigation.navigate("TransporterRegistration");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#176B2C]">
            <StatusBar
                barStyle="light-content"
                backgroundColor="#176B2C"
            />

            {/* Header */}
            <View className="bg-[#176B2C] px-5 pt-3 pb-6 items-start">
                {/* Back button */}
                <TouchableOpacity
                    onPress={() => navigation.navigate("Welcome")}
                    activeOpacity={0.7}
                    className="mb-2.5 -ml-1 p-1"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Logo under Back Button */}
                <Image
                    source={require("../../assets/logo.png")}
                    className="mb-2.5 h-[72px] w-[120px] -ml-2.5 self-start"
                    resizeMode="contain"
                />

                {/* Step */}
                <Text className="mb-1 text-xs font-semibold text-[#B9E2C1]">
                    Step 1 of 4
                </Text>

                {/* Title */}
                <Text className="mb-1 text-2xl font-bold text-white">
                    Choose your role
                </Text>

                {/* Subtitle */}
                <Text className="text-xs text-[#D9EEDC]">
                    How will you use Green Hive?
                </Text>
            </View>

            {/* Content Container */}
            <View className="flex-1 bg-[#F5F8F6] px-5 pt-6">
                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
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

                    {/* Sign In */}
                    <View className="mt-8 mb-6 flex-row items-center justify-center gap-1">
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
            </View>
        </SafeAreaView>
    );
};

export default RoleSelectionScreen;

