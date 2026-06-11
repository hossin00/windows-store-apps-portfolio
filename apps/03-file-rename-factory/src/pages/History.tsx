import { useState, useEffect } from "react";
import { Search, Trash2, Clock, FilePenLine, X, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, Badge, EmptyState } from "../components/UI";
import { getHistory, deleteSession, clearHistory, searchHistory, updateSession } from "../services/localStorageService";
import { useToast } from "../context/ToastContext";
import type { RenameSession } from "../types";
import { format } from "date-fns";

export function History() {
  const { toast } = useToast();
  const [entries,    setEntries]    = useState<RenameSession[]>([]);
  const [query,      setQuery]      = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = () => setEntries(getHistory());
  useEffect(load, []);

  const filtered = query.trim() ? searchHistory(query) : entries;

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="History"
        subtitle={`${entries.length} session${entries.length !== 1 ? "s" : ""}`}
        actions={entries.length > 0 && (
          <Button variant="danger" size="sm"
            onClick={() => { clearHistory(); load(); toast("History cleared", "info"); }}
            icon={<Trash2 size={13} />}>Clear</Button>
        )}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {entries.length > 0 && (
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <input type="text" placeholder="Search by filename or rule…" value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none"
              style={{ background: "#161b27", border: "1px solid #2d3748", color: "#f1f5f9" }} />
            {query && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setQuery("")}
                style={{ color: "#475569" }}><X size={14} /></button>
            )}
          </div>
        )}
        {query && <p className="text-xs" style={{ color: "#64748b" }}>{filtered.length} result(s) for "{query}"</p>}

        {filtered.length === 0 ? (
          <EmptyState icon={Clock} title={query ? "No results found" : "No sessions yet"}
            description={query ? "Try a different search term." : "Rename sessions you apply will appear here."} />
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => (
              <SessionCard key={e.id} session={e}
                expanded={expandedId === e.id}
                onToggle={() => setExpandedId(expandedId === e.id ? null : e.id)}
                onUndo={(id) => { updateSession(id, { undone: true }); load(); toast("Session marked undone", "info"); }}
                onRedo={(id) => { updateSession(id, { undone: false }); load(); toast("Session marked re-applied", "info"); }}
                onDelete={(id) => { deleteSession(id); load(); toast("Session deleted", "info"); }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCard({ session, expanded, onToggle, onUndo, onRedo, onDelete }: {
  session: RenameSession; expanded: boolean;
  onToggle: () => void;
  onUndo:   (id: string) => void;
  onRedo:   (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const sample = session.samples[0];
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div className="flex items-center gap-4 px-5 py-3.5 cursor-pointer" onClick={onToggle}>
        <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(99,102,241,.1)", color: "#6366f1" }}>
          <FilePenLine size={16} strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: "#f1f5f9" }}>
            {session.fileCount} file{session.fileCount !== 1 ? "s" : ""} · {session.ruleCount} rule{session.ruleCount !== 1 ? "s" : ""}
          </p>
          {!expanded && sample && (
            <p className="text-xs mt-0.5 truncate" style={{ color: "#64748b" }}>
              {sample.from} → {sample.to}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {session.undone ? <Badge variant="amber">UNDONE</Badge> : <Badge variant="green">APPLIED</Badge>}
          <span className="text-xs" style={{ color: "#475569" }}>{format(new Date(session.createdAt), "MMM d, HH:mm")}</span>
          {expanded ? <ChevronUp size={15} style={{ color: "#475569" }} /> : <ChevronDown size={15} style={{ color: "#475569" }} />}
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: "1px solid #2d3748" }}>
          <div className="px-5 py-4 space-y-3">
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>Rules</p>
              <ul className="space-y-1">
                {session.rules.map((r, i) => (
                  <li key={i} className="text-xs flex items-start gap-2" style={{ color: "#cbd5e1" }}>
                    <span style={{ color: "#475569" }}>{String(i + 1).padStart(2, "0")}.</span>
                    {r.summary}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>Sample renames</p>
              <pre className="text-xs overflow-auto p-3 rounded-md"
                style={{ background: "rgba(30,37,53,.5)", color: "#cbd5e1", fontFamily: "JetBrains Mono, monospace", lineHeight: 1.7 }}>
                {session.samples.map((s) => `${s.from}  →  ${s.to}`).join("\n")}
              </pre>
            </div>
          </div>
          <div className="flex items-center gap-2 px-5 py-3" style={{ borderTop: "1px solid #2d3748" }}>
            {session.undone ? (
              <Button variant="secondary" size="sm" onClick={() => onRedo(session.id)} icon={<RotateCcw size={12} />}>
                Mark re-applied
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => onUndo(session.id)} icon={<RotateCcw size={12} />}>
                Mark undone
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="danger" size="sm" onClick={() => onDelete(session.id)} icon={<Trash2 size={12} />}>
              Delete
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
