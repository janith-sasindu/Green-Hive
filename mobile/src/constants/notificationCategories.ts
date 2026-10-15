import type { NotificationCategory } from '../types/seller';

interface NotificationCategoryMeta {
  label: string;
  description: string;
  emoji: string;
  /** Background of the icon tile in the notification list. */
  tileClassName: string;
}

export const NOTIFICATION_CATEGORIES: Record<NotificationCategory, NotificationCategoryMeta> = {
  orders: {
    label: 'Orders',
    description: 'New orders, confirmations & status updates',
    emoji: '📦',
    tileClassName: 'bg-blue-100 dark:bg-blue-500/20',
  },
  payments: {
    label: 'Payments',
    description: 'Payment received, released & held updates',
    emoji: '💳',
    tileClassName: 'bg-green-100 dark:bg-green-500/20',
  },
  transportation: {
    label: 'Transportation',
    description: 'New transport offers & delivery updates',
    emoji: '🚛',
    tileClassName: 'bg-amber-100 dark:bg-amber-500/20',
  },
  fulfillment: {
    label: 'Fulfillment',
    description: 'Requirement matches & fulfillment requests',
    emoji: '📋',
    tileClassName: 'bg-purple-100 dark:bg-purple-500/20',
  },
  promotions: {
    label: 'Promotions',
    description: 'Deals, tips and platform announcements',
    emoji: '📢',
    tileClassName: 'bg-pink-100 dark:bg-pink-500/20',
  },
  security: {
    label: 'Security Alerts',
    description: 'Login activity and account changes',
    emoji: '🔒',
    tileClassName: 'bg-gray-100 dark:bg-slate-700',
  },
};

// Display order in the notification settings sheet
export const NOTIFICATION_CATEGORY_ORDER: NotificationCategory[] = [
  'orders',
  'payments',
  'transportation',
  'fulfillment',
  'promotions',
  'security',
];
