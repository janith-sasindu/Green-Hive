import "./global.css";
import React from "react";
import { Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { apiClient } from "./src/api/client";

export default function App() {
  const currentApiUrl = apiClient.defaults.baseURL;

  return (
    <View className="flex-1 items-center justify-center bg-slate-900 p-6">
      <StatusBar style="light" />
      <Text className="text-3xl font-bold text-emerald-400 mb-2">Green Hive</Text>
      <Text className="text-base text-slate-300 text-center mb-6">
        Digital Agricultural Marketplace
      </Text>

      <View className="w-full rounded-xl bg-slate-800 p-4 border border-slate-700">
        <Text className="text-sm font-semibold text-emerald-400 mb-1">
          ✓ NativeWind & Tailwind CSS Configured
        </Text>
        <Text className="text-xs text-slate-400 mt-2">
          Connected Backend API:
        </Text>
        <Text className="text-xs font-mono text-emerald-300 bg-slate-900 p-2 rounded mt-1 border border-slate-700">
          {currentApiUrl}
        </Text>
      </View>
    </View>
  );
}
