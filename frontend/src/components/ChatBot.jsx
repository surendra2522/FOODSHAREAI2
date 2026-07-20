import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MessageCircle, X, Minus, Send, Gift, HandHelping,
  ClipboardList, HelpCircle, Sparkles, ChevronRight,
  Shield, Bot, User, Trash2, RotateCcw
} from 'lucide-react';

// ── Knowledge base ────────────────────────────────────────────────────────────
const KB = {
  donate: {
    keywords: ['donate','donation','give','food','surplus','post','submit','broadcast'],
    answer: `To donate food on FoodShare AI:\n\n**1. Go to Donate Food** — click "Donate Food" in the navbar.\n**2. Fill the form** — add title, description, food category, and quantity.\n**3. Set your location** — click anywhere on the interactive map to pin your pickup point.\n**4. Submit** — nearby NGOs get notified instantly by our AI matching engine.\n\nThe "Final Redistributable Meals" calculator shows you exactly how much surplus you're sharing! 🌱`
  },
  find: {
    keywords: ['find','request','receive','food','available','browse','search','claim','charity'],
    answer: `To find available food donations:\n\n**1. Go to Find Food** in the navbar.\n**2. Browse listings** — all available surplus near you appears here.\n**3. Filter & search** — use category chips, search bar, or sort by urgency/AI match.\n**4. Claim a donation** — click "Claim This Donation" on any available card.\n\n🔴 **Urgent** badges appear on donations expiring within 3 hours — grab those first!`
  },
  track: {
    keywords: ['track','status','where','progress','accepted','collected','ngos','notified'],
    answer: `Tracking your donation status is easy:\n\n**1. Visit My Donations** page.\n**2. Status Timeline** shows 4 steps:\n   • ✅ Submitted\n   • ✅ NGO Notified\n   • ✅ Accepted\n   • ✅ Collected\n\n**3. My Impact** page shows your full donation history with status badges.\n\nYou'll also receive in-app notifications when an NGO accepts your donation!`
  },
  safety: {
    keywords: ['safe','safety','food','guidelines','hygiene','expire','expiry','fresh','quality','tips'],
    answer: `FoodShare AI food safety guidelines:\n\n🌡️ **Temperature** — Keep hot food above 60°C, cold food below 5°C.\n⏱️ **Freshness Window** — Set a realistic freshness window (2–8 hours for cooked food).\n📦 **Packaging** — Use sealed containers or wrapped trays.\n🚫 **Do not donate** — Expired, opened, or visually spoiled food.\n✅ **Best donations** — Sealed packaged goods, freshly cooked meals, whole fruits/vegetables.\n\nThe AI auto-flags donations with very short windows as 🔴 URGENT for faster pickup.`
  },
  account: {
    keywords: ['account','profile','password','login','register','role','donor','charity'],
    answer: `Managing your FoodShare AI account:\n\n**Roles:**\n• 🟢 **Donor** — post surplus food, view donation history, earn badges.\n• 🔵 **Charity/NGO** — browse and claim available donations.\n\n**Access your profile** — click your name/avatar in the top navbar for quick links.\n\n**To change your password or update details** — contact support via the chatbot or email us.\n\n**Admin portals** have separate login at /admin/login.`
  },
  ngo: {
    keywords: ['ngo','partner','organisation','organization','charity','matching','algorithm','ai','assistance'],
    answer: `How our AI matches donations to NGOs:\n\n🗺️ **Proximity first** — we calculate distance between your pin and registered NGOs.\n⚡ **Speed scoring** — NGOs with faster pickup history rank higher.\n🎯 **Capacity match** — we match quantity to NGO capacity.\n📊 **AI score** — each listing shows an AI Match % based on these factors.\n\nTop 3 nearest NGOs are notified instantly when you post. If no one claims within 1 hour, the radius expands automatically.`
  },
  impact: {
    keywords: ['impact','meals','waste','co2','badges','score','statistics','analytics'],
    answer: `Your impact at a glance — visit **My Impact** page:\n\n🍽️ **Meals Shared** — total meals redirected.\n🌱 **Food Waste Prevented** — kg saved from landfill + CO₂ offset.\n👥 **People Helped** — estimated beneficiaries.\n🏆 **Badges** — First Donation, 100 Meals, Community Hero, etc.\n📊 **Monthly Chart** — see your donation trend over the year.\n\nEvery 2.5 servings donated = ~1 kg food waste prevented = ~2.8 kg CO₂ offset.`
  },
  admin: {
    keywords: ['admin', 'panel', 'announcement', 'broadcast', 'suspend', 'verify', 'telemetry', 'diagnostic', 'system'],
    answer: `As an Administrator, you can access the /admin/dashboard console to:\n\n• **Approve NGOs** — under "NGO Verification" tab, view submitted incorporation certs and click Approve.\n• **Suspend Accounts** — deactivate or suspend any user under "User Management".\n• **Flag Expired** — click "Scan & Flag Expired" under "Donation Management" to auto-detect stale listings.\n• **Broadcast System Alerts** — write and push alerts to all or targeted roles under "Broadcast System" tab.\n• **Export Data** — download CSV reports for users, donations, or analytics.`
  },
  support: {
    keywords: ['help','support','contact','problem','issue','bug','error','faq'],
    answer: `Need support? Here's how to reach us:\n\n📧 **Email** — support@foodshare.ai\n💬 **This chatbot** — ask me anything about the platform!\n🔄 **Refresh** — most issues resolve with a page refresh.\n\nCommon fixes:\n• Map not loading → check internet connection.\n• Can't submit form → make sure you've clicked the map to set a location.\n• Can't claim → you need a Charity/NGO account role.`
  }
};

