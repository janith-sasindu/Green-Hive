
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

    const handleContinue = () => {
        setError("");

        if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
            setError("Please complete all fields.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        navigation.navigate("CompleteProfile", {
            role,
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
        });
    };

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

                {/* Form card overlapping the header */}
                <View className="-mt-[19px] mx-4 rounded-[20px] border border-[#E7EBE8] bg-white px-5 pb-5 pt-5 shadow-sm">
                    {/* Full Name */}
                    <FormField
                        label="Full Name"
                        icon="person-outline"
                        placeholder="Your full name"
                        value={fullName}
                        onChangeText={setFullName}
                        autoCapitalize="words"
                        autoComplete="name"
                    />

                    {/* Email */}
                    <FormField
                        label="Email Address"
                        icon="mail-outline"
                        placeholder="your@email.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />

                    {/* Phone */}
                    <FormField
                        label="Phone Number"
                        icon="call-outline"
                        placeholder="+94 77 000 0000"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        autoComplete="tel"
                    />

                    {/* Password */}
                    <View className="mb-4">
                        <Text className="mb-1.5 text-[11px] font-medium text-[#334155]">
                            Password
                        </Text>

                        <View className="h-[35px] flex-row items-center rounded-[11px] border border-[#E0E5EB] px-2.5">
                            <Ionicons
                                name="lock-closed-outline"
                                size={15}
                                color="#94A3B8"
                            />

                            <TextInput
                                className="ml-2 flex-1 py-0 text-[11px] text-[#334155]"
                                placeholder="Create password"
                                placeholderTextColor="#9AA39D"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoComplete="new-password"
                            />

                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="p-1"
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={15}
                                    color="#94A3B8"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Validation message */}
                    {error ? (
                        <Text className="mb-3 text-[11px] text-red-600">
                            {error}
                        </Text>
                    ) : null}

                    {/* Continue */}
                    <TouchableOpacity
                        onPress={handleContinue}
                        activeOpacity={0.8}
                        className="h-[42px] items-center justify-center rounded-[12px] bg-[#00A844]"
                    >
                        <Text className="text-[12px] font-semibold text-white">
                            Continue
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

interface FormFieldProps {
    label: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    placeholder: string;
    value: string;
    onChangeText: (value: string) => void;
    keyboardType?: "default" | "email-address" | "phone-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    autoComplete?: "name" | "email" | "tel";
}

const FormField = ({
    label,
    icon,
    placeholder,
    value,
    onChangeText,
    keyboardType = "default",
    autoCapitalize = "sentences",
    autoComplete,
}: FormFieldProps) => {
    return (
        <View className="mb-3.5">
            <Text className="mb-1.5 text-[11px] font-medium text-[#334155]">
                {label}
            </Text>

            <View className="h-[35px] flex-row items-center rounded-[11px] border border-[#E0E5EB] px-2.5">
                <Ionicons name={icon} size={15} color="#94A3B8" />

                <TextInput
                    className="ml-2 flex-1 py-0 text-[11px] text-[#334155]"
                    placeholder={placeholder}
                    placeholderTextColor="#9AA39D"
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoComplete={autoComplete}
                />
            </View>
        </View>
    );
};

export default AccountDetailsScreen;
