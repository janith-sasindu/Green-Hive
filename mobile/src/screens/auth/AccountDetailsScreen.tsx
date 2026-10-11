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
}