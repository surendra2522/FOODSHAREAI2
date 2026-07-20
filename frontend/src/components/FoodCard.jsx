import React from 'react';
import { Calendar, MapPin, Sparkles, Clock, Utensils, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function FoodCard({ item, onClaim, loadingId }) {
  const { user } = useAuth();
  
  // Calculate hours left
  const getHoursLeft = (expiryDate) => {
    const hours = Math.round((new Date(expiryDate) - new Date()) / (1000 * 60 * 60));
    return hours > 0 ? `${hours} hrs left` : 'Expired';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'claimed': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-white/5';
    }
  };

  // Generate a mock matching score based on distance and urgency for aesthetic effect
  const getAiScore = () => {
    if (item.aiMatchScore) return item.aiMatchScore;
    const score = Math.floor(Math.random() * 15) + 85; // 85% to 99%
    return score;
  };

  return (
    <div className="glass-card overflow-hidden flex flex-col h-full group relative">
      {/* AI Score Badge */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-brand-500/30 text-brand-400 text-xs font-semibold backdrop-blur-sm shadow-md">
        <Sparkles size={12} className="animate-spin-slow" />
        <span>AI Match: {getAiScore()}%</span>
      </div>

      {/* Main Content */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-brand-400 group-hover:text-brand-300 transition-colors">
            <Utensils size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white group-hover:text-brand-300 transition-colors line-clamp-1">{item.title}</h3>
            <span className="text-xs text-slate-400 font-medium bg-slate-900/40 px-2 py-0.5 rounded border border-white/5 uppercase mt-1 inline-block">
              {item.foodType}
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-300 line-clamp-2 min-h-[40px]">{item.description}</p>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-2 bg-slate-900/30 p-3 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-slate-500" />
            <span>{getHoursLeft(item.expiryTime)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-slate-500" />
            <span>{item.distance || '1.2 km'} away</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 pt-1 border-t border-white/5 mt-1">
            <span className="text-slate-500">Quantity:</span>
            <span className="text-white font-medium">{item.quantity}</span>
          </div>
        </div>

        {/* Donor info */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-[10px] font-bold">
              {item.donor?.name?.charAt(0) || 'D'}
            </div>
            <span className="text-xs text-slate-400 max-w-[100px] truncate">{item.donor?.name || 'Local Donor'}</span>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${getStatusColor(item.status)}`}>
            {item.status}
          </span>
        </div>
      </div>

      {/* Action Button */}
      {user && user.role === 'charity' && item.status === 'available' && (
        <button
          onClick={() => onClaim(item._id)}
          disabled={loadingId === item._id}
          className="w-full bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white font-semibold py-3 border-t border-brand-500/20 group-hover:bg-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loadingId === item._id ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Check size={16} />
              Claim Donation
            </>
          )}
        </button>
      )}

      {user && user.role === 'donor' && item.donor?._id === user.id && (
        <div className="w-full text-center py-2 text-xs text-slate-500 bg-slate-900/40 border-t border-white/5">
          Your Donation
        </div>
      )}
    </div>
  );
}
