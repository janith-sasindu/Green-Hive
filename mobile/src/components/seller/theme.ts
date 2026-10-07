import type React from 'react';
import { useColorScheme } from 'nativewind';
import type { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

export type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

export const SellerGradients = {
  seller: [Colors.secondary, '#1e88e5'],
  primary: [Colors.primary, Colors.primaryDark],
} as const;

/**
 * Colour values for props that cannot take a className (icons, placeholders, switches).
 * Everything else is themed with Tailwind `dark:` variants.
 */
export const useSellerTheme = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    isDark,
    setDarkMode: (enabled: boolean) => setColorScheme(enabled ? 'dark' : 'light'),
    icon: isDark ? '#e2e8f0' : '#374151',
    iconMuted: isDark ? '#94a3b8' : '#9ca3af',
    placeholder: isDark ? '#64748b' : '#9ca3af',
    accent: isDark ? '#60a5fa' : Colors.secondary,
    surface: isDark ? '#1e293b' : '#ffffff',
    switchTrack: { false: isDark ? '#475569' : '#d1d5db', true: '#22c55e' },
  };
};
