import React from 'react';
import { TrendingUp, Star } from 'lucide-react';

interface StatCardProps {
  icon: 'trending_up' | 'star';
  value: string;
  label: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => {
  const IconComponent = icon === 'trending_up' ? TrendingUp : Star;
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-container-low p-6 shadow-sm">
      <IconComponent className="text-primary w-8 h-8 mb-2" />
      <div className="text-3xl font-black text-primary">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-[0.25em] text-outline text-center">{label}</div>
    </div>
  );
};
