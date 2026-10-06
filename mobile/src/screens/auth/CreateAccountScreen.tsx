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

    return (
        <View className="flex-1 bg-[#176B2C]">
            <StatusBar barStyle="light-content" backgroundColor="#176B2C" />

            {/* Top SafeArea for Header */}
            <SafeAreaView edges={["top"]} className="bg-[#176B2C]">
                <View className={`px-5 items-start ${isSmallDevice ? "pt-2 pb-4" : "pt-3 pb-6"}`}>
                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                        className="mb-2 -ml-1 p-1"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Logo */}
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
                        Create {selectedRole} Account {roleIcons[selectedRole] || "🌾"}
                    </Text>

                    {/* Subtitle */}
                    <Text className="text-xs text-[#D9EEDC]">
                        Enter your details to register as a {selectedRole}
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
                    <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                            Account Registration Details
                        </Text>
                        <Text className="text-xs text-gray-500">
                            Fill in your registration information below to complete setup.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default CreateAccountScreen;
