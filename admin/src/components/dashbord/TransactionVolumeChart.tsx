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

export default function TransactionVolumeChart() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800 mb-6">
        Transaction Volume (Rs.)
      </h3>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockTransactionVolume} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
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
              ticks={[0, 1.5, 3.0, 4.5, 6.0]}
              tickFormatter={(v) => `${v.toFixed(1)}M`}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs space-y-1">
                      <p className="font-bold text-slate-700">{label}</p>
                      <p className="text-emerald-700 font-medium">Product: Rs. {payload[0]?.value}M</p>
                      <p className="text-amber-600 font-medium">Transport: Rs. {payload[1]?.value}M</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Green Bar: Product Payments */}
            <Bar
              dataKey="product"
              fill="#15803d"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
            />
            {/* Orange Bar: Transport Payments */}
            <Bar
              dataKey="transport"
              fill="#f59e0b"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#15803d]"></span>
          <span className="text-emerald-700">Product Payments</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm bg-[#f59e0b]"></span>
          <span className="text-amber-600">Transport Payments</span>
        </div>
      </div>
    </div>
  );
}
