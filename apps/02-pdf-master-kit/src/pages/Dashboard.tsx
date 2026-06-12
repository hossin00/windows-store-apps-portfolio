import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Combine, Scissors, Minimize2, RotateCw, ArrowUpDown, FileSearch,
  Clock, Shield, FileText, ArrowRight, Zap, Sparkles,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { StatCard, Card, Button, Badge, ACCENT } from "../components/UI";
import { ActivityChart } from "../components/ActivityChart";
import { getStats, getHistory, getFirstUseDate } from "../services/localStorageService";
import type { HistoryEntry } from "../types";
import { formatDistanceToNow, differenceInCalendarDays } from "date-fns";

const KIND_LABEL: Record<HistoryEntry["kind"], string> = {
  merge: "Merge", split: "Split", compress: "Compress",
  rotate: "Rotate", reorder: "Reorder", extract: "Extract",
};

export function Dashboard() {
  const nav = useNavigate();
  const [stats,  setStats]  = useState({ operationsRun: 0, pagesProcessed: 0, filesProcessed: 0 });
  const [recent, setRecent] = useState<HistoryEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
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
      <Topbar title="Dashboard" subtitle="PDF Master Kit" />
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
                  : `Day ${daysWithUs + 1} with PDF Master Kit · ${stats.operationsRun} operation${stats.operationsRun !== 1 ? "s" : ""} run so far`}
              </p>
            </div>
          </div>
        </Card>

        {/* Activity chart */}
        <Card>
          <ActivityChart timestamps={activityTs} label="Activity — last 7 days" />
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Operations Run"  value={stats.operationsRun}  icon={<Zap size={18} />} accent />
          <StatCard label="Pages Processed" value={stats.pagesProcessed} icon={<FileText size={18} />} />
          <StatCard label="Files Processed" value={stats.filesProcessed} icon={<FileSearch size={18} />} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Card>
              <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Quick Actions</p>
              <div className="grid grid-cols-3 gap-3">
                <ActionTile icon={<Combine size={20} strokeWidth={1.8} />}    label="Merge"
                  desc="Combine PDFs into one" onClick={() => nav("/merge")} accent />
                <ActionTile icon={<Scissors size={20} strokeWidth={1.8} />}   label="Split"
                  desc="Split by pages or ranges" onClick={() => nav("/split")} />
                <ActionTile icon={<Minimize2 size={20} strokeWidth={1.8} />}  label="Compress"
                  desc="Slim down a PDF file" onClick={() => nav("/compress")} />
                <ActionTile icon={<RotateCw size={20} strokeWidth={1.8} />}   label="Rotate"
                  desc="Turn pages 90/180/270" onClick={() => nav("/rotate")} />
                <ActionTile icon={<ArrowUpDown size={20} strokeWidth={1.8} />} label="Reorder"
                  desc="Drag pages to reorder" onClick={() => nav("/reorder")} />
                <ActionTile icon={<FileSearch size={20} strokeWidth={1.8} />} label="Extract"
                  desc="Pull out specific pages" onClick={() => nav("/extract")} />
              </div>
            </Card>
          </div>

          <Card style={{ background: "rgba(139,92,246,.06)", borderColor: "rgba(139,92,246,.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} style={{ color: "#8b5cf6" }} />
              <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Privacy-First</span>
            </div>
            <ul className="space-y-2 mb-4">
              {["Files processed locally", "No account required", "No ads, no tracking", "Clear data anytime"].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs" style={{ color: "#94a3b8" }}>
                  <span style={{ color: "#22c55e", fontSize: 14 }}>✓</span>{item}
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" onClick={() => nav("/privacy")}
              style={{ color: "#8b5cf6", paddingLeft: 0 }}>
              Privacy details <ArrowRight size={13} />
            </Button>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Recent Operations</p>
            <Button variant="ghost" size="sm" onClick={() => nav("/history")} style={{ color: "#8b5cf6" }}>
              View all <ArrowRight size={13} />
            </Button>
          </div>
          {recent.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center py-8 text-center gap-3">
                <div className="rounded-xl p-3" style={{ background: "rgba(139,92,246,.08)", color: "#8b5cf6" }}>
                  <Zap size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1" style={{ color: "#f1f5f9" }}>No operations yet</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>Pick a tool above to get started — every operation runs locally.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => nav("/merge")}>Try Merge</Button>
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
                  <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(124,58,237,.1)", color: "#7c3aed" }}>
                    <FileText size={16} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>{entry.outputName}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                      {KIND_LABEL[entry.kind]} · {entry.outputPages} page{entry.outputPages !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="purple">PDF</Badge>
                    <span className="text-xs" style={{ color: "#475569" }}>
                      {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={15} style={{ color: "#8b5cf6" }} />
            <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Powered by pdf-lib</p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Merge, split, rotate, reorder, and extract operations use the open-source pdf-lib library
            running entirely in your browser. Your files never leave your device.
          </p>
        </Card>
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
      style={{ background: accent ? "rgba(139,92,246,.08)" : "rgba(30,37,53,.6)", borderColor: accent ? "rgba(139,92,246,.25)" : "#2d3748" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#8b5cf6")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = accent ? "rgba(139,92,246,.25)" : "#2d3748")}
    >
      <div className="mb-2" style={{ color: accent ? "#8b5cf6" : "#64748b" }}>{icon}</div>
      <p className="text-sm font-medium leading-tight mb-1" style={{ color: "#f1f5f9" }}>{label}</p>
      <p className="text-xs leading-snug" style={{ color: "#64748b" }}>{desc}</p>
    </button>
  );
}
