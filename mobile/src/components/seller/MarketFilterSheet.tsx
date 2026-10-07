import React, { useEffect, useState } from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { useSellerTheme } from './theme';
import { Chip, PrimaryButton, SecondaryButton, SectionLabel, ink } from './ui';

export type MarketSort = 'recommended' | 'priceLow' | 'priceHigh' | 'quantity';

export interface MarketFilters {
  sort: MarketSort;
  verifiedOnly: boolean;
  /** Farmer location to show, or null for every location. */
  location: string | null;
}

export const DEFAULT_MARKET_FILTERS: MarketFilters = { sort: 'recommended', verifiedOnly: false, location: null };

const SORT_OPTIONS: { value: MarketSort; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'priceLow', label: 'Price: low to high' },
  { value: 'priceHigh', label: 'Price: high to low' },
  { value: 'quantity', label: 'Largest quantity available' },
];

interface MarketFilterSheetProps {
  visible: boolean;
  filters: MarketFilters;
  locations: string[];
  onApply: (filters: MarketFilters) => void;
  onClose: () => void;
}

export const MarketFilterSheet = ({ visible, filters, locations, onApply, onClose }: MarketFilterSheetProps) => {
  const theme = useSellerTheme();
  const [draft, setDraft] = useState(filters);

  // Start from the applied filters every time the sheet is opened
  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Sort & Filter"
      icon="sliders"
      footer={
        <View className="flex-row gap-3">
          <View className="flex-1">
            <SecondaryButton label="Reset" onPress={() => setDraft(DEFAULT_MARKET_FILTERS)} />
          </View>
          <View className="flex-1">
            <PrimaryButton label="Apply Filters" onPress={() => onApply(draft)} />
          </View>
        </View>
      }
    >
      <View className="px-5 py-4">
        <SectionLabel>Sort by</SectionLabel>
        <View className="mt-2">
          {SORT_OPTIONS.map((option) => {
            const selected = draft.sort === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setDraft({ ...draft, sort: option.value })}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className="flex-row items-center py-2.5"
              >
                <View
                  className={`mr-3 h-5 w-5 items-center justify-center rounded-full border-2 ${
                    selected ? 'border-blue-600' : 'border-gray-300 dark:border-slate-500'
                  }`}
                >
                  {selected && <View className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
                </View>
                <Text className={`text-sm ${selected ? `font-semibold ${ink.strong}` : ink.body}`}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mt-3 flex-row items-center justify-between border-t border-gray-100 py-4 dark:border-slate-700">
          <View className="flex-1 pr-3">
            <Text className={`text-sm font-semibold ${ink.strong}`}>Verified farmers only</Text>
            <Text className={`text-xs ${ink.muted}`}>Show products from farmers verified by Green Hive</Text>
          </View>
          <Switch
            value={draft.verifiedOnly}
            onValueChange={(verifiedOnly) => setDraft({ ...draft, verifiedOnly })}
            trackColor={theme.switchTrack}
            thumbColor="#ffffff"
          />
        </View>

        <View className="border-t border-gray-100 pt-4 dark:border-slate-700">
          <SectionLabel>Farmer location</SectionLabel>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <Chip label="All" active={draft.location === null} onPress={() => setDraft({ ...draft, location: null })} />
            {locations.map((location) => (
              <Chip
                key={location}
                label={location}
                active={draft.location === location}
                onPress={() => setDraft({ ...draft, location })}
              />
            ))}
          </View>
        </View>
      </View>
    </BottomSheet>
  );
};
