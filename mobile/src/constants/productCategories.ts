import type { ProductCategory } from '../types/seller';

export const PRODUCT_CATEGORIES: ProductCategory[] = ['Vegetables', 'Fruits', 'Grains & Rice', 'Spices'];

// Shown in place of a product photo when no image is available
export const CATEGORY_EMOJI: Record<ProductCategory, string> = {
  Vegetables: '🥬',
  Fruits: '🍌',
  'Grains & Rice': '🌾',
  Spices: '🌶️',
};
