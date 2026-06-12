import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Minimize2, X, Download, FileText, Info } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, EmptyState, Badge } from "../components/UI";
import { FileDropZone } from "../components/FileDropZone";
import { useToast } from "../context/ToastContext";
import { getPageCount, compressPdf, downloadBytes, suggestName } from "../services/pdfService";
import { addHistoryEntry, incrementStat } from "../services/localStorageService";
import type { PdfFileInfo } from "../types";

export function Compress() {
  const { toast } = useToast();
  const [info,  setInfo]  = useState<PdfFileInfo | null>(null);
  const [busy,  setBusy]  = useState(false);
  const [result, setResult] = useState<{ outSize: number; delta: number; name: string } | null>(null);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    try {
      const pageCount = await getPageCount(f);
      setInfo({ id: uuidv4(), name: f.name, size: f.size, pageCount, file: f });
      setResult(null);
      toast(`Loaded ${f.name}`, "success");
    } catch {
      toast("Could not read PDF", "error");
    }
  };

  const run = async () => {
    if (!info) return;
    setBusy(true);
    try {
      const bytes = await compressPdf(info.file);
      const name  = suggestName(info.name, "compressed");
      downloadBytes(bytes, name);
      const delta = info.size - bytes.byteLength;
      setResult({ outSize: bytes.byteLength, delta, name });
      addHistoryEntry({
        id: uuidv4(), kind: "compress",
        inputName: info.name, outputName: name,
        inputSize: info.size, outputSize: bytes.byteLength,
        inputPages: info.pageCount, outputPages: info.pageCount,
        createdAt: new Date().toISOString(),
        notes: delta > 0 ? `Saved ${(delta / 1024).toFixed(1)} KB` : "No size change",
      });
      incrementStat("pagesProcessed", info.pageCount);
      incrementStat("filesProcessed", 1);
      toast("Compressed PDF downloaded", "success");
    } catch (e: any) {
      toast(`Compress failed: ${e.message ?? "unknown error"}`, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Compress PDF" subtitle="Re-save a PDF with object streams"
        actions={info && (
          <>
            <Button variant="secondary" size="sm" onClick={() => { setInfo(null); setResult(null); }} icon={<X size={13} />}>Clear</Button>
            <Button variant="primary" size="sm" onClick={run} loading={busy} icon={<Download size={13} />}>Compress</Button>
          </>
        )}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-3xl">
        {!info ? (
          <>
            <FileDropZone onFilesAccepted={onFiles} maxSizeMB={100} />
            <EmptyState icon={Minimize2} title="Choose a PDF to compress"
              description="The file will be re-saved using object streams, which removes unused objects and can produce a smaller file." />
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

            {result && (
              <Card>
                <p className="text-sm font-semibold mb-3" style={{ color: "#f1f5f9" }}>Result</p>
                <div className="grid grid-cols-3 gap-4">
                  <Stat label="Original" value={`${(info.size / 1024).toFixed(1)} KB`} />
                  <Stat label="Compressed" value={`${(result.outSize / 1024).toFixed(1)} KB`} accent />
                  <Stat label={result.delta >= 0 ? "Saved" : "Larger by"}
                    value={`${(Math.abs(result.delta) / 1024).toFixed(1)} KB`} />
                </div>
                <p className="text-xs mt-3" style={{ color: "#64748b" }}>
                  Output file: <span style={{ color: "#94a3b8" }}>{result.name}</span>
                </p>
              </Card>
            )}

            <Card style={{ background: "rgba(245,158,11,.04)", borderColor: "rgba(245,158,11,.2)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Info size={14} style={{ color: "#f59e0b" }} />
                <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>About compression</p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                This tool re-saves the PDF with object stream compression. It can shrink files that have unused
                objects or verbose structure, but it does not re-encode embedded images. PDFs that are already
                tightly packed may not get smaller.
              </p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg p-3" style={{ background: "rgba(30,37,53,.5)", border: "1px solid #2d3748" }}>
      <p className="text-xs mb-1" style={{ color: "#64748b" }}>{label}</p>
      <p className="text-sm font-bold" style={{ color: accent ? "#8b5cf6" : "#f1f5f9" }}>{value}</p>
    </div>
  );
}
