import React, { createContext, useContext, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast { id: string; type: ToastType; message: string; }

interface ToastCtx {
  toast:   (msg: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

const STYLES: Record<ToastType, string> = {
  success: "bg-green-500/15 border-green-500/30 text-green-300",
  error:   "bg-red-500/15 border-red-500/30 text-red-300",
  warning: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  info:    "bg-violet-500/15 border-violet-500/30 text-violet-300",
};
const ICONS: Record<ToastType, string> = {
  success: "✓", error: "✕", warning: "⚠", info: "ℹ",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = uuidv4();
    setToasts((p) => [...p.slice(-4), { id, type, message }]);
    setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  return (
    <Ctx.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={`animate-slide-in flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium max-w-xs pointer-events-auto cursor-pointer shadow-xl ${STYLES[t.type]}`}
          >
            <span>{ICONS[t.type]}</span>
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast outside ToastProvider");
  return ctx;
}
