import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Alert,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface IdentityVerificationScreenProps {
    navigation: any;
    route: any;
}

const IdentityVerificationScreen = ({
    navigation,
    route,
}: IdentityVerificationScreenProps) => {
    const { height: screenHeight } = useWindowDimensions();
    const isSmallDevice = screenHeight < 700;

    const role = route?.params?.role ?? "Farmer";
    const fullName = route?.params?.fullName ?? "";
    const email = route?.params?.email ?? "";
    const phone = route?.params?.phone ?? "";
    const password = route?.params?.password ?? "";

    const [document, setDocument] =
        useState<DocumentPicker.DocumentPickerAsset | null>(null);

    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "image/jpeg",
                    "image/png",
                    "application/pdf",
                ],
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (result.canceled) return;

            const selectedFile = result.assets[0];

            if (selectedFile.size != null && selectedFile.size > MAX_FILE_SIZE) {
                Alert.alert(
                    "File too large",
                    "Please select a JPG, PNG, or PDF file up to 10 MB."
                );
                return;
            }

            setDocument(selectedFile);
        } catch {
            Alert.alert(
                "Upload error",
                "Unable to select your document. Please try again."
            );
        }
    };

    const handleContinue = async () => {
        if (!document) {
            Alert.alert(
                "National ID required",
                "Please upload a clear photo or scan of your National ID Card."
            );
            return;
        }

        setUploading(true);

        try {
            navigation.navigate("RegistrationComplete", {
                role,
                fullName,
                email,
                phone,
                password,
                idDocument: {
                    uri: document.uri,
                    name: document.name,
                    mimeType: document.mimeType,
                    size: document.size,
                },
            });
        } catch {
            Alert.alert(
                "Upload failed",
                "Please try again."
            );
        } finally {
            setUploading(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <View className="flex-1 bg-[#176B2C]">
            <StatusBar
                barStyle="light-content"
                backgroundColor="#176B2C"
            />

            {/* Top SafeArea ensures status bar / notch area is solid green */}
            <SafeAreaView edges={["top"]} className="bg-[#176B2C]" />

            {/* Main content area */}
            <SafeAreaView
                edges={["bottom", "left", "right"]}
                className="flex-1 bg-[#F5F8F6]"
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingBottom: isSmallDevice ? 20 : 32,
                    }}
                >
                    {/* ================= HEADER ================= */}
                    <View
                        className={`bg-[#176B2C] px-5 ${
                            isSmallDevice ? "pt-2 pb-7" : "pt-3 pb-8"
                        }`}
                    >
                        <TouchableOpacity
                            onPress={handleBack}
                            activeOpacity={0.7}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            className="mb-2.5 flex-row items-center self-start"
                        >
                            <Ionicons
                                name="arrow-back"
                                size={20}
                                color="#FFFFFF"
                            />

                            <Text className="ml-1.5 text-base text-white">
                                Back
                            </Text>
                        </TouchableOpacity>

                        <Text className="mb-1 text-lg font-semibold text-[#C6E6CC]">
                            Step 4 of 4
                        </Text>

                        <Text
                            className={`font-bold text-white mb-1 ${
                                isSmallDevice ? "text-[28px]" : "text-[34px]"
                            }`}
                        >
                            Verify Your Identity
                        </Text>

                        <Text className="text-lg text-[#D9EEDC]">
                            Upload your National ID Card
                        </Text>
                    </View>

                    {/* ================= MAIN CARD ================= */}
                    <View className="px-4">
                        <View
                            className={`-mt-5 w-full self-center rounded-[20px] border border-[#E5E9E6] bg-white shadow-sm ${
                                isSmallDevice ? "p-4" : "p-5"
                            }`}
                            style={{ maxWidth: 440 }}
                        >
                            {/* Information box */}
                            <View className="mb-3.5 rounded-[14px] border border-[#BFDBFE] bg-[#EFF6FF] px-3.5 py-3">
                                <View className="flex-row items-center mb-1">
                                    <Ionicons
                                        name="information-circle"
                                        size={14}
                                        color="#1D4ED8"
                                    />
                                    <Text className="ml-1.5 text-[11px] font-semibold text-[#1D4ED8]">
                                        National ID Card Required
                                    </Text>
                                </View>

                                <Text className="text-[10px] leading-[15px] text-[#2563EB]">
                                    Upload a clear photo of your National Identity Card
                                    (front side).
                                </Text>
                            </View>

                            {/* Upload label */}
                            <Text className="mb-2 text-[11px] font-medium text-[#334155]">
                                Upload National ID Card
                            </Text>

                            {/* Upload area */}
                            <TouchableOpacity
                                onPress={handleUpload}
                                activeOpacity={0.7}
                                className={`mb-4 items-center justify-center rounded-[14px] border border-dashed px-3 ${
                                    isSmallDevice ? "min-h-[135px] py-3.5" : "min-h-[160px] py-4"
                                } ${
                                    document
                                        ? "border-[#86C99A] bg-[#F4FBF5]"
                                        : "border-[#DCE2E8] bg-white"
                                }`}
                            >
                                {document ? (
                                    <>
                                        <View className="mb-2.5 h-11 w-11 items-center justify-center rounded-full bg-[#E1F4E5]">
                                            <Ionicons
                                                name="document-text-outline"
                                                size={23}
                                                color="#16853A"
                                            />
                                        </View>

                                        <Text
                                            className="mb-1 max-w-full text-center text-[11px] font-medium text-[#334155]"
                                            numberOfLines={2}
                                        >
                                            {document.name}
                                        </Text>

                                        <Text className="mb-2.5 text-[9px] text-[#8A96A5]">
                                            {document.size != null
                                                ? `${(document.size / (1024 * 1024)).toFixed(2)} MB`
                                                : "File selected"}
                                        </Text>

                                        <View className="flex-row items-center">
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={14}
                                                color="#16853A"
                                            />

                                            <Text className="ml-1 text-[10px] font-medium text-[#16853A]">
                                                Document selected
                                            </Text>
                                        </View>

                                        <Text className="mt-1.5 text-[10px] text-[#64748B]">
                                            Tap to choose another file
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <View className="mb-2.5 h-[44px] w-[44px] items-center justify-center rounded-full bg-[#F3F4F6]">
                                            <Ionicons
                                                name="document-attach-outline"
                                                size={22}
                                                color="#94A3B8"
                                            />
                                        </View>

                                        <Text className="mb-1 text-center text-[11px] font-medium text-[#475569]">
                                            Tap to upload National ID Card
                                        </Text>

                                        <Text className="text-center text-[9px] text-[#94A3B8]">
                                            JPG, PNG or PDF up to 10 MB
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Back and Continue buttons */}
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={handleBack}
                                    activeOpacity={0.7}
                                    className={`flex-1 items-center justify-center rounded-[13px] border border-[#E0E5EB] bg-white ${
                                        isSmallDevice ? "h-[42px]" : "h-[46px]"
                                    }`}
                                >
                                    <Text className="text-[12px] font-medium text-[#334155]">
                                        Back
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleContinue}
                                    disabled={!document || uploading}
                                    activeOpacity={0.8}
                                    className={`flex-1 items-center justify-center rounded-[13px] ${
                                        isSmallDevice ? "h-[42px]" : "h-[46px]"
                                    } ${
                                        document && !uploading
                                            ? "bg-[#00A844]"
                                            : "bg-[#A8C7AE]"
                                    }`}
                                >
                                    <Text className="text-[12px] font-semibold text-white">
                                        {uploading ? "Please wait..." : "Continue"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default IdentityVerificationScreen;