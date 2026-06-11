import { useState, useCallback } from "react";
import { Copy, Download, Save, Trash2, FileText, CheckCircle2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Topbar } from "../components/Topbar";
import { FileDropZone } from "../components/FileDropZone";
import { Button, Card, Badge, ErrorState, StatusBadge } from "../components/UI";
import { extractTextFromImage, extractTextFromPdf } from "../services/ocrService";
import { addHistoryEntry } from "../services/localStorageService";
import { exportText } from "../services/exportService";
import { useToast } from "../context/ToastContext";
import type { OCRJob } from "../types";

const fmt = (b: number) => b < 1048576 ? `${(b/1024).toFixed(0)} KB` : `${(b/1048576).toFixed(1)} MB`;

export function Workspace() {
  const { toast } = useToast();
  const [job,           setJob]           = useState<OCRJob | null>(null);
  const [previewUrl,    setPreviewUrl]    = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [progress,      setProgress]      = useState(0);
  const [error,         setError]         = useState<string | null>(null);
  const [copied,        setCopied]        = useState(false);
  const [saved,         setSaved]         = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const isImg  = file.type.startsWith("image/");
    const jobId  = uuidv4();

    setPreviewUrl(URL.createObjectURL(file));
    setExtractedText(""); setError(null); setProgress(0); setSaved(false);

    const newJob: OCRJob = {
      id: jobId, fileName: file.name,
      fileType: isImg ? "image" : "pdf",
      fileSize: file.size, status: "processing",
      createdAt: new Date().toISOString(),
    };
    setJob(newJob);

    try {
      const fn  = isImg ? extractTextFromImage : extractTextFromPdf;
      const res = await fn(file, setProgress);
      setExtractedText(res.text);
      setJob((p) => p ? { ...p, status: "completed", extractedText: res.text, completedAt: new Date().toISOString() } : p);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "OCR failed. Try a clearer image.";
      setError(msg);
      setJob((p) => p ? { ...p, status: "failed", errorMessage: msg } : p);
      toast(msg, "error");
    }
  }, [toast]);

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true); toast("Copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (f: "txt" | "md") => {
    if (!job || !extractedText) return;
    exportText(extractedText, job.fileName, f, job.id);
    toast(`Exported as .${f}`, "success");
  };

  const handleSave = () => {
    if (!job || !extractedText) return;
    const words = extractedText.trim().split(/\s+/).filter(Boolean);
    addHistoryEntry({ id: uuidv4(), jobId: job.id, fileName: job.fileName, fileType: job.fileType,
      extractedText, wordCount: words.length, charCount: extractedText.length, createdAt: new Date().toISOString() });
    setSaved(true); toast("Saved to history", "success");
  };

  const handleClear = () => { setJob(null); setExtractedText(""); setPreviewUrl(null); setError(null); setProgress(0); setSaved(false); };

  const isProcessing = job?.status === "processing";
  const isDone       = job?.status === "completed";
  const hasFailed    = job?.status === "failed";

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="OCR Workspace" subtitle="Import a file to extract text"
        actions={job && <Button variant="ghost" size="sm" onClick={handleClear} icon={<Trash2 size={14} />}>Clear</Button>}
      />
      <div className="flex-1 overflow-hidden flex">
        {/* Left panel */}
        <div className="flex flex-col border-r overflow-y-auto"
          style={{ width: 360, flexShrink: 0, borderColor: "#2d3748", padding: 24 }}>
          {!job ? (
            <FileDropZone onFilesAccepted={handleFiles} multiple={false} />
          ) : (
            <div className="flex flex-col gap-4">
              <Card style={{ padding: "12px 16px" }}>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(99,102,241,.1)", color: "#6366f1" }}>
                    <FileText size={18} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate mb-1" style={{ color: "#f1f5f9" }}>{job.fileName}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={job.fileType === "pdf" ? "purple" : "blue"}>{job.fileType.toUpperCase()}</Badge>
                      <span className="text-xs" style={{ color: "#64748b" }}>{fmt(job.fileSize)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card style={{ padding: "10px 16px" }}>
                <div className="flex items-center justify-between">
                  <StatusBadge status={job.status} />
                  {isProcessing && <span className="text-xs font-medium" style={{ color: "#a78bfa" }}>{Math.round(progress)}%</span>}
                </div>
                {isProcessing && (
                  <div className="mt-2 rounded-full overflow-hidden" style={{ height: 4, background: "#1e2535" }}>
                    <div className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%`, background: "linear-gradient(90deg,#6366f1,#3b82f6)" }} />
                  </div>
                )}
              </Card>

              {previewUrl && job.fileType === "image" && (
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: "#64748b" }}>Preview</p>
                  <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#2d3748" }}>
                    <img src={previewUrl} alt="Preview" className="w-full object-contain max-h-56" style={{ background: "#1e2535" }} />
                  </div>
                </div>
              )}

              {job.fileType === "pdf" && (
                <Card style={{ background: "rgba(99,102,241,.06)", borderColor: "rgba(99,102,241,.2)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={14} style={{ color: "#6366f1" }} />
                    <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>PDF Document</span>
                  </div>
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    PDF page rendering is processed in the background. Text extraction runs on the full document.
                  </p>
                </Card>
              )}
              <Button variant="secondary" size="sm" onClick={handleClear} icon={<Trash2 size={13} />}>Import different file</Button>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isDone && extractedText && (
            <div className="flex items-center gap-2 px-5 py-3 border-b flex-shrink-0"
              style={{ borderColor: "#2d3748", background: "#161b27" }}>
              <Button variant="primary" size="sm" onClick={handleCopy}
                icon={copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}>
                {copied ? "Copied!" : "Copy text"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleExport("txt")} icon={<Download size={13} />}>Export TXT</Button>
              <Button variant="secondary" size="sm" onClick={() => handleExport("md")} icon={<Download size={13} />}>Export MD</Button>
              <Button variant={saved ? "ghost" : "secondary"} size="sm" onClick={handleSave} disabled={saved}
                icon={saved ? <CheckCircle2 size={13} style={{ color: "#22c55e" }} /> : <Save size={13} />}>
                {saved ? "Saved" : "Save to history"}
              </Button>
              <div className="flex-1" />
              <span className="text-xs" style={{ color: "#475569" }}>
                {extractedText.trim().split(/\s+/).filter(Boolean).length} words · {extractedText.length} chars
              </span>
            </div>
          )}

          <div className="flex-1 overflow-hidden p-5">
            {!job && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <div className="rounded-2xl p-5" style={{ background: "rgba(59,130,246,.06)", color: "#3b82f6" }}>
                  <FileText size={32} strokeWidth={1.4} />
                </div>
                <div>
                  <p className="font-semibold mb-1" style={{ color: "#f1f5f9" }}>No file imported</p>
                  <p className="text-sm" style={{ color: "#64748b" }}>Drop a file on the left panel to begin text extraction.</p>
                </div>
              </div>
            )}
            {isProcessing && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="rounded-2xl p-5" style={{ background: "rgba(99,102,241,.08)", color: "#a78bfa" }}>
                  <OCRAnimation />
                </div>
                <div className="text-center">
                  <p className="font-semibold mb-1" style={{ color: "#f1f5f9" }}>Extracting text…</p>
                  <p className="text-sm" style={{ color: "#64748b" }}>OCR processing — {Math.round(progress)}% complete</p>
                </div>
              </div>
            )}
            {hasFailed && error && <ErrorState message={error} onRetry={handleClear} />}
            {isDone && extractedText && (
              <textarea
                className="w-full h-full resize-none rounded-xl p-4 text-sm outline-none"
                style={{ background: "#161b27", border: "1px solid #2d3748", color: "#e2e8f0",
                  fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                spellCheck={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OCRAnimation() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="2" y="2" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="21" y="2" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" opacity="0.5"/>
      <rect x="2" y="21" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" opacity="0.5"/>
      <rect x="21" y="21" width="13" height="13" rx="2" stroke="#6366f1" strokeWidth="1.8"/>
      <line x1="0" y1="18" x2="36" y2="18" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 2">
        <animate attributeName="y1" values="6;30;6" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="y2" values="6;30;6" dur="1.5s" repeatCount="indefinite"/>
      </line>
    </svg>
  );
}
