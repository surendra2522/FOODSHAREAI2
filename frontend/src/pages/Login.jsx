import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Mail, Lock, AlertTriangle, ArrowRight, Utensils,
  Heart, Building2, ShieldCheck, Eye, EyeOff, CheckCircle2,
  Users, Leaf
} from 'lucide-react';

const ROLES = [
  {
    id: 'donor',
    label: 'Donor',
    desc: 'Share surplus food with communities.',
    icon: Heart,
    activeBg: 'bg-emerald-50',
    activeBorder: 'border-[#16A34A]',
    activeText: 'text-[#16A34A]',
    activeIcon: 'text-[#16A34A]',
    checkBg: 'bg-[#16A34A]',
  },
  {
    id: 'charity',
    label: 'NGO',
    desc: 'Claim and distribute available donations.',
    icon: Building2,
    activeBg: 'bg-orange-50',
    activeBorder: 'border-[#F97316]',
    activeText: 'text-[#F97316]',
    activeIcon: 'text-[#F97316]',
    checkBg: 'bg-[#F97316]',
  },
  {
    id: 'admin',
    label: 'Admin',
    desc: 'Manage the FoodShareAI ecosystem.',
    icon: ShieldCheck,
    activeBg: 'bg-slate-50',
    activeBorder: 'border-slate-900',
    activeText: 'text-slate-900',
    activeIcon: 'text-slate-900',
    checkBg: 'bg-slate-900',
  },
];

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      addToast('Please fill in all fields.', 'error');
      return;
    }
    if (!selectedRole) {
      setError('Please select your user role before signing in.');
      addToast('Please select your user role before signing in.', 'warning');
      return;
    }
    setError('');
    setLoading(true);

    const result = await login(email, password, selectedRole);
    
    if (result.success) {
      setSuccess(true);
      addToast('Login Successful! Welcome back.', 'success');
      setTimeout(() => {
        setLoading(false);
        if (selectedRole === 'admin') navigate('/admin/dashboard');
        else if (selectedRole === 'charity') navigate('/ngo-dashboard');
        else navigate('/dashboard');
      }, 800);
    } else {
      setLoading(false);
      setError(result.message);
      addToast(result.message || 'Login failed. Please check your credentials.', 'error');
    }
  };

  return (
    <div className="flex-1 flex min-h-[calc(100vh-73px)] items-center justify-center p-6 sm:p-12 bg-slate-50 relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#16A34A] blur-[140px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#F97316] blur-[120px] opacity-10 pointer-events-none" />

      <div className="w-full max-w-[480px] bg-white/80 backdrop-blur-xl border border-white p-8 sm:p-10 rounded-[32px] shadow-2xl shadow-slate-200/50 relative z-10 flex flex-col gap-8">
          
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Please sign in to your account.</p>
          </div>

          {/* Error/Success Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-start gap-3 animate-[fadeIn_0.3s_ease]">
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium flex items-center gap-3 animate-[fadeIn_0.3s_ease]">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <span>Login Successful! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Role Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Role</label>
              <div className="grid grid-cols-3 gap-3">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => { setSelectedRole(role.id); setError(''); }}
                      className={`relative flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 text-center group ${
                        isSelected
                          ? `${role.activeBorder} ${role.activeBg}`
                          : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && (
                        <span className={`absolute top-2 right-2 w-4 h-4 ${role.checkBg} rounded-full flex items-center justify-center shadow-sm`}>
                          <CheckCircle2 size={10} className="text-white" strokeWidth={3} />
                        </span>
                      )}
                      <Icon
                        size={22}
                        className={isSelected ? role.activeIcon : 'text-slate-400 group-hover:text-slate-600 transition-colors'}
                      />
                      <span className={`font-bold text-[11px] sm:text-xs ${isSelected ? role.activeText : 'text-slate-600'}`}>
                        {role.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Role description */}
              <div className="h-4 flex items-center justify-center">
                {selectedRole ? (
                  <p className="text-xs font-semibold text-slate-500 animate-[fadeIn_0.2s_ease]">
                    {ROLES.find(r => r.id === selectedRole)?.desc}
                  </p>
                ) : (
                  <p className="text-xs font-medium text-slate-400">Choose a role to continue</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || success}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3.5 pl-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent focus:bg-white transition-all font-medium text-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="password">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || success}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3.5 pl-11 pr-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent focus:bg-white transition-all font-medium text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className={`w-full relative overflow-hidden font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 mt-2 text-sm shadow-xl active:scale-[0.98] ${
                selectedRole === 'admin' ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20' :
                selectedRole === 'charity' ? 'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-orange-500/20' :
                'bg-[#16A34A] hover:bg-[#15803d] text-white shadow-green-500/20'
              } ${(!selectedRole || loading || success) ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {loading && !success ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Success!</span>
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm font-medium text-slate-500 pt-2">
            New to FoodShareAI?{' '}
            <Link to="/register" className="text-[#16A34A] hover:text-[#15803d] font-bold transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
