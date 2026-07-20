import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Award, Download, Leaf, Heart, Share2, Printer,
  Sparkles, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';

function CertificatePreview({ donor, meals, co2, date, donationCount }) {
  return (
    <div
      id="certificate-content"
      className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-4 border-[#059669] rounded-3xl p-10 flex flex-col items-center gap-5 text-center shadow-2xl"
      style={{ minWidth: 480, maxWidth: 640 }}
    >
      {/* Decorative corner accents */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-[#059669]/30 rounded-tl-2xl pointer-events-none" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-[#059669]/30 rounded-tr-2xl pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-[#059669]/30 rounded-bl-2xl pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-[#059669]/30 rounded-br-2xl pointer-events-none" />

      {/* Logo area */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-16 h-16 bg-[#059669] rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Leaf size={32} className="text-white" />
        </div>
        <span className="text-xs font-extrabold text-[#059669] uppercase tracking-widest mt-1">FoodShare AI</span>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 justify-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          <CheckCircle2 size={12} className="text-[#059669]" />
          Official Recognition
          <CheckCircle2 size={12} className="text-[#059669]" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Impact Certificate</h2>
      </div>

      {/* Body */}
      <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
        This certifies that
      </p>
      <div className="border-b-2 border-[#059669]/40 w-full pb-2">
        <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{donor}</p>
      </div>
      <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
        has made a meaningful contribution to food redistribution and zero-waste living.
      </p>

      {/* KPI Grid */}
      <div className="grid grid-cols-3 gap-4 w-full mt-2">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center gap-1">
          <span className="text-2xl font-extrabold text-[#059669]">{meals}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">Meals Saved</span>
        </div>
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex flex-col items-center gap-1">
          <span className="text-2xl font-extrabold text-teal-600">{co2}kg</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">CO₂ Prevented</span>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col items-center gap-1">
          <span className="text-2xl font-extrabold text-indigo-600">{donationCount}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">Donations Made</span>
        </div>
      </div>

      {/* Date & Signature */}
      <div className="flex w-full justify-between items-end mt-2 pt-4 border-t border-slate-100">
        <div className="text-left">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Date Issued</p>
          <p className="text-sm font-bold text-slate-700">{date}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Certified By</p>
          <p className="text-sm font-bold text-[#059669]">FoodShare AI Platform</p>
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <Award size={280} className="text-[#059669]" />
      </div>
    </div>
  );
}

export default function Certificate() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [printing,  setPrinting]  = useState(false);

  const fetchDonations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/donations');
      const mine = (res.data || []).filter(d => {
        const donorId = d.donor?._id || d.donor;
        return donorId && String(donorId) === String(user?._id || user?.id);
      });
      setDonations(mine);
    } catch {
      setError('Unable to load donation data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDonations(); }, [user]);

  // Computed stats
  const totalMeals = Math.round(donations.reduce((acc, d) => {
    const m = d.quantity?.match(/(\d+(\.\d+)?)/);
    return acc + (m ? parseFloat(m[0]) * 2.5 : 0);
  }, 0));
  const wasteKg  = parseFloat((totalMeals * 0.4).toFixed(1));
  const co2Saved = parseFloat((wasteKg * 2.8).toFixed(1));
  const dateStr  = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrint = () => {
    setPrinting(true);
    const content = document.getElementById('certificate-content');
    if (!content) { setPrinting(false); return; }
    const printWin = window.open('', '_blank', 'width=800,height=700');
    printWin.document.write(`
      <html>
        <head>
          <title>FoodShare AI - Impact Certificate</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', sans-serif; background: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 40px; }
          </style>
        </head>
        <body>
          ${content.outerHTML}
          <script>window.onload = function() { window.print(); window.close(); };<\/script>
        </body>
      </html>
    `);
    printWin.document.close();
    setTimeout(() => setPrinting(false), 1000);
  };

  const handleDownloadText = () => {
    const text = `
FoodShare AI - Impact Certificate
===================================

Awarded to: ${user?.name}
Date Issued: ${dateStr}

IMPACT SUMMARY:
• Donations Made: ${donations.length}
• Meals Saved: ${totalMeals}
• CO₂ Prevented: ${co2Saved} kg
• Food Waste Reduced: ${wasteKg} kg

Certified by FoodShare AI Platform
https://foodshare.ai
    `.trim();
    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
    a.download = `foodshare_certificate_${user?.name?.replace(/\s/g, '_')}.txt`;
    a.click();
  };

  const hasActivity = donations.length > 0;

  return (
    <div className="flex-1 bg-[#F8FAFC] py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full flex flex-col gap-8 text-slate-800">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#059669] uppercase tracking-wider">
            <Sparkles size={13} /> Impact Recognition
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            My <span className="text-[#059669]">Certificate</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Your official recognition for contributing to food redistribution.
          </p>
        </div>
        <button onClick={fetchDonations} className="self-start flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2.5">
          <AlertCircle size={16} /><span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-[#059669] rounded-full animate-spin" />
        </div>
      ) : !hasActivity ? (
        /* No activity yet */
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-5">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center">
            <Award size={40} className="text-emerald-300" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-700">No certificate available yet</p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">
              Make your first donation to earn your impact certificate. Every meal matters!
            </p>
          </div>
          <a
            href="/donate"
            className="bg-[#059669] hover:bg-[#047857] text-white font-bold py-3 px-6 rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition"
          >
            Post Your First Donation
          </a>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Certificate Preview */}
          <div className="flex-1 flex justify-center">
            <CertificatePreview
              donor={user?.name || 'Donor'}
              meals={totalMeals}
              co2={co2Saved}
              date={dateStr}
              donationCount={donations.length}
            />
          </div>

          {/* Actions Panel */}
          <div className="w-full lg:w-72 flex flex-col gap-4">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                <Download size={18} className="text-[#059669]" />
                Export Certificate
              </h3>

              <button
                onClick={handlePrint}
                disabled={printing}
                className="w-full flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-bold py-3 px-4 rounded-2xl text-sm shadow-md shadow-emerald-500/20 transition active:scale-95 disabled:opacity-70"
              >
                <Printer size={16} />
                {printing ? 'Preparing...' : 'Print / Save as PDF'}
              </button>

              <button
                onClick={handleDownloadText}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-2xl text-sm transition active:scale-95"
              >
                <Download size={16} />
                Download Text Version
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'My FoodShare Impact Certificate', text: `I've saved ${totalMeals} meals and prevented ${co2Saved}kg of CO₂ with FoodShare AI!`, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(`I've saved ${totalMeals} meals with FoodShare AI! 🌱`);
                    alert('Copied to clipboard!');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 px-4 rounded-2xl text-sm transition active:scale-95"
              >
                <Share2 size={16} />
                Share Impact
              </button>
            </div>

            {/* Impact Summary */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Heart size={15} className="text-rose-500" /> Your Impact at a Glance
              </h3>
              {[
                { label: 'Total Donations', value: donations.length },
                { label: 'Meals Saved',     value: totalMeals },
                { label: 'CO₂ Prevented',   value: `${co2Saved} kg` },
                { label: 'Food Waste Reduced', value: `${wasteKg} kg` },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-500 font-semibold">{row.label}</span>
                  <span className="text-sm font-extrabold text-[#059669]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
