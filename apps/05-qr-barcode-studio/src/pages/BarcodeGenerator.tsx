import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  Download, Save, FileImage, FileCode, Barcode as BarcodeIcon, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Section, TextField, SelectField, ColorField, ToggleRow, ACCENT } from "../components/UI";
import { useToast } from "../context/ToastContext";
import {
  validateBarcode, renderBarcodeToSvg, renderBarcodeToPngDataUrl, renderBarcodeToSvgString, sampleFor,
} from "../services/barcodeService";
import { downloadDataUrl, downloadSvg, safeName } from "../services/downloadService";
import { addHistoryEntry, getHistoryEntry } from "../services/localStorageService";
import type { BarcodeFormat, BarcodeOptions, HistoryEntry } from "../types";

export function BarcodeGenerator() {
  const { id }   = useParams<{ id?: string }>();
  const nav      = useNavigate();
  const { toast } = useToast();

  const [format,  setFormat]  = useState<BarcodeFormat>(() => {
    if (id) {
      const h = getHistoryEntry(id);
      if (h && h.barcodeFormat) return h.barcodeFormat;
    }
    return "CODE128";
  });
  const [value,   setValue]   = useState<string>(() => {
    if (id) {
      const h = getHistoryEntry(id);
      if (h && h.barcodeValue) return h.barcodeValue;
    }
    return sampleFor("CODE128");
  });
  const [options, setOptions] = useState<BarcodeOptions>(() => {
    if (id) {
      const h = getHistoryEntry(id);
      if (h && h.barcodeOptions) return h.barcodeOptions;
    }
    return { width: 2, height: 100, fg: "#000000", bg: "#ffffff", displayValue: true };
  });

  const svgRef = useRef<SVGSVGElement | null>(null);
  const validation = useMemo(() => validateBarcode(format, value), [format, value]);

  useEffect(() => {
    if (!svgRef.current) return;
    if (!validation.ok) {
      // Clear the preview while value is invalid
      while (svgRef.current.firstChild) svgRef.current.removeChild(svgRef.current.firstChild);
      return;
    }
    renderBarcodeToSvg(svgRef.current, format, value, options);
  }, [format, value, options, validation.ok]);

  const switchFormat = (f: BarcodeFormat) => {
    setFormat(f);
    // Pre-fill the value with a valid sample for the new format if the current value is invalid for it.
    const next = validateBarcode(f, value);
    if (!next.ok) setValue(sampleFor(f));
  };

  // ── Exports ────────────────────────────────────────────────────────────────
  const exportPng = () => {
    const dataUrl = renderBarcodeToPngDataUrl(format, value, options);
    if (!dataUrl) { toast("Cannot render — fix validation first", "error"); return; }
    downloadDataUrl(dataUrl, safeName(`barcode-${format.toLowerCase()}`, "png"));
    toast("PNG downloaded", "success");
  };
  const exportSvg = () => {
    const svg = renderBarcodeToSvgString(format, value, options);
    if (!svg) { toast("Cannot render — fix validation first", "error"); return; }
    downloadSvg(svg, safeName(`barcode-${format.toLowerCase()}`, "svg"));
    toast("SVG downloaded", "success");
  };
  const saveToHistory = () => {
    const thumb = renderBarcodeToPngDataUrl(format, value, { ...options, height: 60, width: 1.5 });
    if (!thumb) { toast("Cannot save — value is invalid", "error"); return; }
    const entry: HistoryEntry = {
      id:        uuidv4(),
      kind:      "barcode",
      title:     value.slice(0, 60),
      content:   value,
      barcodeFormat:  format,
      barcodeValue:   value,
      barcodeOptions: options,
      thumbnailDataUrl: thumb,
      createdAt: new Date().toISOString(),
    };
    addHistoryEntry(entry);
    toast("Saved to history", "success");
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Barcode Generator" subtitle="Code 128, EAN-13, EAN-8, UPC-A, Code 39 — live preview"
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => nav("/barcode")} icon={<BarcodeIcon size={13} />}>New</Button>
            <Button variant="secondary" size="sm" onClick={saveToHistory} disabled={!validation.ok} icon={<Save size={13} />}>Save</Button>
            <Button variant="secondary" size="sm" onClick={exportSvg}    disabled={!validation.ok} icon={<FileCode size={13} />}>Export SVG</Button>
            <Button variant="primary"   size="sm" onClick={exportPng}    disabled={!validation.ok} icon={<FileImage size={13} />}>Export PNG</Button>
          </>
        } />

      <div className="flex-1 overflow-hidden grid" style={{ gridTemplateColumns: "minmax(420px,1fr) minmax(380px,1fr)" }}>
        <div className="overflow-y-auto p-6 space-y-5" style={{ borderRight: "1px solid #2d3748" }}>
          <Section title="Format">
            <SelectField value={format} onChange={(v) => switchFormat(v as BarcodeFormat)}
              options={[
                { value: "CODE128", label: "Code 128 — any ASCII (default)" },
                { value: "EAN13",   label: "EAN-13 — retail (12 or 13 digits)" },
                { value: "EAN8",    label: "EAN-8 — short retail (7 or 8 digits)" },
                { value: "UPC",     label: "UPC-A — US retail (11 or 12 digits)" },
                { value: "CODE39",  label: "Code 39 — uppercase + - . space $ / + %" },
              ]} />
            <p className="text-xs" style={{ color: "#64748b" }}>
              Sample for this format: <span style={{ color: "#cbd5e1", fontFamily: "JetBrains Mono, monospace" }}>{sampleFor(format)}</span>
            </p>
          </Section>

          <Section title="Value">
            <TextField value={value} onChange={setValue} mono
              placeholder={sampleFor(format)} />
            {validation.ok ? (
              <div className="flex items-center gap-2 text-xs" style={{ color: "#22c55e" }}>
                <CheckCircle2 size={13} />
                <span>Valid for {format}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs" style={{ color: "#ef4444" }}>
                <AlertTriangle size={13} />
                <span>{validation.reason}</span>
              </div>
            )}
          </Section>

          <Section title="Appearance">
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Bar color" value={options.fg} onChange={(v) => setOptions((o) => ({ ...o, fg: v }))} />
              <ColorField label="Background" value={options.bg} onChange={(v) => setOptions((o) => ({ ...o, bg: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Bar width" type="number" min={1} max={6} step={0.5}
                value={String(options.width)}
                onChange={(v) => setOptions((o) => ({ ...o, width: Math.max(1, Math.min(6, parseFloat(v) || 1)) }))}
                suffix="px" />
              <TextField label="Height" type="number" min={20} max={300} step={5}
                value={String(options.height)}
                onChange={(v) => setOptions((o) => ({ ...o, height: Math.max(20, Math.min(300, parseInt(v) || 20)) }))}
                suffix="px" />
            </div>
            <ToggleRow label="Show value below the bars"
              description="Display the encoded value as text directly under the barcode."
              checked={options.displayValue}
              onChange={(v) => setOptions((o) => ({ ...o, displayValue: v }))} />
          </Section>
        </div>

        <div className="overflow-y-auto p-6 flex flex-col items-center">
          <p className="text-xs uppercase tracking-wide mb-3 self-start" style={{ color: "#64748b" }}>Live preview</p>
          {!validation.ok ? (
            <div className="rounded-xl p-12 text-center" style={{ background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.25)" }}>
              <AlertTriangle size={28} style={{ color: "#ef4444", margin: "0 auto 8px" }} />
              <p className="text-sm" style={{ color: "#fca5a5" }}>{validation.reason}</p>
            </div>
          ) : (
            <div className="rounded-xl p-6 shadow-xl"
              style={{ background: options.bg, border: "1px solid #2d3748" }}>
              <svg ref={svgRef} />
            </div>
          )}
          <p className="text-xs mt-3 text-center" style={{ color: "#475569" }}>
            Format: <span style={{ color: ACCENT }}>{format}</span> · {options.height}px tall · bar width {options.width}px
          </p>
        </div>
      </div>
    </div>
  );
}
