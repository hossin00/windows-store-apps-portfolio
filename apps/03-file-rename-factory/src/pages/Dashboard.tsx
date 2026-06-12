import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wand2, Clock, Shield, ArrowRight, Zap, FilePenLine, FileText, Sparkles,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { StatCard, Card, Button, Badge, ACCENT } from "../components/UI";
import { ActivityChart } from "../components/ActivityChart";
import { getStats, getHistory, getFirstUseDate } from "../services/localStorageService";
import type { RenameSession } from "../types";
import { formatDistanceToNow, differenceInCalendarDays } from "date-fns";

export function Dashboard() {
  const nav = useNavigate();
  const [stats,  setStats]  = useState({ sessionsApplied: 0, filesRenamed: 0, rulesUsed: 0 });
  const [recent, setRecent] = useState<RenameSession[]>([]);
  const [history, setHistory] = useState<RenameSession[]>([]);
  const [firstUse, setFirstUse] = useState<string>("");

  useEffect(() => {
    setStats(getStats());
    const all = getHistory();
    setHistory(all);
    setRecent(all.slice(0, 5));
    setFirstUse(getFirstUseDate());
  }, []);

  const daysWithUs = firstUse ? Math.max(0, differenceInCalendarDays(new Date(), new Date(firstUse))) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Up early" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const activityTs = history.map((h) => h.createdAt);

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Dashboard" subtitle="File Rename Factory" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Welcome banner */}
        <Card style={{
          background: "linear-gradient(135deg, rgba(249,115,22,0.10), rgba(234,88,12,0.06))",
          borderColor: "rgba(249,115,22,0.25)",
        }}>
          <div className="flex items-center gap-4">
            <div className="rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ width: 44, height: 44, background: `linear-gradient(135deg,${ACCENT},#ea580c)` }}>
              <Sparkles size={20} color="#ffffff" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold" style={{ color: "#f1f5f9" }}>{greeting} — welcome back</p>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                {daysWithUs === 0
                  ? "Glad you're here on day one."
                  : `Day ${daysWithUs + 1} with File Rename Factory · ${stats.filesRenamed} file${stats.filesRenamed !== 1 ? "s" : ""} renamed so far`}
              </p>
            </div>
          </div>
        </Card>

        {/* Activity chart */}
        <Card>
          <ActivityChart timestamps={activityTs} label="Activity — last 7 days" />
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Sessions Applied" value={stats.sessionsApplied} icon={<Zap size={18} />} accent />
          <StatCard label="Files Renamed"    value={stats.filesRenamed}    icon={<FileText size={18} />} />
          <StatCard label="Rules Used"       value={stats.rulesUsed}       icon={<Wand2 size={18} />} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Card>
              <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Quick Actions</p>
              <div className="grid grid-cols-2 gap-3">
                <ActionTile icon={<Wand2 size={20} strokeWidth={1.8} />} label="Open Workspace"
                  desc="Build a rename plan and preview before applying" onClick={() => nav("/workspace")} accent />
                <ActionTile icon={<Clock size={20} strokeWidth={1.8} />} label="View History"
                  desc="Past rename sessions and rule snapshots" onClick={() => nav("/history")} />
              </div>

              <p className="text-sm font-semibold mt-6 mb-3" style={{ color: "#f1f5f9" }}>Rule types available</p>
              <div className="grid grid-cols-3 gap-2">
                {["Prefix","Suffix","Numbering","Date","Find & replace","Regex","Case","Remove special","Trim"].map((r) => (
                  <div key={r} className="rounded-md px-3 py-2 text-xs"
                    style={{ background: "rgba(30,37,53,.5)", border: "1px solid #2d3748", color: "#94a3b8" }}>
                    {r}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card style={{ background: "rgba(249,115,22,.06)", borderColor: "rgba(249,115,22,.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} style={{ color: "#f97316" }} />
              <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Privacy-First</span>
            </div>
            <ul className="space-y-2 mb-4">
              {["Files stay on your device", "No account required", "No ads, no tracking", "Clear data anytime"].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs" style={{ color: "#94a3b8" }}>
                  <span style={{ color: "#22c55e", fontSize: 14 }}>✓</span>{item}
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" onClick={() => nav("/privacy")}
              style={{ color: "#f97316", paddingLeft: 0 }}>
              Privacy details <ArrowRight size={13} />
            </Button>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Recent Sessions</p>
            <Button variant="ghost" size="sm" onClick={() => nav("/history")} style={{ color: "#f97316" }}>
              View all <ArrowRight size={13} />
            </Button>
          </div>
          {recent.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center py-8 text-center gap-3">
                <div className="rounded-xl p-3" style={{ background: "rgba(249,115,22,.08)", color: "#f97316" }}>
                  <FilePenLine size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1" style={{ color: "#f1f5f9" }}>No sessions yet</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>Open the Workspace to drop files and build a rename plan.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => nav("/workspace")}>Open Workspace</Button>
              </div>
            </Card>
          ) : (
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {recent.map((entry, i) => (
                <div key={entry.id}
                  className="flex items-center gap-4 px-5 py-3 cursor-pointer"
                  style={{ borderBottom: i < recent.length - 1 ? "1px solid #2d3748" : undefined }}
                  onClick={() => nav("/history")}
                >
                  <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(234,88,12,.1)", color: "#ea580c" }}>
                    <FilePenLine size={16} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "#f1f5f9" }}>
                      {entry.fileCount} file{entry.fileCount !== 1 ? "s" : ""} · {entry.ruleCount} rule{entry.ruleCount !== 1 ? "s" : ""}
                    </p>
                    {entry.samples[0] && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: "#64748b" }}>
                        {entry.samples[0].from} → {entry.samples[0].to}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {entry.undone ? <Badge variant="amber">UNDONE</Badge> : <Badge variant="green">APPLIED</Badge>}
                    <span className="text-xs" style={{ color: "#475569" }}>
                      {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
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
      style={{ background: accent ? "rgba(249,115,22,.08)" : "rgba(30,37,53,.6)", borderColor: accent ? "rgba(249,115,22,.25)" : "#2d3748" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#f97316")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = accent ? "rgba(249,115,22,.25)" : "#2d3748")}
    >
      <div className="mb-2" style={{ color: accent ? "#f97316" : "#64748b" }}>{icon}</div>
      <p className="text-sm font-medium leading-tight mb-1" style={{ color: "#f1f5f9" }}>{label}</p>
      <p className="text-xs leading-snug" style={{ color: "#64748b" }}>{desc}</p>
    </button>
  );
}
