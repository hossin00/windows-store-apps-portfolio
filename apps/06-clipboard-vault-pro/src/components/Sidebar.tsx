import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, Library, Search as SearchIcon, Clock,
  Settings, Shield, Info, HelpCircle, ChevronRight, type LucideIcon,
} from "lucide-react";

const NAV: { label: string; to: string; icon: LucideIcon }[] = [
  { label: "Dashboard",   to: "/",            icon: LayoutDashboard },
  { label: "Vault",       to: "/vault",       icon: ClipboardList },
  { label: "Collections", to: "/collections", icon: Library },
  { label: "Search",      to: "/search",      icon: SearchIcon },
  { label: "History",     to: "/history",     icon: Clock },
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
      className="flex flex-col h-full border-r"
      style={{ width: 220, minWidth: 220, background: "#161b27", borderColor: "#2d3748", flexShrink: 0, overflow: "hidden" }}
    >
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "#2d3748", minHeight: 60 }}>
        <div
          className="flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ width: 32, height: 32, background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}
        >
          <ClipboardList size={16} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight truncate" style={{ color: "#f1f5f9", whiteSpace: "nowrap" }}>Clipboard Vault Pro</div>
          <div className="text-xs" style={{ color: "#64748b" }}>v1.0.0</div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {NAV.map((item) => <SidebarLink key={item.to} {...item} exact={item.to === "/"} />)}
        </div>
        <hr className="my-3 border-t" style={{ borderColor: "#2d3748" }} />
        <div className="flex flex-col gap-0.5">
          {SECONDARY.map((item) => <SidebarLink key={item.to} {...item} exact={false} />)}
        </div>
      </nav>

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
      style={{ color: active ? "#f1f5f9" : "#64748b", background: active ? "rgba(139,92,246,.12)" : "transparent" }}
    >
      <span style={{ color: active ? "#8b5cf6" : undefined, flexShrink: 0 }}>
        <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
      </span>
      <span className="flex-1 truncate" style={{ whiteSpace: "nowrap" }}>{label}</span>
      {active && <ChevronRight size={13} style={{ color: "#8b5cf6", opacity: 0.7 }} />}
    </NavLink>
  );
}
