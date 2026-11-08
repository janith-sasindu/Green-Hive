import React, { useState, useEffect } from 'react';
import {
  Shield,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Loader2,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { getPayments, releasePayment } from '../services/api';

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [summary, setSummary] = useState({
    totalHeldAmount: 'Rs. 0',
    totalCompletedAmount: 'Rs. 0',
    totalTransactionsCount: 0,
  });

  const [holdingPayments, setHoldingPayments] = useState<any[]>([]);
  const [completedPayments, setCompletedPayments] = useState<any[]>([]);

  // 1. Fetch live payments from backend
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const res = await getPayments();

      if (res.data.success) {
        setSummary(res.data.summary);
        setHoldingPayments(res.data.holdingPayments || []);
        setCompletedPayments(res.data.completedPayments || []);
      }
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to load payments from database'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // 2. Real Backend Action: Release Escrow Payment to Farmer
  const handleRelease = async (paymentId: number | string) => {
    if (!window.confirm('Are you sure you want to release these held funds to the payee?')) {
      return;
    }

    try {
      setActionLoading(paymentId);
      const res = await releasePayment(paymentId);
      if (res.data.success) {
        await fetchPayments(); // Refresh list & totals
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to release payment');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header Sync Status & Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {loading ? (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Syncing escrow transactions from Aiven MySQL...
            </span>
          ) : (
            <span>🟢 Live Escrow Vault connected</span>
          )}
        </div>

        <button
          onClick={fetchPayments}
          title="Refresh Payments"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-700 text-xs font-medium rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Held in Escrow */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none flex items-start justify-between transition-colors">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Held in Escrow (Green Hive)</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{summary.totalHeldAmount}</h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
              {holdingPayments.length} transactions pending release
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* Completed Sales */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none flex items-start justify-between transition-colors">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Completed Payouts</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{summary.totalCompletedAmount}</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              {completedPayments.length} transactions released
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Transactions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none flex items-start justify-between transition-colors">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Total Transactions</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{summary.totalTransactionsCount}</h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">All platform operations</p>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Payment Holding Sales (Escrow) */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 rounded-full bg-amber-500"></span>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Payment Holding Sales (Escrow)</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60">
              {holdingPayments.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Buyer funds held safely by Green Hive until goods are confirmed delivered.
          </p>
        </div>

        {/* Holding Cards List */}
        <div className="space-y-3">
          {holdingPayments.length === 0 && !loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200/90 dark:border-slate-800">
              <p className="text-slate-400 text-sm">No funds currently held in escrow.</p>
            </div>
          ) : (
            holdingPayments.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-md shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                {/* Left: Shield Icon & Route Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base capitalize">
                        {item.product_name || item.payment_type?.replace('_', ' ')}
                      </h4>
                      <span className="text-xs font-mono text-slate-400">{item.tx_code}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                        {item.order_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Payer: <span className="text-slate-800 dark:text-white font-semibold">{item.payer_name}</span> 
                      {' → '} 
                      Payee: <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{item.payee_name}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Held since {item.held_at ? new Date(item.held_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Right: Amount & Release Escrow Button */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50 mb-1">
                      {item.status}
                    </span>
                    <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Rs. {Number(item.amount).toLocaleString()}
                    </p>
                  </div>

                  {/* Real Backend Button */}
                  <button
                    onClick={() => handleRelease(item.id)}
                    disabled={actionLoading === item.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                    <span>Release Escrow</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Completed Sales */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 rounded-full bg-emerald-600"></span>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Completed Sales & Payouts</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
              {completedPayments.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Successfully released funds — all delivery conditions verified.
          </p>
        </div>

        {/* Completed Cards List */}
        <div className="space-y-3">
          {completedPayments.length === 0 && !loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200/90 dark:border-slate-800">
              <p className="text-slate-400 text-sm">No completed transactions yet.</p>
            </div>
          ) : (
            completedPayments.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-md shadow-slate-200/50 dark:shadow-none flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base capitalize">
                        {item.product_name || item.payment_type?.replace('_', ' ')}
                      </h4>
                      <span className="text-xs font-mono text-slate-400">{item.tx_code}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                        {item.order_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Payer: <span className="font-semibold text-slate-800 dark:text-white">{item.payer_name}</span> 
                      {' → '} 
                      Payee: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{item.payee_name}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Completed {item.released_at ? new Date(item.released_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50">
                    {item.status}
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Rs. {Number(item.amount).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}