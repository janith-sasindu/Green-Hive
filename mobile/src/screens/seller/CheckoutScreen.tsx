import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { AppHeader } from '../../components/seller/AppHeader';
import { FeatherIconName, useSellerTheme } from '../../components/seller/theme';
import {
  Card,
  Chip,
  EmptyState,
  FormField,
  PaymentProtectionBanner,
  PrimaryButton,
  ProductImage,
  Screen,
  SectionLabel,
  ink,
} from '../../components/seller/ui';
import { CATEGORY_EMOJI } from '../../constants/productCategories';
import { useSeller } from '../../context/SellerContext';
import { useSellerNavigation } from '../../hooks/useSellerNavigation';
import type { DeliveryMethod, FarmerSummary, ProductCategory } from '../../types/seller';
import type { CheckoutSource, SellerStackParamList } from '../../types/sellerNavigation';
import { addDays, formatKg, formatLkr, formatShortDate, toDateString } from '../../utils/format';
import { parsePositiveNumber } from '../../utils/validation';

const DEFAULT_QUANTITY_KG = 50;
const QUANTITY_STEP_KG = 10;
const DELIVERY_DAY_OPTIONS = 5;
const TIME_SLOTS = ['06:00 AM', '08:00 AM', '10:00 AM', '02:00 PM', '04:00 PM'];
// Stands in for the payment gateway round trip until PayHere is integrated
const PAYMENT_DELAY_MS = 900;

interface CheckoutLine {
  productName: string;
  farmer: FarmerSummary;
  pricePerKg: number;
  pickupAddress: string;
  emoji: string;
  imageUrl?: string;
  availableKg: number;
  /** Set when the quantity was already agreed in a fulfillment request. */
  fixedQuantityKg?: number;
  deliveryLocation: string;
}

/** Resolves what is being paid for: a marketplace advertisement or an accepted fulfillment request. */
const useCheckoutLine = (source: CheckoutSource): CheckoutLine | null => {
  const { products, fulfillmentRequests, requirements, profile } = useSeller();

  if (source.kind === 'product') {
    const product = products.find((item) => item.id === source.productId);
    if (!product) return null;
    return {
      productName: product.productName,
      farmer: product.farmer,
      pricePerKg: product.unitPriceLkr,
      pickupAddress: product.pickupAddress,
      emoji: product.emoji,
      imageUrl: product.imageUrl,
      availableKg: product.quantityAvailableKg,
      deliveryLocation: profile.address,
    };
  }

  const request = fulfillmentRequests.find((item) => item.id === source.requestId);
  const requirement = requirements.find((item) => item.id === request?.requirementId);
  if (!request || !requirement) return null;
  return {
    productName: requirement.productName,
    farmer: request.farmer,
    pricePerKg: request.offeredPricePerKg,
    pickupAddress: request.pickupAddress,
    emoji: CATEGORY_EMOJI[requirement.category as ProductCategory] ?? '📦',
    availableKg: request.offeredQuantityKg,
    fixedQuantityKg: request.offeredQuantityKg,
    deliveryLocation: requirement.deliveryLocation,
  };
};

interface MethodOptionProps {
  icon: FeatherIconName;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}

