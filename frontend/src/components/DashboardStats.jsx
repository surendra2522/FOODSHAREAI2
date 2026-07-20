import React from 'react';
import { Utensils, Heart, ShieldAlert, Leaf, Compass } from 'lucide-react';

export default function DashboardStats({ stats }) {
  const items = [
    {
      title: 'Food Saved',
      value: stats?.totalWeight ? `${stats.totalWeight} kg` : '1,240 kg',
      desc: 'Surplus food redirected',
      icon: Utensils,
      color: 'text-brand-400 bg-brand-500/10 border border-brand-500/20',
    },
    {
      title: 'Meals Shared',
      value: stats?.mealsShared ? stats.mealsShared.toLocaleString() : '2,950',
      desc: 'Shared with local charities',
      icon: Heart,
      color: 'text-rose-400 bg-rose-500/10 border border-rose-500/20',
    },
    {
      title: 'CO₂ Prevented',
      value: stats?.co2Prevented ? `${stats.co2Prevented} kg` : '3,100 kg',
      desc: 'Greenhouse gases saved',
      icon: Leaf,
      color: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
    },
    {
      title: 'Active Connections',
      value: stats?.activeMatches ? stats.activeMatches : '42',
      desc: 'Realtime donor-charity pairs',
      icon: Compass,
      color: 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">{item.title}</span>
              <div className={`p-2 rounded-xl ${item.color}`}>
                <Icon size={20} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white tracking-tight">{item.value}</div>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
