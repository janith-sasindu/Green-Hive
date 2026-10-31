import React, { useState } from 'react';
import {
  Shield,
  TrendingUp,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import {
  mockPaymentSummary,
  mockHoldingPayments,
  mockCompletedPayments,
  PaymentTransaction,
} from '../data/mockData';

export default function PaymentsPage() {
  const [holdingPayments] = useState<PaymentTransaction[]>(mockHoldingPayments);
  const [completedPayments] = useState<PaymentTransaction[]>(mockCompletedPayments);

  return (
    <div className="space-y-8">
      {/* 1. Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Held by Green Hive */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Held by Green Hive</p>
            <h3 className="text-2xl font-bold text-slate-800">{mockPaymentSummary.heldAmount}</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">{mockPaymentSummary.heldCount}</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* Completed Sales */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Completed Sales</p>
            <h3 className="text-2xl font-bold text-slate-800">{mockPaymentSummary.completedAmount}</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">{mockPaymentSummary.completedCount}</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Transactions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-1">Total Transactions</p>
            <h3 className="text-2xl font-bold text-slate-800">{mockPaymentSummary.totalTransactions}</h3>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Payment Holding Sales (Escrow) */}
      <div className="space-y-3.5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 rounded-full bg-amber-500"></span>
            <h3 className="text-base font-bold text-slate-800">Payment Holding Sales</h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700">
              {holdingPayments.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Payments currently held in escrow by Green Hive — awaiting confirmation before release.
          </p>
        </div>

        {/* Holding Cards List */}
        <div className="space-y-3">
          {holdingPayments.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4 transition-all hover:shadow-sm"
            >
              {/* Left: Shield Icon & Route Info */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">{item.type}</h4>
                    <span className="text-xs font-mono text-slate-400">{item.txCode}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium truncate">{item.fromTo}</p>
                  <p className="text-xs text-slate-400 truncate">{item.details}</p>
                </div>
              </div>

              {/* Right: Status Pill & Amount */}
              <div className="text-right shrink-0 space-y-1">
                <div>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'On Hold'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-sm sm:text-base font-bold text-slate-800">{item.amount}</p>
                <p className="text-xs text-slate-400">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Completed Sales */}
      <div className="space-y-3.5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 rounded-full bg-emerald-600"></span>
            <h3 className="text-base font-bold text-slate-800">Completed Sales</h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700">
              {completedPayments.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Successfully released payments — all delivery conditions were met.
          </p>
        </div>

        {/* Completed Cards List */}
        <div className="space-y-3">
          {completedPayments.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4 transition-all hover:shadow-sm"
            >
              {/* Left: Checkmark Icon & Route Info */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">{item.type}</h4>
                    <span className="text-xs font-mono text-slate-400">{item.txCode}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium truncate">{item.fromTo}</p>
                  <p className="text-xs text-slate-400 truncate">{item.details}</p>
                </div>
              </div>

              {/* Right: Status Pill & Amount */}
              <div className="text-right shrink-0 space-y-1">
                <div>
                  <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    {item.status}
                  </span>
                </div>
                <p className="text-sm sm:text-base font-bold text-slate-800">{item.amount}</p>
                <p className="text-xs text-slate-400">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
