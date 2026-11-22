import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, CreditCard, Truck, RefreshCw, Loader2 } from 'lucide-react';
import StatCard from '../components/dashbord/StatCard';
import RoleCard from '../components/dashbord/RoleCard';
import OrdersChart from '../components/dashbord/OrdersChart';
import UserGrowthChart from '../components/dashbord/UserGrowthChart';
import TransactionVolumeChart from '../components/dashbord/TransactionVolumeChart';
import { getDashboardStats, getDashboardCharts } from '../services/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: '0',
    activeOrders: '0',
    heldPayments: 'Rs. 0',
    transportJobs: '0',
  });

  const [roleCounts, setRoleCounts] = useState({
    farmers: 0,
    sellers: 0,
    transporters: 0,
  });

  const [chartsData, setChartsData] = useState<{
    ordersOverTime: any[];
    userGrowth: any[];
    transactionVolume: any[];
  }>({
    ordersOverTime: [],
    userGrowth: [],
    transactionVolume: [],
  });

  // Fetch Live Dashboard Stats and Charts
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartsRes] = await Promise.all([
        getDashboardStats(),
        getDashboardCharts(),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setRoleCounts(statsRes.data.roleCounts);
      }

      if (chartsRes.data.success) {
        setChartsData({
          ordersOverTime: chartsRes.data.ordersOverTime,
          userGrowth: chartsRes.data.userGrowth,
          transactionVolume: chartsRes.data.transactionVolume,
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Live Sync Status & Refresh */}
      <div className="flex items-center justify-between">
        {/* <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {loading ? (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Syncing live metrics from Aiven Cloud...
            </span>
          ) : (
            <span>🟢 Real-time database metrics connected</span>
          )}
        </div> */}

        <button
          onClick={fetchDashboardData}
          title="Refresh Dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-700 text-xs font-medium rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 1. Overview Stat Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          subtext="Active platform participants"
          icon={Users}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Active Orders"
          value={stats.activeOrders}
          subtext="Current active market orders"
          icon={ShoppingBag}
          iconBgColor="bg-blue-50 dark:bg-blue-950/60"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Held Payments"
          value={stats.heldPayments}
          subtext="In secure escrow"
          icon={CreditCard}
          iconBgColor="bg-amber-50 dark:bg-amber-950/60"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Transport Jobs"
          value={stats.transportJobs}
          subtext="Active transport deliveries"
          icon={Truck}
          iconBgColor="bg-purple-50 dark:bg-purple-950/60"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </section>

      {/* 2. Role Breakdown Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RoleCard
          count={roleCounts.farmers}
          label="Farmers"
          emoji="🌱"
          theme="emerald"
        />
        <RoleCard
          count={roleCounts.sellers}
          label="Sellers"
          emoji="🎁"
          theme="blue"
        />
        <RoleCard
          count={roleCounts.transporters}
          label="Transporters"
          emoji="🚚"
          theme="amber"
        />
      </section>

      {/* 3. Orders and User Growth Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersChart data={chartsData.ordersOverTime} />
        <UserGrowthChart data={chartsData.userGrowth} />
      </section>

      {/* 4. Transaction Volume Chart */}
      <section>
        <TransactionVolumeChart data={chartsData.transactionVolume} />
      </section>
    </div>
  );
}