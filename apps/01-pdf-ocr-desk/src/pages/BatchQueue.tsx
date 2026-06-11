import { useState, useCallback } from "react";
import { Trash2, Play, Download, X, FileText, type LucideIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Topbar } from "../components/Topbar";
import { FileDropZone } from "../components/FileDropZone";
import { Button, Card, Badge, StatusBadge, EmptyState } from "../components/UI";
import { extractTextFromImage, extractTextFromPdf } from "../services/ocrService";
import { addHistoryEntry, incrementStat } from "../services/localStorageService";
import { exportBatchResultsAsText } from "../services/exportService";
import { useToast } from "../context/ToastContext";
import type { BatchQueueItem } from "../types";

const fmt = (b: number) => b < 1048576 ? `${(b/1024).toFixed(0)} KB` : `${(b/1048576).toFixed(1)} MB`;

export function BatchQueue() {
  const { toast } = useToast();
  const [items,   setItems]   = useState<BatchQueueItem[]>([]);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Record<string, string>>({});

  const handleFiles = useCallback((files: File[]) => {
    const newItems: BatchQueueItem[] = files.map((f) => ({
      id: uuidv4(), fileName: f.name,
      fileType: f.type.startsWith("image/") ? "image" as const : "pdf" as const,
      fileSize: f.size, status: "waiting" as const, progress: 0, file: f,
    }));
    setItems((p) => [...p, ...newItems]);
  }, []);

  const update = (id: string, patch: Partial<BatchQueueItem>) =>
    setItems((p) => p.map((i) => i.id === id ? { ...i, ...patch } : i));

  const runBatch = async () => {
    const waiting = items.filter((i) => i.status === "waiting");
    if (!waiting.length) return;
    setRunning(true); incrementStat("batchJobsRun");

    for (const item of waiting) {
      update(item.id, { status: "processing", progress: 0 });
      try {
        const fn  = item.fileType === "image" ? extractTextFromImage : extractTextFromPdf;
        const res = await fn(item.file!, (p) => update(item.id, { progress: p }));
        setResults((r) => ({ ...r, [item.id]: res.text }));
        update(item.id, { status: "completed", progress: 100 });
        const words = res.text.trim().split(/\s+/).filter(Boolean);
        addHistoryEntry({ id: uuidv4(), jobId: item.id, fileName: item.fileName, fileType: item.fileType,
          extractedText: res.text, wordCount: words.length, charCount: res.text.length, createdAt: new Date().toISOString() });
      } catch (err: unknown) {
        const msg = (err as { message?: string })?.message ?? "Processing failed";
        update(item.id, { status: "failed", errorMessage: msg, progress: 0 });
      }
    }
    setRunning(false); toast(`Batch complete — ${waiting.length} file(s) processed`, "success");
  };

  const exportAll = () => {
    const done = items.filter((i) => i.status === "completed" && results[i.id])
      .map((i) => ({ fileName: i.fileName, text: results[i.id] }));
    if (!done.length) return;
    exportBatchResultsAsText(done); toast(`Exported ${done.length} result(s)`, "success");
  };

  const waiting   = items.filter((i) => i.status === "waiting").length;
  const completed = items.filter((i) => i.status === "completed").length;
  const failed    = items.filter((i) => i.status === "failed").length;

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Batch Queue" subtitle="Process multiple files at once" />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <FileDropZone onFilesAccepted={handleFiles} multiple />

        {items.length > 0 && (
          <>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium" style={{ color: "#f1f5f9" }}>
                {items.length} file{items.length !== 1 ? "s" : ""} in queue
              </span>
              <div className="flex items-center gap-2">
                {waiting   > 0 && <Badge variant="default">{waiting} waiting</Badge>}
                {completed > 0 && <Badge variant="green">{completed} done</Badge>}
                {failed    > 0 && <Badge variant="red">{failed} failed</Badge>}
              </div>
              <div className="flex-1" />
              <Button variant="ghost" size="sm" onClick={() => { setItems([]); setResults({}); }}
                icon={<Trash2 size={13} />} disabled={running} style={{ color: "#64748b" }}>Clear all</Button>
              {completed > 0 && (
                <Button variant="secondary" size="sm" onClick={exportAll} icon={<Download size={13} />}>Export completed</Button>
              )}
              <Button variant="primary" size="sm" onClick={runBatch} loading={running}
                disabled={waiting === 0 || running} icon={<Play size={13} />}>Run batch</Button>
            </div>

            <Card style={{ padding: 0, overflow: "hidden" }}>
              {items.map((item, i) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4"
                  style={{ borderBottom: i < items.length - 1 ? "1px solid #2d3748" : undefined,
                    background: item.status === "processing" ? "rgba(99,102,241,.04)" : undefined }}>
                  <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(99,102,241,.1)", color: "#6366f1" }}>
                    <FileText size={16} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>{item.fileName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: "#64748b" }}>{fmt(item.fileSize)}</span>
                      <Badge variant={item.fileType === "pdf" ? "purple" : "blue"}>{item.fileType.toUpperCase()}</Badge>
                    </div>
                    {item.status === "processing" && (
                      <div className="mt-2 rounded-full overflow-hidden" style={{ height: 3, background: "#1e2535" }}>
                        <div className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%`, background: "linear-gradient(90deg,#6366f1,#3b82f6)" }} />
                      </div>
                    )}
                    {item.status === "failed" && item.errorMessage && (
                      <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{item.errorMessage}</p>
                    )}
                    {item.status === "completed" && results[item.id] && (
                      <p className="text-xs mt-1 truncate" style={{ color: "#64748b" }}>
                        {results[item.id].trim().split(/\s+/).filter(Boolean).length} words extracted
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={item.status} />
                    {item.status !== "processing" && (
                      <button onClick={() => setItems((p) => p.filter((x) => x.id !== item.id))}
                        className="rounded p-1 transition-colors cursor-pointer" style={{ color: "#475569" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ef4444")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#475569")}>
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          </>
        )}

        {items.length === 0 && (
          <EmptyState icon={FileText} title="Queue is empty"
            description="Drop multiple files above to add them to the queue, then click Run batch." />
        )}
      </div>
    </div>
  );
}
