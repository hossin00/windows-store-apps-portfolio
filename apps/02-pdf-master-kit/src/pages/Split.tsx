import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Scissors, X, Download, FileText, Layers } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, EmptyState, Badge } from "../components/UI";
import { FileDropZone } from "../components/FileDropZone";
import { useToast } from "../context/ToastContext";
import {
  getPageCount, splitByPages, splitByRanges, splitByInterval,
  downloadBytes, parsePageList,
} from "../services/pdfService";
import { addHistoryEntry, incrementStat } from "../services/localStorageService";
import type { PdfFileInfo, SplitMode } from "../types";

export function Split() {
  const { toast } = useToast();
  const [info,     setInfo]     = useState<PdfFileInfo | null>(null);
  const [mode,     setMode]     = useState<SplitMode>("pages");
  const [pages,    setPages]    = useState("1, 2, 4");
  const [ranges,   setRanges]   = useState("1-3, 4-6");
  const [interval, setInterval] = useState(2);
  const [busy,     setBusy]     = useState(false);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    try {
      const pageCount = await getPageCount(f);
      setInfo({ id: uuidv4(), name: f.name, size: f.size, pageCount, file: f });
      toast(`Loaded ${f.name} · ${pageCount} pages`, "success");
    } catch {
      toast("Could not read PDF", "error");
    }
  };

  const run = async () => {
    if (!info) return;
    setBusy(true);
    try {
      let outputs: { name: string; bytes: Uint8Array; pageCount: number }[] = [];
      if (mode === "pages") {
        const pageNums = parsePageList(pages, info.pageCount);
        if (pageNums.length === 0) throw new Error("No valid pages entered.");
        outputs = await splitByPages(info.file, pageNums);
      } else if (mode === "ranges") {
        if (!ranges.trim()) throw new Error("Enter at least one range.");
        outputs = await splitByRanges(info.file, ranges);
      } else {
        if (interval < 1) throw new Error("Interval must be 1 or greater.");
        outputs = await splitByInterval(info.file, interval);
      }
      if (outputs.length === 0) throw new Error("Nothing to split with these settings.");

      let totalOutPages = 0;
      for (const o of outputs) {
        downloadBytes(o.bytes, o.name);
        totalOutPages += o.pageCount;
      }
      addHistoryEntry({
        id: uuidv4(), kind: "split",
        inputName: info.name,
        outputName: `${outputs.length} file${outputs.length !== 1 ? "s" : ""} (${mode})`,
        inputSize: info.size,
        outputSize: outputs.reduce((s, o) => s + o.bytes.byteLength, 0),
        inputPages: info.pageCount,
        outputPages: totalOutPages,
        createdAt: new Date().toISOString(),
        notes: `Mode: ${mode}`,
      });
      incrementStat("pagesProcessed", totalOutPages);
      incrementStat("filesProcessed", 1);
      toast(`Split into ${outputs.length} file${outputs.length !== 1 ? "s" : ""}`, "success");
    } catch (e: any) {
      toast(`Split failed: ${e.message ?? "unknown error"}`, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Split PDF" subtitle="Break a PDF into separate files"
        actions={info && (
          <>
            <Button variant="secondary" size="sm" onClick={() => setInfo(null)} icon={<X size={13} />}>Clear</Button>
            <Button variant="primary" size="sm" onClick={run} loading={busy} icon={<Download size={13} />}>Run split</Button>
          </>
        )}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-3xl">
        {!info ? (
          <>
            <FileDropZone onFilesAccepted={onFiles} maxSizeMB={100} />
            <EmptyState icon={Scissors} title="Choose a PDF to split"
              description="Pick split by individual pages, by custom ranges, or every N pages." />
          </>
        ) : (
          <>
            <Card>
              <div className="flex items-center gap-4">
                <div className="rounded-lg p-2.5 flex-shrink-0" style={{ background: "rgba(99,102,241,.1)", color: "#6366f1" }}>
                  <FileText size={18} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>{info.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                    {info.pageCount} pages · {(info.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Badge variant="purple">PDF</Badge>
              </div>
            </Card>

            <Card>
              <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Split mode</p>
              <div className="flex gap-2 mb-4">
                {([
                  ["pages",   "By pages",   "Pick individual page numbers"],
                  ["ranges",  "By ranges",  "Group pages into ranges"],
                  ["interval","By interval","Every N pages becomes one file"],
                ] as [SplitMode, string, string][]).map(([m, l]) => (
                  <button key={m} onClick={() => setMode(m)}
                    className="flex-1 px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer"
                    style={{
                      background:  mode === m ? "rgba(59,130,246,.12)" : "#1e2535",
                      borderColor: mode === m ? "#3b82f6" : "#2d3748",
                      color:       mode === m ? "#60a5fa" : "#94a3b8",
                    }}>{l}</button>
                ))}
              </div>

              {mode === "pages" && (
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: "#94a3b8" }}>
                    Page numbers (comma separated, ranges with -)
                  </label>
                  <input value={pages} onChange={(e) => setPages(e.target.value)}
                    placeholder="e.g. 1, 3, 5-7"
                    className="w-full rounded-md px-3 py-2 text-sm outline-none"
                    style={{ background: "#1e2535", border: "1px solid #2d3748", color: "#f1f5f9" }} />
                  <p className="text-xs mt-1" style={{ color: "#475569" }}>
                    Each selected page becomes its own PDF (1–{info.pageCount}).
                  </p>
                </div>
              )}

              {mode === "ranges" && (
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: "#94a3b8" }}>
                    Page ranges (comma separated)
                  </label>
                  <input value={ranges} onChange={(e) => setRanges(e.target.value)}
                    placeholder="e.g. 1-3, 4-6, 7-10"
                    className="w-full rounded-md px-3 py-2 text-sm outline-none"
                    style={{ background: "#1e2535", border: "1px solid #2d3748", color: "#f1f5f9" }} />
                  <p className="text-xs mt-1" style={{ color: "#475569" }}>
                    Each range produces a separate PDF (pages 1–{info.pageCount}).
                  </p>
                </div>
              )}

              {mode === "interval" && (
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: "#94a3b8" }}>Pages per output file</label>
                  <input type="number" min={1} max={info.pageCount} value={interval}
                    onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-md px-3 py-2 text-sm outline-none"
                    style={{ background: "#1e2535", border: "1px solid #2d3748", color: "#f1f5f9", maxWidth: 160 }} />
                  <p className="text-xs mt-1" style={{ color: "#475569" }}>
                    {Math.ceil(info.pageCount / interval)} file{Math.ceil(info.pageCount / interval) !== 1 ? "s" : ""} will be produced.
                  </p>
                </div>
              )}
            </Card>

            <Card style={{ background: "rgba(59,130,246,.04)", borderColor: "rgba(59,130,246,.18)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Layers size={14} style={{ color: "#3b82f6" }} />
                <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Output</p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                Each result is downloaded automatically as a separate PDF file. Filenames include the split type
                and a timestamp.
              </p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
