import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RequirementItem {
  id: string; buyerName: string; cropName: string;
  requiredQuantity: string; targetPrice: string; deadline: string; location: string;
}

const mockRequirements: RequirementItem[] = [
  { id: "REQ-101", buyerName: "Colombo Fresh Supermarket", cropName: "Fresh Cabbage",   requiredQuantity: "250 kg", targetPrice: "Rs. 85 / kg",  deadline: "Within 3 days", location: "Pettah, Colombo" },
  { id: "REQ-102", buyerName: "Kandy Wholesale Veg",       cropName: "Organic Carrots", requiredQuantity: "400 kg", targetPrice: "Rs. 130 / kg", deadline: "Within 5 days", location: "Katugastota, Kandy" },
  { id: "REQ-103", buyerName: "Galle Organic Store",       cropName: "Leeks",           requiredQuantity: "150 kg", targetPrice: "Rs. 210 / kg", deadline: "Next week",     location: "Fort, Galle" },
];

interface FarmerRequirementsScreenProps {
  onBackToHome: () => void;
  isDark: boolean;
}

export const FarmerRequirementsScreen = ({ onBackToHome, isDark }: FarmerRequirementsScreenProps) => {
  const t = {
    bg:           isDark ? "#0F1A12" : "#F5F8F6",
    headerBg:     isDark ? "#172116" : "#FFFFFF",
    headerBorder: isDark ? "#2A3D2E" : "#F3F4F6",
    cardBg:       isDark ? "#1C2B1F" : "#FFFFFF",
    cardBorder:   isDark ? "#2A3D2E" : "#F3F4F6",
    innerDivider: isDark ? "#243529" : "rgba(249,250,251,1)",
    titleText:    isDark ? "#E8F5EA" : "#111827",
    subText:      isDark ? "#8DB898" : "#6B7280",
    valueText:    isDark ? "#D1FAE5" : "#1F2937",
    idText:       isDark ? "#4B6B52" : "#9CA3AF",
    priceText:    isDark ? "#4ADE80" : "#166534",
    sectionLabel: isDark ? "#6EAB7A" : "#64748B",
    backIcon:     isDark ? "#A7D9B0" : "#1F2937",
    badgeBg:      isDark ? "#1A3D22" : "#E8F8EE",
    badgeText:    isDark ? "#4ADE80" : "#166534",
    iconBg:       isDark ? "#1E3324" : "#E8F8EE",
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ backgroundColor: t.headerBg, borderBottomWidth: 1, borderBottomColor: t.headerBorder }}
        className="px-5 pt-3 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onBackToHome} className="p-1 -ml-1 mr-2">
            <Ionicons name="arrow-back" size={22} color={t.backIcon} />
          </TouchableOpacity>
          <Text style={{ color: t.titleText }} className="text-xl font-bold">Buyer Requirements</Text>
        </View>
        <View style={{ backgroundColor: t.badgeBg }} className="px-2.5 py-1 rounded-full">
          <Text style={{ color: t.badgeText }} className="text-xs font-semibold">{mockRequirements.length} available</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: t.sectionLabel }} className="text-xs font-bold uppercase tracking-wider mb-3">
          Demands Matching Your Crops
        </Text>
        {mockRequirements.map((req) => (
          <View key={req.id} className="mb-3.5 rounded-2xl p-4"
            style={{ backgroundColor: t.cardBg, borderWidth: 1, borderColor: t.cardBorder, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}>
            <View className="flex-row items-center justify-between pb-2" style={{ borderBottomWidth: 1, borderBottomColor: t.innerDivider }}>
              <View className="flex-row items-center">
                <View style={{ backgroundColor: t.iconBg }} className="h-8 w-8 rounded-lg items-center justify-center mr-2">
                  <Ionicons name="clipboard-outline" size={18} color="#166534" />
                </View>
                <View>
                  <Text style={{ color: t.titleText }} className="text-sm font-bold">{req.cropName}</Text>
                  <Text style={{ color: t.subText }} className="text-xs">{req.buyerName}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text style={{ color: t.priceText }} className="text-xs font-semibold">{req.targetPrice}</Text>
                <Text style={{ color: t.idText }} className="text-[11px]">{req.id}</Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center mt-3 pt-1">
              <View>
                <Text style={{ color: t.subText }} className="text-xs">
                  Quantity: <Text style={{ color: t.valueText }} className="font-semibold">{req.requiredQuantity}</Text>
                </Text>
                <Text style={{ color: t.subText }} className="text-xs mt-0.5">📍 {req.location} · ⏰ {req.deadline}</Text>
              </View>
              <TouchableOpacity className="bg-[#166534] px-4 py-2 rounded-xl">
                <Text className="text-xs font-bold text-white">Fulfill</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
