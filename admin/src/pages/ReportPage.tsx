import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { getDashboardStats, getPayments } from '../services/api';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: '0', activeOrders: '0', heldPayments: 'Rs. 0' });
  const [paymentSummary, setPaymentSummary] = useState({ totalHeldAmount: 'Rs. 0', totalCompletedAmount: 'Rs. 0', totalTransactionsCount: 0 });

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [statsRes, paymentsRes] = await Promise.all([
        getDashboardStats(),
        getPayments(),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (paymentsRes.data.success) {
        setPaymentSummary(paymentsRes.data.summary);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // Simple CSV export generator
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Value\n" +
      `Total Users,${stats.totalUsers}\n` +
      `Active Orders,${stats.activeOrders}\n` +
      `Held in Escrow,${paymentSummary.totalHeldAmount}\n` +
      `Completed Payouts,${paymentSummary.totalCompletedAmount}\n` +
      `Total Transactions,${paymentSummary.totalTransactionsCount}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GreenHive_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl animate-fadeIn">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Financial &amp; Platform Reports</h2>
          <p className="text-xs text-slate-400 mt-1">Audit platform volume, escrow payouts, and order summaries.</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Summary (CSV)</span>
        </button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Payouts</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{paymentSummary.totalCompletedAmount}</h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">Verified deliveries</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Escrow Balance</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{paymentSummary.totalHeldAmount}</h3>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">In transit &amp; holding</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Recorded Volume</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{paymentSummary.totalTransactionsCount} Orders</h3>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">Since launch</p>
        </div>
      </div>
    </div>
  );
}