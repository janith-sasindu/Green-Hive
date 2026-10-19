import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { AppHeader } from '../../components/seller/AppHeader';
import {
  Card,
  EmptyState,
  InfoRow,
  PaymentProtectionBanner,
  PrimaryButton,
  ProductImage,
  Screen,
  SectionLabel,
  StatusBadge,
  ink,
} from '../../components/seller/ui';
import { useSeller } from '../../context/SellerContext';
import { useSellerNavigation } from '../../hooks/useSellerNavigation';
import type { SellerStackParamList } from '../../types/sellerNavigation';
import { formatDate, formatKg, formatLkr, getInitial } from '../../utils/format';

export const ProductDetailScreen = () => {
  const navigation = useSellerNavigation();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<SellerStackParamList, 'ProductDetail'>>();
  const { products } = useSeller();
  const product = products.find((item) => item.id === params.productId);

  if (!product) {
    return (
      <Screen>
        <AppHeader title="Product Details" showBack />
        <EmptyState emoji="🥬" title="Product not found" message="This advertisement is no longer listed." />
      </Screen>
    );
  }

  const isAvailable = product.status === 'ACTIVE';

  return (
    <Screen>
      <AppHeader title="Product Details" showBack />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <ProductImage uri={product.imageUrl} emoji={product.emoji} emojiSize={84} className="h-60 w-full" />

        <View className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className={`text-2xl font-extrabold ${ink.strong}`}>{product.productName}</Text>
              <Text className={`mt-0.5 text-sm ${ink.muted}`}>{product.category}</Text>
            </View>
            {!isAvailable && <StatusBadge label="Sold Out" tone="red" />}
          </View>

          <View className="mt-3 flex-row items-end">
            <Text className="text-3xl font-extrabold text-green-700 dark:text-green-400">
              {formatLkr(product.unitPriceLkr)}
            </Text>
            <Text className={`mb-1 ml-1 text-sm ${ink.muted}`}>/kg</Text>
          </View>

          <Card className="mt-4 flex-row p-4">
            <View className="flex-1">
              <Text className={`text-xs ${ink.faint}`}>Available</Text>
              <Text className={`mt-0.5 text-base font-bold ${ink.strong}`}>
                {formatKg(product.quantityAvailableKg)}
              </Text>
            </View>
            <View className="flex-1 border-l border-gray-100 pl-4 dark:border-slate-700">
              <Text className={`text-xs ${ink.faint}`}>Available until</Text>
              <Text className={`mt-0.5 text-base font-bold ${ink.strong}`}>
                {formatDate(product.availabilityEndDate)}
              </Text>
            </View>
          </Card>

          <Card className="mt-3 p-4">
            <SectionLabel>Farmer</SectionLabel>
            <View className="mt-3 flex-row items-center">
              <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                <Text className="text-base font-bold text-green-800 dark:text-green-300">
                  {getInitial(product.farmer.name)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className={`text-base font-bold ${ink.strong}`}>{product.farmer.name}</Text>
                <Text className={`text-xs ${ink.muted}`}>
                  {product.farmer.location} · ★ {product.farmer.rating.toFixed(1)}
                </Text>
              </View>
              {product.farmer.isVerified && <StatusBadge label="★ Verified" tone="green" showDot={false} />}
            </View>
          </Card>

          <Card className="mt-3 p-4">
            <SectionLabel>Description</SectionLabel>
            <Text className={`mt-2 text-sm leading-5 ${ink.body}`}>{product.description}</Text>
          </Card>

          <Card className="mt-3 gap-4 p-4">
            <InfoRow icon="map-pin" label="Pickup location" value={product.pickupAddress} />
            <InfoRow
              icon="calendar"
              label="Availability period"
              value={`${formatDate(product.availabilityStartDate)} – ${formatDate(product.availabilityEndDate)}`}
            />
          </Card>

          <View className="mt-3">
            <PaymentProtectionBanner />
          </View>
        </View>
      </ScrollView>

      <View
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        className="flex-row items-center border-t border-gray-100 bg-white px-4 pt-3 dark:border-slate-700 dark:bg-slate-800"
      >
        <View className="flex-1">
          <Text className={`text-xs ${ink.faint}`}>Price per kg</Text>
          <Text className={`text-lg font-extrabold ${ink.strong}`}>{formatLkr(product.unitPriceLkr)}</Text>
        </View>
        <View className="flex-1">
          <PrimaryButton
            label={isAvailable ? 'Order Now' : 'Sold Out'}
            disabled={!isAvailable}
            onPress={() => navigation.navigate('Checkout', { kind: 'product', productId: product.id })}
          />
        </View>
      </View>
    </Screen>
  );
};
