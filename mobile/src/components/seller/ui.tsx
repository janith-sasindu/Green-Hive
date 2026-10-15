import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { BadgeTone } from '../../utils/sellerStatus';
import { FeatherIconName, SellerGradients, useSellerTheme } from './theme';

/** Text colour tokens (light + dark) shared by the seller screens. */
export const ink = {
  strong: 'text-gray-900 dark:text-slate-100',
  body: 'text-gray-600 dark:text-slate-300',
  muted: 'text-gray-500 dark:text-slate-400',
  faint: 'text-gray-400 dark:text-slate-500',
  accent: 'text-[#1565c0] dark:text-blue-400',
};

const CARD = 'rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800';

export const Screen = ({ children }: { children: React.ReactNode }) => (
  <View className="flex-1 bg-[#f1f6f2] dark:bg-slate-900">{children}</View>
);

interface CardProps {
  className?: string;
  onPress?: () => void;
  children: React.ReactNode;
}

export const Card = ({ className = '', onPress, children }: CardProps) =>
  onPress ? (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} className={`${CARD} ${className}`}>
      {children}
    </TouchableOpacity>
  ) : (
    <View className={`${CARD} ${className}`}>{children}</View>
  );

export const SectionLabel = ({ children }: { children: string }) => (
  <Text className={`text-xs font-semibold uppercase tracking-wider ${ink.muted}`}>{children}</Text>
);

