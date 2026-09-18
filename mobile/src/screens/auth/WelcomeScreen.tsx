import React from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity, ScrollView, StatusBar} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {Colors} from '../../constants/colors'

interface welcomeScreenProps {
    navigation?:any;
}

export default function WelcomeScreen({
    navigation}: welcomeScreenProps){
        const handleGetStarted = () => {
            navigation?.navigate('Register');
        };

        const handleSignIn = ()=>{
            navigation?.navigate('Login')
        };

        const handleQuickDemo = (role: 'farmer' | 'seller' | 'transporter') =>{
            switch(role){
                case 'farmer':
        navigation?.navigate('FarmerHome');
        break;
      case 'seller':
        navigation?.navigate('SellerHome');
        break;
      case 'transporter':
        navigation?.navigate('TransporterHome');
        break;
            }
    };

    return(
        <View className="flex-1 bg-[#1c5d26]">
            <StatusBar barStyle="light-content" backgroundColor="#1a5323"/>
            
        </View>
    )
}

