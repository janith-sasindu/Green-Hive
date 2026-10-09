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

export default function OrdersChart() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800 mb-6">
        Orders Over Time
      </h3>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockOrdersOverTime}>
            <defs>
              <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#15803d" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#15803d" stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
              ticks={[0, 80, 160, 240, 320]}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs">
                      <p className="font-semibold text-slate-700">{label}</p>
                      <p className="text-emerald-600 font-medium mt-1">
                        orders : {payload[0].value}
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
