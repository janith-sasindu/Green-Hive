import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Image,
    StatusBar,
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

const RoleCard = ({ icon, title, description, onPress }: RoleCardProps) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="mb-4 flex-row items-center rounded-2xl bg-white p-4 shadow-sm border border-gray-100"
    >
        <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-[#E8F5E9]">
            <Text className="text-2xl">{icon}</Text>
        </View>
        <View className="flex-1">
            <View className="flex-row items-center justify-between">
                <Text className="text-base font-bold text-gray-800">{title}</Text>
                <Ionicons name="chevron-forward" size={18} color="#176B2C" />
            </View>
            <Text className="mt-1 text-xs text-gray-500 leading-relaxed">
                {description}
            </Text>
        </View>
    </TouchableOpacity>
);


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
        <SafeAreaView className="flex-1 bg-[#F5F8F6]">
            <StatusBar
                barStyle="light-content"
                backgroundColor="#176B2C"
            />

            {/* Header */}
            <View className="h-[112px] bg-[#176B2C] px-4 pt-2 pb-3">
                {/* Logo */}
                <Image
                    source={require("../../assets/logo.png")}
                    className="mb-1 h-7 w-10"
                    resizeMode="contain"

                />
                {/* Step */}
                <Text className="mb-0.5 text-[9px] font-medium text-[#B9E2C1]">
                    Step 1 of 4
                </Text>

                {/* Title */}
                <Text className="mb-0.5 text-base font-bold text-white">
                    Choose your role
                </Text>

                {/* Subtitle */}
                <Text className="text-[10px] text-[#D9EEDC]">
                    How will you use Green Hive?
                </Text>
            </View>
            {/* Content */}
            <View className="flex-1 px-3 pt-7">

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
            </View>

        </SafeAreaView>
    );
};

export default RoleSelectionScreen;
