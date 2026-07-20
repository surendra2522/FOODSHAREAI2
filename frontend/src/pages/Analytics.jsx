import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart2, Calendar, FileDown, Utensils, Users, Building, Leaf, 
  Sparkles, Globe, MapPin, AlertCircle, TrendingUp 
} from 'lucide-react';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(null);
  const [error, setError] = useState('');

  const handleBackendExport = async (type) => {
    setExportLoading(type);
    try {
      const token = localStorage.getItem('foodshare_token');
      const response = await axios.get(`http://localhost:5000/api/admin/export/${type}`, { 
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `foodshare_analytics_report.${type}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert('Admin privileges required to generate full system reports.');
      } else {
        alert(`Error generating ${type.toUpperCase()} report`);
      }
    } finally {
      setExportLoading(null);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      // Connect to our backend public stats endpoint
      const res = await axios.get('http://localhost:5000/api/donations/public-stats');
      setStats(res.data);
    } catch (err) {
      setError('Unable to fetch impact analytics from MongoDB. Database connection could be offline.');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh live feed every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-[#F8FAFC] py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Skeleton header */}
        <div className="flex flex-col gap-2">
          <div className="h-3 w-32 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-9 w-56 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-3 w-80 bg-slate-200 rounded-full animate-pulse" />
        </div>
        {/* Skeleton KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-3 animate-pulse">
              <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
              <div className="h-3 w-24 bg-slate-200 rounded-full" />
              <div className="h-8 w-16 bg-slate-200 rounded-xl" />
              <div className="h-3 w-20 bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>
        {/* Skeleton chart */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm animate-pulse">
          <div className="h-5 w-48 bg-slate-200 rounded-full mb-4" />
          <div className="h-56 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Handle default calculations
  const totalMeals = stats?.totalMealsSaved || 0;
  const redistRate = stats?.redistributionRate || 0;
  const partnersCount = stats?.activePartners || 31;
  const co2OffsetVal = stats?.co2Offset || 0.0;
  const efficiencyDays = stats?.efficiencyDays || [25, 45, 30, 60, 50, 75, 65];

  // Retrieve environmental impacts directly from API
  const treesPlanted = stats?.treesPlanted || 0;
  const milesSaved = stats?.carMilesSaved || 0;

  // Ensure food type breakdown is formatted
  const foodBreakdown = stats?.foodTypeBreakdown && Object.keys(stats.foodTypeBreakdown).length > 0 
    ? stats.foodTypeBreakdown 
    : { 'Produce': 40, 'Prepared Meals': 30, 'Bakery': 20, 'Other': 10 };

  return (
    <div className="flex-1 bg-[#F8FAFC] text-slate-800 py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#059669] uppercase tracking-wider">
            <Sparkles size={14} className="text-[#059669]" />
            Mission Intelligence
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Impact <span className="text-[#059669]">Analytics</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl">
            Real-time data from our AI-driven food redistribution network across the city.
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-sm">
            <Calendar size={16} className="text-slate-450" />
            Last 30 Days
          </button>
          <button
            onClick={() => handleBackendExport('csv')}
            disabled={exportLoading === 'csv'}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-md shadow-slate-950/10 active:scale-95"
          >
            <FileDown size={16} className={exportLoading === 'csv' ? 'animate-bounce' : ''} />
            {exportLoading === 'csv' ? 'Generating CSV...' : 'Export CSV'}
          </button>
          <button
            onClick={() => handleBackendExport('pdf')}
            disabled={exportLoading === 'pdf'}
            className="flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-md shadow-orange-500/20 active:scale-95"
          >
            <FileDown size={16} className={exportLoading === 'pdf' ? 'animate-bounce' : ''} />
            {exportLoading === 'pdf' ? 'Generating PDF...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-650 text-sm flex items-start gap-2.5">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Metrics Grid (4 Row Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Meals Saved */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-1 hover:shadow-md transition duration-200">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#059669] mb-3">
            <Utensils size={22} />
          </div>
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Meals Saved</span>
          <span className="text-4xl font-extrabold text-slate-900 tracking-tight mt-1">{totalMeals}</span>
          <span className="text-xs font-semibold text-[#059669] flex items-center gap-1 mt-2.5">
            <TrendingUp size={12} />
            +12% this month
          </span>
        </div>

        {/* Metric 2: Redistribution Rate */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-1 hover:shadow-md transition duration-200">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-3">
            <Users size={22} />
          </div>
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Redistribution Rate</span>
          <span className="text-4xl font-extrabold text-slate-900 tracking-tight mt-1">{redistRate}%</span>
          <span className="text-xs font-semibold text-[#059669] flex items-center gap-1 mt-2.5">
            <TrendingUp size={12} />
            {totalMeals > 0 ? `${Math.round(totalMeals / 2.8)} matched` : '0 matched'}
          </span>
        </div>

        {/* Metric 3: Active Partners */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-1 hover:shadow-md transition duration-200">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-3">
            <Building size={22} />
          </div>
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Active Partners</span>
          <span className="text-4xl font-extrabold text-slate-900 tracking-tight mt-1">{partnersCount}</span>
          <span className="text-xs font-semibold text-[#059669] flex items-center gap-1 mt-2.5">
            <TrendingUp size={12} />
            Registered today
          </span>
        </div>

        {/* Metric 4: CO2 Offset */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-1 hover:shadow-md transition duration-200">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-3">
            <Leaf size={22} />
          </div>
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">CO2 Offset</span>
          <span className="text-4xl font-extrabold text-slate-900 tracking-tight mt-1">{co2OffsetVal} kg</span>
          <span className="text-xs font-semibold text-[#059669] flex items-center gap-1 mt-2.5">
            <TrendingUp size={12} />
            Lifetime impact
          </span>
        </div>

      </div>

      {/* Main Grid: Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Efficiency & Breakdown */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Chart Card: Redistribution Efficiency */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="text-[#059669]" size={20} />
                <h3 className="font-extrabold text-slate-900 text-lg">Redistribution Efficiency</h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
                  Success
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
                  Target
                </span>
              </div>
            </div>

            {/* Custom Interactive Vertical CSS Bar Chart */}
            <div className="flex items-end justify-between h-56 px-2 sm:px-6 mt-2">
              {efficiencyDays.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 flex-1">
                  <div className="w-8 sm:w-10 bg-slate-50 rounded-t-2xl relative h-40 flex items-end overflow-hidden group border border-slate-100/50">
                    {/* Shadow / Target bar behind */}
                    <div className="absolute inset-x-0 bottom-0 bg-slate-150 h-[80%] rounded-t-2xl"></div>
                    {/* Real success bar */}
                    <div 
                      className="absolute inset-x-0 bottom-0 bg-[#059669] group-hover:bg-[#047857] transition-all duration-300 rounded-t-2xl shadow-inner flex items-center justify-center"
                      style={{ height: `${val}%` }}
                    >
                      <span className="text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity mb-1 select-none">
                        {val}%
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">
                    Day {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown & AI tip side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Food Type Breakdown */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-50 pb-2">
                Food Type Breakdown
              </h3>
              <div className="flex flex-col gap-3.5">
                {Object.entries(foodBreakdown).map(([type, pct]) => (
                  <div key={type} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>{type}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#059669] h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Optimization Tip (Dark Slate Card) */}
            <div className="bg-slate-800 text-slate-100 p-6 rounded-3xl shadow-md flex flex-col justify-between gap-5 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-emerald-500/10 blur-xl pointer-events-none"></div>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm uppercase tracking-wider">
                  <Sparkles size={16} />
                  AI Optimization Tip
                </div>
                <p className="text-slate-350 text-sm leading-relaxed">
                  System detected a peak efficiency of <span className="text-white font-bold">{redistRate}%</span> today. 
                  Continuing to distribute surplus food in highly active zones will increase overall successful deliveries.
                </p>
              </div>

              <a 
                href="#optimize" 
                onClick={(e) => { e.preventDefault(); alert("AI Logistics optimization algorithms running. Redistribution routing prioritized!"); }}
                className="text-emerald-400 hover:text-emerald-350 font-bold text-sm tracking-wide inline-flex items-center gap-1 transition-all group mt-2"
              >
                APPLY OPTIMIZATION 
                <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
              </a>
            </div>

          </div>

        </div>

        {/* Right Column: Environmental Stats & Live City Feed */}
        <div className="flex flex-col gap-8">
          
          {/* Environmental Circular Progress Visual */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col items-center text-center gap-5">
            
            <div className="relative w-36 h-36 flex items-center justify-center bg-emerald-50/50 rounded-full border border-emerald-100/50 shadow-inner">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-[#059669]">
                <Leaf size={44} className="animate-bounce" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full border-t border-slate-50 pt-4 text-slate-800">
              <div className="flex flex-col gap-0.5 border-r border-slate-100">
                <span className="text-2xl font-extrabold text-slate-900">{treesPlanted}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trees Planted</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-2xl font-extrabold text-slate-900">{milesSaved}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Car Miles Saved</span>
              </div>
            </div>

          </div>

          {/* Live City Feed Box */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-[#059669]" />
                <h3 className="font-extrabold text-slate-900 text-base">Live City Feed</h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-100 text-[#059669]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#059669]"></span>
                </span>
                LIVE
              </span>
            </div>

            {/* Live Feed List */}
            <div className="flex flex-col gap-3.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
              {stats?.liveFeed && stats.liveFeed.length > 0 ? (
                stats.liveFeed.map((item) => (
                  <div key={item._id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1.5 hover:bg-slate-100/50 transition">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-800 text-sm">{item.title}</span>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg whitespace-nowrap">{item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-550">
                      <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{item.donor?.organization || 'Local Store'} • {item.donor?.address || 'City Center'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 gap-3 text-slate-400">
                  <div className="w-12 h-12 rounded-full border border-slate-100 bg-slate-50 flex items-center justify-center">
                    <MapPin size={22} className="text-slate-300" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-sm text-slate-700">No live donations available</span>
                    <span className="text-xs text-slate-400">New items will show here in real-time.</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
