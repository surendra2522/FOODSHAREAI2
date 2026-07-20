import React, { useState, useEffect } from 'react';
import { Sparkles, Navigation, ShieldCheck, RefreshCw } from 'lucide-react';

export default function MapMockup() {
  const [nodes, setNodes] = useState([
    { id: 1, name: 'Fresh Foods Grocer', type: 'donor', x: 25, y: 30, active: true },
    { id: 2, name: 'Mercy Soup Kitchen', type: 'charity', x: 70, y: 40, active: true },
    { id: 3, name: 'Daily Bread Bakery', type: 'donor', x: 40, y: 75, active: true },
    { id: 4, name: 'St. Mary Food Bank', type: 'charity', x: 80, y: 70, active: true },
    { id: 5, name: 'Organic Greens Farm', type: 'donor', x: 15, y: 65, active: true },
  ]);

  const [matches, setMatches] = useState([
    { from: 1, to: 2, efficiency: '98%', duration: '8 mins' },
    { from: 3, to: 4, efficiency: '94%', duration: '12 mins' },
  ]);

  const [radarPulse, setRadarPulse] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRadarPulse((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-panel rounded-2xl border border-white/10 p-6 flex flex-col gap-4 relative overflow-hidden h-[420px]">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(circle, #3bab66 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px, 48px 48px, 48px 48px',
          backgroundPosition: 'center'
        }}
      ></div>

      <div className="z-10 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg text-white flex items-center gap-2">
            <Sparkles className="text-brand-400 animate-pulse" size={18} />
            AI Proximity Router
          </h3>
          <p className="text-xs text-slate-400">Real-time matching & route optimization telemetry</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase font-mono px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400">
          <RefreshCw size={10} className="animate-spin" />
          <span>Optimizing Paths</span>
        </div>
      </div>

      {/* SVG Canvas Map Area */}
      <div className="relative flex-1 bg-slate-950/80 rounded-xl border border-white/5 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Paths / Route Connections */}
          {matches.map((match, i) => {
            const start = nodes.find(n => n.id === match.from);
            const end = nodes.find(n => n.id === match.to);
            if (!start || !end) return null;
            return (
              <g key={i}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="rgba(59, 171, 102, 0.4)"
                  strokeWidth="0.8"
                  strokeDasharray="2, 2"
                />
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="#3bab66"
                  strokeWidth="1"
                  strokeDasharray="4 20"
                  className="animate-dash"
                  style={{
                    animation: 'dash 3s linear infinite'
                  }}
                />
              </g>
            );
          })}

          {/* Radar sweep line visual overlay */}
          <line
            x1="0"
            y1={radarPulse}
            x2="100"
            y2={radarPulse}
            stroke="rgba(59, 171, 102, 0.08)"
            strokeWidth="3"
          />

          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.id}>
              {/* Pulse circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r="3"
                fill={node.type === 'donor' ? '#3bab66' : '#ec4899'}
                className="animate-ping opacity-25"
              />
              {/* Dot */}
              <circle
                cx={node.x}
                cy={node.y}
                r="1.8"
                fill={node.type === 'donor' ? '#22c55e' : '#f43f5e'}
                className="hover:scale-150 transition-transform cursor-pointer"
              />
            </g>
          ))}
        </svg>

        {/* Floating Labels over Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-full text-[8px] font-semibold bg-slate-900/90 text-slate-300 border border-white/10 px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none"
            style={{ left: `${node.x}%`, top: `${node.y - 2}%` }}
          >
            {node.name}
          </div>
        ))}
      </div>

      {/* Telemetry info */}
      <div className="z-10 grid grid-cols-2 gap-4 text-xs font-mono">
        {matches.map((match, i) => {
          const start = nodes.find(n => n.id === match.from);
          const end = nodes.find(n => n.id === match.to);
          return (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500">OPTIMAL MATCH</span>
                <span className="text-white font-semibold truncate max-w-[120px]">
                  {start.name} &rarr; {end.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-brand-400 block">{match.efficiency} Match</span>
                <span className="text-slate-400 text-[10px]">{match.duration}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Embedded CSS for animations */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -40;
          }
        }
      `}</style>
    </div>
  );
}
