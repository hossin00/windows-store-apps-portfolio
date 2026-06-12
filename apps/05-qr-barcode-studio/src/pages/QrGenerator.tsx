import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  Download, Save, FileImage, FileCode, QrCode, Link as LinkIcon, Type, Wifi, Contact, Mail,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Section, TextField, SelectField, ColorField, Segmented, ACCENT } from "../components/UI";
import { useToast } from "../context/ToastContext";
import { useApp } from "../context/AppContext";
import {
  encodeQr, renderQrToCanvas, renderQrDataUrl, renderQrSvgString, qrPayloadStats,
} from "../services/qrService";
import { downloadDataUrl, downloadSvg, safeName } from "../services/downloadService";
import { addHistoryEntry, getHistoryEntry } from "../services/localStorageService";
import type { QrInput, QrInputType, QrOptions, QrErrorLevel, HistoryEntry } from "../types";

function defaultInput(kind: QrInputType): QrInput {
  switch (kind) {
    case "url":   return { kind: "url",   url: "https://example.com" };
    case "text":  return { kind: "text",  text: "Hello QR" };
    case "wifi":  return { kind: "wifi",  ssid: "", password: "", security: "WPA", hidden: false };
    case "vcard": return { kind: "vcard", firstName: "", lastName: "", phone: "", email: "", organization: "" };
    case "email": return { kind: "email", to: "", subject: "", body: "" };
  }
}

const KIND_META: { value: QrInputType; label: string; icon: typeof LinkIcon }[] = [
  { value: "url",   label: "URL",   icon: LinkIcon },
  { value: "text",  label: "Text",  icon: Type     },
  { value: "wifi",  label: "Wi-Fi", icon: Wifi     },
  { value: "vcard", label: "vCard", icon: Contact  },
  { value: "email", label: "Email", icon: Mail     },
];

