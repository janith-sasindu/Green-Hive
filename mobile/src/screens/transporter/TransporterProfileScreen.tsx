import React, { useState } from "react";
import {
  View,
  Text,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  MOCK_TRANSPORTER_PROFILE,
  MOCK_TRANSPORTER_STATS,
  TransporterProfile,
  TransporterStats,
} from "./data";

export interface TransporterProfileScreenProps {
  navigation?: any;
  onSelectTab?: (tab: "home" | "jobs" | "active" | "profile") => void;
  activeTab?: "home" | "jobs" | "active" | "profile";
}

export const TransporterProfileScreen: React.FC<TransporterProfileScreenProps> = ({
  navigation,
  onSelectTab,
  activeTab = "profile",
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Responsive Breakpoints
  const isExtraSmall = screenWidth < 360;
  const isSmallDevice = screenWidth < 380 || screenHeight < 700;
  const isTablet = screenWidth >= 600;

  // Profile and stats state from mock data
  const [profile, setProfile] = useState<TransporterProfile>(MOCK_TRANSPORTER_PROFILE);
  const [stats, setStats] = useState<TransporterStats>(MOCK_TRANSPORTER_STATS);

  return (
    <View className="flex-1 bg-[#F4F7F5]">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7F5" />
      <SafeAreaView edges={["top"]} className="flex-1 bg-[#F4F7F5]">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-lg font-bold text-gray-800">
            Transporter Profile
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {profile.name} - {profile.vehicleType}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default TransporterProfileScreen;
