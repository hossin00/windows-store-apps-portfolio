import { useMemo, useState } from "react";
import { Layers, Download, Play, Trash2 } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, EmptyState, TextField, ColorField, ACCENT } from "../components/UI";
import { useToast } from "../context/ToastContext";
import { useApp } from "../context/AppContext";
import { renderQrDataUrl } from "../services/qrService";
import { downloadDataUrl, safeName } from "../services/downloadService";
import { incrementStat } from "../services/localStorageService";
import type { QrInput } from "../types";

interface BatchRow {
  index:    number;
  text:     string;
  preview?: string;       // dataUrl for thumbnail
  status:   "queued" | "ready" | "downloaded" | "error";
  message?: string;
}

export function Batch() {
  const { toast }  = useToast();
  const { settings } = useApp();
  const [raw,      setRaw]      = useState("https://example.com\nhttps://github.com\nHello from QR Barcode Studio");
  const [fg,       setFg]       = useState(settings.defaultFg);
  const [bg,       setBg]       = useState(settings.defaultBg);
  const [size,     setSize]     = useState(settings.defaultQrSize);
  const [rows,     setRows]     = useState<BatchRow[]>([]);
  const [busy,     setBusy]     = useState(false);

  const lines = useMemo(() => raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean), [raw]);

  const generate = async () => {
    if (lines.length === 0) { toast("Add at least one line", "warning"); return; }
    setBusy(true);
    const next: BatchRow[] = lines.map((text, i) => ({ index: i, text, status: "queued" }));
    setRows(next);

    for (let i = 0; i < next.length; i++) {
      const row = next[i];
      const input: QrInput = { kind: "url", url: row.text };
      try {
        const dataUrl = await renderQrDataUrl(input, { size, fg, bg, errorLevel: "M" }, Math.min(256, size));
        next[i] = { ...row, preview: dataUrl, status: "ready" };
      } catch (e: any) {
        next[i] = { ...row, status: "error", message: e.message ?? "render failed" };
      }
      setRows([...next]);
    }
    incrementStat("batchRuns");
    setBusy(false);
    toast(`Generated ${next.filter((r) => r.status === "ready").length} of ${next.length}`, "success");
  };

  const downloadAll = async () => {
    let count = 0;
    for (const row of rows) {
      if (row.status === "ready" || row.status === "downloaded") {
        const input: QrInput = { kind: "url", url: row.text };
        try {
          const fullPng = await renderQrDataUrl(input, { size, fg, bg, errorLevel: "M" });
          // Use the line text as the filename hint
          downloadDataUrl(fullPng, safeName(`qr-${String(row.index + 1).padStart(3, "0")}`, "png"));
          row.status = "downloaded";
          count += 1;
          // Tiny delay between triggers so the browser doesn't suppress later ones
          await new Promise((r) => setTimeout(r, 80));
        } catch {
          row.status = "error";
          row.message = "download failed";
        }
      }
    }
    setRows([...rows]);
    toast(`Downloaded ${count} file${count !== 1 ? "s" : ""}`, "success");
  };

  const clear = () => { setRows([]); };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Batch Generator" subtitle="Paste a list of URLs or text — one per line"
        actions={
          <>
            {rows.length > 0 && (
              <Button variant="secondary" size="sm" onClick={clear} icon={<Trash2 size={13} />}>Clear</Button>
            )}
            <Button variant="secondary" size="sm" onClick={generate} loading={busy} icon={<Play size={13} />}>Generate</Button>
            <Button variant="primary"   size="sm" onClick={downloadAll}
              disabled={rows.filter((r) => r.status === "ready").length === 0}
              icon={<Download size={13} />}>Download all</Button>
          </>
        } />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <Card>
          <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Input</p>
          <TextField multiline rows={6} value={raw} onChange={setRaw}
            placeholder="One URL or text per line. Lines are encoded as QR codes." />
          <div className="grid grid-cols-3 gap-3 mt-4">
            <ColorField label="Foreground" value={fg} onChange={setFg} />
            <ColorField label="Background" value={bg} onChange={setBg} />
            <TextField label="Size (px)" type="number" min={128} max={1024} step={32}
              value={String(size)}
              onChange={(v) => setSize(Math.max(128, Math.min(1024, parseInt(v) || 128)))}
              suffix="px" />
          </div>
          <p className="text-xs mt-3" style={{ color: "#64748b" }}>
            {lines.length} line{lines.length !== 1 ? "s" : ""} will be turned into QR codes. Each becomes a separate PNG file.
          </p>
        </Card>

        {rows.length === 0 ? (
          <EmptyState icon={Layers} title="Nothing generated yet"
            description="Click Generate to build a QR per line. Each one becomes its own PNG download." />
        ) : (
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div className="px-5 py-3 border-b text-sm font-semibold" style={{ borderColor: "#2d3748", color: "#f1f5f9" }}>
              {rows.length} result{rows.length !== 1 ? "s" : ""}
            </div>
            <div className="grid grid-cols-3 gap-3 p-4">
              {rows.map((row) => (
                <div key={row.index}
                  className="rounded-lg p-3 flex flex-col items-center gap-2"
                  style={{ background: "rgba(30,37,53,.5)", border: "1px solid #2d3748" }}>
                  <span className="text-xs self-start" style={{ color: "#475569" }}>
                    #{String(row.index + 1).padStart(3, "0")}
                  </span>
                  {row.preview ? (
                    <img src={row.preview} alt={row.text}
                      style={{ width: 96, height: 96, background: "#fff", borderRadius: 4 }} />
                  ) : (
                    <div style={{ width: 96, height: 96, background: "#1e2535", border: "1px dashed #2d3748", borderRadius: 4 }} />
                  )}
                  <p className="text-xs truncate w-full text-center"
                    title={row.text} style={{ color: "#cbd5e1" }}>{row.text}</p>
                  <p className="text-xs" style={{ color: row.status === "error" ? "#ef4444" : row.status === "downloaded" ? "#22c55e" : ACCENT }}>
                    {row.status === "queued"     ? "queued" :
                     row.status === "ready"      ? "ready"  :
                     row.status === "downloaded" ? "downloaded" :
                     row.message || "error"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
