import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search as SearchIcon, BarChart3, Clock, Shield, Sparkles,
  ArrowRight, HardDrive, Files, Layers,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { StatCard, Card, Button, Badge, ACCENT } from "../components/UI";
import { ActivityChart } from "../components/ActivityChart";
import {
  getStats, getSessions, getFirstUseDate, formatBytes,
} from "../services/duplicateService";
import type { ScanSession } from "../types";
import { formatDistanceToNow, differenceInCalendarDays } from "date-fns";

export function Dashboard() {
  const nav = useNavigate();
  const [stats,    setStats]    = useState(getStats());
  const [sessions, setSessions] = useState<ScanSession[]>([]);
  const [firstUse, setFirstUse] = useState<string>("");

  useEffect(() => {
    setStats(getStats());
    setSessions(getSessions());
    setFirstUse(getFirstUseDate());
  }, []);

  const daysWithUs = firstUse ? Math.max(0, differenceInCalendarDays(new Date(), new Date(firstUse))) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Up early" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const activityTs = sessions.map((s) => s.startedAt);
  const recent     = sessions.slice(0, 5);

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Dashboard" subtitle="Duplicate File Finder" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Welcome banner */}
        <Card style={{
          background: "linear-gradient(135deg, rgba(239,68,68,0.10), rgba(185,28,28,0.06))",
          borderColor: "rgba(239,68,68,0.25)",
        }}>
          <div className="flex items-center gap-4">
            <div className="rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ width: 44, height: 44, background: `linear-gradient(135deg,${ACCENT},#b91c1c)` }}>
              <Sparkles size={20} color="#ffffff" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold" style={{ color: "#f1f5f9" }}>{greeting} — welcome back</p>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                {daysWithUs === 0
                  ? "Glad you're here on day one — drop some files into the scanner."
                  : `Day ${daysWithUs + 1} · ${stats.duplicatesFound} duplicate${stats.duplicatesFound !== 1 ? "s" : ""} flagged so far`}
              </p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Sessions Run"     value={stats.sessionsRun}     icon={<BarChart3 size={18} />} accent />
          <StatCard label="Files Scanned"    value={stats.filesScanned}    icon={<Files size={18} />} />
          <StatCard label="Duplicates Found" value={stats.duplicatesFound} icon={<Layers size={18} />} />
          <StatCard label="Plan Recovered"   value={formatBytes(stats.spaceRecovered)} icon={<HardDrive size={18} />} />
        </div>

        {/* Activity */}
        <Card>
          <ActivityChart timestamps={activityTs} label="Scans — last 7 days" />
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Card>
              <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Quick Actions</p>
              <div className="grid grid-cols-3 gap-3">
                <ActionTile icon={<SearchIcon size={20} strokeWidth={1.8} />} label="Open Scanner"
                  desc="Drop files and find duplicates" onClick={() => nav("/scanner")} accent />
                <ActionTile icon={<BarChart3 size={20} strokeWidth={1.8} />} label="Results"
                  desc="Summary, donut chart, exports" onClick={() => nav("/results")} />
                <ActionTile icon={<Clock size={20} strokeWidth={1.8} />} label="History"
                  desc="Past scan sessions" onClick={() => nav("/history")} />
              </div>
            </Card>
          </div>

          <Card style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} style={{ color: ACCENT }} />
              <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Privacy-First</span>
            </div>
            <ul className="space-y-2 mb-4">
              {["Files stay on your device", "No account required", "No ads, no tracking", "Plan-then-apply — never silent"].map(item => (
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

        {/* Recent sessions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Recent scans</p>
            <Button variant="ghost" size="sm" onClick={() => nav("/history")} style={{ color: ACCENT }}>
              View all <ArrowRight size={13} />
            </Button>
          </div>
          {recent.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center py-8 text-center gap-3">
                <div className="rounded-xl p-3" style={{ background: "rgba(239,68,68,0.08)", color: ACCENT }}>
                  <SearchIcon size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1" style={{ color: "#f1f5f9" }}>No scans yet</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>Open the Scanner and drop your first batch of files.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => nav("/scanner")}>Open Scanner</Button>
              </div>
            </Card>
          ) : (
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {recent.map((s, i) => (
                <div key={s.id}
                  className="flex items-center gap-4 px-5 py-3 cursor-pointer"
                  style={{ borderBottom: i < recent.length - 1 ? "1px solid #2d3748" : undefined }}
                  onClick={() => nav("/history")}>
                  <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(239,68,68,0.1)", color: ACCENT }}>
                    <BarChart3 size={16} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>{s.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                      {s.totalFiles} files · {s.duplicateCount} redundant · {formatBytes(s.recoveredSpace)} planned
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="red">{s.compareMode.toUpperCase()}</Badge>
                    <span className="text-xs" style={{ color: "#475569" }}>
                      {formatDistanceToNow(new Date(s.startedAt), { addSuffix: true })}
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
        background: accent ? "rgba(239,68,68,0.08)" : "rgba(30,37,53,.6)",
        borderColor: accent ? "rgba(239,68,68,0.25)" : "#2d3748",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = ACCENT)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = accent ? "rgba(239,68,68,0.25)" : "#2d3748")}>
      <div className="mb-2" style={{ color: accent ? ACCENT : "#64748b" }}>{icon}</div>
      <p className="text-sm font-medium leading-tight mb-1" style={{ color: "#f1f5f9" }}>{label}</p>
      <p className="text-xs leading-snug" style={{ color: "#64748b" }}>{desc}</p>
    </button>
  );
}
