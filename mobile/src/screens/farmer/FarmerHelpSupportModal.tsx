import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FarmerHelpSupportModalProps {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
}

const FAQS = [
  {
    question: "How do I add a product for buyers?",
    answer:
      "Open My Products, tap Add Product, and enter the crop name, quantity, unit price, and category. Your product will appear in your active listings after it is added.",
  },
  {
    question: "How do I respond to buyer requirements?",
    answer:
      "Open Requirements from the farmer dashboard to view buyer requests. Select a requirement that matches your harvest, then submit the quantity and price you can offer.",
  },
  {
    question: "What happens after I submit a fulfillment request?",
    answer:
      "The buyer reviews your offer and can accept or reject it. You can follow the latest status from your Orders section and receive notifications when the buyer responds.",
  },
  {
    question: "When will I receive payment for my produce?",
    answer:
      "Green Hive holds the buyer's payment until the agreed order milestone is confirmed. Payment is released according to the order status after pickup or delivery is confirmed.",
  },
  {
    question: "How is transportation arranged?",
    answer:
      "If transportation is required, a transport job is created for the order. A transporter submits an offer, and the delivery progress is shown in the order details.",
  },
  {
    question: "How can I track my orders?",
    answer:
      "Open My Orders from the farmer dashboard to view order history, payment status, and delivery updates for your accepted offers and product sales.",
  },
  {
    question: "What should I do if there is a problem with an order?",
    answer:
      "Keep the order number ready and contact Green Hive support. Our admin team can review payment, product, pickup, and delivery issues.",
  },
];

export const FarmerHelpSupportModal = ({
  visible,
  isDark,
  onClose,
}: FarmerHelpSupportModalProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const iconColor = isDark ? "#A7D9B0" : "#4B5563";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[92%] rounded-t-3xl bg-white dark:bg-slate-900">
          <View className="flex-row items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-700">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-950/40">
                <Ionicons name="help-circle-outline" size={21} color="#166534" />
              </View>
              <View className="ml-3">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  Help & Support
                </Text>
                <Text className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                  Farmer questions and answers
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close help and support"
              className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800"
            >
              <Ionicons name="close" size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {FAQS.map((faq, index) => {
              const open = openIndex === index;
              return (
                <TouchableOpacity
                  key={faq.question}
                  onPress={() => setOpenIndex(open ? null : index)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  className="border-b border-gray-100 px-5 py-3.5 dark:border-slate-700"
                >
                  <View className="flex-row items-center">
                    <Text className="flex-1 pr-3 text-sm font-semibold text-gray-900 dark:text-white">
                      {faq.question}
                    </Text>
                    <Ionicons
                      name={open ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={iconColor}
                    />
                  </View>
                  {open && (
                    <Text className="mt-2 text-sm leading-5 text-gray-600 dark:text-slate-300">
                      {faq.answer}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}

            <Text className="px-5 py-4 text-xs leading-5 text-gray-500 dark:text-slate-400">
              For farmer support, contact the Green Hive admin team at 1920 or
              support@greenhive.lk. Keep your order or requirement number ready
              when reporting an issue.
            </Text>

            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              className="mx-5 items-center rounded-2xl bg-[#166534] py-3.5"
            >
              <Text className="text-sm font-bold text-white">Got it</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
