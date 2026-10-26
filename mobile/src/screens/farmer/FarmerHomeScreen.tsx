import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AddProductModal } from "./AddProductModal";
import { FarmerProductsScreen } from "./FarmerProductsScreen";
import { FarmerRequirementsScreen } from "./FarmerRequirementsScreen";
import { FarmerOrdersScreen } from "./FarmerOrdersScreen";
import { FarmerProfileScreen } from "./FarmerProfileScreen";

interface FarmerHomeScreenProps {
  navigation?: any;
}

export const FarmerHomeScreen = ({ navigation }: FarmerHomeScreenProps) => {
  const [activeTab, setActiveTab] = useState<
    "Home" | "Products" | "Requirements" | "Orders" | "Profile"
  >("Home");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);

  // Active products state
  const [products, setProducts] = useState([
    {
      id: "prod-1",
      name: "Fresh Cabbage",
      quantity: "500 kg",
      unitPrice: "Rs. 80/kg",
      status: "Active",
      image: require("../../assets/farmer/cabbage.png"),
    },
    {
      id: "prod-2",
      name: "Organic Carrots",
      quantity: "300 kg",
      unitPrice: "Rs. 120/kg",
      status: "Active",
      image: require("../../assets/farmer/carrots.png"),
    },
    {
      id: "prod-3",
      name: "Leeks",
      quantity: "150 kg",
      unitPrice: "Rs. 200/kg",
      status: "Active",
      image: require("../../assets/farmer/leeks.png"),
    },
  ]);

  const handleAddProduct = (newProd: {
    name: string;
    quantity: string;
    unitPrice: string;
    category: string;
  }) => {
    const item = {
      id: `prod-${Date.now()}`,
      name: newProd.name,
      quantity: `${newProd.quantity} kg`,
      unitPrice: `Rs. ${newProd.unitPrice}/kg`,
      status: "Active",
      image: require("../../assets/farmer/cabbage.png"),
    };
    setProducts((prev) => [...prev, item]);
    Alert.alert("Success", `${newProd.name} added to your active listings!`);
  };

  const handleLogout = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate("Welcome");
    }
  };

  return (
    <View className="flex-1 bg-[#F5F8F6]">
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8F6" />

      {/* Top Header */}
      <SafeAreaView edges={["top"]} className="bg-[#F5F8F6]">
        <View className="px-5 pt-1.5 pb-2.5 flex-row items-center justify-between">
          {/* Logo & Dashboard Title */}
          <View className="flex-row items-center">
            <View
              className="h-9 w-9 rounded-xl bg-[#14532D] items-center justify-center mr-2.5 shadow-xs overflow-hidden"
              style={{ width: 36, height: 36 }}
            >
              <Image
                source={require("../../assets/logo.png")}
                resizeMode="contain"
                resizeMethod="resize"
                style={{ width: 64, height: 36 }}
              />
            </View>
            <Text className="text-xl font-bold text-[#1F2937]">Dashboard</Text>
          </View>

          {/* Right Header Icons */}
          <View className="flex-row items-center">
            {/* Notification Bell */}
            <TouchableOpacity
              onPress={() => setNotificationsModalOpen(true)}
              className="relative p-1.5 mr-2"
              activeOpacity={0.7}
            >
              <Ionicons
                name="notifications-outline"
                size={23}
                color="#374151"
              />
              <View className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border border-white" />
            </TouchableOpacity>

            {/* Profile Avatar */}
            <TouchableOpacity
              onPress={() => setActiveTab("Profile")}
              activeOpacity={0.7}
              className="h-9 w-9 rounded-full bg-[#1E6F38] items-center justify-center shadow-xs"
            >
              <Text className="text-white font-bold text-base">S</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Main Body Content based on Active Tab */}
      <View className="flex-1">
        {activeTab === "Home" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            bounces={true}
            scrollEventThrottle={16}
            decelerationRate="normal"
            overScrollMode="never"
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. Farmer Hero Profile Banner */}
            <View
              className="mx-4 mt-2 rounded-[24px] bg-[#166534] p-4.5 overflow-hidden relative"
              style={{
                elevation: 3,
                shadowColor: "#166534",
                shadowOpacity: 0.15,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              {/* Decorative background subtle circles */}
              <View className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/5" />
              <View className="absolute right-12 -bottom-12 h-36 w-36 rounded-full bg-white/5" />

              {/* Profile details row */}
              <View className="flex-row items-center">
                <View className="h-14 w-14 rounded-2xl bg-[#28813F] items-center justify-center m-5 mr-3.5 border border-white/10 ">
                  <Text className="text-2xl font-bold text-white">S</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-[#C6E7CD] font-medium">
                    Good morning,
                  </Text>
                  <Text className="text-xl font-bold text-white mt-0.5">
                    Sunil Perera
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={14}
                      color="#86EFAC"
                    />
                    <Text className="text-xs text-[#C6E7CD] ml-1 font-medium">
                      Verified Farmer · Nuwara Eliya
                    </Text>
                  </View>
                </View>
              </View>

              {/* Notification badge pill */}
              <TouchableOpacity
                onPress={() => setNotificationsModalOpen(true)}
                activeOpacity={0.8}
                className=" mb-3.5 ml-5 self-start flex-row items-center rounded-full bg-[#125324]/90 px-3.5 py-1.5 border border-white/10"
              >
                <Text className="text-xs mr-1.5">🔔</Text>
                <Text className="text-xs font-semibold text-[#DCFCE7]">
                  2 new notifications
                </Text>
              </TouchableOpacity>
            </View>

            {/* 2. Statistics 2x2 Grid */}
            <View className="mx-4 mt-3.5 flex-row flex-wrap justify-between gap-y-3">
              {/* Active Products */}
              <TouchableOpacity
                onPress={() => setActiveTab("Products")}
                activeOpacity={0.8}
                className="w-[48%] rounded-2xl bg-white p-4 border border-gray-100/70"
                style={{
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-gray-500 font-medium">
                    Active Products
                  </Text>
                  <View className="h-8 w-8 rounded-xl bg-[#E8F8EE] items-center justify-center">
                    <Ionicons name="cube-outline" size={18} color="#16A34A" />
                  </View>
                </View>
                <Text className="text-2xl font-bold text-gray-900 mt-2">
                  {products.length}
                </Text>
              </TouchableOpacity>

              {/* Active Orders */}
              <TouchableOpacity
                onPress={() => setActiveTab("Orders")}
                activeOpacity={0.8}
                className="w-[48%] rounded-2xl bg-white p-4 border border-gray-100/70"
                style={{
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-gray-500 font-medium">
                    Active Orders
                  </Text>
                  <View className="h-8 w-8 rounded-xl bg-[#FFF4EC] items-center justify-center">
                    <Ionicons
                      name="bag-handle-outline"
                      size={18}
                      color="#EA580C"
                    />
                  </View>
                </View>
                <Text className="text-2xl font-bold text-gray-900 mt-2">1</Text>
              </TouchableOpacity>

              {/* Pending Requests */}
              <TouchableOpacity
                onPress={() => setActiveTab("Requirements")}
                activeOpacity={0.8}
                className="w-[48%] rounded-2xl bg-white p-4 border border-gray-100/70"
                style={{
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-gray-500 font-medium">
                    Pending Requests
                  </Text>
                  <View className="h-8 w-8 rounded-xl bg-[#EFF6FF] items-center justify-center">
                    <Ionicons name="eye-outline" size={18} color="#2563EB" />
                  </View>
                </View>
                <Text className="text-2xl font-bold text-gray-900 mt-2">1</Text>
              </TouchableOpacity>

              {/* Total Earnings */}
              <View
                className="w-[48%] rounded-2xl bg-white p-4 border border-gray-100/70"
                style={{
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-gray-500 font-medium">
                    Total Earnings
                  </Text>
                  <View className="h-8 w-8 rounded-xl bg-[#E8F8EE] items-center justify-center">
                    <Ionicons name="trending-up" size={18} color="#16A34A" />
                  </View>
                </View>
                <Text className="text-2xl font-bold text-gray-900 mt-2">
                  Rs. 0k
                </Text>
              </View>
            </View>

            {/* 3. QUICK ACTIONS Section */}
            <Text className="mx-4 mt-6 mb-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">
              QUICK ACTIONS
            </Text>
            <View className="mx-4 flex-row flex-wrap justify-between gap-y-3">
              {/* Add Product Button (Green card with purple +) */}
              <TouchableOpacity
                onPress={() => setIsAddModalOpen(true)}
                activeOpacity={0.85}
                className="w-[48%] rounded-2xl bg-[#1E6F38] py-4 items-center justify-center"
                style={{
                  elevation: 2,
                  shadowColor: "#1E6F38",
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <Ionicons name="add" size={28} color="#C6E7CD" />
                <Text className="text-sm font-bold text-white mt-1">
                  Add Product
                </Text>
              </TouchableOpacity>

              {/* My Products Button */}
              <TouchableOpacity
                onPress={() => setActiveTab("Products")}
                activeOpacity={0.8}
                className="w-[48%] rounded-2xl bg-white py-4 items-center justify-center border border-gray-100/80"
                style={{
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <Text className="text-2xl mb-1">📦</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  My Products
                </Text>
              </TouchableOpacity>

              {/* Requirements Button */}
              <TouchableOpacity
                onPress={() => setActiveTab("Requirements")}
                activeOpacity={0.8}
                className="w-[48%] rounded-2xl bg-white py-4 items-center justify-center border border-gray-100/80"
                style={{
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <Text className="text-2xl mb-1">📋</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  Requirements
                </Text>
              </TouchableOpacity>

              {/* My Orders Button */}
              <TouchableOpacity
                onPress={() => setActiveTab("Orders")}
                activeOpacity={0.8}
                className="w-[48%] rounded-2xl bg-white py-4 items-center justify-center border border-gray-100/80"
                style={{
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <Text className="text-2xl mb-1">🛒</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  My Orders
                </Text>
              </TouchableOpacity>
            </View>

            {/* 4. PAYMENT SUMMARY Section */}
            <Text className="mx-4 mt-6 mb-3 text-xs font-bold tracking-wider text-[#64748B] uppercase">
              PAYMENT SUMMARY
            </Text>
            <View
              className="mx-4 rounded-2xl border border-[#A7F3D0] bg-[#F0FDF4]/60 p-4 flex-row"
              style={{
                elevation: 1,
                shadowColor: "#000",
                shadowOpacity: 0.03,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 1 },
              }}
            >
              {/* Left Column: Held by Green Hive */}
              <View className="flex-1 items-center pr-2 border-r border-[#D1FAE5]">
                <Text className="text-xs font-semibold text-[#059669]">
                  Held by Green Hive
                </Text>
                <Text className="text-xl font-bold text-[#065F46] my-1">
                  Rs. 8,000
                </Text>
                <Text className="text-xs text-[#059669] font-medium">
                  Order #GH-2041
                </Text>
              </View>

              {/* Right Column: Total Earned */}
              <View className="flex-1 items-center pl-2">
                <Text className="text-xs font-semibold text-[#059669]">
                  Total Earned
                </Text>
                <Text className="text-xl font-bold text-[#065F46] my-1">
                  Rs. 0
                </Text>
                <Text className="text-xs text-[#059669] font-medium">
                  0 orders
                </Text>
              </View>
            </View>

            {/* 5. RECENT ORDERS Section */}
            <View className="mx-4 mt-6 mb-3 flex-row items-center justify-between">
              <Text className="text-xs font-bold tracking-wider text-[#64748B] uppercase">
                RECENT ORDERS
              </Text>
              <TouchableOpacity
                onPress={() => setActiveTab("Orders")}
                activeOpacity={0.7}
              >
                <Text className="text-xs font-semibold text-[#16A34A]">
                  View all
                </Text>
              </TouchableOpacity>
            </View>

            {/* Recent Order Card */}
            <TouchableOpacity
              onPress={() => setActiveTab("Orders")}
              activeOpacity={0.8}
              className="mx-4 rounded-2xl bg-white p-3.5 border border-gray-100 flex-row items-center"
              style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              {/* Order Image Thumbnail */}
              <Image
                source={require("../../assets/farmer/cabbage.png")}
                className="h-14 w-14 rounded-xl bg-gray-100"
                resizeMode="cover"
              />

              {/* Order Info */}
              <View className="flex-1 ml-3">
                <Text className="text-sm font-bold text-gray-900">
                  Fresh Cabbage
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  Colombo Fresh Market · 100 kg
                </Text>
                <Text className="text-xs text-gray-400 mt-1">#GH-2041</Text>
              </View>

              {/* Status Pill & Amount */}
              <View className="items-end justify-between self-stretch py-0.5">
                <View className="flex-row items-center rounded-full bg-[#EFF6FF] px-2.5 py-0.5">
                  <View className="h-1.5 w-1.5 rounded-full bg-[#2563EB] mr-1.5" />
                  <Text className="text-xs font-semibold text-[#2563EB]">
                    In Transit
                  </Text>
                </View>
                <Text className="text-sm font-bold text-[#16A34A]">
                  Rs. 8,000
                </Text>
              </View>
            </TouchableOpacity>

            {/* 6. ACTIVE PRODUCTS Section */}
            <View className="mx-4 mt-6 mb-3 flex-row items-center justify-between">
              <Text className="text-xs font-bold tracking-wider text-[#64748B] uppercase">
                ACTIVE PRODUCTS
              </Text>
              <TouchableOpacity
                onPress={() => setActiveTab("Products")}
                activeOpacity={0.7}
              >
                <Text className="text-xs font-semibold text-[#16A34A]">
                  View all
                </Text>
              </TouchableOpacity>
            </View>

            {/* Active Products 2x2 Grid */}
            <View className="mx-4 flex-row flex-wrap justify-between gap-y-3">
              {products.slice(0, 3).map((prod) => (
                <View
                  key={prod.id}
                  className="w-[48%] rounded-2xl bg-white border border-gray-100 overflow-hidden"
                  style={{
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOpacity: 0.04,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                  }}
                >
                  <Image
                    source={prod.image}
                    className="h-28 w-full bg-gray-100"
                    resizeMode="cover"
                  />
                  <View className="p-3">
                    <Text
                      className="text-sm font-bold text-gray-900"
                      numberOfLines={1}
                    >
                      {prod.name}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      {prod.quantity} · {prod.unitPrice}
                    </Text>
                    <View className="mt-2 flex-row items-center self-start rounded-full bg-[#DCFCE7] px-2 py-0.5">
                      <View className="h-1.5 w-1.5 rounded-full bg-[#16A34A] mr-1.5" />
                      <Text className="text-[11px] font-semibold text-[#16A34A]">
                        {prod.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              {/* 4th Card: Add Product (Dashed card) */}
              <TouchableOpacity
                onPress={() => setIsAddModalOpen(true)}
                activeOpacity={0.7}
                className="w-[48%] rounded-2xl bg-white border-2 border-dashed border-gray-200 min-h-[170px] items-center justify-center p-3"
                style={{
                  elevation: 1,
                  shadowColor: "#000",
                  shadowOpacity: 0.02,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 1 },
                }}
              >
                <Ionicons name="add" size={32} color="#16A34A" />
                <Text className="text-sm font-semibold text-[#16A34A] mt-1">
                  Add Product
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* Tab: Products */}
        {activeTab === "Products" && (
          <FarmerProductsScreen
            products={products}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onBackToHome={() => setActiveTab("Home")}
          />
        )}

        {/* Tab: Requirements */}
        {activeTab === "Requirements" && (
          <FarmerRequirementsScreen onBackToHome={() => setActiveTab("Home")} />
        )}

        {/* Tab: Orders */}
        {activeTab === "Orders" && (
          <FarmerOrdersScreen onBackToHome={() => setActiveTab("Home")} />
        )}

        {/* Tab: Profile */}
        {activeTab === "Profile" && (
          <FarmerProfileScreen
            onBackToHome={() => setActiveTab("Home")}
            onLogout={handleLogout}
          />
        )}
      </View>

      {/* 7. Bottom Navigation Bar */}
      <SafeAreaView edges={["bottom"]} className="bg-white border-t border-gray-200/60">
        <View className="flex-row items-center justify-around pt-2 pb-1">
          {/* Home Tab */}
          <TouchableOpacity
            onPress={() => setActiveTab("Home")}
            className="items-center min-w-[56px]"
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === "Home" ? "home" : "home-outline"}
              size={22}
              color={activeTab === "Home" ? "#16A34A" : "#9CA3AF"}
            />
            <Text
              className={`text-[11px] mt-0.5 ${activeTab === "Home"
                ? "font-bold text-[#16A34A]"
                : "font-medium text-[#9CA3AF]"
                }`}
            >
              Home
            </Text>
            {activeTab === "Home" && (
              <View className="h-0.5 w-5 rounded-full bg-[#16A34A] mt-0.5" />
            )}
          </TouchableOpacity>

          {/* Products Tab */}
          <TouchableOpacity
            onPress={() => setActiveTab("Products")}
            className="items-center min-w-[56px]"
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === "Products" ? "cube" : "cube-outline"}
              size={22}
              color={activeTab === "Products" ? "#16A34A" : "#9CA3AF"}
            />
            <Text
              className={`text-[11px] mt-0.5 ${activeTab === "Products"
                ? "font-bold text-[#16A34A]"
                : "font-medium text-[#9CA3AF]"
                }`}
            >
              Products
            </Text>
            {activeTab === "Products" && (
              <View className="h-0.5 w-5 rounded-full bg-[#16A34A] mt-0.5" />
            )}
          </TouchableOpacity>

          {/* Requirements Tab */}
          <TouchableOpacity
            onPress={() => setActiveTab("Requirements")}
            className="items-center min-w-[56px]"
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                activeTab === "Requirements"
                  ? "clipboard"
                  : "clipboard-outline"
              }
              size={22}
              color={activeTab === "Requirements" ? "#16A34A" : "#9CA3AF"}
            />
            <Text
              className={`text-[11px] mt-0.5 ${activeTab === "Requirements"
                ? "font-bold text-[#16A34A]"
                : "font-medium text-[#9CA3AF]"
                }`}
            >
              Requirements
            </Text>
            {activeTab === "Requirements" && (
              <View className="h-0.5 w-5 rounded-full bg-[#16A34A] mt-0.5" />
            )}
          </TouchableOpacity>

          {/* Orders Tab */}
          <TouchableOpacity
            onPress={() => setActiveTab("Orders")}
            className="items-center min-w-[56px]"
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                activeTab === "Orders" ? "bag-handle" : "bag-handle-outline"
              }
              size={22}
              color={activeTab === "Orders" ? "#16A34A" : "#9CA3AF"}
            />
            <Text
              className={`text-[11px] mt-0.5 ${activeTab === "Orders"
                ? "font-bold text-[#16A34A]"
                : "font-medium text-[#9CA3AF]"
                }`}
            >
              Orders
            </Text>
            {activeTab === "Orders" && (
              <View className="h-0.5 w-5 rounded-full bg-[#16A34A] mt-0.5" />
            )}
          </TouchableOpacity>

          {/* Profile Tab */}
          <TouchableOpacity
            onPress={() => setActiveTab("Profile")}
            className="items-center min-w-[56px]"
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === "Profile" ? "person" : "person-outline"}
              size={22}
              color={activeTab === "Profile" ? "#16A34A" : "#9CA3AF"}
            />
            <Text
              className={`text-[11px] mt-0.5 ${activeTab === "Profile"
                ? "font-bold text-[#16A34A]"
                : "font-medium text-[#9CA3AF]"
                }`}
            >
              Profile
            </Text>
            {activeTab === "Profile" && (
              <View className="h-0.5 w-5 rounded-full bg-[#16A34A] mt-0.5" />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Add Product Modal */}
      <AddProductModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProduct}
      />

      {/* Notifications Modal */}
      <Modal
        visible={notificationsModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNotificationsModalOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setNotificationsModalOpen(false)}
          className="flex-1 bg-black/40 justify-center px-5"
        >
          <View className="bg-white rounded-3xl p-5 shadow-lg">
            <View className="flex-row items-center justify-between pb-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <Text className="text-lg font-bold text-gray-900">
                  Notifications
                </Text>
                <View className="ml-2 bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                  <Text className="text-xs font-bold text-[#166534]">2 new</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setNotificationsModalOpen(false)}
                className="h-8 w-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="py-3 gap-3">
              <View className="p-3 bg-[#F0FDF4] rounded-2xl border border-[#DCFCE7]">
                <Text className="text-xs font-bold text-[#166534]">
                  Order #GH-2041 Updated
                </Text>
                <Text className="text-xs text-gray-600 mt-0.5">
                  Your cabbage shipment is now In Transit to Colombo Fresh
                  Market.
                </Text>
                <Text className="text-[10px] text-gray-400 mt-1">10 mins ago</Text>
              </View>

              <View className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100">
                <Text className="text-xs font-bold text-blue-700">
                  New Buyer Requirement
                </Text>
                <Text className="text-xs text-gray-600 mt-0.5">
                  Colombo buyer requested 250 kg Fresh Cabbage at Rs. 85/kg.
                </Text>
                <Text className="text-[10px] text-gray-400 mt-1">1 hour ago</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setNotificationsModalOpen(false)}
              className="mt-2 py-3 rounded-xl bg-[#166534] items-center justify-center"
            >
              <Text className="text-xs font-bold text-white">Dismiss</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