// ── Context tips per route ────────────────────────────────────────────────────
const ROUTE_TIPS = {
  '/donate':       '📍 You\'re on the Donate Food page! Fill the form, then click the map on the right to pin your pickup location.',
  '/donor-portal': '📋 You\'re on My Donations. Check your donation status timeline and AI impact insights here.',
  '/impact':       '📊 You\'re on My Impact. Scroll down to see your badges, monthly chart, and donation history.',
  '/dashboard':    '🏠 You\'re on your Dashboard. Your stats, recent activity, and AI Intelligence panel are all here.',
  '/find-food':    '🗺️ You\'re on Find Food. Browse available surplus food items pinned near you.',
  '/ngo-dashboard':'🏢 You\'re on the NGO Dashboard. Monitor your claimed donations and coordinate distribution.',
  '/ngo-impact':   '📈 You\'re on NGO Impact. Review your community service history and carbon footprint metrics.',
  '/admin/dashboard':'🛡️ Welcome to the Admin Portal! You have full control over user profiles, donation audits, NGO verification, analytics, and announcements.',
  '/profile':      '👤 You\'re on your Profile. You can update your contact information, password, and settings.'
};

// ── Quick actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'Donate Food',    icon: Gift,         path: '/donate',       color: 'emerald' },
  { label: 'Find Food',      icon: HandHelping,  path: '/ngo-dashboard',color: 'blue' },
  { label: 'My Donations',   icon: ClipboardList,path: '/donor-portal', color: 'indigo' },
  { label: 'My Impact',      icon: Sparkles,     path: '/impact',       color: 'amber' },
];

// ── FAQ suggestions ──────────────────────────────────────────────────────────
const FAQS = [
  { q: 'How do I donate food?',         key: 'donate' },
  { q: 'How is food matched to NGOs?',  key: 'ngo' },
  { q: 'How do I track my donation?',   key: 'track' },
  { q: 'What foods can be donated?',    key: 'safety' },
];

