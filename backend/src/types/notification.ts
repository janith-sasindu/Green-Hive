export const NOTIFICATION_CATEGORIES = [
  'orders',
  'payments',
  'transportation',
  'fulfillment',
  'promotions',
  'security',
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export type NotificationSettings = Record<NotificationCategory, boolean>;

/** The kind of record a notification points to, so the app can open it. */
export type NotificationLinkType = 'ORDER' | 'TRANSPORT_JOB' | 'REQUIREMENT';
