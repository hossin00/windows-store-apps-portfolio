import { useState, useEffect } from "react";
import { Search, Copy, Download, Trash2, Clock, FileText, X, ChevronDown, ChevronUp, type LucideIcon } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, Badge, EmptyState } from "../components/UI";
import { getHistory, deleteHistoryEntry, clearHistory, searchHistory } from "../services/localStorageService";
import { exportText, exportHistoryAsJSON } from "../services/exportService";
import { useToast } from "../context/ToastContext";
import type { HistoryEntry } from "../types";
import { format } from "date-fns";

export function History() {
  const { toast }   = useToast();
  const [entries,    setEntries]   = useState<HistoryEntry[]>([]);
  const [query,      setQuery]     = useState("");
  const [expandedId, setExpandedId]= useState<string | null>(null);

  const load = () => setEntries(getHistory());
  useEffect(load, []);

  const filtered = query.trim() ? searchHistory(query) : entries;

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="History"
        subtitle={`${entries.length} saved result${entries.length !== 1 ? "s" : ""}`}
        actions={entries.length > 0 && (
          <>
            <Button variant="secondary" size="sm"
              onClick={() => { exportHistoryAsJSON(entries); toast("History exported as JSON", "success"); }}
              icon={<Download size={13} />}>Export all</Button>
            <Button variant="danger" size="sm"
              onClick={() => { clearHistory(); load(); toast("History cleared", "info"); }}
              icon={<Trash2 size={13} />}>Clear</Button>
          </>
        )}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {entries.length > 0 && (
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <input type="text" placeholder="Search by filename or extracted text…" value={query}
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
          <EmptyState icon={Clock} title={query ? "No results found" : "No history yet"}
            description={query ? "Try a different search term." : "OCR results you save from the Workspace will appear here."} />
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => (
              <HistoryCard key={e.id} entry={e}
                expanded={expandedId === e.id}
                onToggle={() => setExpandedId(expandedId === e.id ? null : e.id)}
                onCopy={(t) => { navigator.clipboard.writeText(t); toast("Copied", "success"); }}
                onExport={(en) => { exportText(en.extractedText, en.fileName, "txt", en.id); toast("Exported as TXT", "success"); }}
                onDelete={(id) => { deleteHistoryEntry(id); load(); toast("Entry deleted", "info"); }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryCard({ entry, expanded, onToggle, onCopy, onExport, onDelete }: {
  entry: HistoryEntry; expanded: boolean;
  onToggle: () => void; onCopy: (t: string) => void;
  onExport: (e: HistoryEntry) => void; onDelete: (id: string) => void;
}) {
  const preview = entry.extractedText.slice(0, 140).replace(/\n+/g, " ");
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div className="flex items-center gap-4 px-5 py-3.5 cursor-pointer" onClick={onToggle}>
        <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(99,102,241,.1)", color: "#6366f1" }}>
          <FileText size={16} strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>{entry.fileName}</p>
          {!expanded && (
            <p className="text-xs mt-0.5 truncate" style={{ color: "#64748b" }}>
              {preview}{entry.extractedText.length > 140 ? "…" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Badge variant={entry.fileType === "pdf" ? "purple" : "blue"}>{entry.fileType.toUpperCase()}</Badge>
          <span className="text-xs" style={{ color: "#475569" }}>{entry.wordCount}w</span>
          <span className="text-xs" style={{ color: "#475569" }}>{format(new Date(entry.createdAt), "MMM d, HH:mm")}</span>
          {expanded ? <ChevronUp size={15} style={{ color: "#475569" }} /> : <ChevronDown size={15} style={{ color: "#475569" }} />}
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: "1px solid #2d3748" }}>
          <pre className="px-5 py-4 text-xs overflow-auto max-h-48"
            style={{ color: "#e2e8f0", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {entry.extractedText}
          </pre>
          <div className="flex items-center gap-2 px-5 py-3" style={{ borderTop: "1px solid #2d3748" }}>
            <Button variant="primary" size="sm" onClick={() => onCopy(entry.extractedText)} icon={<Copy size={12} />}>Copy</Button>
            <Button variant="secondary" size="sm" onClick={() => onExport(entry)} icon={<Download size={12} />}>Export TXT</Button>
            <div className="flex-1" />
            <Button variant="danger" size="sm" onClick={() => onDelete(entry.id)} icon={<Trash2 size={12} />}>Delete</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
