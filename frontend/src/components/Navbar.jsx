import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Menu, X, LogOut, LayoutDashboard, Gift, HandHelping,
  Utensils, BarChart2, LogIn, UserPlus, Star, Bell,
  ChevronDown, User, Settings, ClipboardList, AlertCircle, TrendingUp, Trophy, Award
} from 'lucide-react';

// ─── Notifications ───────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const profileRef = useRef(null);
  const notifRef   = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const isHome = [
    '/', '/login', '/register', '/analytics', '/dashboard',
    '/donate', '/donor-portal', '/impact', '/my-donations',
    '/admin/login', '/admin/dashboard'
  ].includes(location.pathname);

  const isActive = (path) => location.pathname === path;

  // Close dropdowns on outside click
  useEffect(() => {
    const handle = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const navLinks = [
    { name: 'Dashboard',    path: '/dashboard',    icon: LayoutDashboard, show: !!user && user.role !== 'admin' },
    { name: 'Admin Console',path: '/admin/dashboard', icon: LayoutDashboard, show: !!user && user.role === 'admin' },
    { name: 'Donate Food',  path: '/donate',       icon: Gift,            show: user?.role === 'donor' },
    { name: 'My Donations', path: '/donor-portal', icon: ClipboardList,   show: user?.role === 'donor' },

    { name: 'Platform Impact', path: '/impact',       icon: TrendingUp,      show: !!user && user.role !== 'admin' },
  ];

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully. See you soon!', 'success');
    navigate('/');
    setProfileOpen(false);
    setMobileOpen(false);
  };

  const notifTypeColor = (type) => ({
    success: 'bg-emerald-50 text-[#059669] border-emerald-100',
    info:    'bg-blue-50 text-blue-600 border-blue-100',
    achievement: 'bg-amber-50 text-amber-600 border-amber-100',
  }[type] || 'bg-slate-50 text-slate-600 border-slate-100');

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 px-4 py-3 sm:px-6 md:px-8 ${
      isHome
        ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm'
        : 'bg-slate-950/90 backdrop-blur-md border-b border-white/10'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="bg-[#10B981] p-2 rounded-xl text-white flex items-center justify-center shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform">
            <Utensils size={20} />
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-baseline gap-0.5">
              <span className={`font-extrabold text-xl tracking-tight transition-colors ${isHome ? 'text-slate-900' : 'text-white'}`}>
                FoodShare
              </span>
              <span className="text-[#10B981] font-bold text-xl">AI</span>
            </div>
            <span className={`text-[8px] font-bold tracking-wider mt-0.5 hidden sm:block ${isHome ? 'text-slate-400' : 'text-slate-500'}`}>
              SMART REDISTRIBUTION
            </span>
          </div>
        </Link>

        {/* ── Desktop Nav Links ─────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-1">
          {user ? (
            navLinks.filter(l => l.show).map(link => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? isHome
                        ? 'text-[#059669] bg-emerald-50 border border-emerald-100'
                        : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      : isHome
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={15} />
                  {link.name}
                </Link>
              );
            })
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/analytics" className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${isHome ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}>
                <BarChart2 size={15} /> Impact
              </Link>
              {location.pathname !== '/register' && (
                <Link to="/leaderboard" className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${isHome ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}>
                  <Trophy size={15} /> Leaderboard
                </Link>
              )}
              {location.pathname !== '/login' && (
                <Link to="/login" className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${isHome ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'}`}>
                  <LogIn size={15} /> Sign In
                </Link>
              )}
              <Link to="/register" className="bg-[#059669] hover:bg-[#047857] text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-1.5">
                <UserPlus size={15} /> Join Mission
              </Link>
            </div>
          )}
        </div>

        {/* ── Desktop Right Side: Notifs + Profile ─────────────────────── */}
        {user && (
          <div className="hidden md:flex items-center gap-2">

            {/* Notification Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className={`relative p-2.5 rounded-xl border transition-all ${
                  isHome
                    ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center leading-none px-1">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-950/10 overflow-hidden z-50 animate-fadeIn">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
                    <span className="font-extrabold text-slate-900 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[11px] font-bold text-[#059669] hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col divide-y divide-slate-50 max-h-72 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 flex gap-3 items-start transition hover:bg-slate-50 ${!n.read ? 'bg-emerald-50/30' : ''}`}>
                        <span className={`mt-0.5 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border flex-shrink-0 ${notifTypeColor(n.type)}`}>
                          {n.type}
                        </span>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <p className="text-xs text-slate-700 font-medium leading-snug">{n.text}</p>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-[#059669] flex-shrink-0 mt-1.5" />}
                      </div>
                    ))}
                  </div>
                  {notifications.length === 0 && (
                    <div className="py-10 text-center text-sm text-slate-400">No notifications</div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className={`flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 rounded-xl border transition-all ${
                  isHome
                    ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#059669]/20 flex items-center justify-center text-[#059669] text-xs font-extrabold uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <div className={`text-xs font-bold leading-none ${isHome ? 'text-slate-800' : 'text-white'}`}>{user.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize mt-0.5">{user.role}</div>
                </div>
                <ChevronDown size={14} className={`transition-transform ${profileOpen ? 'rotate-180' : ''} ${isHome ? 'text-slate-500' : 'text-slate-400'}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-950/10 overflow-hidden z-50 animate-slide-down">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#059669]/20 flex items-center justify-center text-[#059669] text-sm font-extrabold uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{user.role} Account</p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5">
                    {user.role === 'donor' && (
                      <>
                        <Link to="/donor-portal" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition font-medium">
                          <ClipboardList size={15} className="text-slate-400" /> My Donations
                        </Link>
                        <Link to="/certificate" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition font-medium">
                          <Award size={15} className="text-slate-400" /> My Certificate
                        </Link>
                        <Link to="/donate" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition font-medium">
                          <Gift size={15} className="text-slate-400" /> Post Surplus
                        </Link>

                      </>
                    )}

                    <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition font-medium">
                      <LayoutDashboard size={15} className="text-slate-400" /> Dashboard
                    </Link>
                    <Link to="/analytics" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition font-medium">
                      <BarChart2 size={15} className="text-slate-400" /> Impact Analytics
                    </Link>
                    <Link to="/leaderboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition font-medium">
                      <Trophy size={15} className="text-slate-400" /> Leaderboard
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 py-1.5">
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition font-medium">
                      <Settings size={15} className="text-slate-400" /> Account Settings
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 py-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition font-medium"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Mobile: Bell + Hamburger ──────────────────────────────────── */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={`relative p-2 rounded-xl border transition-all ${isHome ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-400'}`}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-extrabold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">Notifications</span>
                    {unreadCount > 0 && <button onClick={markAllRead} className="text-[11px] font-bold text-[#059669]">Mark all read</button>}
                  </div>
                  <div className="flex flex-col divide-y divide-slate-50 max-h-60 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 flex gap-3 items-start ${!n.read ? 'bg-emerald-50/30' : ''}`}>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <p className="text-xs text-slate-700 font-medium">{n.text}</p>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-[#059669] flex-shrink-0 mt-1.5" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-2 rounded-xl transition-colors ${isHome ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5'}`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className={`md:hidden mt-3 pt-4 border-t flex flex-col gap-1 ${isHome ? 'border-slate-100' : 'border-white/10'}`}>
          {user ? (
            <>
              {/* User header */}
              <div className={`mx-2 mb-2 flex items-center gap-3 p-3 rounded-2xl ${isHome ? 'bg-slate-50' : 'bg-white/5'}`}>
                <div className="w-10 h-10 rounded-full bg-[#059669]/20 flex items-center justify-center text-[#059669] text-sm font-extrabold uppercase">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className={`text-sm font-bold ${isHome ? 'text-slate-900' : 'text-white'}`}>{user.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                </div>
              </div>

              {navLinks.filter(l => l.show).map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 mx-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive(link.path)
                        ? 'bg-[#059669] text-white shadow-md shadow-emerald-500/20'
                        : isHome
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    {link.name}
                  </Link>
                );
              })}

              <Link to="/analytics" className={`flex items-center gap-3 mx-2 px-4 py-3 rounded-xl text-sm font-semibold ${isHome ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5'}`}>
                <BarChart2 size={18} /> Impact Analytics
              </Link>
              <Link to="/profile" className={`flex items-center gap-3 mx-2 px-4 py-3 rounded-xl text-sm font-semibold ${isHome ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5'}`}>
                <Settings size={18} /> Account Settings
              </Link>

              <div className="mx-2 mt-2 pt-3 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold hover:bg-red-100 transition"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 mx-2 pb-2">
              <Link to="/analytics" className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold ${isHome ? 'border-slate-200 text-slate-700 hover:bg-slate-50' : 'border-white/10 text-slate-300 hover:bg-white/5'}`}>
                <BarChart2 size={16} /> Impact
              </Link>
              {location.pathname !== '/login' && (
                <Link to="/login" className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold ${isHome ? 'border-slate-200 text-slate-700 hover:bg-slate-50' : 'border-white/10 text-slate-300 hover:bg-white/5'}`}>
                  <LogIn size={16} /> Sign In
                </Link>
              )}
              <Link to="/register" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#059669] text-white text-sm font-semibold hover:bg-[#047857] shadow-lg shadow-emerald-500/10">
                <UserPlus size={16} /> Join Mission
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
