import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockOrdersOverTime } from '../../data/mockData';

interface OrdersChartProps {
  data?: { month: string; orders: number }[];
}

export default function OrdersChart({ data }: OrdersChartProps) {
  // Use live data if provided, otherwise fallback to mock
  const chartData = data && data.length > 0 ? data : mockOrdersOverTime;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none transition-colors">
      <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-6">
        Orders Over Time
      </h3>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#15803d" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#15803d" stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 text-xs">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{label}</p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                        Orders : {payload[0].value}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#15803d"
              strokeWidth={2.5}
              fill="url(#orderGrad)"
              activeDot={{ r: 5, fill: '#15803d', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}