const BADGE_TONES: Record<BadgeTone, { container: string; text: string; dot: string }> = {
  blue: { container: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  amber: { container: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-800 dark:text-amber-300', dot: 'bg-amber-500' },
  green: { container: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  red: { container: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  gray: { container: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-600 dark:text-slate-300', dot: 'bg-gray-400' },
  indigo: { container: 'bg-indigo-100 dark:bg-indigo-500/20', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
};

interface StatusBadgeProps {
  label: string;
  tone: BadgeTone;
  showDot?: boolean;
}

export const StatusBadge = ({ label, tone, showDot = true }: StatusBadgeProps) => {
  const styles = BADGE_TONES[tone];
  return (
    <View className={`flex-row items-center self-start rounded-full px-2.5 py-1 ${styles.container}`}>
      {showDot && <View className={`mr-1.5 h-1.5 w-1.5 rounded-full ${styles.dot}`} />}
      <Text className={`text-xs font-semibold ${styles.text}`}>{label}</Text>
    </View>
  );
};

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'md' | 'sm';
}

/** Green gradient call-to-action used for the main action on a screen. */
export const PrimaryButton = ({ label, onPress, disabled = false, loading = false, size = 'md' }: ButtonProps) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    disabled={disabled || loading}
    accessibilityRole="button"
    style={{ opacity: disabled ? 0.5 : 1 }}
  >
    <LinearGradient
      colors={SellerGradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 12,
        minHeight: size === 'sm' ? 38 : 48,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text className="text-center text-sm font-bold text-white">{label}</Text>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

export const SecondaryButton = ({
  label,
  onPress,
  disabled = false,
  size = 'md',
  tone = 'default',
}: ButtonProps & { tone?: 'default' | 'danger' }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    style={{ minHeight: size === 'sm' ? 38 : 48, opacity: disabled ? 0.5 : 1 }}
    className={`items-center justify-center rounded-xl border px-4 ${
      tone === 'danger'
        ? 'border-red-200 bg-red-50 dark:border-red-500/40 dark:bg-red-500/10'
        : 'border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-800'
    }`}
  >
    <Text
      className={`text-center text-sm font-bold ${
        tone === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-slate-200'
      }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export const Chip = ({ label, active, onPress }: ChipProps) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    className={`rounded-full border px-4 py-2 ${
      active ? 'border-blue-600 bg-blue-600' : 'border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800'
    }`}
  >
    <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-gray-600 dark:text-slate-300'}`}>
      {label}
    </Text>
  </TouchableOpacity>
);

interface ProductImageProps {
  uri?: string;
  emoji: string;
  className?: string;
  emojiSize?: number;
}

/** Product photo that falls back to an emoji tile when there is no image or it fails to load. */
export const ProductImage = ({ uri, emoji, className = '', emojiSize = 28 }: ProductImageProps) => {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return (
      <View className={`items-center justify-center bg-green-50 dark:bg-slate-700 ${className}`}>
        <Text style={{ fontSize: emojiSize }}>{emoji}</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      resizeMode="cover"
      onError={() => setFailed(true)}
      className={`bg-gray-100 dark:bg-slate-700 ${className}`}
    />
  );
};

interface EmptyStateProps {
  emoji: string;
  title: string;
  message: string;
  children?: React.ReactNode;
}

export const EmptyState = ({ emoji, title, message, children }: EmptyStateProps) => (
  <View className="items-center px-8 py-12">
    <Text style={{ fontSize: 40 }}>{emoji}</Text>
    <Text className={`mt-3 text-center text-base font-bold ${ink.strong}`}>{title}</Text>
    <Text className={`mt-1 text-center text-sm leading-5 ${ink.muted}`}>{message}</Text>
    {children && <View className="mt-5 self-stretch">{children}</View>}
  </View>
);

interface FormFieldProps extends TextInputProps {
  label: string;
  icon?: FeatherIconName;
  error?: string;
  suffix?: string;
}

export const FormField = ({ label, icon, error, suffix, multiline, ...inputProps }: FormFieldProps) => {
  const theme = useSellerTheme();
  return (
    <View className="mb-4">
      <Text className={`mb-1.5 text-xs font-semibold ${ink.body}`}>{label}</Text>
      <View
        className={`flex-row rounded-xl border bg-white px-3.5 dark:bg-slate-900 ${
          multiline ? 'items-start' : 'items-center'
        } ${error ? 'border-red-400' : 'border-gray-200 dark:border-slate-600'}`}
      >
        {icon && <Feather name={icon} size={18} color={theme.iconMuted} style={{ marginRight: 10 }} />}
        <TextInput
          {...inputProps}
          multiline={multiline}
          accessibilityLabel={label}
          placeholderTextColor={theme.placeholder}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={multiline ? { minHeight: 88 } : undefined}
          className={`flex-1 py-3 text-base ${ink.strong}`}
        />
        {suffix && <Text className={`ml-2 text-sm font-semibold ${ink.faint}`}>{suffix}</Text>}
      </View>
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
};

interface InfoRowProps {
  icon: FeatherIconName;
  label: string;
  value: string;
}

export const InfoRow = ({ icon, label, value }: InfoRowProps) => {
  const theme = useSellerTheme();
  return (
    <View className="flex-row items-center">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-700">
        <Feather name={icon} size={18} color={theme.icon} />
      </View>
      <View className="flex-1">
        <Text className={`text-xs ${ink.faint}`}>{label}</Text>
        <Text className={`text-sm font-semibold ${ink.strong}`}>{value}</Text>
      </View>
    </View>
  );
};

/** Pickup (green) and delivery (red) locations of a transport job. */
export const RouteSummary = ({ pickup, delivery }: { pickup: string; delivery: string }) => (
  <View className="gap-1.5">
    <View className="flex-row items-center">
      <View className="mr-2.5 h-2 w-2 rounded-full bg-green-500" />
      <Text className={`flex-1 text-sm ${ink.body}`}>{pickup}</Text>
    </View>
    <View className="flex-row items-center">
      <View className="mr-2.5 h-2 w-2 rounded-full bg-red-500" />
      <Text className={`flex-1 text-sm ${ink.body}`}>{delivery}</Text>
    </View>
  </View>
);

export const PaymentProtectionBanner = ({ message }: { message?: string }) => (
  <View className="flex-row rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-500/30 dark:bg-green-500/10">
    <Text className="mr-3 text-2xl">🔒</Text>
    <View className="flex-1">
      <Text className="text-sm font-bold text-green-800 dark:text-green-300">Green Hive Payment Protection</Text>
      <Text className="mt-1 text-xs leading-5 text-green-700 dark:text-green-400">
        {message ??
          'Your payments are held securely until the transaction conditions are met. Release only happens after pickup or delivery confirmation.'}
      </Text>
    </View>
  </View>
);

export interface TimelineStep {
  title: string;
  description?: string;
  done: boolean;
}

export const Timeline = ({ steps }: { steps: TimelineStep[] }) => (
  <View>
    {steps.map((step, index) => {
      const isLast = index === steps.length - 1;
      return (
        <View key={step.title} className="flex-row">
          <View className="mr-3 items-center">
            <View
              className={`h-6 w-6 items-center justify-center rounded-full ${
                step.done ? 'bg-green-500' : 'border-2 border-gray-300 dark:border-slate-600'
              }`}
            >
              {step.done && <Feather name="check" size={14} color="#ffffff" />}
            </View>
            {!isLast && (
              <View
                style={{ minHeight: 18 }}
                className={`w-0.5 flex-1 ${step.done ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-700'}`}
              />
            )}
          </View>
          <View className={`flex-1 ${isLast ? '' : 'pb-4'}`}>
            <Text className={`text-sm font-semibold ${step.done ? ink.strong : ink.faint}`}>{step.title}</Text>
            {step.description && <Text className={`mt-0.5 text-xs leading-4 ${ink.muted}`}>{step.description}</Text>}
          </View>
        </View>
      );
    })}
  </View>
);

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** In-app confirmation prompt (Alert.alert is not available on every platform). */
export const ConfirmDialog = ({ visible, title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) => (
  <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
    <View className="flex-1 items-center justify-center bg-black/50 px-6">
      <View className="w-full max-w-sm rounded-2xl bg-white p-5 dark:bg-slate-800">
        <Text className={`text-lg font-bold ${ink.strong}`}>{title}</Text>
        <Text className={`mt-2 text-sm leading-5 ${ink.body}`}>{message}</Text>
        <View className="mt-5 flex-row gap-3">
          <View className="flex-1">
            <SecondaryButton label="Cancel" onPress={onCancel} />
          </View>
          <View className="flex-1">
            <PrimaryButton label={confirmLabel} onPress={onConfirm} />
          </View>
        </View>
      </View>
    </View>
  </Modal>
);
