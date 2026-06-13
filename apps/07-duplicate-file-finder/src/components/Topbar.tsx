import { Moon, Sun, Monitor } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Theme } from "../types";

interface TopbarProps { title: string; subtitle?: string; actions?: React.ReactNode; }

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  const { settings, updateSettings } = useApp();

  const cycleTheme = () => {
    const order: Theme[] = ["dark", "light", "system"];
    updateSettings({ theme: order[(order.indexOf(settings.theme) + 1) % order.length] });
  };

  const Icon = settings.theme === "light" ? Sun : settings.theme === "dark" ? Moon : Monitor;

  return (
    <header
      className="flex items-center justify-between px-6 border-b flex-shrink-0"
      style={{ height: 60, background: "#161b27", borderColor: "#2d3748" }}
    >
      <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
        <h1 className="text-base font-semibold leading-tight truncate" style={{ color: "#f1f5f9", whiteSpace: "nowrap" }}>{title}</h1>
        {subtitle && <p className="text-xs mt-0.5 truncate" style={{ color: "#64748b", whiteSpace: "nowrap" }}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <button
          onClick={cycleTheme}
          title={`Theme: ${settings.theme}`}
          className="flex items-center justify-center rounded-md transition-colors"
          style={{ width: 34, height: 34, color: "#64748b", background: "transparent", border: "1px solid #2d3748", cursor: "pointer" }}
        >
          <Icon size={15} />
        </button>
      </div>
    </header>
  );
}
