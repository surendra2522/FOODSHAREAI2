import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Mail, Lock, User, AlertTriangle, ArrowRight, Building2,
  Utensils, Heart, ShieldCheck, Eye, EyeOff, CheckCircle2,
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
    label: 'NGO / Charity',
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

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [organization, setOrganization] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select your role before creating an account.');
      addToast('Please select your role.', 'warning');
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError('Please fill in all required fields.');
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      addToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      addToast('Passwords do not match.', 'error');
      return;
    }
    setError('');
    setLoading(true);

    const result = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      role: selectedRole,
      organization: organization.trim(),
      address: '',
    });

    if (result.success) {
      setSuccess(true);
      addToast('Registration Successful! Welcome to FoodShare.', 'success');
      setTimeout(() => {
        setLoading(false);
        if (selectedRole === 'admin') navigate('/admin/dashboard');
        else if (selectedRole === 'charity') navigate('/ngo-dashboard');
        else navigate('/dashboard');
      }, 800);
    } else {
      setLoading(false);
      setError(result.message);
      addToast(result.message || 'Registration failed.', 'error');
    }
  };

  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { level: 'weak', color: 'bg-red-400', label: 'Weak (Too short)' };
    if (password.length < 8) return { level: 'fair', color: 'bg-amber-400', label: 'Fair' };
    if (/[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) return { level: 'very-strong', color: 'bg-[#16A34A]', label: 'Very Strong' };
    if (/[A-Z]/.test(password) && /\d/.test(password)) return { level: 'strong', color: 'bg-blue-500', label: 'Strong' };
    return { level: 'good', color: 'bg-[#16A34A]', label: 'Good' };
  };
  const strength = getPasswordStrength();

  return (
    <div className="flex-1 flex min-h-[calc(100vh-73px)] items-center justify-center p-6 sm:p-12 bg-slate-50 relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#16A34A] blur-[140px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#F97316] blur-[120px] opacity-10 pointer-events-none" />

      <div className="w-full max-w-[480px] bg-white/80 backdrop-blur-xl border border-white p-8 sm:p-10 rounded-[32px] shadow-2xl shadow-slate-200/50 relative z-10 flex flex-col gap-8 my-auto">
          
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-slate-500 font-medium">Join us to make a real impact.</p>
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
              <span>Account created! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Role Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">I am a...</label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading || success}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3.5 pl-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all font-medium text-sm"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || success}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3.5 pl-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all font-medium text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              
              {/* Organization (NGO only) */}
              {selectedRole === 'charity' && (
                <div className="flex flex-col gap-2 sm:col-span-2 animate-[fadeIn_0.3s_ease]">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Organization Name <span className="text-slate-400 font-normal normal-case">(Optional)</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                      <Building2 size={18} />
                    </span>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      disabled={loading || success}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3.5 pl-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all font-medium text-sm"
                      placeholder="e.g. Hope Shelter Trust"
                    />
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || success}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3.5 pl-11 pr-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all font-medium text-sm"
                    placeholder="Minimum 6 characters"
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
                {/* Strength Meter */}
                {strength && (
                  <div className="flex items-center gap-2 px-1 mt-1 animate-[fadeIn_0.2s_ease]">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${
                        strength.level === 'weak' ? 'w-1/4' :
                        strength.level === 'fair' ? 'w-2/4' :
                        strength.level === 'good' ? 'w-3/4' : 'w-full'
                      }`} />
                    </div>
                    <span className={`text-[10px] font-bold ${
                      strength.level === 'weak' ? 'text-red-500' :
                      strength.level === 'fair' ? 'text-amber-500' :
                      strength.level === 'good' ? 'text-blue-500' : 'text-[#16A34A]'
                    }`}>{strength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading || success}
                    className={`w-full bg-slate-50/50 border rounded-2xl px-4 py-3.5 pl-11 pr-11 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all font-medium text-sm ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-300 focus:ring-red-400'
                        : confirmPassword && password === confirmPassword
                        ? 'border-[#16A34A]/40 focus:ring-[#16A34A]'
                        : 'border-slate-200 focus:ring-[#16A34A]'
                    }`}
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex="-1"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {confirmPassword && password === confirmPassword && (
                    <span className="absolute inset-y-0 right-10 flex items-center text-[#16A34A] animate-[fadeIn_0.2s_ease]">
                      <CheckCircle2 size={16} />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className={`w-full relative overflow-hidden font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 mt-4 text-sm shadow-xl active:scale-[0.98] ${
                selectedRole === 'admin' ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20' :
                selectedRole === 'charity' ? 'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-orange-500/20' :
                'bg-[#16A34A] hover:bg-[#15803d] text-white shadow-green-500/20'
              } ${(!selectedRole || loading || success) ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {loading && !success ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Success!</span>
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm font-medium text-slate-500 pt-2 border-t border-slate-100">
            Already have an account?{' '}
            <Link to="/login" className="text-[#16A34A] hover:text-[#15803d] font-bold transition-colors">
              Sign In
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
