import React, { useState } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  onAdd: (product: { name: string; quantity: string; unitPrice: string; category: string }) => void;
}

export const AddProductModal = ({ visible, onClose, onAdd, isDark }: AddProductModalProps) => {
  const [name, setName]           = useState("");
  const [quantity, setQuantity]   = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [category, setCategory]   = useState("Vegetables");
  const categories = ["Vegetables", "Fruits", "Grains", "Spices"];

  const t = {
    sheetBg:      isDark ? "#1C2B1F" : "#FFFFFF",
    divider:      isDark ? "#2A3D2E" : "#F3F4F6",
    titleText:    isDark ? "#E8F5EA" : "#111827",
    subText:      isDark ? "#8DB898" : "#6B7280",
    label:        isDark ? "#A7D9B0" : "#4B5563",
    inputBg:      isDark ? "#172116" : "#F9FAFB",
    inputBorder:  isDark ? "#2A3D2E" : "#E5E7EB",
    inputText:    isDark ? "#E8F5EA" : "#111827",
    placeholder:  isDark ? "#4B7A54" : "#9CA3AF",
    closeBtnBg:   isDark ? "#2A3D2E" : "#F3F4F6",
    catInactiveBg:    isDark ? "#172116" : "#F9FAFB",
    catInactiveBorder:isDark ? "#2A3D2E" : "#E5E7EB",
    catInactiveText:  isDark ? "#8DB898" : "#4B5563",
    cancelBg:     isDark ? "#172116" : "#F9FAFB",
    cancelBorder: isDark ? "#2A3D2E" : "#E5E7EB",
    cancelText:   isDark ? "#A7D9B0" : "#374151",
  };

  const handleSave = () => {
    if (!name.trim() || !quantity.trim() || !unitPrice.trim()) return;
    onAdd({ name: name.trim(), quantity: quantity.trim(), unitPrice: unitPrice.trim(), category });
    setName(""); setQuantity(""); setUnitPrice("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-end bg-black/50">
        <View style={{ backgroundColor: t.sheetBg }} className="rounded-t-[32px] p-6 max-h-[90%]">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-4" style={{ borderBottomWidth: 1, borderBottomColor: t.divider }}>
            <View>
              <Text style={{ color: t.titleText }} className="text-xl font-bold">Add New Product</Text>
              <Text style={{ color: t.subText }} className="text-xs mt-0.5">List your farm harvest on Green Hive</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ backgroundColor: t.closeBtnBg }} className="h-8 w-8 rounded-full items-center justify-center">
              <Ionicons name="close" size={20} color={isDark ? "#A7D9B0" : "#6B7280"} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="pt-4">
            {/* Category */}
            <Text style={{ color: t.label }} className="text-xs font-semibold mb-2">Category</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {categories.map((cat) => (
                <TouchableOpacity key={cat} onPress={() => setCategory(cat)}
                  style={category === cat
                    ? { backgroundColor: "#166534", borderColor: "#166534", borderWidth: 1 }
                    : { backgroundColor: t.catInactiveBg, borderColor: t.catInactiveBorder, borderWidth: 1 }}
                  className="px-3 py-1.5 rounded-full">
                  <Text style={{ color: category === cat ? "#FFFFFF" : t.catInactiveText }} className="text-xs font-medium">{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Product Name */}
            <Text style={{ color: t.label }} className="text-xs font-semibold mb-1">Product Name *</Text>
            <TextInput
              placeholder="e.g. Fresh Cabbage, Red Potatoes"
              placeholderTextColor={t.placeholder}
              value={name} onChangeText={setName}
              style={{ backgroundColor: t.inputBg, borderColor: t.inputBorder, borderWidth: 1, color: t.inputText }}
              className="rounded-xl px-4 py-3 text-sm mb-4"
            />

            {/* Quantity */}
            <Text style={{ color: t.label }} className="text-xs font-semibold mb-1">Available Quantity (kg) *</Text>
            <TextInput
              placeholder="e.g. 250"
              placeholderTextColor={t.placeholder}
              keyboardType="numeric" value={quantity} onChangeText={setQuantity}
              style={{ backgroundColor: t.inputBg, borderColor: t.inputBorder, borderWidth: 1, color: t.inputText }}
              className="rounded-xl px-4 py-3 text-sm mb-4"
            />

            {/* Price */}
            <Text style={{ color: t.label }} className="text-xs font-semibold mb-1">Unit Price (Rs. / kg) *</Text>
            <TextInput
              placeholder="e.g. 150"
              placeholderTextColor={t.placeholder}
              keyboardType="numeric" value={unitPrice} onChangeText={setUnitPrice}
              style={{ backgroundColor: t.inputBg, borderColor: t.inputBorder, borderWidth: 1, color: t.inputText }}
              className="rounded-xl px-4 py-3 text-sm mb-6"
            />

            {/* Actions */}
            <View className="flex-row gap-3 pb-6">
              <TouchableOpacity onPress={onClose}
                style={{ backgroundColor: t.cancelBg, borderColor: t.cancelBorder, borderWidth: 1 }}
                className="flex-1 py-3.5 rounded-xl items-center justify-center">
                <Text style={{ color: t.cancelText }} className="text-sm font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} className="flex-1 py-3.5 rounded-xl bg-[#166534] items-center justify-center shadow-sm">
                <Text className="text-sm font-bold text-white">Add Product</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
