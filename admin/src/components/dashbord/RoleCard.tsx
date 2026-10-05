import React from 'react';

interface RoleCardProps {
  count: number;
  label: string;
  emoji: string;
  theme: 'emerald' | 'blue' | 'amber';
}

export default function RoleCard({ count, label, emoji, theme }: RoleCardProps) {
  const themeStyles = {
    emerald: {
      card: 'bg-emerald-50/60 border-emerald-100/80',
      count: 'text-emerald-700',
      label: 'text-emerald-600',
    },
    blue: {
      card: 'bg-blue-50/60 border-blue-100/80',
      count: 'text-blue-700',
      label: 'text-blue-600',
    },
    amber: {
      card: 'bg-amber-50/60 border-amber-100/80',
      count: 'text-amber-700',
      label: 'text-amber-600',
    },
  }[theme];

  return (
    <div
      className={`rounded-2xl border p-5 text-center flex flex-col items-center justify-center transition-all shadow-sm ${themeStyles.card}`}
    >
      <span className={`text-3xl font-extrabold ${themeStyles.count}`}>
        {count}
      </span>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-sm">{emoji}</span>
        <span className={`text-sm font-medium ${themeStyles.label}`}>{label}</span>
      </div>
    </div>
  );
}
