import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ScanText, ListOrdered, Clock,
  Download, Settings, Shield, Info, HelpCircle,
  FileText, ChevronRight, type LucideIcon,
} from "lucide-react";

const NAV: { label: string; to: string; icon: LucideIcon }[] = [
  { label: "Dashboard",    to: "/",          icon: LayoutDashboard },
  { label: "OCR Workspace",to: "/workspace", icon: ScanText        },
  { label: "Batch Queue",  to: "/batch",     icon: ListOrdered     },
  { label: "History",      to: "/history",   icon: Clock           },
  { label: "Export Center",to: "/export",    icon: Download        },
];
const SECONDARY: { label: string; to: string; icon: LucideIcon }[] = [
  { label: "Settings", to: "/settings", icon: Settings  },
  { label: "Privacy",  to: "/privacy",  icon: Shield    },
  { label: "About",    to: "/about",    icon: Info      },
  { label: "Help",     to: "/help",     icon: HelpCircle},
];

export function Sidebar() {
  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        height: '100%',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#161b27',
        borderRight: '1px solid #2d3748',
        overflow: 'hidden'
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "#2d3748", minHeight: 60 }}>
        <div
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ width: 32, height: 32, background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
        >
          <FileText size={16} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight truncate" style={{ color: "#f1f5f9", whiteSpace: "nowrap" }}>PDF OCR Desk</div>
          <div className="text-xs" style={{ color: "#64748b" }}>v1.0.0</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {NAV.map((item) => <SidebarLink key={item.to} {...item} exact={item.to === "/"} />)}
        </div>
        <hr className="my-3 border-t" style={{ borderColor: "#2d3748" }} />
        <div className="flex flex-col gap-0.5">
          {SECONDARY.map((item) => <SidebarLink key={item.to} {...item} exact={false} />)}
        </div>
      </nav>

      {/* Footer tag */}
      <div className="px-4 py-3 border-t text-xs" style={{ borderColor: "#2d3748", color: "#475569" }}>
        <div className="flex items-center gap-1.5">
          <Shield size={11} />
          <span>Local-first · No tracking</span>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({
  label, to, icon: Icon, exact,
}: { label: string; to: string; icon: LucideIcon; exact: boolean }) {
  const { pathname } = useLocation();
  const active = exact ? pathname === to : pathname.startsWith(to);
  return (
    <NavLink
      to={to}
      className="nav-link flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium"
      style={{ color: active ? "#f1f5f9" : "#64748b", background: active ? "rgba(59,130,246,.12)" : "transparent" }}
    >
      <span style={{ color: active ? "#3b82f6" : undefined, flexShrink: 0 }}>
        <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
      </span>
      <span className="flex-1 truncate" style={{ whiteSpace: "nowrap" }}>{label}</span>
      {active && <ChevronRight size={13} style={{ color: "#3b82f6", opacity: 0.7 }} />}
    </NavLink>
  );
}
