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

interface CreateAccountScreenProps {
    navigation: any;
    route: any;
}

const CreateAccountScreen = ({
    navigation,
    route,
}: CreateAccountScreenProps) => {
    // Get the role selected from Step 1
    const selectedRole = route?.params?.role || "Farmer";

    // Role icons
    const roleIcons: Record<string, string> = {
        Farmer: "🌾",
        "Retail Seller": "🏪",
        Transporter: "🚚",
    };
};