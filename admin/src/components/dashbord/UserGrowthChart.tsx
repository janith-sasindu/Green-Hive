import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockUserGrowth } from '../../data/mockData';

export default function UserGrowthChart() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800 mb-6">
        User Growth
      </h3>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockUserGrowth}>
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
              ticks={[0, 200, 400, 600, 800]}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs space-y-1">
                      <p className="font-bold text-slate-700">{label}</p>
                      <p className="text-emerald-700 font-medium">Farmers: {payload[0]?.value}</p>
                      <p className="text-blue-700 font-medium">Sellers: {payload[1]?.value}</p>
                      <p className="text-amber-600 font-medium">Transporters: {payload[2]?.value}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="farmers"
              stroke="#15803d"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="sellers"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="transporters"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-600 bg-white"></span>
          <span className="text-emerald-700">Farmers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-600 bg-white"></span>
          <span className="text-blue-700">Sellers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-amber-500 bg-white"></span>
          <span className="text-amber-600">Transporters</span>
        </div>
      </div>
    </div>
  );
}
