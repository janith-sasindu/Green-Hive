import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
}

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconBgColor,
  iconColor,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {subtext && (
          <p className="text-[11px] text-slate-400 mt-1 font-medium">{subtext}</p>
        )}
      </div>

      <div className={`p-3 rounded-2xl ${iconBgColor} ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
