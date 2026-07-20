import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Navigation, Calendar, Download, Utensils, Users, Leaf, Sparkles, MapPin, Compass, Clock,
  AlertCircle
} from 'lucide-react';

const FOOD_TYPE_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-amber-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-teal-500',
];

export default function ImpactPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    meals: 0,
    rate: 0,
    partners: 0,
    co2: 0,
    trees: 0,
    miles: 0,
    efficiency: [10, 15, 8, 12, 14, 18, 11],
    foodTypeBreakdown: {},
    liveFeed: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicStats = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/donations/public-stats');
        const data = res.data;

        const meals     = data.totalMealsSaved || 0;
        const rate      = data.redistributionRate || 0;
        const partners  = data.activePartners || 0;
        const co2       = data.co2Offset || 0.0;
        const trees     = data.treesPlanted || 0;
        const miles     = data.carMilesSaved || 0;

        setStats({
          meals,
          rate,
          partners,
          co2,
          trees,
          miles,
          efficiency: data.efficiencyDays || [5, 10, 8, 12, 6, 15, 10],
          foodTypeBreakdown: data.foodTypeBreakdown || {},
          liveFeed: data.liveFeed || [],
        });
      } catch (err) {
        console.warn('Error fetching public stats', err);
        setError('Could not load analytics data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicStats();
  }, []);

  // Build food type breakdown entries sorted by count
  const foodTypeEntries = Object.entries(stats.foodTypeBreakdown)
    .sort((a, b) => b[1] - a[1]);
  const totalFoodItems = foodTypeEntries.reduce((sum, [, v]) => sum + v, 0);

  // Export report as CSV
  const handleExportReport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Meals Saved', stats.meals],
      ['Redistribution Rate (%)', stats.rate],
      ['Active Partners', stats.partners],
      ['CO2 Offset (kg)', stats.co2.toFixed(1)],
      ['Trees Equivalent', stats.trees],
      ['Car Miles Saved', stats.miles],
      ...foodTypeEntries.map(([type, count]) => [`Food Type: ${type}`, count]),
    ];
    const csv = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', 'foodshare_impact_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTimeRemaining = (expiryStr) => {
    const diff = new Date(expiryStr) - new Date();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h left`;
    return `${mins}m left`;
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full flex flex-col gap-8 text-slate-800">
      
      {/* Navigation Subheader / Breadcrumb Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-[#059669] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#059669]" /> Mission Intelligence
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Impact <span className="text-[#059669]">Analytics</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time data from our AI-driven food redistribution network across the city.</p>
        </div>

        {/* Date Selector & Export Actions */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm">
            <Calendar size={14} className="text-slate-500" />
            Last 30 Days
          </button>
          <button
            onClick={handleExportReport}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2"
          >
            <Download size={14} />
            Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-2.5">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
        
        {/* TOTAL MEALS SAVED */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-2 relative">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-50 text-[#059669] border border-emerald-100 mb-1">
            <Utensils size={18} />
          </div>
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Meals Saved</span>
          <span className="text-4xl font-black text-slate-900 leading-tight">
            {loading ? <span className="animate-pulse text-slate-300">—</span> : stats.meals}
          </span>
          <div className="text-[10px] text-[#059669] font-bold flex items-center gap-1 mt-1">
            <span>&uarr; +12% this month</span>
          </div>
        </div>

        {/* REDISTRIBUTION RATE */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-2 relative">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-amber-50 text-amber-600 border border-amber-100 mb-1">
            <Navigation size={18} className="rotate-45" />
          </div>
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Redistribution Rate</span>
          <span className="text-4xl font-black text-slate-900 leading-tight">
            {loading ? <span className="animate-pulse text-slate-300">—</span> : `${stats.rate}%`}
          </span>
          <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1">
            <span>&nearr; of all donations claimed</span>
          </div>
        </div>

        {/* ACTIVE PARTNERS */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-2 relative">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-100 mb-1">
            <Users size={18} />
          </div>
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Active Partners</span>
          <span className="text-4xl font-black text-slate-900 leading-tight">
            {loading ? <span className="animate-pulse text-slate-300">—</span> : stats.partners}
          </span>
          <div className="text-[10px] text-[#059669] font-bold flex items-center gap-1 mt-1">
            <span>&uarr; Registered users</span>
          </div>
        </div>

        {/* CO2 OFFSET */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-2 relative">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#D1FAE5] text-emerald-800 border border-emerald-200 mb-1">
            <Leaf size={18} />
          </div>
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">CO2 Offset</span>
          <span className="text-4xl font-black text-slate-900 leading-tight">
            {loading
              ? <span className="animate-pulse text-slate-300">—</span>
              : `${stats.co2.toFixed(1)} kg`}
          </span>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <span>&bull; Lifetime impact</span>
          </div>
        </div>

      </div>

      {/* Middle Row: Redistribution Efficiency & Carbon Saved */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Redistribution Efficiency Column Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-[#059669]">&bull;&bull;&bull;</span>
              <h3 className="font-extrabold text-slate-900 text-base">Redistribution Efficiency</h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#059669]" /> Success</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Target</span>
            </div>
          </div>

          {/* Bar Chart Canvas */}
          <div className="flex items-end justify-between h-44 px-2">
            {stats.efficiency.map((val, idx) => {
              const maxVal = Math.max(...stats.efficiency, 10);
              const heightPct = (val / maxVal) * 100;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                    {val}% success
                  </div>
                  <div className="w-12 bg-slate-50 rounded-full overflow-hidden h-28 relative flex items-end">
                    <div 
                      className="w-full bg-[#059669] rounded-full transition-all duration-500"
                      style={{ height: `${Math.max(heightPct, 8)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Day {idx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carbon Saved Circular Leaf Card */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col items-center text-center justify-between gap-5">
          <div className="w-20 h-20 rounded-full bg-[#D1FAE5] flex items-center justify-center text-emerald-800 shadow-inner">
            <Leaf size={32} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-xl">Carbon Saved</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed px-4">
              Preventing food from reaching landfills has mitigated methane emissions equivalent to:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full border-t border-slate-50 pt-4">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-2xl font-black text-slate-800 block">
                {loading ? '—' : stats.trees}
              </span>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Trees Planted</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-2xl font-black text-slate-800 block">
                {loading ? '—' : stats.miles}
              </span>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Car Miles Saved</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row: Food Type, AI Optimization, Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Food Type Breakdown — REAL data from API */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col gap-4">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-50 pb-2">Food Type Breakdown</h3>
          
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col gap-1.5 animate-pulse">
                  <div className="h-2.5 bg-slate-100 rounded-full w-full" />
                  <div className="h-2 bg-slate-100 rounded-full w-1/2" />
                </div>
              ))}
            </div>
          ) : foodTypeEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-400">
              <Utensils size={24} className="text-slate-300" />
              <span className="text-xs font-semibold">No donations posted yet</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 py-1">
              {foodTypeEntries.map(([type, count], idx) => {
                const pct = totalFoodItems > 0 ? Math.round((count / totalFoodItems) * 100) : 0;
                const colorClass = FOOD_TYPE_COLORS[idx % FOOD_TYPE_COLORS.length];
                return (
                  <div key={type} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-600 capitalize">{type}</span>
                      <span className="text-slate-800">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`${colorClass} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">{count} listing{count !== 1 ? 's' : ''}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Optimization Tip Card */}
        <div className="bg-[#2D3748] text-white rounded-[32px] p-6 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
              <Sparkles size={16} />
            </div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">AI Optimization Tip</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {stats.rate > 0
              ? `System detected a peak efficiency of ${stats.rate}% today. Continuing to distribute surplus food in highly active zones will increase overall successful deliveries.`
              : 'Start posting donations to activate AI optimization insights. The system will learn and improve redistribution efficiency with each listing.'}
          </p>
          <a href="#" onClick={(e) => e.preventDefault()} className="text-emerald-400 text-xs font-bold uppercase tracking-wider hover:underline flex items-center gap-1 mt-2">
            Apply Optimization &rarr;
          </a>
        </div>

        {/* Live City Feed — REAL data from API */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col gap-4 min-h-[200px]">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <h3 className="font-extrabold text-slate-900 text-sm">Live City Feed</h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map(i => (
                <div key={i} className="p-3 bg-slate-50 rounded-2xl animate-pulse flex flex-col gap-2">
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                  <div className="h-2 bg-slate-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : stats.liveFeed.length > 0 ? (
            <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto max-h-[200px]">
              {stats.liveFeed.map((item, idx) => {
                const timeLeft = getTimeRemaining(item.expiryTime);
                const isUrgent = new Date(item.expiryTime) - new Date() < 3 * 3600 * 1000;
                return (
                  <div key={item._id || idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 text-xs truncate">{item.title}</span>
                      {isUrgent && (
                        <span className="text-[9px] bg-red-100 text-red-700 font-black px-1.5 py-0.5 rounded uppercase flex-shrink-0">
                          Urgent
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                      {item.pickupAddress && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} />
                          {item.pickupAddress.split(',')[0]}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {timeLeft}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl py-6 px-4 text-center my-1 bg-slate-50/50">
              <Compass className="text-slate-300 mb-2" size={24} />
              <span className="text-xs font-bold text-slate-400">No live donations available</span>
            </div>
          )}

          <Link
            to="/ngo-dashboard"
            className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-center text-xs font-bold py-2.5 rounded-xl transition shadow-sm"
          >
            View Full Map Activity
          </Link>
        </div>

      </div>

    </div>
  );
}
