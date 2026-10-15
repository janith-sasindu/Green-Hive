import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { AppHeader } from '../../components/seller/AppHeader';
import {
  DEFAULT_MARKET_FILTERS,
  MarketFilterSheet,
  MarketFilters,
} from '../../components/seller/MarketFilterSheet';
import { useSellerTheme } from '../../components/seller/theme';
import { Card, Chip, EmptyState, PrimaryButton, ProductImage, Screen, ink } from '../../components/seller/ui';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import { useSeller } from '../../context/SellerContext';
import { useSellerNavigation } from '../../hooks/useSellerNavigation';
import type { MarketplaceProduct, ProductCategory } from '../../types/seller';
import type { SellerTabParamList } from '../../types/sellerNavigation';
import { formatKg, formatLkr } from '../../utils/format';

const SCREEN_PADDING = 16;
const GRID_GAP = 12;

const sortProducts = (products: MarketplaceProduct[], sort: MarketFilters['sort']): MarketplaceProduct[] => {
  switch (sort) {
    case 'priceLow':
      return [...products].sort((a, b) => a.unitPriceLkr - b.unitPriceLkr);
    case 'priceHigh':
      return [...products].sort((a, b) => b.unitPriceLkr - a.unitPriceLkr);
    case 'quantity':
      return [...products].sort((a, b) => b.quantityAvailableKg - a.quantityAvailableKg);
    default:
      return products;
  }
};

interface ProductCardProps {
  product: MarketplaceProduct;
  width: number;
  onPress: () => void;
}

const ProductCard = ({ product, width, onPress }: ProductCardProps) => {
  const theme = useSellerTheme();
  return (
    <View style={{ width }}>
      <Card onPress={onPress}>
        <View>
          <ProductImage
            uri={product.imageUrl}
            emoji={product.emoji}
            emojiSize={48}
            className="aspect-[5/4] w-full rounded-t-2xl"
          />
          {product.farmer.isVerified && (
            <View className="absolute left-2 top-2 rounded-full bg-green-100 px-2 py-0.5">
              <Text className="text-[11px] font-semibold text-green-700">★ Verified</Text>
            </View>
          )}
        </View>
        <View className="p-3">
          <Text className={`text-[15px] font-bold ${ink.strong}`} numberOfLines={1}>
            {product.productName}
          </Text>
          <Text className={`text-xs ${ink.muted}`} numberOfLines={1}>
            {product.farmer.name}
          </Text>
          <View className="mt-2 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-extrabold text-green-700 dark:text-green-400">
                {formatLkr(product.unitPriceLkr)}
              </Text>
              <Text className={`text-[11px] ${ink.faint}`}>/kg</Text>
            </View>
            <Text className={`text-xs ${ink.muted}`}>{formatKg(product.quantityAvailableKg)}</Text>
          </View>
          <View className="mb-2.5 mt-1 flex-row items-center">
            <Feather name="map-pin" size={12} color={theme.iconMuted} />
            <Text className={`ml-1 flex-1 text-xs ${ink.faint}`} numberOfLines={1}>
              {product.location}
            </Text>
          </View>
          <PrimaryButton label="View Product" size="sm" onPress={onPress} />
        </View>
      </Card>
    </View>
  );
};

export const MarketplaceScreen = () => {
  const navigation = useSellerNavigation();
  const tabNavigation = useNavigation<BottomTabNavigationProp<SellerTabParamList, 'Market'>>();
  const route = useRoute<RouteProp<SellerTabParamList, 'Market'>>();
  const theme = useSellerTheme();
  const { width } = useWindowDimensions();
  const { products } = useSeller();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProductCategory | 'All'>('All');
  const [filters, setFilters] = useState<MarketFilters>(DEFAULT_MARKET_FILTERS);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // A search submitted from the dashboard arrives as a route param; consume it once
  const incomingQuery = route.params?.query;
  useEffect(() => {
    if (incomingQuery === undefined) return;
    setSearch(incomingQuery);
    setCategory('All');
    tabNavigation.setParams({ query: undefined });
  }, [incomingQuery, tabNavigation]);

  const activeProducts = useMemo(() => products.filter((product) => product.status === 'ACTIVE'), [products]);

  const locations = useMemo(
    () => Array.from(new Set(activeProducts.map((product) => product.location))).sort(),
    [activeProducts],
  );

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matches = activeProducts.filter(
      (product) =>
        (category === 'All' || product.category === category) &&
        (!filters.verifiedOnly || product.farmer.isVerified) &&
        (filters.location === null || product.location === filters.location) &&
        (term === '' ||
          [product.productName, product.farmer.name, product.location].some((value) =>
            value.toLowerCase().includes(term),
          )),
    );
    return sortProducts(matches, filters.sort);
  }, [activeProducts, category, filters, search]);

  const hasActiveFilters =
    filters.sort !== DEFAULT_MARKET_FILTERS.sort || filters.verifiedOnly || filters.location !== null;
  const cardWidth = (width - SCREEN_PADDING * 2 - GRID_GAP) / 2;

  const resetAll = () => {
    setSearch('');
    setCategory('All');
    setFilters(DEFAULT_MARKET_FILTERS);
  };

  return (
    <Screen>
      <AppHeader
        title="Marketplace"
        action={
          <TouchableOpacity
            onPress={() => setFilterSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Sort and filter products"
            className="h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-slate-600"
          >
            <Feather name="sliders" size={18} color={theme.icon} />
            {hasActiveFilters && <View className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-600" />}
          </TouchableOpacity>
        }
      />

      <View className="px-4 pt-4">
        <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800">
          <Feather name="search" size={18} color={theme.iconMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
            placeholder="Search products, farmers..."
            placeholderTextColor={theme.placeholder}
            accessibilityLabel="Search products and farmers"
            className={`ml-3 flex-1 py-3.5 text-sm ${ink.strong}`}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} accessibilityLabel="Clear search">
              <Feather name="x" size={18} color={theme.iconMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING, paddingVertical: 12, gap: 8 }}
      >
        <Chip label="All" active={category === 'All'} onPress={() => setCategory('All')} />
        {PRODUCT_CATEGORIES.map((item) => (
          <Chip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />
        ))}
      </ScrollView>

      <FlatList
        data={visibleProducts}
        keyExtractor={(product) => String(product.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: GRID_GAP }}
        contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING, paddingBottom: 24, gap: GRID_GAP }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text className={`text-xs ${ink.faint}`}>
            {visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'} available
          </Text>
        }
        ListEmptyComponent={
          <EmptyState
            emoji="🔍"
            title="No products found"
            message="Try a different search or filter, or post a requirement so farmers can come to you."
          >
            <PrimaryButton label="Clear search & filters" onPress={resetAll} />
          </EmptyState>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            width={cardWidth}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
      />

      <MarketFilterSheet
        visible={filterSheetOpen}
        filters={filters}
        locations={locations}
        onClose={() => setFilterSheetOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setFilterSheetOpen(false);
        }}
      />
    </Screen>
  );
};
