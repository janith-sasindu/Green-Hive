import "./global.css";
import React from "react";
import { Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-900 p-4">
      <StatusBar style="light" />
      <Text className="text-3xl font-bold text-emerald-400 mb-2">Green Hive</Text>
      <Text className="text-base text-slate-300 text-center">
        Digital Agricultural Marketplace
      </Text>
      <View className="mt-6 rounded-lg bg-slate-800 px-4 py-3 border border-slate-700">
        <Text className="text-sm font-medium text-emerald-300">
          ✓ NativeWind & Tailwind CSS Ready
        </Text>
      </View>
    </View>
  );
}
