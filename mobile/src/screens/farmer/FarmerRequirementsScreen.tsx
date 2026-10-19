import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RequirementItem {
  id: string;
  buyerName: string;
  cropName: string;
  requiredQuantity: string;
  targetPrice: string;
  deadline: string;
  location: string;
}

const mockRequirements: RequirementItem[] = [
  {
    id: "REQ-101",
    buyerName: "Colombo Fresh Supermarket",
    cropName: "Fresh Cabbage",
    requiredQuantity: "250 kg",
    targetPrice: "Rs. 85 / kg",
    deadline: "Within 3 days",
    location: "Pettah, Colombo",
  },
  {
    id: "REQ-102",
    buyerName: "Kandy Wholesale Veg",
    cropName: "Organic Carrots",
    requiredQuantity: "400 kg",
    targetPrice: "Rs. 130 / kg",
    deadline: "Within 5 days",
    location: "Katugastota, Kandy",
  },
  {
    id: "REQ-103",
    buyerName: "Galle Organic Store",
    cropName: "Leeks",
    requiredQuantity: "150 kg",
    targetPrice: "Rs. 210 / kg",
    deadline: "Next week",
    location: "Fort, Galle",
  },
];

interface FarmerRequirementsScreenProps {
  onBackToHome: () => void;
}

export const FarmerRequirementsScreen = ({
  onBackToHome,
}: FarmerRequirementsScreenProps) => {
  return (
    <View className="flex-1 bg-[#F5F8F6]">
      {/* Header */}
      <View className="px-5 pt-3 pb-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onBackToHome} className="p-1 -ml-1 mr-2">
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Buyer Requirements</Text>
        </View>
        <View className="bg-[#E8F8EE] px-2.5 py-1 rounded-full">
          <Text className="text-xs font-semibold text-[#166534]">
            {mockRequirements.length} available
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
          Demands Matching Your Crops
        </Text>

        {mockRequirements.map((req) => (
          <View
            key={req.id}
            className="mb-3.5 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <View className="flex-row items-center justify-between pb-2 border-b border-gray-50">
              <View className="flex-row items-center">
                <View className="h-8 w-8 rounded-lg bg-[#E8F8EE] items-center justify-center mr-2">
                  <Ionicons name="clipboard-outline" size={18} color="#166534" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-gray-900">
                    {req.cropName}
                  </Text>
                  <Text className="text-xs text-gray-500">{req.buyerName}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-xs font-semibold text-[#166534]">
                  {req.targetPrice}
                </Text>
                <Text className="text-[11px] text-gray-400">{req.id}</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center mt-3 pt-1">
              <View>
                <Text className="text-xs text-gray-500">
                  Quantity:{" "}
                  <Text className="font-semibold text-gray-800">
                    {req.requiredQuantity}
                  </Text>
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  📍 {req.location} · ⏰ {req.deadline}
                </Text>
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
