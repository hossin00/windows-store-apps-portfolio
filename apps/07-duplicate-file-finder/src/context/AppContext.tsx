import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AppSettings } from "../types";
import { getSettings, saveSettings } from "../services/duplicateService";

interface AppContextValue {
  settings:       AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resolvedTheme:  "dark" | "light";
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(getSettings);

  const resolvedTheme: "dark" | "light" =
    settings.theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : settings.theme === "light" ? "light" : "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("light", resolvedTheme === "light");
  }, [resolvedTheme]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    const updated = saveSettings(patch);
    setSettings(updated);
  }, []);

  return (
    <AppContext.Provider value={{ settings, updateSettings, resolvedTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
