import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SellerStackParamList } from '../types/sellerNavigation';

export type SellerNavigation = NativeStackNavigationProp<SellerStackParamList>;

/** Navigation typed against the seller stack. Tab screens can use it too, as navigate() bubbles up. */
export const useSellerNavigation = () => useNavigation<SellerNavigation>();
