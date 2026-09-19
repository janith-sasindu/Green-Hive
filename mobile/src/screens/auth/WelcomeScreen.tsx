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

            {/*Top Section*/}
            <SafeAreaView edges={['top']} className="flex-1 justify-center">
                <ScrollView contentContainerClassName="item-center justify-center px-6 py-5" showsVerticalScrollIndicator={false} bounces={false}>
                    
                    {/*logo*/}
                    <View className="item-center justify-center mb-5">
                        <Image source={require('../../assets/logo.png')}
                        className="w-48 h-32"
                        resizeMode="contain"/>
                    </View>
                    <Text className="text-white text-x5 font-extrabold tracking-widest text-center mb-2.5">
                        CONNECT TRADE TRANSPORT GROW
                    </Text>

                    {/* Subtitle*/}

                    <Text className="text-[#d1e7d4] text-x5 text-center leading-relaxed font-normal"></Text>
                </ScrollView>

            </SafeAreaView>
        </View>
    )
}