const MethodOption = ({ icon, title, description, selected, onPress }: MethodOptionProps) => {
  const theme = useSellerTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`flex-row items-center rounded-2xl border-2 p-4 ${
        selected
          ? 'border-blue-600 bg-blue-50 dark:bg-blue-500/10'
          : 'border-gray-100 bg-white dark:border-slate-700 dark:bg-slate-800'
      }`}
    >
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-700">
        <Feather name={icon} size={18} color={selected ? theme.accent : theme.iconMuted} />
      </View>
      <View className="flex-1 pr-3">
        <Text className={`text-sm font-bold ${ink.strong}`}>{title}</Text>
        <Text className={`mt-0.5 text-xs leading-4 ${ink.muted}`}>{description}</Text>
      </View>
      <View
        className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
          selected ? 'border-blue-600' : 'border-gray-300 dark:border-slate-500'
        }`}
      >
        {selected && <View className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
      </View>
    </TouchableOpacity>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-start justify-between py-1.5">
    <Text className={`flex-1 pr-3 text-sm ${ink.muted}`}>{label}</Text>
    <Text className={`text-sm font-semibold ${ink.strong}`}>{value}</Text>
  </View>
);

export const CheckoutScreen = () => {
  const navigation = useSellerNavigation();
  const insets = useSafeAreaInsets();
  const theme = useSellerTheme();
  const { params } = useRoute<RouteProp<SellerStackParamList, 'Checkout'>>();
  const { placeOrder } = useSeller();
  const line = useCheckoutLine(params);

  const dateOptions = useMemo(
    () => Array.from({ length: DELIVERY_DAY_OPTIONS }, (_, index) => addDays(new Date(), index + 1)),
    [],
  );

  const [quantityText, setQuantityText] = useState(() =>
    line ? String(Math.min(DEFAULT_QUANTITY_KG, line.availableKg)) : '',
  );
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('SELF_PICKUP');
  const [deliveryLocation, setDeliveryLocation] = useState(line?.deliveryLocation ?? '');
  const [requiredDate, setRequiredDate] = useState(() => toDateString(dateOptions[0]));
  const [requiredTime, setRequiredTime] = useState(TIME_SLOTS[1]);
  const [isPaying, setIsPaying] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const paymentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (paymentTimer.current) clearTimeout(paymentTimer.current);
    },
    [],
  );

  if (!line) {
    return (
      <Screen>
        <AppHeader title="Checkout" showBack />
        <EmptyState emoji="🧺" title="Nothing to check out" message="This item is no longer available." />
      </Screen>
    );
  }

  const isQuantityFixed = line.fixedQuantityKg !== undefined;
  const quantityKg = line.fixedQuantityKg ?? parsePositiveNumber(quantityText);
  const needsTransport = deliveryMethod === 'TRANSPORTATION';

  // Validation is paused while paying: the stock changes as soon as the order is placed
  let quantityError: string | undefined;
  if (!isPaying && !isQuantityFixed) {
    if (quantityKg === null) quantityError = 'Enter the quantity you want in kg.';
    else if (quantityKg > line.availableKg) quantityError = `Only ${formatKg(line.availableKg)} available.`;
  }
  const locationError =
    needsTransport && deliveryLocation.trim() === '' ? 'Enter where the goods should be delivered.' : undefined;

  const productAmount = (quantityKg ?? 0) * line.pricePerKg;
  const canPay = quantityKg !== null && !quantityError && !locationError;

  const changeQuantity = (delta: number) => {
    const next = Math.min(line.availableKg, Math.max(QUANTITY_STEP_KG, (quantityKg ?? 0) + delta));
    setQuantityText(String(next));
  };

  const handlePay = () => {
    if (!canPay || quantityKg === null) return;
    setSubmitError(null);
    setIsPaying(true);
    paymentTimer.current = setTimeout(() => {
      try {
        const order = placeOrder({
          source:
            params.kind === 'product'
              ? { kind: 'product', productId: params.productId, quantityKg }
              : { kind: 'fulfillment', requestId: params.requestId },
          deliveryMethod,
          transport: needsTransport ? { deliveryLocation, requiredDate, requiredTime } : undefined,
        });
        navigation.replace('OrderDetail', { orderId: order.id, justPlaced: true });
      } catch (error) {
        setIsPaying(false);
        setSubmitError(error instanceof Error ? error.message : 'The order could not be placed. Please try again.');
      }
    }, PAYMENT_DELAY_MS);
  };

  return (
    <Screen>
      <AppHeader title="Checkout" showBack />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <Card className="flex-row items-center p-3.5">
          <ProductImage uri={line.imageUrl} emoji={line.emoji} className="h-14 w-14 rounded-xl" />
          <View className="ml-3 flex-1">
            <Text className={`text-base font-bold ${ink.strong}`} numberOfLines={1}>
              {line.productName}
            </Text>
            <Text className={`text-xs ${ink.muted}`} numberOfLines={1}>
              {line.farmer.name} · {line.farmer.location}
            </Text>
            <Text className="mt-0.5 text-sm font-bold text-green-700 dark:text-green-400">
              {formatLkr(line.pricePerKg)} /kg
            </Text>
          </View>
        </Card>

        <Card className="mt-3 p-4">
          <SectionLabel>Quantity</SectionLabel>
          {isQuantityFixed ? (
            <Text className={`mt-2 text-sm leading-5 ${ink.body}`}>
              <Text className={`font-bold ${ink.strong}`}>{formatKg(line.availableKg)}</Text> at{' '}
              {formatLkr(line.pricePerKg)}/kg, as offered in the farmer's fulfillment request.
            </Text>
          ) : (
            <>
              <View className="mt-3 flex-row items-center">
                <TouchableOpacity
                  onPress={() => changeQuantity(-QUANTITY_STEP_KG)}
                  accessibilityRole="button"
                  accessibilityLabel={`Decrease quantity by ${QUANTITY_STEP_KG} kg`}
                  className="h-11 w-11 items-center justify-center rounded-xl border border-gray-200 dark:border-slate-600"
                >
                  <Feather name="minus" size={18} color={theme.icon} />
                </TouchableOpacity>
                <View
                  className={`mx-3 flex-1 flex-row items-center rounded-xl border px-3.5 ${
                    quantityError ? 'border-red-400' : 'border-gray-200 dark:border-slate-600'
                  }`}
                >
                  <TextInput
                    value={quantityText}
                    onChangeText={setQuantityText}
                    keyboardType="decimal-pad"
                    accessibilityLabel="Quantity in kilograms"
                    placeholder="0"
                    placeholderTextColor={theme.placeholder}
                    className={`flex-1 py-2.5 text-center text-lg font-bold ${ink.strong}`}
                  />
                  <Text className={`text-sm font-semibold ${ink.faint}`}>kg</Text>
                </View>
                <TouchableOpacity
                  onPress={() => changeQuantity(QUANTITY_STEP_KG)}
                  accessibilityRole="button"
                  accessibilityLabel={`Increase quantity by ${QUANTITY_STEP_KG} kg`}
                  className="h-11 w-11 items-center justify-center rounded-xl border border-gray-200 dark:border-slate-600"
                >
                  <Feather name="plus" size={18} color={theme.icon} />
                </TouchableOpacity>
              </View>
              <Text className={`mt-2 text-xs ${quantityError ? 'text-red-500' : ink.faint}`}>
                {quantityError ?? `${formatKg(line.availableKg)} available from this farmer`}
              </Text>
            </>
          )}
        </Card>

        <View className="mb-3 mt-5">
          <SectionLabel>Delivery method</SectionLabel>
        </View>
        <View className="gap-3">
          <MethodOption
            icon="map-pin"
            title="Self Pickup"
            description="Collect the goods from the farmer yourself. The farmer is paid when you confirm receipt."
            selected={deliveryMethod === 'SELF_PICKUP'}
            onPress={() => setDeliveryMethod('SELF_PICKUP')}
          />
          <MethodOption
            icon="truck"
            title="Transportation Required"
            description="Transporters submit their costs for this delivery and you choose the one that suits you."
            selected={needsTransport}
            onPress={() => setDeliveryMethod('TRANSPORTATION')}
          />
        </View>

        {needsTransport ? (
          <Card className="mt-3 p-4">
            <FormField
              label="Delivery location"
              icon="map-pin"
              value={deliveryLocation}
              onChangeText={setDeliveryLocation}
              placeholder="Shop or warehouse address"
              error={locationError}
            />
            <Text className={`mb-2 text-xs font-semibold ${ink.body}`}>Delivery date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {dateOptions.map((date, index) => {
                const value = toDateString(date);
                return (
                  <Chip
                    key={value}
                    label={index === 0 ? 'Tomorrow' : formatShortDate(date)}
                    active={requiredDate === value}
                    onPress={() => setRequiredDate(value)}
                  />
                );
              })}
            </ScrollView>
            <Text className={`mb-2 mt-4 text-xs font-semibold ${ink.body}`}>Preferred time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {TIME_SLOTS.map((slot) => (
                <Chip key={slot} label={slot} active={requiredTime === slot} onPress={() => setRequiredTime(slot)} />
              ))}
            </ScrollView>
          </Card>
        ) : (
          <Card className="mt-3 flex-row items-center p-4">
            <Feather name="map-pin" size={16} color={theme.iconMuted} />
            <View className="ml-3 flex-1">
              <Text className={`text-xs ${ink.faint}`}>Collect from</Text>
              <Text className={`text-sm font-semibold ${ink.strong}`}>{line.pickupAddress}</Text>
            </View>
          </Card>
        )}

        <Card className="mt-3 p-4">
          <SectionLabel>Payment summary</SectionLabel>
          <View className="mt-2">
            <SummaryRow
              label={`Product (${formatKg(quantityKg ?? 0)} × ${formatLkr(line.pricePerKg)})`}
              value={formatLkr(productAmount)}
            />
            <SummaryRow
              label="Transportation"
              value={needsTransport ? 'Paid after you approve an offer' : 'Not required'}
            />
          </View>
          <View className="mt-2 flex-row items-center justify-between border-t border-gray-100 pt-3 dark:border-slate-700">
            <Text className={`text-sm font-bold ${ink.strong}`}>Pay now</Text>
            <Text className={`text-xl font-extrabold ${ink.strong}`}>{formatLkr(productAmount)}</Text>
          </View>
        </Card>

        <View className="mt-3">
          <PaymentProtectionBanner
            message={
              needsTransport
                ? 'Your payment is held by Green Hive and released to the farmer only after the transporter confirms pickup.'
                : 'Your payment is held by Green Hive and released to the farmer only after you confirm receipt of the goods.'
            }
          />
        </View>

        {submitError && (
          <View className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-500/40 dark:bg-red-500/10">
            <Text className="text-sm text-red-600 dark:text-red-400">{submitError}</Text>
          </View>
        )}
      </ScrollView>

      <View
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        className="border-t border-gray-100 bg-white px-4 pt-3 dark:border-slate-700 dark:bg-slate-800"
      >
        <PrimaryButton
          label={`Pay ${formatLkr(productAmount)}`}
          onPress={handlePay}
          disabled={!canPay}
          loading={isPaying}
        />
        <Text className={`mt-2 text-center text-[11px] ${ink.faint}`}>
          Demo checkout: payment is simulated until the payment gateway is connected.
        </Text>
      </View>
    </Screen>
  );
};
