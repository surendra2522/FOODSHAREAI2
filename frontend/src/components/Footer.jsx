import React from 'react';
import { useLocation } from 'react-router-dom';
import { Leaf, Heart } from 'lucide-react';

export default function Footer() {
  const location = useLocation();
  const isHome = [
    '/', '/login', '/register', '/analytics', '/dashboard',
    '/donate', '/donor-portal', '/impact', '/my-donations',
    '/ngo-dashboard', '/ngo-impact', '/admin/login', '/admin/dashboard'
  ].includes(location.pathname);

  return (
    <footer className={`mt-auto border-t py-8 px-4 sm:px-6 md:px-8 transition-colors duration-300 ${
      isHome 
        ? 'bg-[#F8FAFC] border-slate-200 text-slate-600' 
        : 'border-white/10 bg-slate-950 text-slate-400'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Leaf size={18} className="text-brand-500" />
          <span className={`text-sm font-semibold tracking-wider ${isHome ? 'text-slate-800' : 'text-white'}`}>FOODSHARE AI</span>
        </div>
        <p className="text-xs flex items-center gap-1.5">
          Made with <Heart size={12} className="text-red-500 fill-red-500" /> & AI for a better world &copy; {new Date().getFullYear()}
        </p>
        <div className={`flex gap-4 text-xs ${isHome ? 'text-slate-500' : 'text-slate-400'}`}>
          <a href="#privacy" className={`transition-colors ${isHome ? 'hover:text-slate-900' : 'hover:text-white'}`}>Privacy Policy</a>
          <a href="#terms" className={`transition-colors ${isHome ? 'hover:text-slate-900' : 'hover:text-white'}`}>Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
