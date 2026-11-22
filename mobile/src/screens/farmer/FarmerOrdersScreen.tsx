import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface OrderItem {
  id: string; cropName: string; buyer: string; quantity: string;
  amount: string; status: string; statusColor: string; statusBg: string; image: any;
}

const mockOrders: OrderItem[] = [
  { id: "#GH-2041", cropName: "Fresh Cabbage",   buyer: "Colombo Fresh Market", quantity: "100 kg", amount: "Rs. 8,000",  status: "In Transit", statusColor: "#2563EB", statusBg: "#EFF6FF", image: require("../../assets/farmer/cabbage.png") },
  { id: "#GH-1980", cropName: "Organic Carrots", buyer: "Kandy Organics Co.",   quantity: "200 kg", amount: "Rs. 24,000", status: "Delivered",  statusColor: "#16A34A", statusBg: "#DCFCE7", image: require("../../assets/farmer/carrots.png") },
];

interface FarmerOrdersScreenProps {
  onBackToHome: () => void;
  isDark: boolean;
}

export const FarmerOrdersScreen = ({ onBackToHome, isDark }: FarmerOrdersScreenProps) => {
  const t = {
    bg:          isDark ? "#0F1A12" : "#F5F8F6",
    headerBg:    isDark ? "#172116" : "#FFFFFF",
    headerBorder:isDark ? "#2A3D2E" : "#F3F4F6",
    cardBg:      isDark ? "#1C2B1F" : "#FFFFFF",
    cardBorder:  isDark ? "#2A3D2E" : "#F3F4F6",
    titleText:   isDark ? "#E8F5EA" : "#111827",
    subText:     isDark ? "#8DB898" : "#6B7280",
    idText:      isDark ? "#4B6B52" : "#9CA3AF",
    sectionLabel:isDark ? "#6EAB7A" : "#64748B",
    badgeBg:     isDark ? "#1A3D22" : "#E8F8EE",
    badgeText:   isDark ? "#4ADE80" : "#166534",
    backIcon:    isDark ? "#A7D9B0" : "#1F2937",
    // status badge backgrounds in dark
    statusBgFn:  (bg: string) => isDark ? (bg === "#EFF6FF" ? "#12213A" : bg === "#DCFCE7" ? "#14371E" : bg) : bg,
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ backgroundColor: t.headerBg, borderBottomWidth: 1, borderBottomColor: t.headerBorder }}
        className="px-5 pt-3 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onBackToHome} className="p-1 -ml-1 mr-2">
            <Ionicons name="arrow-back" size={22} color={t.backIcon} />
          </TouchableOpacity>
          <Text style={{ color: t.titleText }} className="text-xl font-bold">My Orders</Text>
        </View>
        <View style={{ backgroundColor: t.badgeBg }} className="px-2.5 py-1 rounded-full">
          <Text style={{ color: t.badgeText }} className="text-xs font-semibold">{mockOrders.length} orders</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: t.sectionLabel }} className="text-xs font-bold uppercase tracking-wider mb-3">
          Order History & Tracking
        </Text>
        {mockOrders.map((order) => (
          <View key={order.id} className="mb-3.5 rounded-2xl p-3.5 flex-row items-center"
            style={{ backgroundColor: t.cardBg, borderWidth: 1, borderColor: t.cardBorder, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}>
            <Image source={order.image} className="h-16 w-16 rounded-xl" resizeMode="cover" />
            <View className="flex-1 ml-3">
              <Text style={{ color: t.titleText }} className="text-sm font-bold">{order.cropName}</Text>
              <Text style={{ color: t.subText }} className="text-xs mt-0.5">{order.buyer} · {order.quantity}</Text>
              <Text style={{ color: t.idText }} className="text-xs mt-1">{order.id}</Text>
            </View>
            <View className="items-end justify-between self-stretch py-0.5">
              <View className="flex-row items-center rounded-full px-2.5 py-1" style={{ backgroundColor: t.statusBgFn(order.statusBg) }}>
                <View className="h-1.5 w-1.5 rounded-full mr-1.5" style={{ backgroundColor: order.statusColor }} />
                <Text className="text-xs font-semibold" style={{ color: order.statusColor }}>{order.status}</Text>
              </View>
              <Text className="text-sm font-bold text-[#16A34A]">{order.amount}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
