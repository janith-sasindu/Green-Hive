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

            </View>
        </SafeAreaView>
    );
};

export default RoleSelectionScreen;
