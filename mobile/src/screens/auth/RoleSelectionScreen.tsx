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
                {/* Sign In */}
                <View className="mt-7 flex-row items-center justify-center">
                    <Text className="text-[10px] text-[#89918D]">
                        Already have an account?
                    </Text>

                    <TouchableOpacity
                        onPress={() => navigation.navigate("Login")}
                    >
                        <Text className="text-[10px] font-medium text-[#16853A]">
                            Sign In
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

        </SafeAreaView>
    );
};
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
            activeOpacity={0.7}
            onPress={onPress}
            className="mb-2 flex-row items-center rounded-xl bg-white px-3 py-3 shadow-sm"
        >
            {/* Icon */}
            <View className="mr-2 w-7 items-center justify-center">
                <Text className="text-[22px]">
                    {icon}
                </Text>
            </View>

            {/* Text */}
            <View className="flex-1 pr-1">
                <Text className="mb-0.5 text-xs font-medium text-[#111111]">
                    {title}
                </Text>

                <Text className="text-[9.5px] leading-[13px] text-[#777777]">
                    {description}
                </Text>
            </View>

            {/* Arrow */}
            <Ionicons
                name="chevron-forward"
                size={18}
                color="#CBD2D0"
            />
        </TouchableOpacity>
    );
};


export default RoleSelectionScreen;
