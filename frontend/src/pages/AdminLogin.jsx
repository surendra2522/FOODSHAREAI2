import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertTriangle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);

    const result = await login(email, password, 'admin');
    setLoading(false);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
      {/* Dark radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-slate-800/8 blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full bg-white border border-slate-100 p-8 rounded-[32px] shadow-xl shadow-slate-200/60 relative z-10 flex flex-col gap-7">

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Admin Console</h1>
            <p className="text-sm text-slate-500 mt-0.5">Access administrative telemetry and system controls</p>
          </div>
        </div>

        {/* Admin badge */}
        <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <p className="text-xs text-slate-600 font-medium">
            This portal is restricted to pre-authorized administrators only.{' '}
            <Link to="/login" className="text-[#059669] font-semibold hover:underline">
              Regular users sign in here →
            </Link>
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-2.5">
            <AlertTriangle size={17} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-0.5">Admin Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Mail size={17} />
              </span>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent focus:bg-white transition-all duration-200 pl-11 text-sm"
                placeholder="admin@foodshare.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-0.5">Security Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Lock size={17} />
              </span>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent focus:bg-white transition-all duration-200 pl-11 pr-11 text-sm"
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            id="admin-login-submit"
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-[0.98] w-full mt-1"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In to Console
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
