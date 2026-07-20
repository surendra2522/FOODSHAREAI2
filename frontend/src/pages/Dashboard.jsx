import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { 
  Heart, Award, Box, Clock, Plus, BarChart2, ShieldCheck, 
  Leaf, Users, ChevronRight, AlertCircle, Trash2, MapPin, Bell,
  CheckCircle2, X
} from 'lucide-react';

import NgoDashboard from './NgoDashboard';

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  // ── ALL hooks must be declared before any conditional returns ──────────────
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');
  const [announcements, setAnnouncements] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    addToast(message, type);
  }, [addToast]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [donationsRes, statsRes, annRes, weeklyRes] = await Promise.all([
        api.get('/donations'),
        api.get('/donations/stats'),
        api.get('/admin/announcements/public').catch(() => ({ data: [] })),
        api.get('/donations/stats/weekly').catch(() => ({ data: null })),
      ]);
      setItems(donationsRes.data);
      setStats(statsRes.data);
      setAnnouncements(annRes.data);
      setWeeklyStats(weeklyRes.data);
    } catch (err) {
      setError('Unable to load dashboard data. Database/Backend connection failed.');
      setItems([]);
      setStats({ totalWeight: 0, mealsShared: 0, co2Prevented: 0, activeMatches: 0, ngosHelped: 0 });
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleClaim = async (id) => {
    setActionLoadingId(id);
    try {
      await api.put(`/donations/${id}/claim`);
      showToast('Food item claimed successfully!');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to claim food item.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    setActionLoadingId(id);
    try {
      // Use the donor-scoped delete route (not admin route)
      await api.delete(`/donations/${id}`);
      setItems(prev => prev.filter(item => item._id !== id));
      showToast('Donation listing removed successfully.');
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Could not delete donation listing.',
        'error'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── After all hooks — role-based guard for charity users ───────────────────
  if (user?.role === 'charity') {
    return <NgoDashboard />;
  }

  // Computed values
  const isDonor = user?.role === 'donor';
  const totalMeals = stats?.totalMeals || 0;
  const co2Offset = stats?.co2PreventedKg || 0.0;
  const activeMatches = stats?.activeMissions || 0;
  const ngosHelped = stats?.ngosHelped || 0;

  const displayedItems = isDonor
    ? items.filter(i => {
        const donorId = i.donor?._id || i.donor;
        return String(donorId) === String(user?._id || user?.id);
      })
    : items.filter(i => i.status === 'available');

  return (
    <div className="flex-1 bg-[#F8FAFC] py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full flex flex-col gap-8 text-slate-800">
      
      {/* Welcome & Top Summary Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-[#059669] uppercase tracking-wider">
            {isDonor ? 'Donor Impact Hub' : 'NGO Partner Portal'}
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome, <span className="text-[#059669]">{user?.name || 'Partner'}</span>
          </h1>
          <p className="text-slate-500 text-sm">
            You have helped save {totalMeals} meals from going to waste.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {isDonor ? (
            <Link 
              to="/donate" 
              className="bg-[#059669] hover:bg-[#047857] text-white text-sm font-semibold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-98"
            >
              <Plus size={18} />
              Post Surplus
            </Link>
          ) : (
            <Link 
              to="/admin/dashboard" 
              className="bg-[#059669] hover:bg-[#047857] text-white text-sm font-semibold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-98"
            >
              Admin Console
            </Link>
          )}

          {/* Top Right Mini Impact Widget */}
          <div className="bg-white border border-slate-100 p-3.5 rounded-2xl shadow-sm flex items-center gap-3 min-w-[170px]">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-[#059669]">
              <BarChart2 size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Impact</span>
              <span className="text-sm font-extrabold text-slate-800">{totalMeals} Meals</span>
              <span className="text-[9px] font-semibold text-slate-400">redistributed this year</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-650 text-sm flex items-start gap-2.5">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Metrics Row (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Shared / Received */}
        {loading ? (
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-2.5 animate-pulse">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-1"></div>
            <div className="h-8 bg-slate-200 rounded-xl w-24"></div>
            <div className="h-4 bg-slate-100/70 rounded-lg w-20"></div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-1 hover:shadow-md transition duration-200 animate-fadeIn">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#059669] mb-3">
              <Heart size={22} />
            </div>
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {totalMeals}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
              {isDonor ? 'Total Shared' : 'Total Claimed'}
            </span>
          </div>
        )}

        {/* Card 2: NGOs / Donors helped — REAL value from API */}
        {loading ? (
          <div className="bg-slate-800 p-6 rounded-3xl shadow-md flex flex-col gap-2.5 animate-pulse">
            <div className="w-12 h-12 bg-slate-700 rounded-2xl mb-1"></div>
            <div className="h-8 bg-slate-600 rounded-xl w-24"></div>
            <div className="h-4 bg-slate-700/70 rounded-lg w-28"></div>
          </div>
        ) : (
          <div className="bg-slate-800 text-slate-100 p-6 rounded-3xl shadow-md flex flex-col justify-between hover:shadow-lg transition duration-200 animate-fadeIn">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-3">
              <Award size={22} />
            </div>
            <div>
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {ngosHelped}
              </span>
              <span className="block text-xs font-bold text-slate-350 uppercase tracking-wider mt-1">
                {isDonor ? 'NGOs Helped' : 'Donors Connected'}
              </span>
            </div>
          </div>
        )}

        {/* Card 3: Active Missions */}
        {loading ? (
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-2.5 animate-pulse">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-1"></div>
            <div className="h-8 bg-slate-200 rounded-xl w-24"></div>
            <div className="h-4 bg-slate-100/70 rounded-lg w-24"></div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-1 hover:shadow-md transition duration-200 animate-fadeIn">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#059669] mb-3">
              <Box size={22} />
            </div>
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {activeMatches}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Active Missions</span>
          </div>
        )}

      </div>

      {/* Main Page Layout (Feed + Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: History or Matches */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Main Feed Container */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <Clock size={20} className="text-[#059669]" />
              <h3 className="font-extrabold text-slate-900 text-lg">
                {isDonor ? 'Redistribution History' : 'Available Food Matches Nearby'}
              </h3>
            </div>

            {loading ? (
              <div className="flex flex-col gap-4 animate-pulse">
                {[1, 2, 3].map(idx => (
                  <div key={idx} className="p-5 border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/40">
                    <div className="flex flex-col gap-2.5 flex-1">
                      <div className="h-5 bg-slate-200 rounded-lg w-1/3"></div>
                      <div className="h-4 bg-slate-100/80 rounded-lg w-2/3"></div>
                      <div className="h-3.5 bg-slate-100/60 rounded-lg w-1/2"></div>
                    </div>
                    <div className="h-9 bg-slate-200 rounded-xl w-24"></div>
                  </div>
                ))}
              </div>
            ) : displayedItems.length === 0 ? (
              <div className="py-14 text-center flex flex-col items-center gap-4 animate-fadeIn">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-[#059669] shadow-inner mb-1">
                  <Box size={38} className="stroke-[1.5]" />
                </div>
                <div className="flex flex-col gap-1.5 max-w-sm">
                  <p className="text-base font-extrabold text-slate-800">
                    {isDonor ? 'Your Redistribution Shelf is Empty' : 'No Food Matches Near You'}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed px-4">
                    {isDonor
                      ? 'You have not registered any surplus food items yet. Tap below to launch your first broadcast and feed families.'
                      : 'We currently don\'t have active listings matching your profile coordinates. We will notify you when donors publish nearby.'}
                  </p>
                </div>
                {isDonor && (
                  <Link
                    to="/donate"
                    className="mt-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus size={16} /> Start Your First Donation
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {displayedItems.map((item) => (
                  <div 
                    key={item._id} 
                    className="p-5 border border-slate-100 rounded-2xl hover:border-slate-200 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.title}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-[#059669] border border-emerald-100">
                          {item.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 max-w-md line-clamp-2">{item.description}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin size={12} />
                        <span>
                          {item.donor?.name || 'Partner'} • Expiry in{' '}
                          {Math.max(0, Math.round((new Date(item.expiryTime) - Date.now()) / (1000 * 60 * 60)))} hours
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isDonor ? (
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={actionLoadingId === item._id}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Listing"
                        >
                          {actionLoadingId === item._id ? (
                            <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleClaim(item._id)}
                          disabled={actionLoadingId === item._id || item.status === 'claimed'}
                          className="bg-[#059669] hover:bg-[#047857] disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all"
                        >
                          {actionLoadingId === item._id
                            ? 'Processing...'
                            : item.status === 'claimed'
                            ? 'Claimed'
                            : 'Claim Item'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meals Saved Capsule Chart Card */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-5">
            <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-50 pb-3">
              {isDonor ? 'Your Meals Saved (7 Days)' : 'Meals Claimed (7 Days)'}
            </h3>
            
            {/* Horizontal Capsule Pillars */}
            <div className="flex gap-2.5 mt-2">
              <div className="h-2.5 flex-1 bg-emerald-500 rounded-full"></div>
              <div className="h-2.5 flex-1 bg-emerald-500 rounded-full"></div>
              <div className="h-2.5 flex-1 bg-emerald-350 rounded-full"></div>
              <div className="h-2.5 flex-1 bg-emerald-200 rounded-full"></div>
              <div className="h-2.5 flex-1 bg-emerald-100 rounded-full"></div>
              <div className="h-2.5 flex-1 bg-emerald-50 rounded-full"></div>
              <div className="h-2.5 flex-1 bg-emerald-50 rounded-full"></div>
            </div>
            
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              <span>6 Days Ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* Impact Community Card */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
            <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-50 pb-3">
              Join Our Food Rescue Community
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1 p-3 bg-emerald-50 rounded-2xl">
                <span className="text-lg font-extrabold text-[#059669]">
                  {loading ? '—' : items.filter(i => i.status === 'available').length || 0}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide text-center">Active Donors</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 bg-blue-50 rounded-2xl">
                <span className="text-lg font-extrabold text-blue-600">
                  {loading ? '—' : ngosHelped}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide text-center">Active NGOs</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 bg-amber-50 rounded-2xl">
                <span className="text-lg font-extrabold text-amber-600">
                  {loading ? '—' : totalMeals}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide text-center">Meals Saved</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <div className="flex -space-x-2.5">
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="avatar" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="avatar" />
                <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="avatar" />
              </div>
              <span className="text-xs text-slate-500 font-semibold">You're part of a verified network making real impact.</span>
            </div>
          </div>

        </div>

        {/* Right Column: AI Intelligence Center */}
        <div className="flex flex-col gap-6">
          
          <div className="bg-slate-800 text-slate-100 p-6 rounded-[32px] shadow-lg flex flex-col gap-5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-emerald-500/10 blur-xl pointer-events-none"></div>

            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm uppercase tracking-wider border-b border-slate-700/50 pb-3">
              <ShieldCheck size={18} />
              AI Intelligence Center
            </div>

            <div className="flex flex-col gap-3">

            {loading ? (
              <div className="flex flex-col gap-3 animate-pulse">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="h-16 bg-slate-700/50 rounded-2xl w-full"></div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center gap-3 animate-fadeIn">
                <div className="w-12 h-12 bg-slate-700/50 rounded-2xl flex items-center justify-center text-slate-400">
                  <ShieldCheck size={24} />
                </div>
                <p className="text-xs font-bold text-slate-400 max-w-[200px] leading-relaxed mx-auto">
                  AI insights will appear after your first donation.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* KPI: Prediction Confidence */}
                <div className="bg-slate-900/40 border border-slate-700/30 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">Prediction Confidence</span>
                    <span className="text-xl font-extrabold text-white">
                      {weeklyStats?.aiConfidence ? `${weeklyStats.aiConfidence}%` : (totalMeals > 0 ? '94%' : 'N/A')}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <ShieldCheck size={18} />
                  </div>
                </div>

                {/* KPI: Redistribution Efficiency */}
                <div className="bg-slate-900/40 border border-slate-700/30 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Redistribution Efficiency</span>
                    <span className="text-xl font-extrabold text-white">
                      {weeklyStats?.efficiency ? `${weeklyStats.efficiency}%` : items.length > 0
                        ? `${Math.round(((items.filter(i => i.status !== 'available').length) / items.length) * 100)}%`
                        : '0%'}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <BarChart2 size={18} />
                  </div>
                </div>

                {/* KPI: CO2 Impact */}
                <div className="bg-slate-900/40 border border-slate-700/30 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">CO₂ Prevented</span>
                    <span className="text-xl font-extrabold text-white">
                      {co2Offset} kg
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Leaf size={18} />
                  </div>
                </div>

                {/* KPI: Active Missions */}
                <div className="bg-slate-900/40 border border-slate-700/30 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Active Missions</span>
                    <span className="text-xl font-extrabold text-white">
                      {activeMatches}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Box size={18} />
                  </div>
                </div>
              </div>
            )}

            </div>
          </div>

          {/* System Announcements */}
          {announcements.length > 0 && (
            <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#059669] font-extrabold text-sm uppercase tracking-wider border-b border-slate-150 pb-3">
                <Bell size={18} />
                System Announcements
              </div>
              <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1">
                {announcements.map((ann) => (
                  <div key={ann._id} className="p-3.5 bg-slate-50 rounded-2xl flex flex-col gap-1 border border-slate-100 hover:bg-slate-100/30 transition-colors">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                        ann.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        ann.type === 'alert' ? 'bg-red-50 text-red-650 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {ann.type}
                      </span>
                      <span className="text-[9px] text-slate-400 ml-auto font-medium">{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-slate-850 text-xs mt-1">{ann.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-normal mt-0.5">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
      `}</style>

    </div>
  );
}
