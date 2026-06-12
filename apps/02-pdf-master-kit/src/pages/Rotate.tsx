import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { RotateCw, X, Download, FileText, RefreshCw } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, EmptyState, Badge } from "../components/UI";
import { FileDropZone } from "../components/FileDropZone";
import { useToast } from "../context/ToastContext";
import { getPageCount, rotateAll, rotatePerPage, downloadBytes, suggestName } from "../services/pdfService";
import { addHistoryEntry, incrementStat } from "../services/localStorageService";
import type { PdfFileInfo } from "../types";

type Mode = "all" | "per-page";
const ANGLES = [90, 180, 270] as const;

export function Rotate() {
  const { toast } = useToast();
  const [info,  setInfo]  = useState<PdfFileInfo | null>(null);
  const [mode,  setMode]  = useState<Mode>("all");
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [perPage, setPerPage] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);

  const onFiles = async (files: File[]) => {
    const f = files[0];
    try {
      const pageCount = await getPageCount(f);
      setInfo({ id: uuidv4(), name: f.name, size: f.size, pageCount, file: f });
      setPerPage(new Array(pageCount).fill(0));
      toast(`Loaded ${f.name} · ${pageCount} pages`, "success");
    } catch {
      toast("Could not read PDF", "error");
    }
  };

  const cyclePage = (i: number) => setPerPage((p) => {
    const c = p.slice();
    const order = [0, 90, 180, 270];
    c[i] = order[(order.indexOf(c[i]) + 1) % order.length];
    return c;
  });

  const run = async () => {
    if (!info) return;
    setBusy(true);
    try {
      let bytes: Uint8Array;
      let note: string;
      if (mode === "all") {
        bytes = await rotateAll(info.file, angle);
        note = `All pages +${angle}°`;
      } else {
        if (perPage.every((r) => r === 0)) throw new Error("No pages set to rotate.");
        bytes = await rotatePerPage(info.file, perPage);
        const count = perPage.filter((r) => r !== 0).length;
        note = `${count} page${count !== 1 ? "s" : ""} rotated`;
      }
      const name = suggestName(info.name, "rotated");
      downloadBytes(bytes, name);
      addHistoryEntry({
        id: uuidv4(), kind: "rotate",
        inputName: info.name, outputName: name,
        inputSize: info.size, outputSize: bytes.byteLength,
        inputPages: info.pageCount, outputPages: info.pageCount,
        createdAt: new Date().toISOString(), notes: note,
      });
      incrementStat("pagesProcessed", info.pageCount);
      incrementStat("filesProcessed", 1);
      toast("Rotated PDF downloaded", "success");
    } catch (e: any) {
      toast(`Rotate failed: ${e.message ?? "unknown error"}`, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Rotate PDF" subtitle="Turn all pages or selected pages"
        actions={info && (
          <>
            <Button variant="secondary" size="sm" onClick={() => setInfo(null)} icon={<X size={13} />}>Clear</Button>
            <Button variant="primary" size="sm" onClick={run} loading={busy} icon={<Download size={13} />}>Rotate</Button>
          </>
        )}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-3xl">
        {!info ? (
          <>
            <FileDropZone onFilesAccepted={onFiles} maxSizeMB={100} />
            <EmptyState icon={RotateCw} title="Choose a PDF to rotate"
              description="Rotate every page by the same angle, or set rotations per page." />
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

            <Card>
              <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Rotation mode</p>
              <div className="flex gap-2 mb-5">
                {([["all","All pages"],["per-page","Per page"]] as [Mode, string][]).map(([m, l]) => (
                  <button key={m} onClick={() => setMode(m)}
                    className="flex-1 px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer"
                    style={{
                      background:  mode === m ? "rgba(139,92,246,.12)" : "#1e2535",
                      borderColor: mode === m ? "#8b5cf6" : "#2d3748",
                      color:       mode === m ? "#a78bfa" : "#94a3b8",
                    }}>{l}</button>
                ))}
              </div>

              {mode === "all" ? (
                <div>
                  <label className="text-xs font-medium block mb-2" style={{ color: "#94a3b8" }}>Rotation angle</label>
                  <div className="flex gap-2">
                    {ANGLES.map((a) => (
                      <button key={a} onClick={() => setAngle(a)}
                        className="flex-1 px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer"
                        style={{
                          background:  angle === a ? "rgba(139,92,246,.12)" : "#1e2535",
                          borderColor: angle === a ? "#8b5cf6" : "#2d3748",
                          color:       angle === a ? "#a78bfa" : "#94a3b8",
                        }}>+{a}°</button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs mb-3" style={{ color: "#94a3b8" }}>Click each page to cycle 0 → 90 → 180 → 270.</p>
                  <div className="grid grid-cols-6 gap-2">
                    {perPage.map((rot, i) => (
                      <button key={i} onClick={() => cyclePage(i)}
                        className="flex flex-col items-center gap-1 py-3 rounded-lg border cursor-pointer transition-colors"
                        style={{
                          background:  rot !== 0 ? "rgba(139,92,246,.12)" : "#1e2535",
                          borderColor: rot !== 0 ? "#8b5cf6" : "#2d3748",
                          color:       rot !== 0 ? "#a78bfa" : "#94a3b8",
                        }}>
                        <RefreshCw size={14} style={{ transform: `rotate(${rot}deg)`, transition: "transform .2s" }} />
                        <span className="text-xs font-medium">P{i + 1}</span>
                        <span className="text-xs opacity-70">{rot}°</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
