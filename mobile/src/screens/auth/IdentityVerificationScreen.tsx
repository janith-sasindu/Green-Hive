import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Alert,
} from "react-native";
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
    const role = route?.params?.role ?? "Farmer";

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
            // TODO: Upload the selected document to your backend
            // using multipart/form-data before completing registration.
            //
            // document.uri  -> local file URI
            // document.name -> original filename
            // document.mimeType -> file MIME type

            navigation.navigate("RegistrationComplete", {
                role,
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
        <SafeAreaView className="flex-1 bg-[#F5F8F6]">
            <StatusBar
                barStyle="light-content"
                backgroundColor="#176B2C"
            />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
            >
                {/* ================= HEADER ================= */}
                <View className="h-[132px] bg-[#176B2C] px-4 pt-2">
                    <TouchableOpacity
                        onPress={handleBack}
                        activeOpacity={0.7}
                        className="mb-3 flex-row items-center self-start"
                    >
                        <Ionicons
                            name="arrow-back"
                            size={16}
                            color="#FFFFFF"
                        />

                        <Text className="ml-2 text-[10px] text-white">
                            Back
                        </Text>
                    </TouchableOpacity>

                    <Text className="mb-1 text-[10px] text-[#C6E6CC]">
                        Step 4 of 4
                    </Text>

                    <Text className="text-[16px] font-semibold text-white">
                        Verify Your Identity
                    </Text>

                    <Text className="mt-1 text-[11px] text-[#D9EEDC]">
                        Upload your National ID Card
                    </Text>
                </View>

                {/* ================= MAIN CARD ================= */}
                <View className="-mt-5 mx-4 rounded-[20px] border border-[#E5E9E6] bg-white px-5 pb-5 pt-5 shadow-sm">

                    {/* Information box */}
                    <View className="mb-4 rounded-[14px] border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-3">
                        <Text className="mb-1 text-[11px] font-semibold text-[#1D4ED8]">
                            National ID Card Required
                        </Text>

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
                        className={`mb-4 min-h-[156px] items-center justify-center rounded-[14px] border border-dashed px-3 py-4 ${document
                            ? "border-[#86C99A] bg-[#F4FBF5]"
                            : "border-[#DCE2E8] bg-white"
                            }`}
                    >
                        {document ? (
                            <>
                                <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-[#E1F4E5]">
                                    <Ionicons
                                        name="document-text-outline"
                                        size={25}
                                        color="#16853A"
                                    />
                                </View>

                                <Text
                                    className="mb-1 max-w-full text-center text-[11px] font-medium text-[#334155]"
                                    numberOfLines={2}
                                >
                                    {document.name}
                                </Text>

                                <Text className="mb-3 text-[9px] text-[#8A96A5]">
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

                                <Text className="mt-2 text-[10px] text-[#64748B]">
                                    Tap to choose another file
                                </Text>
                            </>
                        ) : (
                            <>
                                <View className="mb-3 h-[46px] w-[46px] items-center justify-center rounded-full bg-[#F3F4F6]">
                                    <Ionicons
                                        name="document-attach-outline"
                                        size={23}
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
                            className="h-[46px] flex-1 items-center justify-center rounded-[13px] border border-[#E0E5EB] bg-white"
                        >
                            <Text className="text-[12px] font-medium text-[#334155]">
                                Back
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleContinue}
                            disabled={!document || uploading}
                            activeOpacity={0.8}
                            className={`h-[46px] flex-1 items-center justify-center rounded-[13px] ${document && !uploading
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
            </ScrollView>
        </SafeAreaView>
    );
};

export default IdentityVerificationScreen;