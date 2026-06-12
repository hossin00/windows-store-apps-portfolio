import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Combine, X, ArrowUp, ArrowDown, Trash2, Download, FileText, Plus } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, EmptyState, Badge } from "../components/UI";
import { FileDropZone } from "../components/FileDropZone";
import { useToast } from "../context/ToastContext";
import { getPageCount, mergePdfs, downloadBytes, suggestName } from "../services/pdfService";
import { addHistoryEntry, incrementStat } from "../services/localStorageService";
import type { PdfFileInfo } from "../types";

export function Merge() {
  const { toast } = useToast();
  const [items,   setItems]   = useState<PdfFileInfo[]>([]);
  const [busy,    setBusy]    = useState(false);

  const totalSize  = items.reduce((s, i) => s + i.size, 0);
  const totalPages = items.reduce((s, i) => s + i.pageCount, 0);

  const onFiles = async (files: File[]) => {
    const next: PdfFileInfo[] = [];
    for (const f of files) {
      try {
        const pageCount = await getPageCount(f);
        next.push({ id: uuidv4(), name: f.name, size: f.size, pageCount, file: f });
      } catch {
        toast(`Could not read ${f.name}`, "error");
      }
    }
    if (next.length > 0) {
      setItems((p) => [...p, ...next]);
      toast(`Added ${next.length} file${next.length !== 1 ? "s" : ""}`, "success");
    }
  };

  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const move   = (id: string, dir: -1 | 1) => setItems((p) => {
    const idx = p.findIndex((i) => i.id === id);
    if (idx < 0) return p;
    const ni = idx + dir;
    if (ni < 0 || ni >= p.length) return p;
    const copy = p.slice();
    [copy[idx], copy[ni]] = [copy[ni], copy[idx]];
    return copy;
  });
  const clear = () => setItems([]);

  const run = async () => {
    if (items.length < 2) { toast("Add at least two PDFs to merge", "warning"); return; }
    setBusy(true);
    try {
      const bytes = await mergePdfs(items.map((i) => i.file));
      const name  = suggestName(items[0].name, "merged");
      downloadBytes(bytes, name);
      addHistoryEntry({
        id: uuidv4(), kind: "merge",
        inputName:  items.map((i) => i.name).join(" + "),
        outputName: name,
        inputSize:  totalSize,
        outputSize: bytes.byteLength,
        inputPages: totalPages,
        outputPages: totalPages,
        createdAt:  new Date().toISOString(),
        notes: `Merged ${items.length} files`,
      });
      incrementStat("pagesProcessed", totalPages);
      incrementStat("filesProcessed", items.length);
      toast("Merged PDF downloaded", "success");
    } catch (e: any) {
      toast(`Merge failed: ${e.message ?? "unknown error"}`, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar
        title="Merge PDFs"
        subtitle="Combine multiple PDFs into a single file"
        actions={items.length > 0 && (
          <>
            <Button variant="secondary" size="sm" onClick={clear} icon={<Trash2 size={13} />}>Clear</Button>
            <Button variant="primary" size="sm" onClick={run} loading={busy} icon={<Download size={13} />}>
              Merge {items.length} files
            </Button>
          </>
        )}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-3xl">
        <FileDropZone onFilesAccepted={onFiles} multiple maxSizeMB={100} hint="reorder before merging" />

        {items.length === 0 ? (
          <EmptyState icon={Combine} title="No PDFs added yet"
            description="Drop two or more PDF files above. You can reorder them before merging."
          />
        ) : (
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "#2d3748" }}>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Files in order</p>
                <Badge variant="blue">{items.length}</Badge>
              </div>
              <p className="text-xs" style={{ color: "#64748b" }}>
                {totalPages} page{totalPages !== 1 ? "s" : ""} · {(totalSize / 1024).toFixed(1)} KB
              </p>
            </div>
            {items.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3"
                style={{ borderBottom: idx < items.length - 1 ? "1px solid #2d3748" : undefined }}>
                <span className="text-xs font-mono w-6 flex-shrink-0" style={{ color: "#475569" }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(124,58,237,.1)", color: "#7c3aed" }}>
                  <FileText size={16} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>{item.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                    {item.pageCount} page{item.pageCount !== 1 ? "s" : ""} · {(item.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <IconBtn onClick={() => move(item.id, -1)} disabled={idx === 0} icon={<ArrowUp size={13} />} />
                  <IconBtn onClick={() => move(item.id,  1)} disabled={idx === items.length - 1} icon={<ArrowDown size={13} />} />
                  <IconBtn onClick={() => remove(item.id)} icon={<X size={13} />} danger />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 px-5 py-3" style={{ background: "rgba(30,37,53,.4)" }}>
              <Button variant="ghost" size="sm" onClick={() => document.getElementById("merge-pick")?.click()}
                icon={<Plus size={13} />} style={{ color: "#8b5cf6", paddingLeft: 0 }}>
                Add more files
              </Button>
              <input id="merge-pick" type="file" accept="application/pdf" multiple style={{ display: "none" }}
                onChange={(e) => e.target.files && onFiles(Array.from(e.target.files))} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function IconBtn({ onClick, disabled, icon, danger }: { onClick: () => void; disabled?: boolean; icon: React.ReactNode; danger?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex items-center justify-center rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      style={{ width: 28, height: 28, color: danger ? "#ef4444" : "#94a3b8", border: "1px solid #2d3748", background: "transparent", cursor: disabled ? "not-allowed" : "pointer" }}>
      {icon}
    </button>
  );
}
