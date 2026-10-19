import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FarmerProfileScreenProps {
  onBackToHome: () => void;
  onLogout: () => void;
}

export const FarmerProfileScreen = ({
  onBackToHome,
  onLogout,
}: FarmerProfileScreenProps) => {
  return (
    <View className="flex-1 bg-[#F5F8F6]">
      {/* Header */}
      <View className="px-5 pt-3 pb-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onBackToHome} className="p-1 -ml-1 mr-2">
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Farmer Profile</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View
          className="bg-white rounded-3xl p-5 items-center shadow-sm border border-gray-100 mb-4"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <View className="h-20 w-20 rounded-full bg-[#166534] items-center justify-center mb-3">
            <Text className="text-3xl font-bold text-white">S</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">Sunil Perera</Text>
          <View className="flex-row items-center mt-1 bg-[#DCFCE7] px-3 py-1 rounded-full">
            <Ionicons name="checkmark-circle" size={14} color="#166534" />
            <Text className="text-xs font-semibold text-[#166534] ml-1">
              Verified Farmer
            </Text>
          </View>

          <View className="w-full mt-5 pt-4 border-t border-gray-100">
            <View className="flex-row justify-between py-2">
              <Text className="text-xs text-gray-500">Farm Location</Text>
              <Text className="text-xs font-semibold text-gray-800">
                Nuwara Eliya, Central Province
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-xs text-gray-500">Phone</Text>
              <Text className="text-xs font-semibold text-gray-800">
                +94 77 123 4567
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-xs text-gray-500">Member Since</Text>
              <Text className="text-xs font-semibold text-gray-800">
                August 2024
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-xs text-gray-500">Active Listings</Text>
              <Text className="text-xs font-semibold text-gray-800">3 Crops</Text>
            </View>
          </View>
        </View>

        {/* Options */}
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-50">
            <View className="flex-row items-center">
              <Ionicons name="card-outline" size={20} color="#166534" />
              <Text className="text-sm font-semibold text-gray-800 ml-3">
                Bank & Payment Details
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-50">
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark-outline" size={20} color="#166534" />
              <Text className="text-sm font-semibold text-gray-800 ml-3">
                Farm Verification Certificate
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <Ionicons name="settings-outline" size={20} color="#166534" />
              <Text className="text-sm font-semibold text-gray-800 ml-3">
                Settings & Language
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* Logout / Switch Role Button */}
        <TouchableOpacity
          onPress={onLogout}
          className="flex-row items-center justify-center p-4 rounded-2xl border border-red-200 bg-red-50"
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text className="text-sm font-bold text-red-600 ml-2">
            Switch Role / Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
