import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProductItem {
  id: string;
  name: string;
  quantity: string;
  unitPrice: string;
  status: string;
  image: any;
}

interface FarmerProductsScreenProps {
  products: ProductItem[];
  onOpenAddModal: () => void;
  onBackToHome: () => void;
}

export const FarmerProductsScreen = ({
  products,
  onOpenAddModal,
  onBackToHome,
}: FarmerProductsScreenProps) => {
  return (
    <View className="flex-1 bg-[#F5F8F6]">
      {/* Header */}
      <View className="px-5 pt-3 pb-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onBackToHome}
            className="p-1 -ml-1 mr-2"
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">My Products</Text>
        </View>
        <TouchableOpacity
          onPress={onOpenAddModal}
          className="flex-row items-center bg-[#166534] px-3 py-1.5 rounded-full"
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text className="text-xs font-bold text-white ml-1">New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {products.map((item) => (
            <View
              key={item.id}
              className="w-[48%] rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden"
              style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              <Image
                source={item.image}
                className="h-28 w-full bg-gray-100"
                resizeMode="cover"
              />
              <View className="p-3">
                <Text
                  className="text-sm font-bold text-gray-900"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {item.quantity} · {item.unitPrice}
                </Text>
                <View className="mt-2 flex-row items-center self-start rounded-full bg-[#DCFCE7] px-2 py-0.5">
                  <View className="h-1.5 w-1.5 rounded-full bg-[#16A34A] mr-1.5" />
                  <Text className="text-[11px] font-semibold text-[#16A34A]">
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {/* Add Product Card */}
          <TouchableOpacity
            onPress={onOpenAddModal}
            className="w-[48%] rounded-2xl bg-white shadow-sm border-2 border-dashed border-gray-200 min-h-[170px] items-center justify-center p-3"
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={32} color="#16A34A" />
            <Text className="text-sm font-semibold text-[#16A34A] mt-1">
              Add Product
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
