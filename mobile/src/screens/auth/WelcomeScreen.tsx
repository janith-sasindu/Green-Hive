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
            <View className="flex-[0.55] bg-[#1c5d26]">
            <StatusBar barStyle="light-content" backgroundColor="#1a5323"/>

            {/*Top Section*/}
            <SafeAreaView edges={['top']} className="flex-1 justify-center">
                <ScrollView contentContainerClassName="item-center justify-center px-6 py-5" showsVerticalScrollIndicator={false} bounces={false}>
                    
                    {/*logo*/}
                    <View className="item-center justify-center mb-5">
                        <Image source={require('../../assets/logo.png')}
                        className="w-48 h-32 self-center margin mt-[120px]"
                        resizeMode="contain"/>
                    </View>
                    <Text className="text-white text-x5 font-extrabold tracking-widest text-center mb-2.5">
                        CONNECT TRADE TRANSPORT GROW
                    </Text>

                    {/* Subtitle*/}

                    <Text className="text-[#d1e7d4] text-x5 text-center leading-relaxed font-normal">
                        Sri Lanka's agricultural marketplace — connecting{'\n'}
            farmers, sellers & transporters
                    </Text>
                </ScrollView>
            </SafeAreaView>
         </View>


            <View className="flex-[0.45] bg-white rounded-t-[40px] px-6 pt-5">

                {/* feature badges */}
                <View className="flex-row flex-wrap justify-center gap-2">
                    <View className="bg-[#e8f5e9] rounded-full px-4 py-2">
                        <Text className="text-[#1c5d26] text-xs font-medium">
                             🌿 Farm Fresh 
                        </Text>  
                    </View>
                    <View className="bg-[#e8f5e9] rounded-full px-4 py-2">
                        <Text className="text-[#1c5d26] text-xs font-medium">
                            🔒 Secure Payment 
                        </Text>  
                    </View>                    
                </View>
                {/*Row 2*/}
                <View className="flex-row flex-wrap justify-center gap-2">
                    <View className="bg-[#e8f5e9] rounded-full px-4 py-2">
                        <Text className="text-[#1c5d26] text-xs font-medium">
                          🚛  Transport Network 
                        </Text>  
                    </View>
                    <View className="bg-[#e8f5e9] rounded-full px-4 py-2">
                        <Text className="text-[#1c5d26] text-xs font-medium">
                            ✅ Verifed Users 
                        </Text>  
                    </View>                    
                </View>
                {/* Buttons */}

                <View className="mt-6 gap-3">
                    <TouchableOpacity onPress={handleGetStarted}
                    activeOpacity={0.8}
                    className="bg-[#1c5d26] rounded-2xl py-4 items-center justify-center shadow-sm">
                        <Text className="text-white text-base font-bold">
                            Get Started
                        </Text>
                    </TouchableOpacity>
                </View>
                <View className="mt-6 gap-3">
                    <TouchableOpacity onPress={handleGetStarted}
                    activeOpacity={0.8}
                    className="bg-[#e8f5e9] rounded-2xl py-4 items-center justify-center shadow-sm cursor-pointer">
                        <Text className="text-[#1c5d26] text-base font-bold">
                            Get Started
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Quick move */}
        <View className="mt-8">

    <View className="flex-row justify-between gap-2">
        {/* Farmer */}
        <TouchableOpacity
            onPress={() => handleQuickDemo('farmer')}
            activeOpacity={0.7}
            className="flex-1 bg-[#e8f5e9] border border-[#c8e6c9] rounded-xl py-3 items-center justify-center"
        >
            <Text className="text-[#1c5d26] text-xs font-bold" numberOfLines={1}>
                🌾 Farmer
            </Text>
        </TouchableOpacity>

        {/* Retail Seller */}
        <TouchableOpacity
            onPress={() => handleQuickDemo('seller')}
            activeOpacity={0.7}
            className="flex-1 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl py-3 items-center justify-center"
        >
            <Text className="text-[#1d4ed8] text-xs font-bold" numberOfLines={1}>
                🏪 Retail Seller
            </Text>
        </TouchableOpacity>

        {/* Transporter */}
        <TouchableOpacity
            onPress={() => handleQuickDemo('transporter')}
            activeOpacity={0.7}
            className="flex-1 bg-[#fffbeb] border border-[#fde68a] rounded-xl py-3 items-center justify-center"
        >
            <Text className="text-[#b45309] text-xs font-bold" numberOfLines={1}>
                🚛 Transporter
            </Text>
        </TouchableOpacity>
    </View>
</View>

            </View>
        </View>
    )

}