export function QrGenerator() {
  const { id }   = useParams<{ id?: string }>();
  const nav      = useNavigate();
  const { toast } = useToast();
  const { settings } = useApp();

  const [input,   setInput]   = useState<QrInput>(() => {
    if (id) {
      const h = getHistoryEntry(id);
      if (h && h.qrInput) return h.qrInput;
    }
    return defaultInput("url");
  });
  const [options, setOptions] = useState<QrOptions>(() => {
    if (id) {
      const h = getHistoryEntry(id);
      if (h && h.qrOptions) return h.qrOptions;
    }
    return {
      size: settings.defaultQrSize,
      fg:   settings.defaultFg,
      bg:   settings.defaultBg,
      errorLevel: "M",
    };
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Re-render whenever inputs or options change
  useEffect(() => {
    if (!canvasRef.current) return;
    renderQrToCanvas(canvasRef.current, input, options).catch(() => {
      // qrcode throws on truly impossible payloads — the validation banner surfaces this
    });
  }, [input, options]);

  const payloadStats = useMemo(() => qrPayloadStats(input), [input]);
  const encoded      = useMemo(() => encodeQr(input), [input]);

  const setKind = (kind: QrInputType) => setInput(defaultInput(kind));

  // ── Exports ─────────────────────────────────────────────────────────────────
  const exportPng = async () => {
    try {
      const dataUrl = await renderQrDataUrl(input, options);
      downloadDataUrl(dataUrl, safeName(`qr-${input.kind}`, "png"));
      toast("PNG downloaded", "success");
    } catch (e: any) {
      toast(`Export failed: ${e.message ?? "unknown"}`, "error");
    }
  };
  const exportSvg = async () => {
    try {
      const svg = await renderQrSvgString(input, options);
      downloadSvg(svg, safeName(`qr-${input.kind}`, "svg"));
      toast("SVG downloaded", "success");
    } catch (e: any) {
      toast(`Export failed: ${e.message ?? "unknown"}`, "error");
    }
  };
  const saveToHistory = async () => {
    try {
      const thumb = await renderQrDataUrl(input, options, 128);
      const entry: HistoryEntry = {
        id:        uuidv4(),
        kind:      "qr",
        title:     (encoded || "(empty)").slice(0, 60),
        content:   encoded,
        qrInput:   input,
        qrOptions: options,
        thumbnailDataUrl: thumb,
        createdAt: new Date().toISOString(),
      };
      addHistoryEntry(entry);
      toast("Saved to history", "success");
    } catch (e: any) {
      toast(`Save failed: ${e.message ?? "unknown"}`, "error");
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="QR Generator" subtitle="URL, text, Wi-Fi, vCard, email — live preview"
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => nav("/qr")} icon={<QrCode size={13} />}>New</Button>
            <Button variant="secondary" size="sm" onClick={saveToHistory} icon={<Save size={13} />}>Save</Button>
            <Button variant="secondary" size="sm" onClick={exportSvg} icon={<FileCode size={13} />}>Export SVG</Button>
            <Button variant="primary"   size="sm" onClick={exportPng} icon={<FileImage size={13} />}>Export PNG</Button>
          </>
        } />

      <div className="flex-1 overflow-hidden grid" style={{ gridTemplateColumns: "minmax(420px,1fr) minmax(380px,1fr)" }}>
        <div className="overflow-y-auto p-6 space-y-5" style={{ borderRight: "1px solid #2d3748" }}>

          <Section title="Type">
            <div className="grid grid-cols-5 gap-2">
              {KIND_META.map(({ value, label, icon: Icon }) => (
                <button key={value} onClick={() => setKind(value)}
                  className="flex flex-col items-center gap-1 py-3 rounded-lg border cursor-pointer transition-colors"
                  style={{
                    background:  input.kind === value ? "rgba(16,185,129,.12)" : "#1e2535",
                    borderColor: input.kind === value ? ACCENT : "#2d3748",
                    color:       input.kind === value ? "#34d399" : "#94a3b8",
                  }}>
                  <Icon size={16} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Content">
            <QrInputForm input={input} onChange={setInput} />
            <div className="text-xs flex items-center gap-3" style={{ color: payloadStats.warning ? "#f59e0b" : "#64748b" }}>
              <span>{payloadStats.bytes} byte{payloadStats.bytes !== 1 ? "s" : ""} encoded</span>
              {payloadStats.warning && <span>· {payloadStats.warning}</span>}
            </div>
          </Section>

          <Section title="Appearance">
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Foreground" value={options.fg} onChange={(v) => setOptions((o) => ({ ...o, fg: v }))} />
              <ColorField label="Background" value={options.bg} onChange={(v) => setOptions((o) => ({ ...o, bg: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Size (px)" type="number" min={128} max={1024} step={32}
                value={String(options.size)}
                onChange={(v) => setOptions((o) => ({ ...o, size: Math.max(128, Math.min(1024, parseInt(v) || 128)) }))}
                suffix="px" />
              <SelectField label="Error correction" value={options.errorLevel}
                onChange={(v) => setOptions((o) => ({ ...o, errorLevel: v as QrErrorLevel }))}
                options={[
                  { value: "L", label: "L — ~7% recovery" },
                  { value: "M", label: "M — ~15% recovery" },
                  { value: "Q", label: "Q — ~25% recovery" },
                  { value: "H", label: "H — ~30% recovery" },
                ]} />
            </div>
          </Section>

          <Section title="Encoded payload">
            <pre className="text-xs p-3 rounded-md max-h-32 overflow-auto whitespace-pre-wrap break-all"
              style={{ background: "rgba(30,37,53,.5)", color: "#cbd5e1", fontFamily: "JetBrains Mono, monospace", border: "1px solid #2d3748" }}>
              {encoded || "(empty)"}
            </pre>
          </Section>
        </div>

        <div className="overflow-y-auto p-6 flex flex-col items-center">
          <p className="text-xs uppercase tracking-wide mb-3 self-start" style={{ color: "#64748b" }}>Live preview</p>
          <div className="rounded-xl p-6 shadow-xl"
            style={{ background: options.bg, border: "1px solid #2d3748" }}>
            <canvas ref={canvasRef} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
          </div>
          <p className="text-xs mt-3 text-center" style={{ color: "#475569" }}>
            Rendered at {options.size}×{options.size} px · Error level {options.errorLevel}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Forms per input kind ────────────────────────────────────────────────────

function QrInputForm({ input, onChange }: { input: QrInput; onChange: (i: QrInput) => void }) {
  switch (input.kind) {
    case "url":
      return (
        <TextField label="URL" value={input.url}
          onChange={(v) => onChange({ ...input, url: v })}
          placeholder="https://example.com" />
      );
    case "text":
      return (
        <TextField label="Text" multiline rows={4} value={input.text}
          onChange={(v) => onChange({ ...input, text: v })}
          placeholder="Any plain text — note, message, code…" />
      );
    case "wifi":
      return (
        <>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="SSID" value={input.ssid}
              onChange={(v) => onChange({ ...input, ssid: v })} placeholder="MyNetwork" />
            <SelectField label="Security" value={input.security}
              onChange={(v) => onChange({ ...input, security: v as "WPA" | "WEP" | "nopass" })}
              options={[
                { value: "WPA",    label: "WPA / WPA2" },
                { value: "WEP",    label: "WEP" },
                { value: "nopass", label: "Open (no password)" },
              ]} />
          </div>
          <TextField label="Password" type="text" value={input.password}
            onChange={(v) => onChange({ ...input, password: v })}
            placeholder={input.security === "nopass" ? "(none)" : "Wi-Fi password"} />
          <Segmented<"true" | "false"> value={input.hidden ? "true" : "false"}
            onChange={(v) => onChange({ ...input, hidden: v === "true" })}
            options={[{ value: "false", label: "Broadcast SSID" }, { value: "true", label: "Hidden network" }]} />
        </>
      );
    case "vcard":
      return (
        <>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="First name" value={input.firstName}
              onChange={(v) => onChange({ ...input, firstName: v })} placeholder="Ada" />
            <TextField label="Last name"  value={input.lastName}
              onChange={(v) => onChange({ ...input, lastName: v })}  placeholder="Lovelace" />
          </div>
          <TextField label="Organisation" value={input.organization}
            onChange={(v) => onChange({ ...input, organization: v })} placeholder="Analytical Engine Co." />
          <TextField label="Phone" value={input.phone}
            onChange={(v) => onChange({ ...input, phone: v })} placeholder="+1 555 0123" />
          <TextField label="Email" value={input.email}
            onChange={(v) => onChange({ ...input, email: v })} placeholder="ada@example.com" />
        </>
      );
    case "email":
      return (
        <>
          <TextField label="To" value={input.to}
            onChange={(v) => onChange({ ...input, to: v })} placeholder="someone@example.com" />
          <TextField label="Subject" value={input.subject}
            onChange={(v) => onChange({ ...input, subject: v })} placeholder="Hello" />
          <TextField label="Body" multiline rows={3} value={input.body}
            onChange={(v) => onChange({ ...input, body: v })} placeholder="Optional message body" />
        </>
      );
  }
}
