// ─── Export Center ────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Download, FileText, FileJson, AlignLeft, Clock, Trash2 } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, Badge, EmptyState, StatCard } from "../components/UI";
import { getHistory, getExportRecords, clearExportRecords, getStats } from "../services/localStorageService";
import { exportText, exportHistoryAsJSON, exportBatchResultsAsText } from "../services/exportService";
import { useToast } from "../context/ToastContext";
import type { HistoryEntry } from "../types";
import { format } from "date-fns";

export function ExportCenter() {
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [records, setRecords] = useState(getExportRecords());
  const [stats,   setStats]   = useState(getStats());

  const load = () => { setHistory(getHistory()); setRecords(getExportRecords()); setStats(getStats()); };
  useEffect(load, []);

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Export Center" subtitle="Export OCR results in multiple formats" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Exports"    value={stats.textExports}    icon={<Download size={18} />} accent />
          <StatCard label="In History"       value={history.length}       icon={<FileText size={18} />} />
          <StatCard label="Files Processed"  value={stats.filesProcessed} icon={<Clock size={18} />} />
        </div>

        <Card>
          <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Export All History</p>
          <div className="flex flex-wrap gap-3">
            <ExportTile icon={<AlignLeft size={20} strokeWidth={1.8} />} label="TXT — Combined"
              desc="All results merged into one text file" disabled={!history.length}
              onClick={() => { exportBatchResultsAsText(history.map((h) => ({ fileName: h.fileName, text: h.extractedText }))); toast(`Exported ${history.length} results`, "success"); load(); }} />
            <ExportTile icon={<FileJson size={20} strokeWidth={1.8} />} label="JSON — Full data"
              desc="Complete history with metadata" disabled={!history.length}
              onClick={() => { exportHistoryAsJSON(history); toast("History exported as JSON", "success"); load(); }} />
          </div>
          {!history.length && (
            <p className="text-xs mt-3" style={{ color: "#475569" }}>
              No history yet. Run OCR in the Workspace and save results to enable export.
            </p>
          )}
        </Card>

        {history.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: "#f1f5f9" }}>Export Individual Results</p>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {history.slice(0, 20).map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-4 px-5 py-3.5"
                  style={{ borderBottom: i < Math.min(history.length, 20) - 1 ? "1px solid #2d3748" : undefined }}>
                  <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(99,102,241,.1)", color: "#6366f1" }}>
                    <FileText size={16} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>{entry.fileName}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                      {entry.wordCount} words · {format(new Date(entry.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="secondary" size="sm"
                      onClick={() => { exportText(entry.extractedText, entry.fileName, "txt", entry.id); toast("Exported as TXT", "success"); load(); }}
                      icon={<Download size={12} />}>TXT</Button>
                    <Button variant="secondary" size="sm"
                      onClick={() => { exportText(entry.extractedText, entry.fileName, "md", entry.id); toast("Exported as MD", "success"); load(); }}
                      icon={<Download size={12} />}>MD</Button>
                  </div>
                </div>
              ))}
              {history.length > 20 && (
                <div className="px-5 py-3 text-xs" style={{ color: "#475569", borderTop: "1px solid #2d3748" }}>
                  Showing first 20 of {history.length} entries. Export all as JSON for complete data.
                </div>
              )}
            </Card>
          </div>
        )}

        {records.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Export Log</p>
              <Button variant="ghost" size="sm"
                onClick={() => { clearExportRecords(); load(); toast("Log cleared", "info"); }}
                icon={<Trash2 size={12} />} style={{ color: "#475569" }}>Clear log</Button>
            </div>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {records.slice(0, 15).map((rec, i) => (
                <div key={rec.id} className="flex items-center gap-4 px-5 py-3"
                  style={{ borderBottom: i < Math.min(records.length, 15) - 1 ? "1px solid #2d3748" : undefined }}>
                  <span className="text-xs font-medium uppercase" style={{ color: "#3b82f6", width: 32 }}>{rec.format}</span>
                  <span className="flex-1 text-sm truncate" style={{ color: "#94a3b8" }}>{rec.fileName}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: "#475569" }}>
                    {format(new Date(rec.exportedAt), "MMM d, HH:mm")}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function ExportTile({ icon, label, desc, onClick, disabled }: {
  icon: React.ReactNode; label: string; desc: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex items-start gap-3 rounded-lg p-4 border text-left transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: "rgba(30,37,53,.6)", borderColor: "#2d3748", minWidth: 200 }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.borderColor = "#3b82f6"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#2d3748"; }}>
      <div style={{ color: "#3b82f6", marginTop: 2 }}>{icon}</div>
      <div>
        <p className="text-sm font-medium mb-0.5" style={{ color: "#f1f5f9" }}>{label}</p>
        <p className="text-xs" style={{ color: "#64748b" }}>{desc}</p>
      </div>
    </button>
  );
}
