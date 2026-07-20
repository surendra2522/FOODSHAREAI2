import React from 'react';
import { 
  Info, AlertTriangle, Target, CheckCircle2, 
  Layers, Code2, Database, Globe, Network, 
  ArrowRight, ShieldCheck, Cpu, Building, HeartHandshake
} from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-20">
        
        {/* 1. Project Title */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold tracking-wide shadow-sm">
            <Info size={18} />
            ACADEMIC / STARTUP PROJECT
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            AI-Enabled Smart Food <br className="hidden md:block"/>
            <span className="text-emerald-600">Redistribution System</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-3xl mx-auto">
            A comprehensive final-year project designed to eradicate food waste using artificial intelligence, real-time logistics, and smart matching algorithms.
          </p>
        </div>

        {/* 2. Problem Statement */}
        <section className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 space-y-5">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">The Problem</h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              Globally, one-third of all food produced for human consumption is lost or wasted, while millions suffer from food insecurity. Restaurants, events, and supermarkets struggle with surplus food due to a lack of rapid, reliable redistribution networks. 
            </p>
            <p className="text-slate-600 leading-relaxed text-lg">
              Existing systems rely on manual coordination, which often results in food spoiling before it reaches those in need.
            </p>
          </div>
          <div className="flex-1 w-full flex justify-center">
             <div className="relative w-full max-w-sm">
                <div className="absolute inset-0 bg-red-400 blur-[100px] opacity-20 rounded-full"></div>
                <div className="bg-slate-900 rounded-3xl p-6 relative border border-slate-800 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-4">
                     <span className="text-red-400 font-bold">Food Spoilage Risk</span>
                     <span className="text-slate-400 text-sm">Critical</span>
                  </div>
                  <div className="space-y-3">
                     <div className="h-4 bg-slate-800 rounded-full w-full overflow-hidden">
                       <div className="h-full bg-red-500 w-[85%]"></div>
                     </div>
                     <p className="text-xs font-mono text-slate-400 text-right">85% Wasted Logistically</p>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* 3. Objectives */}
        <section className="bg-emerald-900 text-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-emerald-800">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-emerald-800 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target size={32} />
            </div>
            <h2 className="text-3xl font-bold">Core Objectives</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-emerald-800/50 border border-emerald-700/50 p-6 rounded-2xl">
              <span className="text-emerald-400 text-4xl font-black block mb-4">01</span>
              <h3 className="text-xl font-bold mb-2">Zero Waste</h3>
              <p className="text-emerald-100/70 text-sm leading-relaxed">Minimize edible food waste from commercial sectors through rapid AI-driven intervention.</p>
            </div>
            <div className="bg-emerald-800/50 border border-emerald-700/50 p-6 rounded-2xl">
              <span className="text-emerald-400 text-4xl font-black block mb-4">02</span>
              <h3 className="text-xl font-bold mb-2">Smart Logistics</h3>
              <p className="text-emerald-100/70 text-sm leading-relaxed">Ensure food reaches NGOs within strict freshness windows using real-time distance matching.</p>
            </div>
            <div className="bg-emerald-800/50 border border-emerald-700/50 p-6 rounded-2xl">
              <span className="text-emerald-400 text-4xl font-black block mb-4">03</span>
              <h3 className="text-xl font-bold mb-2">Impact Tracking</h3>
              <p className="text-emerald-100/70 text-sm leading-relaxed">Provide transparent analytics on meals shared and CO2 emissions prevented.</p>
            </div>
          </div>
        </section>

        {/* 4. Features */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">Platform Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
              <Building className="text-emerald-500 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Donor Portal</h3>
              <p className="text-slate-500 text-sm">Dedicated interface for restaurants and event organizers to post surplus food listings easily.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
              <HeartHandshake className="text-orange-500 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">NGO Portal</h3>
              <p className="text-slate-500 text-sm">Dashboard for charities to view, claim, and coordinate pickups for available food nearby.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
              <ShieldCheck className="text-blue-500 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Admin Portal</h3>
              <p className="text-slate-500 text-sm">Master control room for user verification, platform health monitoring, and data exports.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
              <Cpu className="text-purple-500 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">AI Prediction</h3>
              <p className="text-slate-500 text-sm">Preemptive estimation of food surplus based on event scale and expected attendance.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
              <Network className="text-indigo-500 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Real-Time Matching</h3>
              <p className="text-slate-500 text-sm">Algorithmic pairing of donors with the closest available NGOs to minimize transit times.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
              <CheckCircle2 className="text-rose-500 mb-4" size={28} />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Impact Analytics</h3>
              <p className="text-slate-500 text-sm">Live telemetry on meals redistributed and the precise carbon footprint reduction achieved.</p>
            </div>
          </div>
        </section>

        {/* 5. Technology Stack */}
        <section className="bg-slate-900 rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-800 text-white">
          <h2 className="text-3xl font-bold text-center mb-12">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center gap-3 p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
              <Code2 size={32} className="text-sky-400" />
              <span className="font-bold">Frontend</span>
              <span className="text-xs text-slate-400 text-center">React + Vite <br/> Tailwind CSS</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
              <Layers size={32} className="text-green-500" />
              <span className="font-bold">Backend</span>
              <span className="text-xs text-slate-400 text-center">Node.js <br/> Express.js</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
              <Database size={32} className="text-emerald-500" />
              <span className="font-bold">Database</span>
              <span className="text-xs text-slate-400 text-center">MongoDB <br/> Mongoose</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
              <Globe size={32} className="text-indigo-400" />
              <span className="font-bold">Deployment</span>
              <span className="text-xs text-slate-400 text-center">Frontend: Vercel <br/> Backend: Render</span>
            </div>
          </div>
        </section>

        {/* 6. Architecture Diagram */}
        <section className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">Architecture Diagram</h2>
          <div className="relative w-full overflow-x-auto pb-6">
            <div className="min-w-[700px] flex justify-between items-center gap-4 px-4">
              
              <div className="w-1/4 bg-slate-50 border-2 border-dashed border-slate-300 p-6 rounded-3xl text-center shadow-sm">
                <span className="block font-black text-slate-800 mb-1">Client Layer</span>
                <span className="text-xs text-slate-500">React SPAs<br/>(Donor, NGO, Admin)</span>
              </div>

              <ArrowRight className="text-emerald-500 flex-shrink-0" size={32} />

              <div className="w-1/4 bg-emerald-50 border-2 border-emerald-500 p-6 rounded-3xl text-center shadow-md relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] px-3 py-1 rounded-full font-bold">CORE</span>
                <span className="block font-black text-emerald-800 mb-1">API Gateway</span>
                <span className="text-xs text-emerald-600">Express + Node.js<br/>Auth & Routing</span>
              </div>

              <ArrowRight className="text-emerald-500 flex-shrink-0" size={32} />

              <div className="w-1/4 flex flex-col gap-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-center">
                   <span className="block font-bold text-blue-800 text-sm">AI Engine</span>
                </div>
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl text-center">
                   <span className="block font-bold text-orange-800 text-sm">MongoDB Cluster</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 7. Future Scope */}
        <section className="bg-emerald-50 rounded-[2rem] p-8 md:p-12 border border-emerald-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Future Scope</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="mt-1 w-8 h-8 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold">1</div>
              <div>
                <h4 className="font-bold text-slate-800">Route Optimization Integration</h4>
                <p className="text-slate-600 text-sm">Integrating real-time GPS mapping (like Mapbox or Google Maps) to generate turn-by-turn navigation for NGO pickup drivers.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="mt-1 w-8 h-8 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold">2</div>
              <div>
                <h4 className="font-bold text-slate-800">IoT Cold Storage Monitoring</h4>
                <p className="text-slate-600 text-sm">Connecting the platform with IoT temperature sensors during transport to guarantee food safety compliance.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="mt-1 w-8 h-8 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold">3</div>
              <div>
                <h4 className="font-bold text-slate-800">Mobile Applications</h4>
                <p className="text-slate-600 text-sm">Publishing dedicated native iOS and Android applications utilizing React Native for push notifications and offline mode capabilities.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