// ── Response engine ──────────────────────────────────────────────────────────
function generateResponse(text, pathname) {
  const lower = text.toLowerCase();

  // Greetings
  if (/^(hi|hello|hey|yo|sup|good\s*(morning|afternoon|evening))/.test(lower)) {
    const tip = ROUTE_TIPS[pathname] || '';
    return `Hi there! 👋 I'm **FoodShare AI Assistant**.\n\nI can help you with donations, finding food, tracking status, food safety, and more.\n\n${tip ? tip + '\n\n' : ''}What can I help you with today?`;
  }

  // Match knowledge base
  for (const [, entry] of Object.entries(KB)) {
    if (entry.keywords.some(k => lower.includes(k))) {
      return entry.answer;
    }
  }

  // Route-aware context
  if (ROUTE_TIPS[pathname]) {
    return `${ROUTE_TIPS[pathname]}\n\nI'm not sure I understood your question. Try asking:\n• "How do I donate food?"\n• "How do I track my donation?"\n• "What foods are safe to donate?"`;
  }

  return `I'm not sure about that. Here are things I can help with:\n\n• **Donating food** — how to post surplus\n• **Finding food** — how to claim donations\n• **Tracking status** — where is my donation?\n• **Food safety** — guidelines and tips\n• **Account help** — roles and settings\n\nTry asking one of those topics! 😊`;
}

// ── Markdown renderer (lightweight) ─────────────────────────────────────────
function renderMarkdown(text) {
  const parts = text.split('\n');
  return parts.map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const isHeading = bold.startsWith('•') || bold.startsWith('-');
    return (
      <span key={i} className={`block ${i > 0 ? 'mt-1' : ''}`} dangerouslySetInnerHTML={{ __html: bold }} />
    );
  });
}

const STORAGE_KEY = 'foodshare_chat_history';
const WELCOME_MSG = {
  id: 'welcome',
  role: 'bot',
  text: 'Hi! 👋 I\'m your **FoodShare AI Assistant**.\n\nI can help with donations, finding food, tracking status, food safety tips, and more.\n\nWhat would you like to know?',
  ts: Date.now()
};

