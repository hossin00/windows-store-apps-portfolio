import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList, Library, Search as SearchIcon, Clock, Shield, Sparkles,
  ArrowRight, Copy, Plus, Layers,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { StatCard, Card, Button, Badge, ACCENT } from "../components/UI";
import { ActivityChart } from "../components/ActivityChart";
import {
  getStats, getSnippets, getCollections, getFirstUseDate,
} from "../services/clipboardService";
import type { Snippet } from "../types";
import { formatDistanceToNow, differenceInCalendarDays } from "date-fns";

export function Dashboard() {
  const nav = useNavigate();
  const [stats,    setStats]    = useState(getStats());
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [collCount, setCollCount] = useState(0);
  const [firstUse, setFirstUse] = useState<string>("");

  useEffect(() => {
    setStats(getStats());
    const all = getSnippets();
    setSnippets(all);
    setCollCount(getCollections().length);
    setFirstUse(getFirstUseDate());
  }, []);

  const daysWithUs = firstUse ? Math.max(0, differenceInCalendarDays(new Date(), new Date(firstUse))) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Up early" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const activityTs = snippets.map((s) => s.createdAt);

  const recent  = snippets.slice(0, 5);

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Dashboard" subtitle="Clipboard Vault Pro" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Welcome banner */}
        <Card style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.10), rgba(124,58,237,0.06))",
          borderColor: "rgba(139,92,246,0.25)",
        }}>
          <div className="flex items-center gap-4">
            <div className="rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ width: 44, height: 44, background: `linear-gradient(135deg,${ACCENT},#7c3aed)` }}>
              <Sparkles size={20} color="#ffffff" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold" style={{ color: "#f1f5f9" }}>{greeting} — welcome back</p>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                {daysWithUs === 0
                  ? "Glad you're here on day one."
                  : `Day ${daysWithUs + 1} with Clipboard Vault Pro · ${stats.snippetsCreated} snippet${stats.snippetsCreated !== 1 ? "s" : ""} saved so far`}
              </p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Snippets Saved" value={stats.snippetsCreated} icon={<ClipboardList size={18} />} accent />
          <StatCard label="Copied"          value={stats.snippetsCopied} icon={<Copy size={18} />} />
          <StatCard label="Collections"     value={collCount} icon={<Library size={18} />} />
          <StatCard label="Snippets Now"    value={snippets.length} icon={<Layers size={18} />} />
        </div>

        {/* Activity chart */}
        <Card>
          <ActivityChart timestamps={activityTs} label="Activity — last 7 days" />
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Card>
              <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Quick Actions</p>
              <div className="grid grid-cols-3 gap-3">
                <ActionTile icon={<Plus size={20} strokeWidth={1.8} />} label="Add to Vault"
                  desc="Drop a snippet in and we'll auto-tag it" onClick={() => nav("/vault")} accent />
                <ActionTile icon={<Library size={20} strokeWidth={1.8} />} label="Collections"
                  desc="Organise snippets into folders" onClick={() => nav("/collections")} />
                <ActionTile icon={<SearchIcon size={20} strokeWidth={1.8} />} label="Search"
                  desc="Filter by type, tag, collection" onClick={() => nav("/search")} />
              </div>
              <p className="text-sm font-semibold mt-6 mb-3" style={{ color: "#f1f5f9" }}>Type breakdown</p>
              <div className="grid grid-cols-5 gap-2">
                <TypeStat label="URL"   value={stats.type_url} />
                <TypeStat label="Email" value={stats.type_email} />
                <TypeStat label="Code"  value={stats.type_code} />
                <TypeStat label="Phone" value={stats.type_phone} />
                <TypeStat label="Text"  value={stats.type_text} />
              </div>
            </Card>
          </div>

          <Card style={{ background: "rgba(139,92,246,0.06)", borderColor: "rgba(139,92,246,0.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} style={{ color: ACCENT }} />
              <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Privacy-First</span>
            </div>
            <ul className="space-y-2 mb-4">
              {["Snippets stay on your device", "No account required", "No ads, no tracking", "Clear data anytime"].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs" style={{ color: "#94a3b8" }}>
                  <span style={{ color: "#22c55e", fontSize: 14 }}>✓</span>{item}
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" onClick={() => nav("/privacy")}
              style={{ color: ACCENT, paddingLeft: 0 }}>
              Privacy details <ArrowRight size={13} />
            </Button>
          </Card>
        </div>

        {/* Recent */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Recent snippets</p>
            <Button variant="ghost" size="sm" onClick={() => nav("/vault")} style={{ color: ACCENT }}>
              View all <ArrowRight size={13} />
            </Button>
          </div>
          {recent.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center py-8 text-center gap-3">
                <div className="rounded-xl p-3" style={{ background: "rgba(139,92,246,0.08)", color: ACCENT }}>
                  <ClipboardList size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1" style={{ color: "#f1f5f9" }}>No snippets yet</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>Save your first snippet — the vault page has an Add form.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => nav("/vault")}>Open Vault</Button>
              </div>
            </Card>
          ) : (
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {recent.map((s, i) => (
                <div key={s.id}
                  className="flex items-center gap-4 px-5 py-3 cursor-pointer"
                  style={{ borderBottom: i < recent.length - 1 ? "1px solid #2d3748" : undefined }}
                  onClick={() => nav("/vault")}>
                  <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(139,92,246,0.1)", color: ACCENT }}>
                    <ClipboardList size={16} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>
                      {s.title || s.content.slice(0, 60)}
                    </p>
                    <p className="text-xs mt-0.5 truncate font-mono" style={{ color: "#64748b" }}>
                      {s.content.slice(0, 80)}{s.content.length > 80 ? "…" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="purple">{s.type.toUpperCase()}</Badge>
                    <span className="text-xs" style={{ color: "#475569" }}>
                      {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionTile({ icon, label, desc, onClick, accent = false }: {
  icon: React.ReactNode; label: string; desc: string; onClick: () => void; accent?: boolean;
}) {
  return (
    <button onClick={onClick}
      className="text-left rounded-lg p-4 border transition-all duration-100"
      style={{
        background: accent ? "rgba(139,92,246,0.08)" : "rgba(30,37,53,.6)",
        borderColor: accent ? "rgba(139,92,246,0.25)" : "#2d3748",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = ACCENT)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = accent ? "rgba(139,92,246,0.25)" : "#2d3748")}>
      <div className="mb-2" style={{ color: accent ? ACCENT : "#64748b" }}>{icon}</div>
      <p className="text-sm font-medium leading-tight mb-1" style={{ color: "#f1f5f9" }}>{label}</p>
      <p className="text-xs leading-snug" style={{ color: "#64748b" }}>{desc}</p>
    </button>
  );
}

function TypeStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md px-3 py-2 text-center"
      style={{ background: "rgba(30,37,53,.5)", border: "1px solid #2d3748" }}>
      <p className="text-lg font-bold" style={{ color: "#f1f5f9" }}>{value}</p>
      <p className="text-xs" style={{ color: "#64748b" }}>{label}</p>
    </div>
  );
}
