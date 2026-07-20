import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Gift, Star, Users, TrendingUp, Leaf, Award, Zap, Clock,
  CheckCircle2, Circle, ChevronRight, Plus, BarChart2,
  Sparkles, Heart, Package, AlertCircle, Trophy, Download
} from 'lucide-react';

// ─── Status tracker steps ────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: 'submitted',   label: 'Submitted',    icon: Package },
  { key: 'notified',    label: 'NGO Notified', icon: Zap },
  { key: 'accepted',    label: 'Accepted',     icon: CheckCircle2 },
  { key: 'collected',   label: 'Collected',    icon: Gift },
];

// Map backend donation status → step index
function statusToStep(status) {
  switch (status) {
    case 'available': return 1;   // submitted + notified
    case 'claimed':   return 2;   // + accepted
    case 'completed': return 3;   // + collected
    default:          return 0;
  }
}

// ─── Achievement badge definitions ───────────────────────────────────────────
function buildBadges(donations) {
  const count     = donations.length;
  const totalMeals = donations.reduce((acc, d) => {
    const m = d.quantity?.match(/(\d+(\.\d+)?)/);
    return acc + (m ? parseFloat(m[0]) : 0);
  }, 0);
  return [
    {
      id: 'first',
      label: 'First Donation',
      desc: 'Made your very first surplus broadcast',
      icon: '🥇',
      earned: count >= 1,
      color: 'amber',
    },
    {
      id: 'meals100',
      label: '100 Meals Shared',
      desc: 'Helped save 100+ meals from going to waste',
      icon: '🍽️',
      earned: totalMeals >= 100,
      color: 'emerald',
    },
    {
      id: 'hero',
      label: 'Community Hero',
      desc: 'Made 5 or more successful donations',
      icon: '🏆',
      earned: count >= 5,
      color: 'indigo',
    },
  ];
}

