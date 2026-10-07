import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { Db } from '../config/db';
import type {
  NotificationCategory,
  NotificationItem,
  NotificationLinkType,
  NotificationSettings,
} from '../types/notification';

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

interface NotificationRow extends RowDataPacket {
  id: number;
  category: NotificationCategory;
  title: string;
  message: string;
  link_type: NotificationLinkType | null;
  link_id: number | null;
  is_read: number;
  created_at: Date;
}

export async function saveNotificationSettings(db: Db, userId: number, settings: NotificationSettings): Promise<void> {
  await db.query<ResultSetHeader>(
    `INSERT INTO notification_settings (user_id, orders, payments, transportation, fulfillment, promotions, security)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE orders = VALUES(orders), payments = VALUES(payments),
       transportation = VALUES(transportation), fulfillment = VALUES(fulfillment),
       promotions = VALUES(promotions), security = VALUES(security)`,
    [
      userId,
      settings.orders,
      settings.payments,
      settings.transportation,
      settings.fulfillment,
      settings.promotions,
      settings.security,
    ],
  );
}

export async function listNotifications(db: Db, userId: number, limit: number): Promise<NotificationItem[]> {
  const [rows] = await db.query<NotificationRow[]>(
    `SELECT id, category, title, message, link_type, link_id, is_read, created_at
       FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT ?`,
    [userId, limit],
  );
  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    title: row.title,
    message: row.message,
    createdAt: row.created_at.toISOString(),
    isRead: row.is_read === 1,
    link: row.link_type && row.link_id ? { type: row.link_type, id: row.link_id } : null,
  }));
}

export async function countUnreadNotifications(db: Db, userId: number): Promise<number> {
  const [rows] = await db.query<(RowDataPacket & { total: number })[]>(
    'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND is_read = FALSE',
    [userId],
  );
  return rows[0].total;
}

/** Returns false when the notification does not exist or belongs to someone else. */
export async function markNotificationRead(db: Db, userId: number, notificationId: number): Promise<boolean> {
  const [rows] = await db.query<RowDataPacket[]>('SELECT id FROM notifications WHERE id = ? AND user_id = ?', [
    notificationId,
    userId,
  ]);
  if (rows.length === 0) return false;
  await db.query<ResultSetHeader>('UPDATE notifications SET is_read = TRUE WHERE id = ?', [notificationId]);
  return true;
}

export async function markAllNotificationsRead(db: Db, userId: number): Promise<void> {
  await db.query<ResultSetHeader>('UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE', [
    userId,
  ]);
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
