import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DISTRICTS } from '../../constants/districts';
import { useSeller } from '../../context/SellerContext';
import { isValidEmail, isValidPhone } from '../../utils/validation';
import { BottomSheet } from './BottomSheet';
import { useSellerTheme } from './theme';
import { FormField, PrimaryButton, SecondaryButton, ink } from './ui';

interface EditProfileSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const EditProfileSheet = ({ visible, onClose }: EditProfileSheetProps) => {
  const theme = useSellerTheme();
  const { profile, updateProfile } = useSeller();
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [district, setDistrict] = useState<string | null>(null);
  const [districtListOpen, setDistrictListOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // Start from the saved profile every time the sheet is opened
  useEffect(() => {
    if (!visible) return;
    setPhone(profile.phone);
    setEmail(profile.email);
    // The saved location may be more specific than a district (e.g. "Colombo 07")
    setDistrict(DISTRICTS.find((item) => item === profile.location) ?? null);
    setDistrictListOpen(false);
    setShowErrors(false);
  }, [visible, profile]);

  const phoneError = isValidPhone(phone) ? undefined : 'Enter a valid phone number, e.g. +94 71 234 5678.';
  const emailError = isValidEmail(email) ? undefined : 'Enter a valid email address.';

  const handleSave = () => {
    if (phoneError || emailError) {
      setShowErrors(true);
      return;
    }
    updateProfile({ phone: phone.trim(), email: email.trim(), ...(district ? { location: district } : {}) });
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Edit Profile"
      footer={
        <View className="flex-row gap-3">
          <View className="flex-1">
            <SecondaryButton label="Cancel" onPress={onClose} />
          </View>
          <View className="flex-1">
            <PrimaryButton label="Save Changes" onPress={handleSave} />
          </View>
        </View>
      }
    >
      <View className="px-5 pt-4">
        <FormField
          label="Phone Number"
          icon="phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+94 71 234 5678"
          error={showErrors ? phoneError : undefined}
        />
        <FormField
          label="Email Address"
          icon="mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="name@example.com"
          error={showErrors ? emailError : undefined}
        />

        <Text className={`mb-1.5 text-xs font-semibold ${ink.body}`}>Location</Text>
        <TouchableOpacity
          onPress={() => setDistrictListOpen((open) => !open)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Select district"
          className="flex-row items-center rounded-xl border border-gray-200 bg-white px-3.5 py-3 dark:border-slate-600 dark:bg-slate-900"
        >
          <Feather name="map-pin" size={18} color={theme.iconMuted} style={{ marginRight: 10 }} />
          <Text className={`flex-1 text-base ${district ? ink.strong : ink.faint}`}>
            {district ?? 'Select district'}
          </Text>
          <Feather name={districtListOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.iconMuted} />
        </TouchableOpacity>
        {districtListOpen && (
          <ScrollView
            nestedScrollEnabled
            style={{ maxHeight: 200 }}
            className="mt-2 rounded-xl border border-gray-200 dark:border-slate-600"
          >
            {DISTRICTS.map((item) => {
              const selected = item === district;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => {
                    setDistrict(item);
                    setDistrictListOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  className={`flex-row items-center justify-between px-4 py-2.5 ${
                    selected ? 'bg-blue-50 dark:bg-blue-500/10' : ''
                  }`}
                >
                  <Text className={`text-sm ${selected ? `font-bold ${ink.accent}` : ink.body}`}>{item}</Text>
                  {selected && <Feather name="check" size={16} color={theme.accent} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
        <View className="h-4" />
      </View>
    </BottomSheet>
  );
};
