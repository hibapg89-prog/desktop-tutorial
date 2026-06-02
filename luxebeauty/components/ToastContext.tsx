"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";

interface ToastMsg { id: number; text: string; icon?: string; }
interface ToastCtx { showToast: (text: string, icon?: string) => void; }

const ToastContext = createContext<ToastCtx>({ showToast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((text: string, icon?: string) => {
    const id = ++nextId.current;
    setToasts(t => [...t, { id, text, icon }]);
    setTimeout(() => setToasts(t => t.filter(m => m.id !== id)), 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 left-0 right-0 flex flex-col items-center gap-2 z-[200] pointer-events-none px-10">
        {toasts.map(t => (
          <div key={t.id}
            className="toast-enter flex items-center gap-2 px-4 py-2.5 rounded-full"
            style={{
              background: "rgba(11,60,38,0.92)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 4px 20px rgba(11,60,38,0.28), 0 1px 4px rgba(0,0,0,0.08)",
              border: "1px solid rgba(200,176,106,0.28)",
            }}>
            {t.icon && <span className="text-sm leading-none">{t.icon}</span>}
            <span className="font-sans text-[10px] tracking-[0.1em] whitespace-nowrap"
              style={{ color: "rgba(240,232,204,0.95)" }}>
              {t.text}
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
