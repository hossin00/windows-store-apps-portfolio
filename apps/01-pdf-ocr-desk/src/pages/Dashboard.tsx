import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanText, ListOrdered, Clock, Download, Shield, FileText, ArrowRight, Zap } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { StatCard, Card, Button, Badge, StatusBadge } from "../components/UI";
import { getStats, getHistory } from "../services/localStorageService";
import type { HistoryEntry } from "../types";
import { formatDistanceToNow } from "date-fns";

export function Dashboard() {
  const nav = useNavigate();
  const [stats,  setStats]  = useState({ filesProcessed: 0, textExports: 0, batchJobsRun: 0 });
  const [recent, setRecent] = useState<HistoryEntry[]>([]);

  useEffect(() => { setStats(getStats()); setRecent(getHistory().slice(0, 5)); }, []);

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Dashboard" subtitle="PDF OCR Desk" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Files Processed" value={stats.filesProcessed} icon={<ScanText size={18} />} accent />
          <StatCard label="Text Exports"    value={stats.textExports}    icon={<Download size={18} />} />
          <StatCard label="Batch Jobs"      value={stats.batchJobsRun}   icon={<ListOrdered size={18} />} />
        </div>

        {/* Quick actions + privacy */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Card>
              <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Quick Actions</p>
              <div className="grid grid-cols-2 gap-3">
                <ActionTile icon={<ScanText size={20} strokeWidth={1.8} />} label="OCR Workspace"
                  desc="Import a file and extract text" onClick={() => nav("/workspace")} accent />
                <ActionTile icon={<ListOrdered size={20} strokeWidth={1.8} />} label="Batch Queue"
                  desc="Process multiple files at once" onClick={() => nav("/batch")} />
                <ActionTile icon={<Clock size={20} strokeWidth={1.8} />} label="History"
                  desc="Browse past OCR results" onClick={() => nav("/history")} />
                <ActionTile icon={<Download size={20} strokeWidth={1.8} />} label="Export Center"
                  desc="Export results in multiple formats" onClick={() => nav("/export")} />
              </div>
            </Card>
          </div>

          <Card style={{ background: "rgba(59,130,246,.06)", borderColor: "rgba(59,130,246,.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} style={{ color: "#3b82f6" }} />
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
              style={{ color: "#3b82f6", paddingLeft: 0 }}>
              Privacy details <ArrowRight size={13} />
            </Button>
          </Card>
        </div>

        {/* Recent */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Recent OCR Jobs</p>
            <Button variant="ghost" size="sm" onClick={() => nav("/history")} style={{ color: "#3b82f6" }}>
              View all <ArrowRight size={13} />
            </Button>
          </div>
          {recent.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center py-8 text-center gap-3">
                <div className="rounded-xl p-3" style={{ background: "rgba(59,130,246,.08)", color: "#3b82f6" }}>
                  <Zap size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1" style={{ color: "#f1f5f9" }}>No jobs yet</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>Import an image or PDF in the OCR Workspace to get started.</p>
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
                  <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(99,102,241,.1)", color: "#6366f1" }}>
                    <FileText size={16} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>{entry.fileName}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{entry.wordCount} words · {entry.charCount} chars</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={entry.fileType === "pdf" ? "purple" : "blue"}>{entry.fileType.toUpperCase()}</Badge>
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
      style={{ background: accent ? "rgba(59,130,246,.08)" : "rgba(30,37,53,.6)", borderColor: accent ? "rgba(59,130,246,.25)" : "#2d3748" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#3b82f6")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = accent ? "rgba(59,130,246,.25)" : "#2d3748")}
    >
      <div className="mb-2" style={{ color: accent ? "#3b82f6" : "#64748b" }}>{icon}</div>
      <p className="text-sm font-medium leading-tight mb-1" style={{ color: "#f1f5f9" }}>{label}</p>
      <p className="text-xs leading-snug" style={{ color: "#64748b" }}>{desc}</p>
    </button>
  );
}
