import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ArrowUpDown, X, Download, FileText, GripVertical, ArrowUp, ArrowDown, RotateCw } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, EmptyState, Badge } from "../components/UI";
import { FileDropZone } from "../components/FileDropZone";
import { useToast } from "../context/ToastContext";
import { getPageCount, reorderPages, downloadBytes, suggestName } from "../services/pdfService";
import { addHistoryEntry, incrementStat } from "../services/localStorageService";
import type { PdfFileInfo, PageEntry } from "../types";

export function Reorder() {
  const { toast } = useToast();
  const [info,    setInfo]    = useState<PdfFileInfo | null>(null);
  const [pages,   setPages]   = useState<PageEntry[]>([]);
  const [dragId,  setDragId]  = useState<string | null>(null);
  const [overId,  setOverId]  = useState<string | null>(null);
  const [busy,    setBusy]    = useState(false);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    try {
      const pageCount = await getPageCount(f);
      setInfo({ id: uuidv4(), name: f.name, size: f.size, pageCount, file: f });
      setPages(Array.from({ length: pageCount }, (_, i) => ({
        id: uuidv4(), origIndex: i, rotation: 0,
      })));
      toast(`Loaded ${f.name} · ${pageCount} pages`, "success");
    } catch {
      toast("Could not read PDF", "error");
    }
  };

  const move = (id: string, dir: -1 | 1) => setPages((p) => {
    const idx = p.findIndex((i) => i.id === id);
    if (idx < 0) return p;
    const ni = idx + dir;
    if (ni < 0 || ni >= p.length) return p;
    const copy = p.slice();
    [copy[idx], copy[ni]] = [copy[ni], copy[idx]];
    return copy;
  });
  const rotate = (id: string) => setPages((p) =>
    p.map((pg) => pg.id === id ? { ...pg, rotation: (pg.rotation + 90) % 360 } : pg)
  );

  const reset = () => {
    if (!info) return;
    setPages(Array.from({ length: info.pageCount }, (_, i) => ({
      id: uuidv4(), origIndex: i, rotation: 0,
    })));
    toast("Reset to original order", "info");
  };

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver  = (id: string, e: React.DragEvent) => { e.preventDefault(); setOverId(id); };
  const handleDrop      = (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return; }
    setPages((p) => {
      const from = p.findIndex((i) => i.id === dragId);
      const to   = p.findIndex((i) => i.id === targetId);
      if (from < 0 || to < 0) return p;
      const copy = p.slice();
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
    setDragId(null); setOverId(null);
  };

  const run = async () => {
    if (!info) return;
    const sameOrder = pages.every((p, i) => p.origIndex === i && p.rotation === 0);
    if (sameOrder) { toast("No changes to apply", "warning"); return; }
    setBusy(true);
    try {
      const bytes = await reorderPages(info.file, pages.map((p) => ({ origIndex: p.origIndex, rotation: p.rotation })));
      const name  = suggestName(info.name, "reordered");
      downloadBytes(bytes, name);
      addHistoryEntry({
        id: uuidv4(), kind: "reorder",
        inputName: info.name, outputName: name,
        inputSize: info.size, outputSize: bytes.byteLength,
        inputPages: info.pageCount, outputPages: pages.length,
        createdAt: new Date().toISOString(),
        notes: `Reordered ${pages.length} pages`,
      });
      incrementStat("pagesProcessed", pages.length);
      incrementStat("filesProcessed", 1);
      toast("Reordered PDF downloaded", "success");
    } catch (e: any) {
      toast(`Reorder failed: ${e.message ?? "unknown error"}`, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Reorder PDF" subtitle="Drag pages to reorder, rotate per page"
        actions={info && (
          <>
            <Button variant="secondary" size="sm" onClick={reset}>Reset order</Button>
            <Button variant="secondary" size="sm" onClick={() => setInfo(null)} icon={<X size={13} />}>Clear</Button>
            <Button variant="primary" size="sm" onClick={run} loading={busy} icon={<Download size={13} />}>Apply order</Button>
          </>
        )}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-3xl">
        {!info ? (
          <>
            <FileDropZone onFilesAccepted={onFiles} maxSizeMB={100} />
            <EmptyState icon={ArrowUpDown} title="Choose a PDF to reorder"
              description="Drag pages to a new position. Click the rotate icon on a page to turn it 90° at a time." />
          </>
        ) : (
          <>
            <Card>
              <div className="flex items-center gap-4">
                <div className="rounded-lg p-2.5 flex-shrink-0" style={{ background: "rgba(124,58,237,.1)", color: "#7c3aed" }}>
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

            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "#2d3748" }}>
                <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Page order</p>
                <p className="text-xs" style={{ color: "#64748b" }}>Drag handles, arrows, or rotate</p>
              </div>
              <div className="p-3 grid grid-cols-1 gap-2">
                {pages.map((pg, idx) => {
                  const over = overId === pg.id && dragId !== pg.id;
                  return (
                    <div key={pg.id}
                      draggable
                      onDragStart={() => handleDragStart(pg.id)}
                      onDragOver={(e) => handleDragOver(pg.id, e)}
                      onDrop={() => handleDrop(pg.id)}
                      onDragEnd={() => { setDragId(null); setOverId(null); }}
                      className="flex items-center gap-3 px-3 py-2 rounded-md"
                      style={{
                        background:  over ? "rgba(139,92,246,.12)" : (dragId === pg.id ? "rgba(124,58,237,.08)" : "#1e2535"),
                        border: `1px solid ${over ? "#8b5cf6" : "#2d3748"}`,
                        cursor: "grab",
                      }}>
                      <GripVertical size={14} style={{ color: "#475569", flexShrink: 0 }} />
                      <span className="text-xs font-mono w-10 flex-shrink-0" style={{ color: "#475569" }}>
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: "#f1f5f9" }}>
                          Original page {pg.origIndex + 1}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                          Rotation: {pg.rotation}°
                        </p>
                      </div>
                      <button onClick={() => rotate(pg.id)}
                        className="flex items-center justify-center rounded-md cursor-pointer"
                        title="Rotate 90°"
                        style={{ width: 28, height: 28, background: "transparent", border: "1px solid #2d3748", color: "#8b5cf6" }}>
                        <RotateCw size={13} style={{ transform: `rotate(${pg.rotation}deg)`, transition: "transform .2s" }} />
                      </button>
                      <button onClick={() => move(pg.id, -1)} disabled={idx === 0}
                        className="flex items-center justify-center rounded-md cursor-pointer disabled:opacity-30"
                        style={{ width: 28, height: 28, background: "transparent", border: "1px solid #2d3748", color: "#94a3b8" }}>
                        <ArrowUp size={13} />
                      </button>
                      <button onClick={() => move(pg.id, 1)} disabled={idx === pages.length - 1}
                        className="flex items-center justify-center rounded-md cursor-pointer disabled:opacity-30"
                        style={{ width: 28, height: 28, background: "transparent", border: "1px solid #2d3748", color: "#94a3b8" }}>
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
