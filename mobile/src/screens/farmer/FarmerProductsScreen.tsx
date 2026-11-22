import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProductItem {
  id: string; name: string; quantity: string; unitPrice: string; status: string; image: any;
}

interface FarmerProductsScreenProps {
  products: ProductItem[];
  onOpenAddModal: () => void;
  onBackToHome: () => void;
  isDark: boolean;
}

export const FarmerProductsScreen = ({ products, onOpenAddModal, onBackToHome, isDark }: FarmerProductsScreenProps) => {
  const t = {
    bg:           isDark ? "#0F1A12" : "#F5F8F6",
    headerBg:     isDark ? "#172116" : "#FFFFFF",
    headerBorder: isDark ? "#2A3D2E" : "#F3F4F6",
    cardBg:       isDark ? "#1C2B1F" : "#FFFFFF",
    cardBorder:   isDark ? "#2A3D2E" : "#F3F4F6",
    titleText:    isDark ? "#E8F5EA" : "#111827",
    subText:      isDark ? "#8DB898" : "#6B7280",
    backIcon:     isDark ? "#A7D9B0" : "#1F2937",
    dashedBorder: isDark ? "#2A4D32" : "#E5E7EB",
    statusBg:     isDark ? "#14371E" : "#DCFCE7",
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ backgroundColor: t.headerBg, borderBottomWidth: 1, borderBottomColor: t.headerBorder }}
        className="px-5 pt-3 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onBackToHome} className="p-1 -ml-1 mr-2">
            <Ionicons name="arrow-back" size={22} color={t.backIcon} />
          </TouchableOpacity>
          <Text style={{ color: t.titleText }} className="text-xl font-bold">My Products</Text>
        </View>
        <TouchableOpacity onPress={onOpenAddModal} className="flex-row items-center bg-[#166534] px-3 py-1.5 rounded-full">
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text className="text-xs font-bold text-white ml-1">New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {products.map((item) => (
            <View key={item.id} className="w-[48%] rounded-2xl overflow-hidden"
              style={{ backgroundColor: t.cardBg, borderWidth: 1, borderColor: t.cardBorder, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}>
              <Image source={item.image} className="h-28 w-full" resizeMode="cover" />
              <View className="p-3">
                <Text style={{ color: t.titleText }} className="text-sm font-bold" numberOfLines={1}>{item.name}</Text>
                <Text style={{ color: t.subText }} className="text-xs mt-0.5">{item.quantity} · {item.unitPrice}</Text>
                <View className="mt-2 flex-row items-center self-start rounded-full px-2 py-0.5" style={{ backgroundColor: t.statusBg }}>
                  <View className="h-1.5 w-1.5 rounded-full bg-[#16A34A] mr-1.5" />
                  <Text className="text-[11px] font-semibold text-[#16A34A]">{item.status}</Text>
                </View>
              </View>
            </View>
          ))}
          <TouchableOpacity onPress={onOpenAddModal} activeOpacity={0.7}
            className="w-[48%] rounded-2xl min-h-[170px] items-center justify-center p-3"
            style={{ backgroundColor: t.cardBg, borderWidth: 2, borderStyle: "dashed", borderColor: t.dashedBorder, elevation: 1 }}>
            <Ionicons name="add" size={32} color="#16A34A" />
            <Text className="text-sm font-semibold text-[#16A34A] mt-1">Add Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
