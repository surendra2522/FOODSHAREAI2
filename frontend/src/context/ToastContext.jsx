import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, X, Info, WifiOff } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
      {/* Toast Portal/Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';
          
          let bgClass = 'bg-white text-slate-800 border-slate-100';
          let icon = <Info className="text-blue-500 flex-shrink-0" size={18} />;
          
          if (isSuccess) {
            bgClass = 'bg-emerald-50 text-emerald-900 border-emerald-200';
            icon = <CheckCircle2 className="text-[#059669] flex-shrink-0" size={18} />;
          } else if (isError) {
            bgClass = 'bg-red-50 text-red-900 border-red-200';
            icon = <AlertTriangle className="text-red-600 flex-shrink-0" size={18} />;
          } else if (isWarning) {
            bgClass = 'bg-amber-50 text-amber-900 border-amber-200';
            icon = <AlertTriangle className="text-amber-600 flex-shrink-0" size={18} />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-in-right ${bgClass}`}
              role="alert"
            >
              <div className="flex items-center gap-2.5">
                {icon}
                <span className="text-xs font-bold leading-normal">{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Add custom CSS keyframes to the page */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(120%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
