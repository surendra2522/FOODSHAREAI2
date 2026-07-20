import React from 'react';
import { 
  BrainCircuit, GitMerge, FileCheck2, BarChartBig, 
  ArrowRight, CheckCircle2, ChevronRight, Calculator,
  MapPin, Clock, Users, Utensils, Leaf, Award
} from 'lucide-react';

export default function AiExplanation() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold tracking-wide">
            <BrainCircuit size={16} />
            INTELLIGENCE CENTER
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            How Our <span className="text-emerald-600">AI Works</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            FoodShareAI leverages advanced machine learning models and predictive analytics to eliminate food waste and bridge the gap between surplus food and communities in need.
          </p>
        </div>

        {/* 1. Surplus Prediction */}
        <section className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center hover:shadow-md transition-shadow">
          <div className="flex-1 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Calculator size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">1. Surplus Prediction</h2>
            <p className="text-slate-500 leading-relaxed">
              Before an event even begins, our predictive models estimate potential food surplus based on historical data. By analyzing the scale and type of event, we preemptively notify logistics partners.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Users size={18} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Input: Expected Guests & Event Type</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Utensils size={18} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Input: Food Prepared (kg/lbs)</span>
              </div>
              <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">Output: Estimated Surplus Meals</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full bg-slate-50 rounded-2xl p-6 border border-slate-200">
            {/* Minimalist illustration of Prediction */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                <span>HISTORICAL DATA</span>
                <span>PREDICTION MODEL</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-emerald-500"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                  <span className="block text-2xl font-black text-slate-800">850</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Guests</span>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-100 text-center">
                  <span className="block text-2xl font-black text-emerald-600">~45</span>
                  <span className="text-[10px] text-emerald-600/80 font-bold uppercase">Surplus Meals</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. NGO Matching */}
        <section className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row-reverse gap-8 items-center hover:shadow-md transition-shadow">
          <div className="flex-1 space-y-4">
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
              <GitMerge size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">2. NGO Matching Algorithm</h2>
            <p className="text-slate-500 leading-relaxed">
              When a donation is posted, the system evaluates all nearby verified NGOs. The smart contract ensures the fastest, most reliable partner is selected to prevent food spoilage.
            </p>
            <ul className="space-y-3 pt-2">
              <li className="flex items-start gap-3">
                <div className="mt-0.5"><MapPin size={18} className="text-orange-500" /></div>
                <div>
                  <span className="block font-bold text-slate-700">Distance & Logistics</span>
                  <span className="text-sm text-slate-500">Calculates shortest real-time traffic routes.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5"><Clock size={18} className="text-orange-500" /></div>
                <div>
                  <span className="block font-bold text-slate-700">Operating Availability</span>
                  <span className="text-sm text-slate-500">Cross-checks NGO working hours.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5"><Users size={18} className="text-orange-500" /></div>
                <div>
                  <span className="block font-bold text-slate-700">Historical Response Rate</span>
                  <span className="text-sm text-slate-500">Prioritizes highly responsive organizations.</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full bg-slate-50 rounded-2xl p-6 border border-slate-200">
             <div className="flex flex-col gap-3 relative">
                <div className="bg-emerald-600 text-white p-3 rounded-xl font-bold text-sm text-center z-10 shadow-lg mx-auto w-3/4">
                  New Donation: 50 Meals
                </div>
                <div className="flex justify-center my-2 text-slate-300">
                  <ArrowRight className="rotate-90" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border-2 border-orange-400 shadow-sm relative">
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">MATCH</span>
                    <span className="block font-bold text-sm text-slate-800">Hope Foundation</span>
                    <span className="text-xs text-slate-400">2.4 km • 98% Reponse</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 opacity-60">
                    <span className="block font-bold text-sm text-slate-800">City Helpers</span>
                    <span className="text-xs text-slate-400">5.1 km • 72% Reponse</span>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* 3. Freshness Analysis */}
        <section className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center hover:shadow-md transition-shadow">
          <div className="flex-1 space-y-4">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <FileCheck2 size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">3. Freshness Analysis</h2>
            <p className="text-slate-500 leading-relaxed">
              We ensure food quality and safety by calculating precise decay windows based on the food type and environmental factors.
            </p>
            <div className="space-y-3 pt-2">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-blue-600 tracking-wider">VARIABLES CHECKED</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">Uploaded Food Photo</span>
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">Food Type Category</span>
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">Temperature Data</span>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm font-semibold text-blue-800">
                Result: Safe Consumption Window (e.g., "Must pick up within 3 hours")
              </div>
            </div>
          </div>
          <div className="flex-1 w-full flex justify-center">
             <div className="w-64 h-64 border-4 border-slate-100 rounded-full flex items-center justify-center relative bg-white shadow-xl">
               <div className="absolute inset-0 rounded-full border-[10px] border-blue-100 border-t-blue-500 animate-[spin_10s_linear_infinite]"></div>
               <div className="text-center">
                 <span className="block text-4xl font-black text-blue-600">3.5h</span>
                 <span className="text-xs font-bold text-slate-400">SHELF LIFE LEFT</span>
               </div>
             </div>
          </div>
        </section>

        {/* 4. Impact Analytics */}
        <section className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row-reverse gap-8 items-center hover:shadow-md transition-shadow">
          <div className="flex-1 space-y-4">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
              <BarChartBig size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">4. Impact Analytics</h2>
            <p className="text-slate-500 leading-relaxed">
              Every successful donation is logged, quantified, and aggregated to generate real-time ESG (Environmental, Social, and Governance) impact reports for both donors and NGOs.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <Utensils size={20} className="text-purple-600 mb-2" />
                <span className="block font-bold text-slate-800">Meals Saved</span>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <Leaf size={20} className="text-purple-600 mb-2" />
                <span className="block font-bold text-slate-800">CO2 Reduction</span>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 col-span-2 flex items-center gap-3">
                <Award size={20} className="text-purple-600 flex-shrink-0" />
                <span className="font-bold text-slate-800">Redistribution Efficiency %</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="bg-slate-900 rounded-2xl p-6 shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex gap-2 items-end h-32 mb-4">
                {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                  <div key={i} className="flex-1 bg-purple-500/30 rounded-t-sm hover:bg-purple-400 transition-colors" style={{ height: `${h}%` }}></div>
                ))}
              </div>
              <span className="text-purple-400 font-mono text-xs">Live Telemetry Aggregation</span>
            </div>
          </div>
        </section>

        {/* 5. AI Decision Flow Diagram */}
        <section className="bg-emerald-900 rounded-3xl p-8 md:p-12 shadow-2xl text-white">
          <div className="text-center mb-10 space-y-3">
            <h2 className="text-3xl font-extrabold">Complete Workflow</h2>
            <p className="text-emerald-200">The lifecycle of an AI-powered donation.</p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative">
            {/* Desktop Connectors */}
            <div className="hidden md:block absolute top-1/2 left-10 right-10 h-0.5 bg-emerald-700 -z-0"></div>

            <div className="z-10 bg-emerald-800 border-2 border-emerald-600 p-6 rounded-2xl text-center w-full md:w-1/4 shadow-lg">
              <span className="block text-xs text-emerald-400 font-bold mb-1">STEP 1</span>
              <span className="font-bold">Donor Posts Event</span>
              <span className="block text-xs text-emerald-300 mt-2">Prediction Engine activates</span>
            </div>
            
            <ChevronRight size={24} className="text-emerald-500 md:hidden" />

            <div className="z-10 bg-emerald-800 border-2 border-emerald-600 p-6 rounded-2xl text-center w-full md:w-1/4 shadow-lg scale-105">
              <span className="block text-xs text-emerald-400 font-bold mb-1">STEP 2</span>
              <span className="font-bold">AI Validates & Matches</span>
              <span className="block text-xs text-emerald-300 mt-2">Freshness + NGO proximity</span>
            </div>

            <ChevronRight size={24} className="text-emerald-500 md:hidden" />

            <div className="z-10 bg-emerald-800 border-2 border-emerald-600 p-6 rounded-2xl text-center w-full md:w-1/4 shadow-lg">
              <span className="block text-xs text-emerald-400 font-bold mb-1">STEP 3</span>
              <span className="font-bold">NGO Pickup & Analytics</span>
              <span className="block text-xs text-emerald-300 mt-2">Live metrics updated</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
