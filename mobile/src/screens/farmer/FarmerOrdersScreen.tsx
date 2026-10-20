import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface OrderItem {
  id: string;
  cropName: string;
  buyer: string;
  quantity: string;
  amount: string;
  status: string;
  statusColor: string;
  statusBg: string;
  image: any;
}

const mockOrders: OrderItem[] = [
  {
    id: "#GH-2041",
    cropName: "Fresh Cabbage",
    buyer: "Colombo Fresh Market",
    quantity: "100 kg",
    amount: "Rs. 8,000",
    status: "In Transit",
    statusColor: "#2563EB",
    statusBg: "#EFF6FF",
    image: require("../../assets/farmer/cabbage.png"),
  },
  {
    id: "#GH-1980",
    cropName: "Organic Carrots",
    buyer: "Kandy Organics Co.",
    quantity: "200 kg",
    amount: "Rs. 24,000",
    status: "Delivered",
    statusColor: "#16A34A",
    statusBg: "#DCFCE7",
    image: require("../../assets/farmer/carrots.png"),
  },
];

interface FarmerOrdersScreenProps {
  onBackToHome: () => void;
}

export const FarmerOrdersScreen = ({
  onBackToHome,
}: FarmerOrdersScreenProps) => {
  return (
    <View className="flex-1 bg-[#F5F8F6]">
      {/* Header */}
      <View className="px-5 pt-3 pb-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onBackToHome} className="p-1 -ml-1 mr-2">
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">My Orders</Text>
        </View>
        <View className="bg-[#E8F8EE] px-2.5 py-1 rounded-full">
          <Text className="text-xs font-semibold text-[#166534]">
            {mockOrders.length} orders
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
          Order History & Tracking
        </Text>

        {mockOrders.map((order) => (
          <View
            key={order.id}
            className="mb-3.5 bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex-row items-center"
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Image
              source={order.image}
              className="h-16 w-16 rounded-xl bg-gray-100"
              resizeMode="cover"
            />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-bold text-gray-900">
                {order.cropName}
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                {order.buyer} · {order.quantity}
              </Text>
              <Text className="text-xs text-gray-400 mt-1">{order.id}</Text>
            </View>

            <View className="items-end justify-between self-stretch py-0.5">
              <View
                className="flex-row items-center rounded-full px-2.5 py-1"
                style={{ backgroundColor: order.statusBg }}
              >
                <View
                  className="h-1.5 w-1.5 rounded-full mr-1.5"
                  style={{ backgroundColor: order.statusColor }}
                />
                <Text
                  className="text-xs font-semibold"
                  style={{ color: order.statusColor }}
                >
                  {order.status}
                </Text>
              </View>
              <Text className="text-sm font-bold text-[#16A34A]">
                {order.amount}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
