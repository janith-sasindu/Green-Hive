import { pool } from '../config/db';
import { countUnreadNotifications } from '../models/notification.model';
import { getSellerOrderStats, listSellerOrders } from '../models/order.model';
import { listOpenRequirements } from '../models/requirement.model';
import type { DashboardSummary } from '../types/seller';

const RECENT_ORDER_COUNT = 3;
const OPEN_REQUIREMENT_COUNT = 2;

export async function getSellerDashboard(sellerId: number): Promise<DashboardSummary> {
  const [stats, recentOrders, openRequirements, unreadNotifications] = await Promise.all([
    getSellerOrderStats(pool, sellerId),
    listSellerOrders(pool, sellerId, 'all', RECENT_ORDER_COUNT),
    listOpenRequirements(pool, sellerId, OPEN_REQUIREMENT_COUNT),
    countUnreadNotifications(pool, sellerId),
  ]);
  return { stats, recentOrders, openRequirements, unreadNotifications };
}
