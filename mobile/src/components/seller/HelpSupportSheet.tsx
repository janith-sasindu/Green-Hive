import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { useSellerTheme } from './theme';
import { PrimaryButton, ink } from './ui';

const FAQS = [
  {
    question: 'How does Green Hive payment protection work?',
    answer:
      'When you place an order your payment is held by Green Hive instead of going straight to the farmer. It is released only when the agreed milestone is confirmed in the app.',
  },
  {
    question: 'When is the farmer paid?',
    answer:
      'With transportation, the product payment is released when the transporter confirms pickup. With self pickup, it is released when you confirm that you received the goods.',
  },
  {
    question: 'When is the transporter paid?',
    answer:
      'The transportation cost is held when you approve a transporter offer and released after you confirm that the goods were delivered.',
  },
  {
    question: 'How do I arrange transportation?',
    answer:
      'Choose “Transportation Required” at checkout. A transport job is created, transporters submit their costs, and you approve the offer that suits you from the Transport tab.',
  },
  {
    question: 'What if I cannot find the product I need?',
    answer:
      'Post a requirement with the product, quantity and your maximum price. Farmers who can supply it send fulfillment requests that you can accept or reject.',
  },
];

interface HelpSupportSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const HelpSupportSheet = ({ visible, onClose }: HelpSupportSheetProps) => {
  const theme = useSellerTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Help & Support"
      icon="help-circle"
      footer={<PrimaryButton label="Got it" onPress={onClose} />}
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
              <Text className={`flex-1 pr-3 text-sm font-semibold ${ink.strong}`}>{faq.question}</Text>
              <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.iconMuted} />
            </View>
            {open && <Text className={`mt-2 text-sm leading-5 ${ink.body}`}>{faq.answer}</Text>}
          </TouchableOpacity>
        );
      })}
      <Text className={`px-5 py-4 text-xs leading-5 ${ink.muted}`}>
        Problems with an order, a payment or another user are reviewed by the Green Hive admin team. Keep your
        order number ready when you report an issue.
      </Text>
    </BottomSheet>
  );
};
