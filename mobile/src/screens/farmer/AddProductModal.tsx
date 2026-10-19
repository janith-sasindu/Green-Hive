import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (product: {
    name: string;
    quantity: string;
    unitPrice: string;
    category: string;
  }) => void;
}

export const AddProductModal = ({
  visible,
  onClose,
  onAdd,
}: AddProductModalProps) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [category, setCategory] = useState("Vegetables");

  const categories = ["Vegetables", "Fruits", "Grains", "Spices"];

  const handleSave = () => {
    if (!name.trim() || !quantity.trim() || !unitPrice.trim()) {
      return;
    }
    onAdd({
      name: name.trim(),
      quantity: quantity.trim(),
      unitPrice: unitPrice.trim(),
      category,
    });
    setName("");
    setQuantity("");
    setUnitPrice("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-white rounded-t-[32px] p-6 max-h-[90%]">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-gray-100">
            <View>
              <Text className="text-xl font-bold text-gray-900">
                Add New Product
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                List your farm harvest on Green Hive
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="h-8 w-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="pt-4">
            {/* Category selection */}
            <Text className="text-xs font-semibold text-gray-600 mb-2">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full border ${
                    category === cat
                      ? "bg-[#166534] border-[#166534]"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      category === cat ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Product Name */}
            <Text className="text-xs font-semibold text-gray-600 mb-1">
              Product Name *
            </Text>
            <TextInput
              placeholder="e.g. Fresh Cabbage, Red Potatoes"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 mb-4"
            />

            {/* Quantity */}
            <Text className="text-xs font-semibold text-gray-600 mb-1">
              Available Quantity (kg) *
            </Text>
            <TextInput
              placeholder="e.g. 250"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 mb-4"
            />

            {/* Price */}
            <Text className="text-xs font-semibold text-gray-600 mb-1">
              Unit Price (Rs. / kg) *
            </Text>
            <TextInput
              placeholder="e.g. 150"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={unitPrice}
              onChangeText={setUnitPrice}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 mb-6"
            />

            {/* Action Buttons */}
            <View className="flex-row gap-3 pb-6">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-3.5 rounded-xl border border-gray-200 items-center justify-center bg-gray-50"
              >
                <Text className="text-sm font-semibold text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 py-3.5 rounded-xl bg-[#166534] items-center justify-center shadow-sm"
              >
                <Text className="text-sm font-bold text-white">Add Product</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
