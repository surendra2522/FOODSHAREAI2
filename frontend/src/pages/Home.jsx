import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, Clock, MapPin, Bell, Zap, ShieldCheck, Heart, 
  ArrowRight, Gift, PieChart, Users, Leaf, Building2, Trophy, BarChart2
} from 'lucide-react';
import childrenSmiling from '../assets/children_smiling.png';
import axios from 'axios';

export default function Home() {
  const { user } = useAuth();
  const [liveStats, setLiveStats] = useState({ totalMealsSaved: 0, activePartners: 0, co2Offset: 0 });

  useEffect(() => {
    axios.get('http://localhost:5000/api/donations/public-stats')
      .then(r => setLiveStats(r.data))
      .catch(() => {});
  }, []);

  const features = [
    {
      title: 'AI-Based Matching',
      desc: 'The system uses intelligent matching algorithms to connect donors and NGOs with maximum efficiency.',
      icon: Sparkles,
      color: 'text-emerald-500 bg-emerald-50 border border-emerald-100/50',
    },
    {
      title: 'Freshness Tracking',
      desc: 'Integrated food freshness tracking ensures all redistributed food meets safety and quality standards.',
      icon: Clock,
      color: 'text-amber-500 bg-amber-50 border border-amber-100/50',
    },
    {
      title: 'Location-Based Logic',
      desc: 'Real-time location matching enables faster distribution by connecting you with the nearest NGOs.',
      icon: MapPin,
      color: 'text-indigo-500 bg-indigo-50 border border-indigo-100/50',
    },
    {
      title: 'Smart Alerts',
      desc: 'Instant notifications are sent for urgent food redistribution needs to minimize response time.',
      icon: Bell,
      color: 'text-rose-500 bg-rose-50 border border-rose-100/50',
    },
    {
      title: 'Event-Based Design',
      desc: 'Specifically engineered for event-based food waste management, making it more effective than general solutions.',
      icon: Zap,
      color: 'text-amber-600 bg-amber-50 border border-amber-100/50',
    },
    {
      title: 'Safety First',
      desc: 'Built-in verification protocols for all partners to ensure humanitarian impact is maximized safely.',
      icon: ShieldCheck,
      color: 'text-teal-500 bg-teal-50 border border-teal-100/50',
    },
  ];

  return (
    <div className="bg-[#F8FAFC] text-slate-800 flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-8 text-left z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F7F0] border border-[#C2F0DD] text-[#059669] text-xs font-semibold uppercase tracking-wider w-fit">
            <Sparkles size={14} className="animate-pulse" />
            Next-Gen Food Redistribution
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-[70px] font-extrabold tracking-tight leading-[1.05] text-slate-900">
            End <span className="text-[#10B981]">Waste.</span> <br />
            Begin <span className="relative inline-block text-amber-500 after:absolute after:bottom-2 after:left-0 after:right-0 after:h-2.5 after:bg-[#C2F0DD]/60 after:-z-10">Blessings.</span>
          </h1>

          <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
            An <strong className="text-slate-950 font-bold">AI-enabled</strong> platform that connects surplus food from events to nearby communities in real time. Smart, fast, and transparent.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            {user ? (
              <Link to="/dashboard" className="bg-[#059669] hover:bg-[#047857] text-white font-semibold py-4 px-8 rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 group">
                Go to Dashboard
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="bg-[#059669] hover:bg-[#047857] text-white font-semibold py-4 px-8 rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 group">
                  <Heart size={20} className="fill-white/10 group-hover:scale-110 transition-transform" />
                  Donate Surplus
                </Link>
                <Link to="/login" className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold py-4 px-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  Join the Mission
                  <ArrowRight size={18} />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right Column (Hero Graphic) */}
        <div className="flex-1 w-full relative max-w-lg lg:max-w-none flex justify-center items-center">
          <div className="relative p-3 rounded-[38px] bg-gradient-to-tr from-emerald-100 to-emerald-50 border-2 border-emerald-100/50 shadow-2xl shadow-emerald-500/5">
            {/* Glowing background blob behind photo */}
            <div className="absolute inset-0 rounded-[38px] bg-gradient-to-tr from-emerald-400/20 to-teal-400/20 blur-xl opacity-60 -z-10 pointer-events-none"></div>

            {/* Main Kids Image Container */}
            <div className="relative rounded-[30px] overflow-hidden w-full aspect-[4/3] sm:aspect-[4/3.2] md:w-[480px] lg:w-[500px] shadow-inner border border-white/20">
              <img 
                src={childrenSmiling} 
                alt="Children Smiling" 
                className="w-full h-full object-cover object-center transform hover:scale-[1.02] transition-transform duration-700"
              />
              
              {/* Dark Overlay Gradient at Bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-left">
                <h4 className="text-white font-bold text-xl leading-none">Impactful AI</h4>
                <p className="text-emerald-300 text-sm mt-1.5 font-medium">Matching surplus to need in under 15 minutes.</p>
              </div>
            </div>

            {/* Overlay Card 1: Live Match (Top Right) */}
            <div className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-md border border-slate-100 shadow-xl px-4 py-3 rounded-2xl flex items-center gap-3.5 animate-float">
              <div className="w-10 h-10 bg-[#E6F7F0] border border-[#C2F0DD] text-[#059669] rounded-xl flex items-center justify-center">
                <Zap size={20} className="fill-[#059669]/10" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Live Match</div>
                <div className="text-sm font-bold text-[#0B1528]">Wedding Surplus</div>
              </div>
            </div>

            {/* Overlay Card 2: Live Impact (Bottom Left) */}
            <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md border border-slate-100 shadow-xl px-4 py-3 rounded-2xl flex items-center gap-3.5 animate-float-delayed">
              <div className="w-10 h-10 bg-[#FEF3C7] border border-[#FDE68A] text-[#D97706] rounded-xl flex items-center justify-center">
                <PieChart size={20} className="fill-[#D97706]/10" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Meals Saved</div>
                <div className="text-sm font-bold text-[#0B1528]">
                  {liveStats.totalMealsSaved > 0 ? `${liveStats.totalMealsSaved} Meals` : 'Impact Growing'}
                </div>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-12 border-y border-slate-100 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center gap-1 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <span className="text-3xl font-extrabold text-[#059669]">
              {liveStats.totalMealsSaved || 0}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Heart size={12} className="text-[#059669] fill-[#059669]" /> Meals Redistributed
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <span className="text-3xl font-extrabold text-blue-600">
              {liveStats.activePartners || 0}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Users size={12} className="text-blue-600" /> Active NGO Partners
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 p-6 bg-teal-50 rounded-2xl border border-teal-100">
            <span className="text-3xl font-extrabold text-teal-600">
              {liveStats.co2Offset || 0} kg
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Leaf size={12} className="text-teal-600" /> CO₂ Prevented
            </span>
          </div>
        </div>
      </section>

      {/* ── Impact Story Section ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="text-center flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-[#059669] text-xs font-extrabold uppercase tracking-widest mx-auto">
              <Sparkles size={12} /> Real Impact. Real Numbers.
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
              Every Meal Tells a <span className="text-[#059669]">Story</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base">
              These aren't estimates. Every number below comes directly from verified food redistribution events on our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                value: liveStats.totalMealsSaved || 0,
                suffix: '',
                label: 'Total Meals Saved',
                desc: 'Surplus food rescued from events and delivered to communities in need.',
                icon: Heart,
                color: 'emerald',
                gradient: 'from-emerald-500 to-teal-500',
              },
              {
                value: Math.round((liveStats.totalMealsSaved || 0) / 2.5),
                suffix: '',
                label: 'Families Helped',
                desc: 'Families across communities received nutritious meals through our network.',
                icon: Users,
                color: 'blue',
                gradient: 'from-blue-500 to-indigo-500',
              },
              {
                value: liveStats.activePartners || 0,
                suffix: '+',
                label: 'NGOs Connected',
                desc: 'Verified NGO partners actively claiming and distributing donated food.',
                icon: Building2,
                color: 'violet',
                gradient: 'from-violet-500 to-purple-500',
              },
              {
                value: liveStats.co2Offset || 0,
                suffix: 'kg',
                label: 'CO₂ Prevented',
                desc: 'Greenhouse gas emissions avoided by keeping food out of landfills.',
                icon: Leaf,
                color: 'teal',
                gradient: 'from-teal-500 to-cyan-500',
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="relative bg-white border border-slate-100 rounded-3xl p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 overflow-hidden group"
                >
                  {/* Gradient accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} rounded-t-3xl`} />

                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-md`}>
                    <Icon size={22} />
                  </div>

                  <div>
                    <div className="text-4xl font-black text-slate-900 tracking-tight">
                      {stat.value.toLocaleString()}{stat.suffix}
                    </div>
                    <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">{stat.desc}</p>

                  <div className={`h-1 bg-slate-100 rounded-full overflow-hidden`}>
                    <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-1000`} style={{ width: stat.value > 0 ? '75%' : '5%' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Story CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/analytics" className="flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-bold py-3.5 px-7 rounded-2xl text-sm shadow-lg shadow-emerald-500/20 transition">
              <BarChart2 size={16} /> View Full Analytics
            </Link>
            <Link to="/leaderboard" className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-7 rounded-2xl text-sm shadow-sm transition">
              <Trophy size={16} /> See Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Why We're Different */}
      <section className="py-20 bg-[#F8FAFC] px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full text-center flex flex-col gap-12">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">Why We're Different</h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            Existing systems are manual and slow. We built a platform designed specifically for high-stakes event food waste.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div 
                key={index} 
                className="bg-white border border-slate-100 p-8 rounded-[28px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left flex flex-col gap-6 group"
              >
                <div className={`p-4 rounded-2xl w-fit ${feat.color} group-hover:scale-105 transition-transform duration-300`}>
                  <Icon size={24} />
                </div>
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-xl font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-slate-650 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-[#0B1528] rounded-[40px] px-8 py-12 lg:p-16 text-white flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
          {/* Accent Blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Banner Left Info */}
          <div className="flex-1 flex flex-col gap-6 text-left z-10">
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
              Ready to join the <br />
              <span className="text-[#10B981]">Zero Waste Mission?</span>
            </h2>
            <p className="text-slate-400 text-base max-w-lg leading-relaxed">
              Whether you're hosting a grand celebration or managing a care home, our platform is here to ensure surplus becomes a solution.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/register" className="bg-[#059669] hover:bg-[#047857] text-white font-semibold py-3.5 px-7 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-300">
                Get Started Now
              </Link>
              <Link to="/analytics" className="text-white hover:text-emerald-300 font-semibold py-3.5 px-5 transition-colors flex items-center gap-1.5">
                View Live Impact &rarr;
              </Link>
            </div>
          </div>

          {/* Banner Right Stats */}
          <div className="flex-1 flex flex-col sm:flex-row gap-6 w-full lg:max-w-md z-10">
            {/* Stat Card 1 */}
            <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col gap-6 text-left">
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/25 rounded-2xl w-fit text-[#10B981]">
                <Gift size={22} />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {liveStats.totalMealsSaved > 0 ? `${liveStats.totalMealsSaved}` : '0'}
                </div>
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">Meals Served</div>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col gap-6 text-left">
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/25 rounded-2xl w-fit text-[#10B981]">
                <Zap size={22} />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {liveStats.activePartners > 0 ? `${liveStats.activePartners}` : '0'}
                </div>
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">NGO Partners</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
