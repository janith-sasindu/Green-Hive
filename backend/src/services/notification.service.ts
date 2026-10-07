import type { Db } from '../config/db';
import { findNotificationSettings, insertNotification, NewNotification } from '../models/notification.model';

/**
 * Records a notification for a user unless they have switched that category off.
 * Pass the transaction connection so the notification is only saved if the event it
 * describes is committed.
 */
export async function notify(db: Db, notification: NewNotification): Promise<void> {
  const settings = await findNotificationSettings(db, notification.userId);
  if (!settings[notification.category]) return;
  await insertNotification(db, notification);
}
