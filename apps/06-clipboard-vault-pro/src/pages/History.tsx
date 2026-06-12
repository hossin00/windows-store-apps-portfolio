import { useEffect, useState } from "react";
import {
  Download, FileText, FileCode, Clock, Pin, Star, Copy, Trash2,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Card, Button, Badge, EmptyState } from "../components/UI";
import { EmptySearchIllustration } from "../components/illustrations";
import {
  getSnippets, deleteSnippet, recordCopy,
  exportAsJson, exportAsTxt, downloadString,
} from "../services/clipboardService";
import { useToast } from "../context/ToastContext";
import type { Snippet } from "../types";
import { format } from "date-fns";

export function History() {
  const { toast } = useToast();
  const [items, setItems] = useState<Snippet[]>([]);

  const reload = () => setItems(getSnippets().slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  useEffect(reload, []);

  const onCopy = async (s: Snippet) => {
    try { await navigator.clipboard.writeText(s.content); recordCopy(s.id); reload(); toast("Copied", "success"); }
    catch { toast("Could not copy", "error"); }
  };

  const exportTxt = () => {
    const c = exportAsTxt();
    downloadString(c, `clipboard-vault-${Date.now()}.txt`, "text/plain;charset=utf-8");
    toast("Exported as TXT", "success");
  };
  const exportJson = () => {
    const c = exportAsJson();
    downloadString(c, `clipboard-vault-${Date.now()}.json`, "application/json;charset=utf-8");
    toast("Exported as JSON", "success");
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="History"
        subtitle={`${items.length} snippet${items.length !== 1 ? "s" : ""} — chronological`}
        actions={items.length > 0 && (
          <>
            <Button variant="secondary" size="sm" onClick={exportTxt}  icon={<FileText size={13} />}>Export TXT</Button>
            <Button variant="secondary" size="sm" onClick={exportJson} icon={<FileCode size={13} />}>Export JSON</Button>
          </>
        )} />

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {items.length === 0 ? (
          <EmptyState illustration={<EmptySearchIllustration />}
            title="Nothing in history yet"
            description="Snippets you save show up here in newest-first order — handy for export." />
        ) : items.map((s) => (
          <Card key={s.id} style={{ padding: 0 }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <Clock size={13} style={{ color: "#475569" }} />
              <span className="text-xs font-mono" style={{ color: "#64748b" }}>
                {format(new Date(s.createdAt), "MMM d, HH:mm")}
              </span>
              {s.pinned   && <Pin  size={12} style={{ color: "#a78bfa" }} />}
              {s.favorite && <Star size={12} style={{ color: "#fbbf24" }} fill="#fbbf24" />}
              <Badge variant="purple">{s.type.toUpperCase()}</Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>
                  {s.title || s.content.slice(0, 60)}
                </p>
                {!s.title && (
                  <p className="text-xs mt-0.5 truncate font-mono" style={{ color: "#64748b" }}>
                    {s.content.slice(0, 100)}{s.content.length > 100 ? "…" : ""}
                  </p>
                )}
              </div>
              <Button variant="primary" size="sm" onClick={() => onCopy(s)} icon={<Copy size={11} />}>Copy</Button>
              <Button variant="danger"  size="sm" onClick={() => { deleteSnippet(s.id); reload(); toast("Deleted", "info"); }} icon={<Trash2 size={11} />} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
