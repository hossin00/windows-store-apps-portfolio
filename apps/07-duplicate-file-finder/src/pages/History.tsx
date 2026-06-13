import { useEffect, useState } from "react";
import {
  Search, Trash2, Clock, X, BarChart3,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Card, Button, Badge, EmptyState } from "../components/UI";
import { EmptyHistoryIllustration } from "../components/illustrations";
import {
  getSessions, deleteSession, clearSessions, formatBytes,
} from "../services/duplicateService";
import { useToast } from "../context/ToastContext";
import type { ScanSession } from "../types";
import { format } from "date-fns";

export function History() {
  const { toast } = useToast();
  const [items,    setItems]    = useState<ScanSession[]>([]);
  const [query,    setQuery]    = useState("");

  const reload = () => setItems(getSessions());
  useEffect(reload, []);

  const filtered = query.trim()
    ? items.filter((s) => `${s.label} ${s.compareMode}`.toLowerCase().includes(query.toLowerCase()))
    : items;

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="History"
        subtitle={`${items.length} session${items.length !== 1 ? "s" : ""}`}
        actions={items.length > 0 && (
          <Button variant="danger" size="sm"
            onClick={() => { clearSessions(); reload(); toast("History cleared", "info"); }}
            icon={<Trash2 size={13} />}>Clear</Button>
        )} />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {items.length > 0 && (
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <input type="text" placeholder="Search by label or compare mode…" value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none"
              style={{ background: "#161b27", border: "1px solid #2d3748", color: "#f1f5f9" }} />
            {query && (
              <button onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }}>
                <X size={14} />
              </button>
            )}
          </div>
        )}
        {query && <p className="text-xs" style={{ color: "#64748b" }}>{filtered.length} match{filtered.length !== 1 ? "es" : ""}</p>}

        {filtered.length === 0 ? (
          <EmptyState illustration={<EmptyHistoryIllustration />}
            title={query ? "No matching sessions" : "No saved sessions"}
            description={query ? "Try a different search term." : "Run a scan from the Scanner page and save your plan to keep a record here."} />
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => (
              <Card key={s.id} style={{ padding: 0 }}>
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                    <BarChart3 size={16} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>{s.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                      {s.totalFiles} files · {s.groupCount} groups · {s.duplicateCount} redundant · plan: {formatBytes(s.recoveredSpace)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="red">{s.compareMode.toUpperCase()}</Badge>
                    <Clock size={13} style={{ color: "#475569" }} />
                    <span className="text-xs" style={{ color: "#475569" }}>{format(new Date(s.startedAt), "MMM d, HH:mm")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-5 py-3"
                  style={{ borderTop: "1px solid #2d3748", background: "rgba(30,37,53,0.4)" }}>
                  <span className="text-xs" style={{ color: "#94a3b8" }}>
                    Total {formatBytes(s.totalSize)} · wasted {formatBytes(s.wastedSpace)}
                  </span>
                  <div className="flex-1" />
                  <Button variant="danger" size="sm"
                    onClick={() => { deleteSession(s.id); reload(); toast("Session deleted", "info"); }}
                    icon={<Trash2 size={11} />}>Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
