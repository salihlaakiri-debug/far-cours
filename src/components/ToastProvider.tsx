"use client";

import { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

const icons: Record<ToastType, string> = {
  success: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  error: "M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z",
  warning: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z",
  info: "m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z",
};

const bgClasses: Record<ToastType, string> = {
  success: "border-[#22c55e]/30 bg-[#22c55e]/10",
  error: "border-[#ef4444]/30 bg-[#ef4444]/10",
  warning: "border-[#d4a843]/30 bg-[#d4a843]/10",
  info: "border-[#2563eb]/30 bg-[#2563eb]/10",
};

const iconColors: Record<ToastType, string> = {
  success: "text-[#22c55e]",
  error: "text-[#ef4444]",
  warning: "text-[#d4a843]",
  info: "text-[#2563eb]",
};

function ToastItem({ t, onClose }: { t: Toast; onClose: (id: string) => void }) {
  return (
    <div
      className={`pointer-events-auto animate-slide-up flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-xl ${bgClasses[t.type]}`}
      style={{ animation: "slideUp 0.3s ease-out" }}
    >
      <svg className={`h-5 w-5 shrink-0 mt-0.5 ${iconColors[t.type]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icons[t.type]} />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#f1f5f9]">{t.title}</p>
        {t.message && <p className="mt-0.5 text-xs text-[#94a3b8]">{t.message}</p>}
      </div>
      <button
        onClick={() => onClose(t.id)}
        className="shrink-0 rounded-lg p-1 text-[#64748b] hover:bg-[#334155]/50 hover:text-[#f1f5f9] transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => removeToast(id), 5000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-1/2 z-[9999] flex w-full max-w-sm -translate-y-0 translate-x-1/2 flex-col gap-2 px-4 sm:right-4 sm:translate-x-0">
        {toasts.map((t) => (
          <ToastItem key={t.id} t={t} onClose={removeToast} />
        ))}
      </div>
      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
