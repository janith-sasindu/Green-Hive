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

  // Dark mode state — owned here and passed to all child screens
  const [isDark, setIsDark] = useState(false);

  const [products, setProducts] = useState([
    { id: "prod-1", name: "Fresh Cabbage", quantity: "500 kg", unitPrice: "Rs. 80/kg", status: "Active", image: require("../../assets/farmer/cabbage.png") },
    { id: "prod-2", name: "Organic Carrots", quantity: "300 kg", unitPrice: "Rs. 120/kg", status: "Active", image: require("../../assets/farmer/carrots.png") },
    { id: "prod-3", name: "Leeks", quantity: "150 kg", unitPrice: "Rs. 200/kg", status: "Active", image: require("../../assets/farmer/leeks.png") },
  ]);

  const handleAddProduct = (newProd: { name: string; quantity: string; unitPrice: string; category: string }) => {
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
    if (navigation?.canGoBack && navigation.canGoBack()) navigation.goBack();
    else navigation?.navigate("Welcome");
  };

  // ── Theme token map ──────────────────────────────────────────────────────────
  const t = {
    bg: isDark ? "#0F1A12" : "#F5F8F6",
    headerBg: isDark ? "#172116" : "#F5F8F6",
    cardBg: isDark ? "#1C2B1F" : "#FFFFFF",
    cardBorder: isDark ? "#2A3D2E" : "rgba(243,244,246,0.7)",
    sectionLabel: isDark ? "#6EAB7A" : "#64748B",
    titleText: isDark ? "#E8F5EA" : "#1F2937",
    subText: isDark ? "#8DB898" : "#6B7280",
    valueText: isDark ? "#E8F5EA" : "#111827",
    iconBgGreen: isDark ? "#1E3324" : "#E8F8EE",
    iconBgOrange: isDark ? "#2D2215" : "#FFF4EC",
    iconBgBlue: isDark ? "#12213A" : "#EFF6FF",
    navBg: isDark ? "#172116" : "#FFFFFF",
    navBorder: isDark ? "#2A3D2E" : "rgba(229,231,235,0.6)",
    navInactive: isDark ? "#4B7A54" : "#9CA3AF",
    payCardBg: isDark ? "#132A1A" : "rgba(240,253,244,0.6)",
    payCardBorder: isDark ? "#1E4D28" : "#A7F3D0",
    payDivider: isDark ? "#1E4D28" : "#D1FAE5",
    payTitle: isDark ? "#4ADE80" : "#059669",
    payValue: isDark ? "#BBF7D0" : "#065F46",
    notifBg: isDark ? "#1C2B1F" : "#FFFFFF",
    notifBorder: isDark ? "#2A3D2E" : "#F3F4F6",
    notifBadgeBg: isDark ? "#1A3D22" : "#DCFCE7",
    notifBadgeText: isDark ? "#4ADE80" : "#166534",
    closeBtnBg: isDark ? "#2A3D2E" : "#F3F4F6",
    statusBarStyle: (isDark ? "light-content" : "dark-content") as "light-content" | "dark-content",
  };

  const navTabs = [
    { label: "Home", active: "home", inactive: "home-outline" },
    { label: "Products", active: "cube", inactive: "cube-outline" },
    { label: "Requirements", active: "clipboard", inactive: "clipboard-outline" },
    { label: "Orders", active: "bag-handle", inactive: "bag-handle-outline" },
    { label: "Profile", active: "person", inactive: "person-outline" },
  ] as const;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar barStyle={t.statusBarStyle} backgroundColor={t.bg} />

      {/* ── Header ── */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: t.headerBg }}>
        <View className="px-5 pt-1.5 pb-2.5 flex-row items-center justify-between">
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
            <Text style={{ color: t.titleText }} className="text-xl font-bold">Dashboard</Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => setNotificationsModalOpen(true)} className="relative p-1.5 mr-2" activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={23} color={isDark ? "#A7D9B0" : "#374151"} />
              <View className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border border-white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab("Profile")} activeOpacity={0.7} className="h-9 w-9 rounded-full bg-[#1E6F38] items-center justify-center">
              <Text className="text-white font-bold text-base">S</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* ── Main Tab Content ── */}
      <View className="flex-1">
        {activeTab === "Home" && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

            {/* Hero Banner */}
            <View className="mx-4 mt-2 rounded-[24px] overflow-hidden relative" style={{ backgroundColor: "#166534", elevation: 3, shadowColor: "#166534", shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
              <View className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/5" />
              <View className="absolute right-12 -bottom-12 h-36 w-36 rounded-full bg-white/5" />
              <View className="flex-row items-center px-4 pt-4">
                <View className="h-14 w-14 rounded-2xl bg-[#28813F] items-center justify-center mr-3.5 border border-white/10">
                  <Text className="text-2xl font-bold text-white">S</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-[#C6E7CD] font-medium">Good morning,</Text>
                  <Text className="text-xl font-bold text-white mt-0.5">Sunil Perera</Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="checkmark-circle-outline" size={14} color="#86EFAC" />
                    <Text className="text-xs text-[#C6E7CD] ml-1 font-medium">Verified Farmer · Nuwara Eliya</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => setNotificationsModalOpen(true)} activeOpacity={0.8} className="my-3.5 ml-5 self-start flex-row items-center rounded-full bg-[#125324]/90 px-3.5 py-1.5 border border-white/10">
                <Text className="text-xs mr-1.5">🔔</Text>
                <Text className="text-xs font-semibold text-[#DCFCE7]">2 new notifications</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <View className="mx-4 mt-3.5 flex-row flex-wrap justify-between gap-y-3">
              {[
                { label: "Active Products", value: String(products.length), icon: "cube-outline", iconColor: "#16A34A", iconBg: t.iconBgGreen, onPress: () => setActiveTab("Products") },
                { label: "Active Orders", value: "1", icon: "bag-handle-outline", iconColor: "#EA580C", iconBg: t.iconBgOrange, onPress: () => setActiveTab("Orders") },
                { label: "Pending Requests", value: "1", icon: "eye-outline", iconColor: "#2563EB", iconBg: t.iconBgBlue, onPress: () => setActiveTab("Requirements") },
                { label: "Total Earnings", value: "Rs. 0k", icon: "trending-up", iconColor: "#16A34A", iconBg: t.iconBgGreen, onPress: undefined },
              ].map(({ label, value, icon, iconColor, iconBg, onPress }) => (
                <TouchableOpacity key={label} disabled={!onPress} onPress={onPress} activeOpacity={0.8}
                  className="w-[48%] rounded-2xl p-4"
                  style={{ backgroundColor: t.cardBg, borderWidth: 1, borderColor: t.cardBorder, elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}>
                  <View className="flex-row items-center justify-between">
                    <Text style={{ color: t.subText }} className="text-xs font-medium">{label}</Text>
                    <View style={{ backgroundColor: iconBg }} className="h-8 w-8 rounded-xl items-center justify-center">
                      <Ionicons name={icon as any} size={18} color={iconColor} />
                    </View>
                  </View>
                  <Text style={{ color: t.valueText }} className="text-2xl font-bold mt-2">{value}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Actions */}
            <Text style={{ color: t.sectionLabel }} className="mx-4 mt-6 mb-3 text-xs font-bold tracking-wider uppercase">QUICK ACTIONS</Text>
            <View className="mx-4 flex-row flex-wrap justify-between gap-y-3">
              <TouchableOpacity onPress={() => setIsAddModalOpen(true)} activeOpacity={0.85} className="w-[48%] rounded-2xl bg-[#1E6F38] py-4 items-center justify-center" style={{ elevation: 2, shadowColor: "#1E6F38", shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}>
                <Ionicons name="add" size={28} color="#C6E7CD" />
                <Text className="text-sm font-bold text-white mt-1">Add Product</Text>
              </TouchableOpacity>
              {[
                { label: "My Products", emoji: "📦", tab: "Products" },
                { label: "Requirements", emoji: "📋", tab: "Requirements" },
                { label: "My Orders", emoji: "🛒", tab: "Orders" },
              ].map(({ label, emoji, tab }) => (
                <TouchableOpacity key={label} onPress={() => setActiveTab(tab as any)} activeOpacity={0.8}
                  className="w-[48%] rounded-2xl py-4 items-center justify-center"
                  style={{ backgroundColor: t.cardBg, borderWidth: 1, borderColor: t.cardBorder, elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}>
                  <Text className="text-2xl mb-1">{emoji}</Text>
                  <Text style={{ color: t.valueText }} className="text-sm font-semibold">{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Payment Summary */}
            <Text style={{ color: t.sectionLabel }} className="mx-4 mt-6 mb-3 text-xs font-bold tracking-wider uppercase">PAYMENT SUMMARY</Text>
            <View className="mx-4 rounded-2xl p-4 flex-row" style={{ backgroundColor: t.payCardBg, borderWidth: 1, borderColor: t.payCardBorder, elevation: 1 }}>
              <View className="flex-1 items-center pr-2" style={{ borderRightWidth: 1, borderRightColor: t.payDivider }}>
                <Text style={{ color: t.payTitle }} className="text-xs font-semibold">Held by Green Hive</Text>
                <Text style={{ color: t.payValue }} className="text-xl font-bold my-1">Rs. 8,000</Text>
                <Text style={{ color: t.payTitle }} className="text-xs font-medium">Order #GH-2041</Text>
              </View>
              <View className="flex-1 items-center pl-2">
                <Text style={{ color: t.payTitle }} className="text-xs font-semibold">Total Earned</Text>
                <Text style={{ color: t.payValue }} className="text-xl font-bold my-1">Rs. 0</Text>
                <Text style={{ color: t.payTitle }} className="text-xs font-medium">0 orders</Text>
              </View>
            </View>

            {/* Recent Orders */}
            <View className="mx-4 mt-6 mb-3 flex-row items-center justify-between">
              <Text style={{ color: t.sectionLabel }} className="text-xs font-bold tracking-wider uppercase">RECENT ORDERS</Text>
              <TouchableOpacity onPress={() => setActiveTab("Orders")} activeOpacity={0.7}>
                <Text className="text-xs font-semibold text-[#16A34A]">View all</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setActiveTab("Orders")} activeOpacity={0.8}
              className="mx-4 rounded-2xl p-3.5 flex-row items-center"
              style={{ backgroundColor: t.cardBg, borderWidth: 1, borderColor: t.cardBorder, elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}>
              <Image source={require("../../assets/farmer/cabbage.png")} className="h-14 w-14 rounded-xl" resizeMode="cover" />
              <View className="flex-1 ml-3">
                <Text style={{ color: t.valueText }} className="text-sm font-bold">Fresh Cabbage</Text>
                <Text style={{ color: t.subText }} className="text-xs mt-0.5">Colombo Fresh Market · 100 kg</Text>
                <Text style={{ color: isDark ? "#4B6B52" : "#9CA3AF" }} className="text-xs mt-1">#GH-2041</Text>
              </View>
              <View className="items-end justify-between self-stretch py-0.5">
                <View style={{ backgroundColor: t.iconBgBlue }} className="flex-row items-center rounded-full px-2.5 py-0.5">
                  <View className="h-1.5 w-1.5 rounded-full bg-[#2563EB] mr-1.5" />
                  <Text className="text-xs font-semibold text-[#2563EB]">In Transit</Text>
                </View>
                <Text className="text-sm font-bold text-[#16A34A]">Rs. 8,000</Text>
              </View>
            </TouchableOpacity>

            {/* Active Products */}
            <View className="mx-4 mt-6 mb-3 flex-row items-center justify-between">
              <Text style={{ color: t.sectionLabel }} className="text-xs font-bold tracking-wider uppercase">ACTIVE PRODUCTS</Text>
              <TouchableOpacity onPress={() => setActiveTab("Products")} activeOpacity={0.7}>
                <Text className="text-xs font-semibold text-[#16A34A]">View all</Text>
              </TouchableOpacity>
            </View>
            <View className="mx-4 flex-row flex-wrap justify-between gap-y-3">
              {products.slice(0, 3).map((prod) => (
                <View key={prod.id} className="w-[48%] rounded-2xl overflow-hidden" style={{ backgroundColor: t.cardBg, borderWidth: 1, borderColor: t.cardBorder, elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}>
                  <Image source={prod.image} className="h-28 w-full" resizeMode="cover" />
                  <View className="p-3">
                    <Text style={{ color: t.valueText }} className="text-sm font-bold" numberOfLines={1}>{prod.name}</Text>
                    <Text style={{ color: t.subText }} className="text-xs mt-0.5">{prod.quantity} · {prod.unitPrice}</Text>
                    <View className="mt-2 flex-row items-center self-start rounded-full px-2 py-0.5" style={{ backgroundColor: isDark ? "#14371E" : "#DCFCE7" }}>
                      <View className="h-1.5 w-1.5 rounded-full bg-[#16A34A] mr-1.5" />
                      <Text className="text-[11px] font-semibold text-[#16A34A]">{prod.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
              <TouchableOpacity onPress={() => setIsAddModalOpen(true)} activeOpacity={0.7}
                className="w-[48%] rounded-2xl min-h-[170px] items-center justify-center p-3"
                style={{ backgroundColor: t.cardBg, borderWidth: 2, borderStyle: "dashed", borderColor: isDark ? "#2A4D32" : "#E5E7EB", elevation: 1 }}>
                <Ionicons name="add" size={32} color="#16A34A" />
                <Text className="text-sm font-semibold text-[#16A34A] mt-1">Add Product</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        )}

        {activeTab === "Products" && <FarmerProductsScreen products={products} onOpenAddModal={() => setIsAddModalOpen(true)} onBackToHome={() => setActiveTab("Home")} isDark={isDark} />}
        {activeTab === "Requirements" && <FarmerRequirementsScreen onBackToHome={() => setActiveTab("Home")} isDark={isDark} />}
        {activeTab === "Orders" && <FarmerOrdersScreen onBackToHome={() => setActiveTab("Home")} isDark={isDark} />}
        {activeTab === "Profile" && <FarmerProfileScreen onBackToHome={() => setActiveTab("Home")} onLogout={handleLogout} isDark={isDark} setIsDark={setIsDark} />}
      </View>

      {/* ── Bottom Navigation ── */}
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor: t.navBg, borderTopWidth: 1, borderTopColor: t.navBorder }}>
        <View className="flex-row items-center justify-around pt-2 pb-1">
          {navTabs.map(({ label, active, inactive }) => {
            const isActive = activeTab === label;
            return (
              <TouchableOpacity key={label} onPress={() => setActiveTab(label as any)} className="items-center min-w-[56px]" activeOpacity={0.7}>
                <Ionicons name={isActive ? active : inactive} size={22} color={isActive ? "#16A34A" : t.navInactive} />
                <Text style={{ color: isActive ? "#16A34A" : t.navInactive }} className={`text-[11px] mt-0.5 ${isActive ? "font-bold" : "font-medium"}`}>{label}</Text>
                {isActive && <View className="h-0.5 w-5 rounded-full bg-[#16A34A] mt-0.5" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>

      {/* ── Add Product Modal ── */}
      <AddProductModal visible={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddProduct} isDark={isDark} />

      {/* ── Notifications Modal ── */}
      <Modal visible={notificationsModalOpen} transparent animationType="fade" onRequestClose={() => setNotificationsModalOpen(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setNotificationsModalOpen(false)} className="flex-1 bg-black/40 justify-center px-5">
          <View className="rounded-3xl p-5" style={{ backgroundColor: t.notifBg }}>
            <View className="flex-row items-center justify-between pb-3" style={{ borderBottomWidth: 1, borderBottomColor: t.notifBorder }}>
              <View className="flex-row items-center">
                <Text style={{ color: t.valueText }} className="text-lg font-bold">Notifications</Text>
                <View style={{ backgroundColor: t.notifBadgeBg }} className="ml-2 px-2 py-0.5 rounded-full">
                  <Text style={{ color: t.notifBadgeText }} className="text-xs font-bold">2 new</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setNotificationsModalOpen(false)} style={{ backgroundColor: t.closeBtnBg }} className="h-8 w-8 rounded-full items-center justify-center">
                <Ionicons name="close" size={18} color={isDark ? "#A7D9B0" : "#6B7280"} />
              </TouchableOpacity>
            </View>
            <View className="py-3 gap-3">
              <View className="p-3 rounded-2xl" style={{ backgroundColor: isDark ? "#132A1A" : "#F0FDF4", borderWidth: 1, borderColor: isDark ? "#1E4D28" : "#DCFCE7" }}>
                <Text style={{ color: isDark ? "#4ADE80" : "#166534" }} className="text-xs font-bold">Order #GH-2041 Updated</Text>
                <Text style={{ color: t.subText }} className="text-xs mt-0.5">Your cabbage shipment is now In Transit to Colombo Fresh Market.</Text>
                <Text style={{ color: isDark ? "#4B6B52" : "#9CA3AF" }} className="text-[10px] mt-1">10 mins ago</Text>
              </View>
              <View className="p-3 rounded-2xl" style={{ backgroundColor: isDark ? "#12213A" : "rgba(239,246,255,0.7)", borderWidth: 1, borderColor: isDark ? "#1E3D6A" : "#BFDBFE" }}>
                <Text style={{ color: isDark ? "#60A5FA" : "#1D4ED8" }} className="text-xs font-bold">New Buyer Requirement</Text>
                <Text style={{ color: t.subText }} className="text-xs mt-0.5">Colombo buyer requested 250 kg Fresh Cabbage at Rs. 85/kg.</Text>
                <Text style={{ color: isDark ? "#4B6B52" : "#9CA3AF" }} className="text-[10px] mt-1">1 hour ago</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setNotificationsModalOpen(false)} className="mt-2 py-3 rounded-xl items-center justify-center" style={{ backgroundColor: "#166534" }}>
              <Text className="text-xs font-bold text-white">Dismiss</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
