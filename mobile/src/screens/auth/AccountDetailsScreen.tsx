import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AccountDetailsScreenProps {
    navigation: any;
    route: any;
}

const AccountDetailsScreen = ({
    navigation,
    route,
}: AccountDetailsScreenProps) => {
    const role = route?.params?.role ?? "Farmer";

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    return (
        <SafeAreaView className="flex-1 bg-[#F5F8F6]">
            <StatusBar barStyle="light-content" backgroundColor="#176B2C" />

            <ScrollView
                className="flex-1"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
            >
                {/* Green header */}
                <View className="h-[127px] bg-[#176B2C] px-[18px] pt-2">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                        className="mb-3 flex-row items-center self-start"
                    >
                        <Ionicons name="arrow-back" size={17} color="#FFFFFF" />
                        <Text className="ml-2 text-[10px] text-white">Back</Text>
                    </TouchableOpacity>

                    <Text className="mb-1 text-[10px] text-[#C6E6CC]">
                        Step 3 of 4
                    </Text>

                    <Text className="text-[16px] font-bold text-white">
                        Create Account
                    </Text>

                    <Text className="mt-1 text-[11px] text-[#D9EEDC]">
                        Registering as a {role.toLowerCase()}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>

    )
}