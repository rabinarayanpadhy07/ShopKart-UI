import React, { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const ACCENTS = {
  success: 'border-l-success text-success',
  error: 'border-l-danger text-danger',
  info: 'border-l-brand text-brand',
};

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const toast = {
    show: notify,
    success: (message, duration) => notify(message, 'success', duration),
    error: (message, duration) => notify(message, 'error', duration),
    info: (message, duration) => notify(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[min(22rem,calc(100vw-2.5rem))]">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || Info;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`flex items-start gap-2.5 bg-surface border border-border border-l-4 rounded-xl shadow-lg p-3.5 ${ACCENTS[t.type] || ACCENTS.info}`}
                role="status"
              >
                <Icon className="h-5 w-5 shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-sm font-medium text-ink flex-1">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-ink-muted hover:text-ink shrink-0 cursor-pointer"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