// ─── Main component ──────────────────────────────────────────────────────────
export default function ChatBot() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [open,    setOpen]    = useState(false);
  const [minimal, setMinimal] = useState(false);
  const [input,   setInput]   = useState('');
  const [typing,  setTyping]  = useState(false);
  const [unread,  setUnread]  = useState(0);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [WELCOME_MSG];
    } catch { return [WELCOME_MSG]; }
  });

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const pathname   = location.pathname;

  // Persist to localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, open]);

  // Focus input on open
  useEffect(() => {
    if (open && !minimal) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open, minimal]);

  // Route-aware contextual message
  useEffect(() => {
    if (!open || !ROUTE_TIPS[pathname]) return;
    const alreadySent = messages.some(m => m.contextFor === pathname);
    if (alreadySent) return;
    const botMsg = {
      id: `ctx-${Date.now()}`,
      role: 'bot',
      text: ROUTE_TIPS[pathname],
      ts: Date.now(),
      contextFor: pathname
    };
    setMessages(prev => [...prev, botMsg]);
  }, [pathname, open]);

  const sendMessage = useCallback((text = input.trim()) => {
    if (!text) return;
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    const delay = 600 + text.length * 8;
    setTimeout(() => {
      const botMsg = {
        id: `b-${Date.now()}`,
        role: 'bot',
        text: generateResponse(text, pathname),
        ts: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
      setTyping(false);
      if (!open) setUnread(n => n + 1);
    }, Math.min(delay, 2000));
  }, [input, pathname, open]);

  const handleOpen = () => { setOpen(true); setMinimal(false); setUnread(0); };
  const handleClose = () => { setOpen(false); setMinimal(false); };
  const clearChat = () => setMessages([WELCOME_MSG]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const ACTION_COLORS = {
    emerald: 'bg-emerald-50 text-[#059669] border-emerald-100 hover:bg-emerald-100',
    blue:    'bg-blue-50   text-blue-600   border-blue-100   hover:bg-blue-100',
    indigo:  'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100',
    amber:   'bg-amber-50  text-amber-600  border-amber-100  hover:bg-amber-100',
  };

  if (!user) return null; // only show for authenticated users

  return (
    <>
      {/* ── Global chatbot animation styles (injected once) ─────────── */}
      <style>{`
        @keyframes chatbot-slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes chatbot-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .chatbot-panel-enter {
          animation: chatbot-slide-up 0.25s cubic-bezier(0.16,1,0.3,1) both;
        }
        .chatbot-btn-enter {
          animation: chatbot-fade-in 0.2s ease both;
        }
      `}</style>
      {/* ── Floating button ───────────────────────────────────────────── */}
      {!open && (
        <button
          onClick={handleOpen}
          aria-label="Open FoodShare AI Assistant"
          className="chatbot-btn-enter fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-[#059669] hover:bg-[#047857] text-white rounded-full shadow-xl shadow-emerald-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
        >
          <MessageCircle size={24} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shadow-md">
              {unread}
            </span>
          )}
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-[#059669] animate-ping opacity-20 pointer-events-none" />
        </button>
      )}

      {/* ── Chat panel ───────────────────────────────────────────────── */}
      {open && (
        <div
          className={`chatbot-panel-enter fixed bottom-6 right-6 z-[9999] flex flex-col bg-white border border-slate-200 shadow-2xl shadow-slate-900/20 rounded-3xl overflow-hidden transition-all duration-300 ${
            minimal
              ? 'w-72 h-14'
              : 'w-[360px] sm:w-[400px] h-[600px] max-h-[90vh]'
          }`}
          role="dialog"
          aria-label="FoodShare AI Chatbot"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#059669] text-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-sm">FoodShare Assistant</span>
                {!minimal && (
                  <span className="text-[10px] text-emerald-100 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Online
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear chat"
                className="p-1.5 rounded-lg hover:bg-white/10 transition text-emerald-100 hover:text-white"
                aria-label="Clear chat history"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => setMinimal(!minimal)}
                title={minimal ? 'Expand' : 'Minimise'}
                className="p-1.5 rounded-lg hover:bg-white/10 transition text-emerald-100 hover:text-white"
                aria-label={minimal ? 'Expand chat' : 'Minimise chat'}
              >
                <Minus size={16} />
              </button>
              <button
                onClick={handleClose}
                title="Close"
                className="p-1.5 rounded-lg hover:bg-white/10 transition text-emerald-100 hover:text-white"
                aria-label="Close chatbot"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!minimal && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-slate-50/50 scroll-smooth">

                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'bot' && (
                      <div className="w-7 h-7 rounded-full bg-[#059669]/10 flex items-center justify-center text-[#059669] flex-shrink-0 mt-0.5">
                        <Sparkles size={13} />
                      </div>
                    )}
                    <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#059669] text-white rounded-br-md shadow-sm'
                        : 'bg-white border border-slate-100 text-slate-700 rounded-bl-md shadow-sm'
                    }`}>
                      {msg.role === 'bot' ? renderMarkdown(msg.text) : msg.text}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0 mt-0.5 text-[10px] font-extrabold uppercase">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {typing && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-full bg-[#059669]/10 flex items-center justify-center text-[#059669] flex-shrink-0">
                      <Sparkles size={13} />
                    </div>
                    <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* FAQ suggestions */}
              <div className="px-4 py-3 border-t border-slate-100 bg-white flex flex-col gap-2.5">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <HelpCircle size={11} /> Frequently asked
                </p>
                <div className="flex flex-col gap-1.5">
                  {FAQS.map(faq => (
                    <button
                      key={faq.key}
                      onClick={() => sendMessage(faq.q)}
                      className="text-left text-xs text-slate-600 hover:text-[#059669] font-medium flex items-center gap-1.5 hover:bg-emerald-50 px-2 py-1.5 rounded-xl transition group"
                    >
                      <ChevronRight size={11} className="text-slate-300 group-hover:text-[#059669] flex-shrink-0" />
                      {faq.q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="px-4 pb-3 bg-white flex flex-col gap-2">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} /> Quick actions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => { navigate(action.path); setOpen(false); }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${ACTION_COLORS[action.color]}`}
                      >
                        <Icon size={13} />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input */}
              <div className="px-4 pb-4 bg-white border-t border-slate-100 pt-3 flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask me anything…"
                  disabled={typing}
                  aria-label="Chat message"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition disabled:opacity-60"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || typing}
                  aria-label="Send message"
                  className="w-10 h-10 bg-[#059669] hover:bg-[#047857] text-white rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-sm shadow-emerald-500/20"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
