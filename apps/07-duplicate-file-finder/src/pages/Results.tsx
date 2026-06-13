import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3, Download, FileText, FileCode, Files, HardDrive, Layers, Trash2,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import {
  Button, Card, EmptyState, Badge, ACCENT, SelectField,
} from "../components/UI";
import { AllCleanIllustration } from "../components/illustrations";
import {
  getSessions, groupsToCsv, groupsToJson, downloadString, formatBytes,
} from "../services/duplicateService";
import { useToast } from "../context/ToastContext";
import { useScan } from "../context/ScanContext";
import type { ScanSession } from "../types";

export function Results() {
  const nav        = useNavigate();
  const { toast }  = useToast();
  const { groups, files } = useScan();
  const [sessions, setSessions] = useState<ScanSession[]>([]);
  const [pickedId, setPickedId] = useState<string>("");

  useEffect(() => {
    const all = getSessions();
    setSessions(all);
    if (all.length > 0) setPickedId(all[0].id);
  }, []);

  const picked = sessions.find((s) => s.id === pickedId);

  // If there's a current scan in memory, summarise it. Otherwise show the most recent session.
  const liveCount = files.length;

  const exportCsv = () => {
    if (groups.length === 0) { toast("Nothing in the current scan to export", "warning"); return; }
    downloadString(groupsToCsv(groups), `dupefinder-${Date.now()}.csv`, "text/csv;charset=utf-8");
    toast("Exported as CSV", "success");
  };
  const exportJson = () => {
    if (groups.length === 0) { toast("Nothing in the current scan to export", "warning"); return; }
    downloadString(groupsToJson(groups), `dupefinder-${Date.now()}.json`, "application/json;charset=utf-8");
    toast("Exported as JSON", "success");
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Results" subtitle="Summary, donut chart, and exports"
        actions={
          groups.length > 0 && (
            <>
              <Button variant="secondary" size="sm" onClick={exportCsv}  icon={<FileText size={13} />}>Export CSV</Button>
              <Button variant="secondary" size="sm" onClick={exportJson} icon={<FileCode size={13} />}>Export JSON</Button>
            </>
          )
        } />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Current scan summary */}
        {liveCount > 0 ? (
          <CurrentSummary />
        ) : (
          <EmptyState illustration={<AllCleanIllustration />}
            title={sessions.length === 0 ? "Nothing scanned yet" : "No current scan in memory"}
            description={sessions.length === 0
              ? "Open the Scanner page and drop files to see a results breakdown here."
              : "The current Results page summarises the live scan. Saved sessions appear below — pick one to view its summary."} />
        )}

        {/* Saved sessions picker */}
        {sessions.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4 gap-4">
              <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Saved sessions</p>
              <Button variant="ghost" size="sm" onClick={() => nav("/history")} style={{ color: ACCENT }}>
                Open History →
              </Button>
            </div>
            <SelectField value={pickedId} onChange={setPickedId}
              options={sessions.map((s) => ({
                value: s.id,
                label: `${s.label} — ${new Date(s.startedAt).toLocaleString()}`,
              }))} />
            {picked && <SessionCard session={picked} />}
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Current scan summary ────────────────────────────────────────────────────

function CurrentSummary() {
  const { files, groups } = useScan();
  const totalSize       = files.reduce((s, f) => s + f.size, 0);
  const dupeCount       = groups.reduce((s, g) => s + Math.max(0, g.files.length - 1), 0);
  const wasted          = groups.reduce((s, g) => {
    if (g.files.length < 2) return s;
    const total = g.files.reduce((x, f) => x + f.size, 0);
    const keep  = Math.max(...g.files.map((f) => f.size));
    return s + (total - keep);
  }, 0);
  const uniqueCount     = files.length - dupeCount;

  return (
    <>
      <div className="grid grid-cols-4 gap-3">
        <StatPill icon={<Files size={16} />}     label="Total files"     value={files.length.toString()} />
        <StatPill icon={<Layers size={16} />}    label="Duplicate groups" value={groups.length.toString()} />
        <StatPill icon={<BarChart3 size={16} />} label="Redundant files" value={dupeCount.toString()} accent />
        <StatPill icon={<HardDrive size={16} />} label="Space wasted"    value={formatBytes(wasted)} accent />
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-6 items-center">
          <div className="flex items-center justify-center">
            <DonutChart total={files.length} dupe={dupeCount} unique={uniqueCount} />
          </div>
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: "#f1f5f9" }}>Duplicate vs unique</p>
            <ul className="space-y-2">
              <LegendRow color="#ef4444" label="Redundant" value={`${dupeCount} files`} />
              <LegendRow color="#22c55e" label="Unique"    value={`${uniqueCount} files`} />
              <LegendRow color="#475569" label="Total size" value={formatBytes(totalSize)} />
              <LegendRow color="#f87171" label="Reclaimable" value={formatBytes(wasted)} />
            </ul>
            <p className="text-xs mt-4" style={{ color: "#64748b" }}>
              Open the Scanner to flip auto-select and apply your cleanup plan.
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}

// ─── Donut chart (pure SVG) ──────────────────────────────────────────────────

function DonutChart({ total, dupe, unique }: { total: number; dupe: number; unique: number }) {
  const r = 56, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const dupeFrac   = total > 0 ? dupe   / total : 0;
  const dupeStroke = circ * dupeFrac;
  // Render unique first (green), then dupe arc on top (red).
  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e2535" strokeWidth="18" />
      {total > 0 && (
        <>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22c55e" strokeWidth="18"
            strokeDasharray={`${circ} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} />
          {dupe > 0 && (
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ef4444" strokeWidth="18"
              strokeDasharray={`${dupeStroke} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} />
          )}
        </>
      )}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#f1f5f9" fontSize="20" fontWeight="700">
        {total > 0 ? Math.round(dupeFrac * 100) : 0}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize="9">duplicate</text>
    </svg>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <li className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-2" style={{ color: "#94a3b8" }}>
        <span style={{ display: "inline-block", width: 10, height: 10, background: color, borderRadius: 3 }} />
        {label}
      </span>
      <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{value}</span>
    </li>
  );
}