// ─── Small helper components ──────────────────────────────────────────────────
function StatCard({ icon: Icon, color, label, value, sub }) {
  const colors = {
    emerald: 'bg-emerald-50 text-[#059669]',
    amber:   'bg-amber-50   text-amber-600',
    indigo:  'bg-indigo-50  text-indigo-600',
    teal:    'bg-teal-50    text-teal-600',
  };
  return (
    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-2">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      {sub && <span className="text-xs text-[#059669] font-semibold flex items-center gap-1"><TrendingUp size={11}/>{sub}</span>}
    </div>
  );
}

function StatusTimeline({ donation }) {
  const step = statusToStep(donation?.status || 'available');
  return (
    <div className="flex items-start gap-0 w-full">
      {STATUS_STEPS.map((s, idx) => {
        const done    = idx <= step;
        const current = idx === step;
        const Icon    = s.icon;
        return (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                done
                  ? 'bg-[#059669] border-[#059669] text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white border-slate-200 text-slate-300'
              } ${current ? 'ring-4 ring-emerald-500/20' : ''}`}>
                <Icon size={16} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wide text-center leading-tight ${
                done ? 'text-[#059669]' : 'text-slate-400'
              }`}>{s.label}</span>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mt-4 rounded-full transition-all duration-500 ${
                idx < step ? 'bg-[#059669]' : 'bg-slate-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Expiry countdown calculation helper
function getExpiryCountdown(expiryTime) {
  if (!expiryTime) return 'No expiry set';
  const now = new Date();
  const exp = new Date(expiryTime);
  const diffMs = exp - now;
  if (diffMs <= 0) return 'Expired';
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 0) {
    return `Expires in ${diffHours}h ${diffMins}m`;
  }
  return `Expires in ${diffMins}m`;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DonorPortal() {
  const { user } = useAuth();
  const [donations, setDonations]   = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading,   setLoading]     = useState(true);
  const [error,     setError]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [donationsRes, statsRes] = await Promise.all([
          api.get('/donations'),
          api.get('/donations/stats')
        ]);
        setDonations(donationsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        setError('Failed to fetch donations from MongoDB. Database connection could be offline.');
        setDonations([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const myDonations = donations.filter(d => {
    const donorId = d.donor?._id || d.donor;
    return donorId && String(donorId) === String(user?._id || user?.id);
  });

  const filteredDonations = myDonations.filter(d => {
    const statusMatch = statusFilter === 'all' || d.status === statusFilter;
    const foodType = d.foodType || 'prepared';
    const typeMatch = typeFilter === 'all' || foodType === typeFilter;
    return statusMatch && typeMatch;
  });

  const totalDonations = stats?.totalDonations || 0;
  const totalMeals = stats?.totalMeals || 0;
  const ngosHelped   = stats?.ngosHelped || 0;
  const impactScore  = Math.min(100, Math.round(totalMeals / 5 + ngosHelped * 8));
  const wasteKg      = stats?.wastePreventedKg || 0;
  const co2Offset    = stats?.co2PreventedKg || 0;
  const peopleHelped = Math.round(totalMeals / 2.5);
  const recentDonations = [...filteredDonations].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const latestDonation  = myDonations.length > 0 ? [...myDonations].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;
  const badges          = buildBadges(myDonations);

  const statusColors = {
    available: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25',
    claimed:   'bg-blue-500/10 text-blue-600 border-blue-500/25',
    completed: 'bg-slate-500/10 text-slate-600 border-slate-500/25',
  };
  const statusLabels = { available: 'Broadcasting', claimed: 'Claimed', completed: 'Completed' };

  return (
    <div className="flex-1 bg-[#F8FAFC] py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full flex flex-col gap-10 text-slate-800">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#059669] uppercase tracking-wider">
            <Sparkles size={13} />
            Donor Impact Hub
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            My <span className="text-[#059669]">Donor Portal</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Welcome back, <span className="font-bold text-slate-700">{user?.name}</span>. Track your impact and manage your donations.
          </p>
        </div>
        <Link
          to="/donate"
          className="self-start md:self-auto flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-bold py-3 px-5 rounded-2xl text-sm shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all"
        >
          <Plus size={18} />
          Post New Surplus
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-2.5">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── 1. DONOR DASHBOARD SUMMARY ────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart2 size={20} className="text-[#059669]" />
          Dashboard Summary
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon={Gift}     color="emerald" label="Total Donations"  value={loading ? '—' : totalDonations} sub="+1 this week" />
          <StatCard icon={Heart}    color="amber"   label="Meals Shared"     value={loading ? '—' : totalMeals}    sub="lifetime total" />
          <StatCard icon={Users}    color="indigo"  label="NGOs Helped"      value={loading ? '—' : ngosHelped}    sub="unique partners" />
          <StatCard icon={Star}     color="teal"    label="Impact Score"     value={loading ? '—' : `${impactScore}/100`} sub="growing" />
        </div>
      </section>

      {/* ── 2 + 3. RECENT DONATIONS + STATUS TRACKER (side-by-side) ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recent Donations list with filter capability */}
        <section className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 pb-3 gap-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-[#059669]" />
              My Donation History
            </h2>
            
            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-[11px] bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
              >
                <option value="all">All Statuses</option>
                <option value="available">Broadcasting</option>
                <option value="claimed">Claimed</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-[11px] bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
              >
                <option value="all">All Food Types</option>
                <option value="prepared">Prepared Meals</option>
                <option value="bakery">Bakery Items</option>
                <option value="pantry">Pantry / Dry</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-[#059669] rounded-full animate-spin" />
            </div>
          ) : recentDonations.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-slate-400 text-center">
              <Gift size={36} className="text-slate-200" />
              <p className="text-sm font-semibold text-slate-500">No donations match your selected filters.</p>
              <button 
                onClick={() => { setStatusFilter('all'); setTypeFilter('all'); }}
                className="text-xs font-bold text-[#059669] hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 max-h-[420px] overflow-y-auto pr-1">
              {recentDonations.map((d) => {
                const countdown = getExpiryCountdown(d.expiryTime);
                const isExpired = countdown === 'Expired';
                const foodType = d.foodType || 'prepared';
                
                // Decide color palette based on foodType
                const typeStyles = {
                  prepared: { bg: 'bg-emerald-50 text-emerald-600', label: 'Prepared', icon: Heart },
                  bakery:   { bg: 'bg-amber-50 text-amber-600', label: 'Bakery', icon: Package },
                  pantry:   { bg: 'bg-indigo-50 text-indigo-650', label: 'Pantry/Dry', icon: Leaf },
                }[foodType] || { bg: 'bg-slate-50 text-slate-600', label: 'Other', icon: Gift };

                const TypeIcon = typeStyles.icon;

                return (
                  <div 
                    key={d._id} 
                    className="flex items-center justify-between gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/70 hover:border-slate-200/90 hover:bg-white hover:shadow-sm transition-all duration-200"
                  >
                    {/* Food Thumbnail Badge */}
                    <div className={`w-11 h-11 rounded-xl ${typeStyles.bg} flex items-center justify-center flex-shrink-0 font-bold shadow-sm`}>
                      <TypeIcon size={18} />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="font-extrabold text-slate-800 text-sm truncate">{d.title}</span>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-405">
                        <span className="font-semibold text-slate-600">{d.quantity} meals</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded-md font-bold uppercase tracking-wider text-slate-500">
                          {typeStyles.label}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className={`font-bold ${isExpired ? 'text-red-500' : 'text-[#059669]'}`}>
                          {countdown}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusColors[d.status] || statusColors.available}`}>
                        {statusLabels[d.status] || 'Live'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold">
                        {new Date(d.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Donation Status Tracker */}
        <section className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-5">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-50 pb-3 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#059669]" />
            Donation Status Tracker
          </h2>

          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="w-7 h-7 border-3 border-emerald-500/20 border-t-[#059669] rounded-full animate-spin" />
            </div>
          ) : latestDonation ? (
            <>
              {/* Which donation is being tracked */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-[#059669] flex-shrink-0">
                  <Package size={16} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-slate-800 text-sm truncate">{latestDonation.title}</span>
                  <span className="text-[10px] text-slate-400">Most recent donation</span>
                </div>
              </div>

              {/* Timeline */}
              <StatusTimeline donation={latestDonation} />

              {/* Step description */}
              <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                {statusToStep(latestDonation.status) === 0 && 'Your donation has been submitted and is being processed.'}
                {statusToStep(latestDonation.status) === 1 && 'NGOs in your area have been notified and are reviewing this donation.'}
                {statusToStep(latestDonation.status) === 2 && 'A partner NGO has accepted this donation and is scheduling pickup.'}
                {statusToStep(latestDonation.status) === 3 && '✅ The food has been successfully collected and distributed. Great work!'}
              </p>
            </>
          ) : (
            <div className="py-10 flex flex-col items-center gap-3 text-slate-400">
              <Circle size={36} className="text-slate-200" />
              <p className="text-sm font-semibold text-slate-500">No donations to track yet.</p>
            </div>
          )}
        </section>
      </div>

      {/* ── 4. AI IMPACT INSIGHTS PANEL ────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-[#059669]" />
          AI Impact Insights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Meals Saved */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#059669]">
              <Heart size={22} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">{loading ? '—' : totalMeals}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Meals Saved</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Equivalent to feeding <strong className="text-slate-700">{peopleHelped} people</strong> a full nutritious meal.
            </p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#059669] h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, totalMeals / 5)}%` }} />
            </div>
          </div>

          {/* Food Waste Prevented */}
          <div className="bg-slate-800 text-white p-6 rounded-3xl shadow-md hover:shadow-lg transition flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
              <Leaf size={22} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">{loading ? '—' : wasteKg} kg</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Food Waste Prevented</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Saved <strong className="text-emerald-400">{co2Offset} kg CO₂</strong> — equivalent to not driving {Math.round(co2Offset * 4)} km.
            </p>
          </div>

          {/* Estimated People Helped */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col gap-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <Users size={22} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">{loading ? '—' : peopleHelped}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">People Helped</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real people in your community who received nutritious food because of you.
            </p>
            <div className="flex -space-x-2 mt-1">
              {['photo-1534528741775-53994a69daeb','photo-1507003211169-0a1dd7228f2d','photo-1494790108377-be9c29b29330'].map((id, i) => (
                <img key={i} className="w-7 h-7 rounded-full border-2 border-white object-cover" src={`https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=60`} alt="person" />
              ))}
              {peopleHelped > 3 && (
                <div className="w-7 h-7 rounded-full border-2 border-white bg-emerald-50 flex items-center justify-center text-[9px] font-extrabold text-[#059669]">
                  +{peopleHelped - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. ACHIEVEMENT BADGES ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <Award size={20} className="text-[#059669]" />
          Achievement Badges
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {badges.map((badge) => {
            const colorMap = {
              amber:   { ring: 'ring-amber-200',   bg: 'bg-amber-50',   text: 'text-amber-700',   bar: 'bg-amber-400',   label: 'bg-amber-100 text-amber-700' },
              emerald: { ring: 'ring-emerald-200', bg: 'bg-emerald-50', text: 'text-[#059669]', bar: 'bg-[#059669]', label: 'bg-emerald-100 text-[#059669]' },
              indigo:  { ring: 'ring-indigo-200',  bg: 'bg-indigo-50',  text: 'text-indigo-700',  bar: 'bg-indigo-500',  label: 'bg-indigo-100 text-indigo-700' },
            };
            const c = colorMap[badge.color];
            return (
              <div
                key={badge.id}
                className={`bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center gap-3 transition hover:shadow-md ${
                  badge.earned ? `ring-2 ${c.ring}` : 'opacity-60 grayscale'
                }`}
              >
                <div className={`w-16 h-16 ${c.bg} rounded-full flex items-center justify-center text-3xl shadow-inner`}>
                  {badge.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-extrabold text-slate-900 text-base">{badge.label}</span>
                  <span className="text-xs text-slate-400 leading-relaxed">{badge.desc}</span>
                </div>
                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${
                  badge.earned ? `${c.label}` : 'bg-slate-100 text-slate-400'
                }`}>
                  {badge.earned ? '✓ Earned' : 'Locked'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 6. QUICK ACTIONS BANNER ─────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Certificate CTA */}
        <div className="relative bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-3xl p-6 shadow-lg overflow-hidden flex flex-col gap-3">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
          <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
            <Award size={22} className="text-white" />
          </div>
          <div className="flex flex-col gap-1 z-10">
            <span className="font-extrabold text-base">Your Impact Certificate</span>
            <span className="text-sm text-emerald-100">Download your official recognition for {totalMeals} meals saved.</span>
          </div>
          <Link to="/certificate" className="self-start mt-1 flex items-center gap-2 bg-white text-[#059669] font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm hover:bg-emerald-50 transition z-10">
            <Download size={14} /> Download Certificate
          </Link>
        </div>
        {/* Leaderboard CTA */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-lg overflow-hidden flex flex-col gap-3">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-amber-500/10 rounded-full pointer-events-none" />
          <div className="w-11 h-11 bg-amber-500/20 rounded-2xl flex items-center justify-center">
            <Trophy size={22} className="text-amber-400" />
          </div>
          <div className="flex flex-col gap-1 z-10">
            <span className="font-extrabold text-base">Community Leaderboard</span>
            <span className="text-sm text-slate-400">See how you rank among top donors in the FoodShare community.</span>
          </div>
          <Link to="/leaderboard" className="self-start mt-1 flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition z-10">
            <Trophy size={14} /> View Rankings
          </Link>
        </div>
      </section>

    </div>
  );
}
