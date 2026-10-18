import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/seller/AppHeader';
import { Card, Chip, FormField, PrimaryButton, Screen, ink } from '../../components/seller/ui';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import { useSeller } from '../../context/SellerContext';
import { useSellerNavigation } from '../../hooks/useSellerNavigation';
import type { ProductCategory } from '../../types/seller';
import { addDays, formatDate, formatLkr, toDateString } from '../../utils/format';
import { parsePositiveNumber } from '../../utils/validation';

const DEADLINE_OPTIONS = [
  { days: 3, label: 'In 3 days' },
  { days: 7, label: 'In 1 week' },
  { days: 14, label: 'In 2 weeks' },
  { days: 30, label: 'In 1 month' },
];

type FieldErrors = Partial<Record<'productName' | 'quantity' | 'maxBudget' | 'deliveryLocation', string>>;

export const CreateRequirementScreen = () => {
  const navigation = useSellerNavigation();
  const insets = useSafeAreaInsets();
  const { profile, createRequirement } = useSeller();

  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState<ProductCategory>(PRODUCT_CATEGORIES[0]);
  const [quantity, setQuantity] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState(profile.address);
  const [deadlineDays, setDeadlineDays] = useState(DEADLINE_OPTIONS[1].days);
  const [description, setDescription] = useState('');
  // Errors appear after the first submit attempt, then update as the seller corrects each field
  const [showErrors, setShowErrors] = useState(false);

  const quantityKg = parsePositiveNumber(quantity);
  const maxBudgetPerKg = parsePositiveNumber(maxBudget);
  const deadlineDate = toDateString(addDays(new Date(), deadlineDays));

  const errors: FieldErrors = {};
  if (productName.trim() === '') errors.productName = 'Enter the product you need.';
  if (quantityKg === null) errors.quantity = 'Enter the quantity in kg.';
  if (maxBudgetPerKg === null) errors.maxBudget = 'Enter the most you will pay per kg.';
  if (deliveryLocation.trim() === '') errors.deliveryLocation = 'Enter where the goods are needed.';
  const visibleErrors: FieldErrors = showErrors ? errors : {};

  const handleSubmit = () => {
    if (Object.keys(errors).length > 0 || quantityKg === null || maxBudgetPerKg === null) {
      setShowErrors(true);
      return;
    }
    const requirement = createRequirement({
      productName,
      category,
      quantityNeededKg: quantityKg,
      maxBudgetPerKg,
      deliveryLocation,
      description,
      deadlineDate,
    });
    navigation.replace('RequirementDetail', { requirementId: requirement.id });
  };

  return (
    <Screen>
      <AppHeader title="Create Requirement" showBack />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <Text className={`mb-4 text-sm leading-5 ${ink.muted}`}>
          Describe what you need. Farmers who can supply it will send you fulfillment requests to review.
        </Text>

        <Card className="p-4">
          <FormField
            label="Product"
            icon="shopping-bag"
            value={productName}
            onChangeText={setProductName}
            placeholder="e.g. Carrots"
            autoCapitalize="words"
            error={visibleErrors.productName}
          />

          <Text className={`mb-2 text-xs font-semibold ${ink.body}`}>Category</Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {PRODUCT_CATEGORIES.map((item) => (
              <Chip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />
            ))}
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <FormField
                label="Quantity needed"
                value={quantity}
                onChangeText={setQuantity}
                placeholder="0"
                keyboardType="decimal-pad"
                suffix="kg"
                error={visibleErrors.quantity}
              />
            </View>
            <View className="flex-1">
              <FormField
                label="Max price per kg"
                value={maxBudget}
                onChangeText={setMaxBudget}
                placeholder="0"
                keyboardType="decimal-pad"
                suffix="Rs."
                error={visibleErrors.maxBudget}
              />
            </View>
          </View>
          {quantityKg !== null && maxBudgetPerKg !== null && (
            <Text className={`-mt-1 mb-4 text-xs ${ink.faint}`}>
              Maximum budget: {formatLkr(quantityKg * maxBudgetPerKg)}
            </Text>
          )}

          <FormField
            label="Delivery location"
            icon="map-pin"
            value={deliveryLocation}
            onChangeText={setDeliveryLocation}
            placeholder="Shop or warehouse address"
            error={visibleErrors.deliveryLocation}
          />

          <Text className={`mb-2 text-xs font-semibold ${ink.body}`}>Needed by</Text>
          <View className="flex-row flex-wrap gap-2">
            {DEADLINE_OPTIONS.map((option) => (
              <Chip
                key={option.days}
                label={option.label}
                active={deadlineDays === option.days}
                onPress={() => setDeadlineDays(option.days)}
              />
            ))}
          </View>
          <Text className={`mb-4 mt-2 text-xs ${ink.faint}`}>
            Farmers can respond until {formatDate(deadlineDate)}.
          </Text>

          <FormField
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Quality, grade, packing or any other details"
            multiline
          />
        </Card>
      </ScrollView>

      <View
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        className="border-t border-gray-100 bg-white px-4 pt-3 dark:border-slate-700 dark:bg-slate-800"
      >
        <PrimaryButton label="Post Requirement" onPress={handleSubmit} />
      </View>
    </Screen>
  );
};
