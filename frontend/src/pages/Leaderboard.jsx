import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  Trophy, Award, Heart, Building, MapPin, TrendingUp,
  Sparkles, Crown, Medal, Star, RefreshCw, AlertCircle
} from 'lucide-react';

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3 bg-slate-200 rounded-full w-1/2" />
        <div className="h-2 bg-slate-200 rounded-full w-1/4" />
      </div>
      <div className="h-6 w-14 bg-slate-200 rounded-lg" />
    </div>
  );
}

function RankBadge({ rank }) {
  if (rank === 1) return <Crown size={20} className="text-amber-500" />;
  if (rank === 2) return <Medal size={18} className="text-slate-400" />;
  if (rank === 3) return <Medal size={18} className="text-orange-400" />;
  return <span className="text-xs font-extrabold text-slate-400 w-5 text-center">#{rank}</span>;
}

function LeaderCard({ title, icon: Icon, color, items, valueKey, valueSuffix, subKey, loading }) {
  const colors = {
    emerald: { header: 'from-emerald-600 to-teal-600', badge: 'bg-emerald-50 text-[#059669] border-emerald-100', dot: 'bg-[#059669]' },
    blue:    { header: 'from-blue-600 to-indigo-600',  badge: 'bg-blue-50 text-blue-700 border-blue-100',        dot: 'bg-blue-600' },
    amber:   { header: 'from-amber-500 to-orange-500', badge: 'bg-amber-50 text-amber-700 border-amber-100',     dot: 'bg-amber-500' },
  };
  const c = colors[color];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className={`bg-gradient-to-r ${c.header} px-6 py-5 text-white flex items-center gap-3`}>
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-extrabold text-base">{title}</h3>
          <p className="text-[11px] text-white/70 mt-0.5">{items.length} ranked entries</p>
        </div>
        <Trophy size={28} className="ml-auto text-white/30" />
      </div>

      {/* Rows */}
      <div className="flex flex-col divide-y divide-slate-50">
        {loading ? (
          [1,2,3,4,5].map(i => <SkeletonRow key={i} />)
        ) : items.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <Trophy size={32} className="text-slate-200" />
            <p className="text-sm font-semibold text-slate-500">No data yet.</p>
            <p className="text-xs text-slate-400">Rankings appear once activity is recorded.</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition ${idx === 0 ? 'bg-amber-50/30' : ''}`}
            >
              {/* Rank */}
              <div className="w-8 flex items-center justify-center flex-shrink-0">
                <RankBadge rank={idx + 1} />
              </div>

              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full ${c.dot} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                <span className="text-xs font-extrabold text-white" style={{ color: 'inherit' }}>
                  {(item.name || '?').charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Name + Sub */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{item.name || 'Anonymous'}</p>
                {subKey && item[subKey] && (
                  <p className="text-[10px] text-slate-400 truncate">{item[subKey]}</p>
                )}
              </div>

              {/* Value */}
              <span className={`flex-shrink-0 text-xs font-extrabold px-3 py-1 rounded-lg border ${c.badge}`}>
                {item[valueKey]}{valueSuffix}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [donors,  setDonors]  = useState([]);
  const [ngos,    setNgos]    = useState([]);
  const [cities,  setCities]  = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [analyticsRes, statsRes] = await Promise.all([
        api.get('/admin/analytics').catch(() => ({ data: null })),
        api.get('/donations/public-stats').catch(() => ({ data: null })),
      ]);
      const an = analyticsRes?.data;
      const st = statsRes?.data;

      if (an) {
        setDonors((an.topDonors || []).map(d => ({
          id: d.id,
          name: d.name,
          organization: d.organization || 'Individual',
          donationsCount: d.donationsCount,
          meals: Math.round(d.donationsCount * 12),
        })));
        setNgos((an.activeNGOs || []).map(n => ({
          id: n.id,
          name: n.name,
          organization: n.organization || 'Charity Partner',
          claimsCount: n.claimsCount,
        })));
      }

      if (st) {
        setSummary({
          totalMeals: st.totalMealsSaved,
          partners: st.activePartners,
          co2: st.co2Offset,
        });
        // Build city-level data from live feed
        const feed = st.liveFeed || [];
        const cityMap = {};
        feed.forEach(d => {
          const city = d.pickupAddress?.split(',').pop()?.trim() || d.donor?.address?.split(',').pop()?.trim() || 'Unknown';
          cityMap[city] = (cityMap[city] || 0) + 1;
        });
        const sorted = Object.entries(cityMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count], i) => ({ id: i, name, donationsCount: count }));
        setCities(sorted);
      }
    } catch (err) {
      setError('Unable to load leaderboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="flex-1 bg-[#F8FAFC] py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full flex flex-col gap-8 text-slate-800">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#059669] uppercase tracking-wider">
            <Sparkles size={13} /> Community Rankings
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Impact <span className="text-[#059669]">Leaderboard</span>
          </h1>
          <p className="text-slate-500 text-sm">Real-time rankings powered by live database activity.</p>
        </div>
        <button
          onClick={fetchData}
          className="self-start flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh Rankings
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2.5">
          <AlertCircle size={16} /><span>{error}</span>
        </div>
      )}

      {/* Summary KPIs */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Meals Saved', value: summary.totalMeals, icon: Heart,    color: 'text-[#059669] bg-emerald-50' },
            { label: 'Active Partners',   value: summary.partners,   icon: Building, color: 'text-blue-600 bg-blue-50' },
            { label: 'CO₂ Prevented',     value: `${summary.co2}kg`, icon: TrendingUp, color: 'text-teal-600 bg-teal-50' },
          ].map(kpi => {
            const KpiIcon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.color}`}>
                  <KpiIcon size={22} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">{kpi.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{kpi.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LeaderCard
          title="Top Donors"
          icon={Heart}
          color="emerald"
          items={donors}
          valueKey="donationsCount"
          valueSuffix=" posts"
          subKey="organization"
          loading={loading}
        />
        <LeaderCard
          title="Top NGOs"
          icon={Award}
          color="blue"
          items={ngos}
          valueKey="claimsCount"
          valueSuffix=" missions"
          subKey="organization"
          loading={loading}
        />
        <LeaderCard
          title="Top Cities"
          icon={MapPin}
          color="amber"
          items={cities}
          valueKey="donationsCount"
          valueSuffix=" donations"
          loading={loading}
        />
      </div>

      {/* How Rankings Work */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
          <Star size={18} className="text-[#059669]" /> How Rankings Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Donor Score', desc: 'Based on total donations posted, meals shared, and consistency over time.' },
            { title: 'NGO Score',   desc: 'Based on missions claimed, successful pickups, and response time to alerts.' },
            { title: 'City Score',  desc: 'Aggregated from all donation activity reported within the city boundary.' },
          ].map(item => (
            <div key={item.title} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="font-bold text-slate-800 text-sm mb-1">{item.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
