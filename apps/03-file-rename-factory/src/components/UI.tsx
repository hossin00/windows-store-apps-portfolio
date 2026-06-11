import React from "react";
import { Loader2, AlertTriangle, type LucideIcon } from "lucide-react";

// ─── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
type BtnSize    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?:    BtnSize;
  loading?: boolean;
  icon?:    React.ReactNode;
}

const VARIANT_STYLE: Record<BtnVariant, React.CSSProperties> = {
  primary:   { background: "#3b82f6", color: "#fff", border: "1px solid transparent" },
  secondary: { background: "#1e2535", color: "#94a3b8", border: "1px solid #2d3748" },
  ghost:     { background: "transparent", color: "#94a3b8", border: "1px solid transparent" },
  danger:    { background: "rgba(239,68,68,.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,.25)" },
};
const SIZE_CLS: Record<BtnSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-sm gap-2",
};

export function Button({ variant = "secondary", size = "md", loading, icon, children, disabled, style, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-md transition-all duration-100 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${SIZE_CLS[size]}`}
      style={{ ...VARIANT_STYLE[variant], ...style }}
      {...rest}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = "", style, onClick }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-5 ${onClick ? "cursor-pointer transition-all duration-100 hover:-translate-y-px" : ""} ${className}`}
      style={{ background: "#161b27", borderColor: "#2d3748", ...style }}
    >
      {children}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, accent = false }: {
  label: string; value: string | number; icon: React.ReactNode; accent?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "#64748b" }}>{label}</p>
          <p className="text-2xl font-bold tracking-tight" style={{ color: accent ? "#3b82f6" : "#f1f5f9" }}>
            {value}
          </p>
        </div>
        <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(59,130,246,.1)", color: "#3b82f6" }}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeV = "default" | "blue" | "green" | "amber" | "red" | "purple";
const BADGE_CLS: Record<BadgeV, string> = {
  default: "bg-slate-700/40 text-slate-400",
  blue:    "bg-blue-500/15 text-blue-400",
  green:   "bg-green-500/15 text-green-400",
  amber:   "bg-amber-500/15 text-amber-400",
  red:     "bg-red-500/15 text-red-400",
  purple:  "bg-violet-500/15 text-violet-400",
};
export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: BadgeV }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${BADGE_CLS[variant]}`}>
      {children}
    </span>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }: {
  icon?: LucideIcon;
  title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {Icon && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(59,130,246,.08)", color: "#3b82f6" }}>
          <Icon size={28} strokeWidth={1.5} />
        </div>
      )}
      <p className="font-semibold mb-1" style={{ color: "#f1f5f9" }}>{title}</p>
      {description && <p className="text-sm mb-4 max-w-xs leading-relaxed" style={{ color: "#64748b" }}>{description}</p>}
      {action}
    </div>
  );
}

// ─── ErrorState ───────────────────────────────────────────────────────────────
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-8">
      <div className="rounded-2xl p-4" style={{ background: "rgba(239,68,68,.08)", color: "#ef4444" }}>
        <AlertTriangle size={28} strokeWidth={1.5} />
      </div>
      <p className="font-semibold" style={{ color: "#f1f5f9" }}>Something went wrong</p>
      <p className="text-sm max-w-xs" style={{ color: "#64748b" }}>{message}</p>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, description, actions }: {
  title: string; description?: string; actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>{title}</h2>
        {description && <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="border-t my-4" style={{ borderColor: "#2d3748" }} />;
  return (
    <div className="flex items-center gap-3 my-4">
      <hr className="flex-1 border-t" style={{ borderColor: "#2d3748" }} />
      <span className="text-xs" style={{ color: "#475569" }}>{label}</span>
      <hr className="flex-1 border-t" style={{ borderColor: "#2d3748" }} />
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function ToggleRow({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: "#f1f5f9" }}>{label}</p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#64748b" }}>{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="flex-shrink-0 rounded-full transition-colors duration-200 mt-0.5"
        style={{ width: 40, height: 22, background: checked ? "#3b82f6" : "#2d3748", position: "relative" }}
        role="switch" aria-checked={checked}
      >
        <span
          className="absolute rounded-full transition-transform duration-200"
          style={{ width: 16, height: 16, background: "#fff", top: 3, left: 3, transform: checked ? "translateX(18px)" : "none" }}
        />
      </button>
    </div>
  );
}

// ─── Inline switch (small, used inline in rule rows) ──────────────────────────
export function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className="flex-shrink-0 rounded-full transition-colors duration-200"
      style={{ width: 32, height: 18, background: checked ? "#3b82f6" : "#2d3748", position: "relative" }}
      role="switch" aria-checked={checked}>
      <span className="absolute rounded-full transition-transform duration-200"
        style={{ width: 12, height: 12, background: "#fff", top: 3, left: 3, transform: checked ? "translateX(14px)" : "none" }} />
    </button>
  );
}
