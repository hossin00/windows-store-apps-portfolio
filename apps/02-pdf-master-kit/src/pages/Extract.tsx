import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FileSearch, X, Download, FileText, CheckSquare, Square } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, EmptyState, Badge } from "../components/UI";
import { FileDropZone } from "../components/FileDropZone";
import { useToast } from "../context/ToastContext";
import { getPageCount, extractPages, downloadBytes, suggestName, parsePageList } from "../services/pdfService";
import { addHistoryEntry, incrementStat } from "../services/localStorageService";
import type { PdfFileInfo } from "../types";

type Mode = "select" | "type";

export function Extract() {
  const { toast } = useToast();
  const [info,     setInfo]     = useState<PdfFileInfo | null>(null);
  const [mode,     setMode]     = useState<Mode>("select");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [typed,    setTyped]    = useState("1, 3-5");
  const [busy,     setBusy]     = useState(false);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    try {
      const pageCount = await getPageCount(f);
      setInfo({ id: uuidv4(), name: f.name, size: f.size, pageCount, file: f });
      setSelected(new Set());
      toast(`Loaded ${f.name} · ${pageCount} pages`, "success");
    } catch {
      toast("Could not read PDF", "error");
    }
  };

  const toggle = (page: number) => setSelected((s) => {
    const c = new Set(s);
    if (c.has(page)) c.delete(page); else c.add(page);
    return c;
  });
  const selectAll = () => {
    if (!info) return;
    setSelected(new Set(Array.from({ length: info.pageCount }, (_, i) => i + 1)));
  };
  const selectNone = () => setSelected(new Set());

  const run = async () => {
    if (!info) return;
    setBusy(true);
    try {
      const pages = mode === "select"
        ? Array.from(selected).sort((a, b) => a - b)
        : parsePageList(typed, info.pageCount);
      if (pages.length === 0) throw new Error("No pages selected.");

      const bytes = await extractPages(info.file, pages);
      const name  = suggestName(info.name, `extracted-${pages.length}p`);
      downloadBytes(bytes, name);
      addHistoryEntry({
        id: uuidv4(), kind: "extract",
        inputName: info.name, outputName: name,
        inputSize: info.size, outputSize: bytes.byteLength,
        inputPages: info.pageCount, outputPages: pages.length,
        createdAt: new Date().toISOString(),
        notes: `Pages: ${pages.join(", ")}`,
      });
      incrementStat("pagesProcessed", pages.length);
      incrementStat("filesProcessed", 1);
      toast(`Extracted ${pages.length} page${pages.length !== 1 ? "s" : ""}`, "success");
    } catch (e: any) {
      toast(`Extract failed: ${e.message ?? "unknown error"}`, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Extract Pages" subtitle="Pull selected pages into a new PDF"
        actions={info && (
          <>
            <Button variant="secondary" size="sm" onClick={() => setInfo(null)} icon={<X size={13} />}>Clear</Button>
            <Button variant="primary" size="sm" onClick={run} loading={busy} icon={<Download size={13} />}>Extract</Button>
          </>
        )}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-3xl">
        {!info ? (
          <>
            <FileDropZone onFilesAccepted={onFiles} maxSizeMB={100} />
            <EmptyState icon={FileSearch} title="Choose a PDF to extract from"
              description="Pick pages individually, or type a page list like 1, 3-5, 8 to build a new PDF." />
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
              <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Selection mode</p>
              <div className="flex gap-2 mb-5">
                {([["select","Click to pick"],["type","Type page list"]] as [Mode, string][]).map(([m, l]) => (
                  <button key={m} onClick={() => setMode(m)}
                    className="flex-1 px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer"
                    style={{
                      background:  mode === m ? "rgba(59,130,246,.12)" : "#1e2535",
                      borderColor: mode === m ? "#3b82f6" : "#2d3748",
                      color:       mode === m ? "#60a5fa" : "#94a3b8",
                    }}>{l}</button>
                ))}
              </div>

              {mode === "select" ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {selected.size} of {info.pageCount} pages selected
                    </p>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={selectAll} icon={<CheckSquare size={12} />}
                        style={{ color: "#3b82f6", padding: "0 8px" }}>Select all</Button>
                      <Button variant="ghost" size="sm" onClick={selectNone} icon={<Square size={12} />}
                        style={{ color: "#94a3b8", padding: "0 8px" }}>None</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {Array.from({ length: info.pageCount }, (_, i) => i + 1).map((p) => {
                      const on = selected.has(p);
                      return (
                        <button key={p} onClick={() => toggle(p)}
                          className="py-2 rounded-md border text-xs font-medium cursor-pointer transition-colors"
                          style={{
                            background:  on ? "rgba(59,130,246,.12)" : "#1e2535",
                            borderColor: on ? "#3b82f6" : "#2d3748",
                            color:       on ? "#60a5fa" : "#94a3b8",
                          }}>
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: "#94a3b8" }}>
                    Pages to extract
                  </label>
                  <input value={typed} onChange={(e) => setTyped(e.target.value)}
                    placeholder="e.g. 1, 3-5, 8"
                    className="w-full rounded-md px-3 py-2 text-sm outline-none"
                    style={{ background: "#1e2535", border: "1px solid #2d3748", color: "#f1f5f9" }} />
                  <p className="text-xs mt-1" style={{ color: "#475569" }}>
                    {parsePageList(typed, info.pageCount).length} page(s) match this list.
                  </p>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
