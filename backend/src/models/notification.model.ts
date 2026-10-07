import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { Db } from '../config/db';
import type { NotificationCategory, NotificationLinkType, NotificationSettings } from '../types/notification';

type SettingsRow = RowDataPacket & Record<NotificationCategory, number>;

// Matches the column defaults of notification_settings
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  orders: true,
  payments: true,
  transportation: true,
  fulfillment: true,
  promotions: false,
  security: true,
};

export interface NewNotification {
  userId: number;
  category: NotificationCategory;
  title: string;
  message: string;
  link?: { type: NotificationLinkType; id: number };
}

export async function findNotificationSettings(db: Db, userId: number): Promise<NotificationSettings> {
  const [rows] = await db.query<SettingsRow[]>(
    `SELECT orders, payments, transportation, fulfillment, promotions, security
       FROM notification_settings WHERE user_id = ?`,
    [userId],
  );
  const row = rows[0];
  if (!row) return DEFAULT_NOTIFICATION_SETTINGS;
  return {
    orders: row.orders === 1,
    payments: row.payments === 1,
    transportation: row.transportation === 1,
    fulfillment: row.fulfillment === 1,
    promotions: row.promotions === 1,
    security: row.security === 1,
  };
}

export async function insertNotification(db: Db, notification: NewNotification): Promise<void> {
  await db.query<ResultSetHeader>(
    `INSERT INTO notifications (user_id, category, title, message, link_type, link_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      notification.userId,
      notification.category,
      notification.title,
      notification.message,
      notification.link?.type ?? null,
      notification.link?.id ?? null,
    ],
  );
}
