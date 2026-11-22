import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockTransactionVolume } from '../../data/mockData';

interface TransactionVolumeChartProps {
  data?: { month: string; product: number; transport: number }[];
}

export default function TransactionVolumeChart({ data }: TransactionVolumeChartProps) {
  const chartData = data && data.length > 0 ? data : mockTransactionVolume;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none transition-colors">
      <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-6">
        Transaction Volume (Rs. Millions)
      </h3>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}M`}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 text-xs space-y-1">
                      <p className="font-bold text-slate-700 dark:text-slate-200">{label}</p>
                      <p className="text-emerald-700 dark:text-emerald-400 font-medium">Product: Rs. {payload[0]?.value}M</p>
                      <p className="text-amber-600 dark:text-amber-400 font-medium">Transport: Rs. {payload[1]?.value}M</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="product" fill="#15803d" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey="transport" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#15803d]"></span>
          <span className="text-emerald-700 dark:text-emerald-400">Product Payments</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#f59e0b]"></span>
          <span className="text-amber-600 dark:text-amber-400">Transport Payments</span>
        </div>
      </div>
    </div>
  );
}