function StatPill({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string; accent?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="rounded-md p-2 flex-shrink-0"
          style={{ background: "rgba(239,68,68,0.1)", color: ACCENT }}>{icon}</div>
        <div>
          <p className="text-xs" style={{ color: "#64748b" }}>{label}</p>
          <p className="text-lg font-bold" style={{ color: accent ? ACCENT : "#f1f5f9" }}>{value}</p>
        </div>
      </div>
    </Card>
  );
}

// ─── Saved session card ──────────────────────────────────────────────────────

function SessionCard({ session }: { session: ScanSession }) {
  return (
    <div className="mt-4 rounded-lg p-4 space-y-3"
      style={{ background: "rgba(30,37,53,0.5)", border: "1px solid #2d3748" }}>
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="red">{session.compareMode.toUpperCase()}</Badge>
        <p className="text-sm font-medium" style={{ color: "#f1f5f9" }}>{session.label}</p>
        <span className="text-xs ml-auto" style={{ color: "#64748b" }}>
          {new Date(session.startedAt).toLocaleString()}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SessionStat label="Total files"     value={session.totalFiles.toString()} />
        <SessionStat label="Duplicate groups" value={session.groupCount.toString()} />
        <SessionStat label="Redundant"       value={session.duplicateCount.toString()} accent />
        <SessionStat label="Space wasted"    value={formatBytes(session.wastedSpace)} accent />
        <SessionStat label="Total size"      value={formatBytes(session.totalSize)} />
        <SessionStat label="Plan size"       value={formatBytes(session.recoveredSpace)} highlight />
        <SessionStat label="Files in plan"   value={session.filesRemoved.toString()} />
        <SessionStat label="Status"          value="Plan saved (simulation)" />
      </div>
    </div>
  );
}

function SessionStat({ label, value, accent, highlight }: { label: string; value: string; accent?: boolean; highlight?: boolean }) {
  return (
    <div className="rounded-md px-3 py-2" style={{ background: "rgba(15,17,23,0.7)", border: "1px solid #2d3748" }}>
      <p className="text-xs" style={{ color: "#475569" }}>{label}</p>
      <p className="text-sm font-bold" style={{ color: highlight ? "#22c55e" : accent ? ACCENT : "#f1f5f9" }}>{value}</p>
    </div>
  );
}
