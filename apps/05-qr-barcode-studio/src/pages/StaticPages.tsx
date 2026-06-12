import { Shield, Lock, Eye, EyeOff, Database, Trash2, CheckCircle2, Info, HelpCircle, ScanLine, Mail } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Card, ACCENT } from "../components/UI";

// ─── Privacy ─────────────────────────────────────────────────────────────────
export function Privacy() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Privacy" subtitle="How QR Barcode Studio handles your data" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        <Card style={{ background: "rgba(16,185,129,.06)", borderColor: "rgba(16,185,129,.2)" }}>
          <div className="flex items-center gap-3 mb-3">
            <Shield size={20} style={{ color: ACCENT }} />
            <p className="font-semibold" style={{ color: "#f1f5f9" }}>Privacy-First Design</p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            QR Barcode Studio generates every code locally in your browser. Payloads, options, and exported
            images stay on your device. No accounts. No telemetry. No ads.
          </p>
        </Card>

        {[
          { icon: Lock,    title: "Codes Generated on Your Device",
            body: "Every QR code and 1D barcode is built locally with the open-source qrcode and JsBarcode libraries. Payloads are never uploaded — they never leave your machine." },
          { icon: EyeOff,  title: "No Tracking by Default",
            body: "QR Barcode Studio does not use analytics, crash reporting, or behavioural tracking. No usage data is sent anywhere." },
          { icon: Database,title: "Local Storage Only",
            body: "Saved codes (with small thumbnail previews), settings, and aggregate counters are stored only in your browser's localStorage." },
          { icon: Eye,     title: "No Account Required",
            body: "You do not need to create an account, sign in, or provide any personal information to use any feature of this app." },
          { icon: Trash2,  title: "Delete Your Data Anytime",
            body: "Clear all locally stored data at any time from Settings → Local Data. Removing the app removes all data completely." },
        ].map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <div className="flex gap-4">
              <div className="rounded-lg p-2 flex-shrink-0 self-start" style={{ background: "rgba(16,185,129,.08)", color: ACCENT }}>
                <Icon size={18} strokeWidth={1.8} />
              </div>
              <div>
                <p className="font-medium mb-1.5" style={{ color: "#f1f5f9" }}>{title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{body}</p>
              </div>
            </div>
          </Card>
        ))}

        <Card>
          <p className="text-sm font-semibold mb-3" style={{ color: "#f1f5f9" }}>A note about Wi-Fi QR codes</p>
          <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
            When you generate a Wi-Fi QR code, your network SSID and password are encoded into the image
            you download. Anyone who can scan the image will be able to join the network — treat exported
            Wi-Fi QR images the same way you would treat the password itself.
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold mb-3" style={{ color: "#f1f5f9" }}>Future Updates</p>
          <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
            If any future version adds online features, this privacy policy will be updated before that
            version is released, and users will be informed clearly within the app.
          </p>
        </Card>

        <div className="text-xs pb-4" style={{ color: "#475569" }}>
          Last updated: 2024. QR Barcode Studio — KART L
        </div>
      </div>
    </div>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────
export function About() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="About" subtitle="QR Barcode Studio" />
      <div className="flex-1 overflow-y-auto p-6 max-w-xl space-y-5">
        <Card>
          <div className="flex items-center gap-4 mb-5">
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{ width: 56, height: 56, background: "linear-gradient(135deg,#10b981,#059669)", flexShrink: 0 }}>
              <ScanLine size={26} color="white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: "#f1f5f9" }}>QR Barcode Studio</p>
              <p className="text-sm" style={{ color: "#64748b" }}>Version 1.0.0</p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>by KART L</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            QR Barcode Studio is a Windows desktop utility that generates real QR codes and 1D barcodes
            with a live preview and PNG / SVG export. Everything runs in-browser; nothing is uploaded.
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Features</p>
          <ul className="space-y-2">
            {[
              "QR — URL, Plain Text, Wi-Fi, vCard, Email",
              "QR — custom foreground / background, size 128–1024px, error correction L/M/Q/H",
              "QR — live preview, PNG and SVG export",
              "Barcodes — Code 128, EAN-13, EAN-8, UPC-A, Code 39",
              "Barcodes — per-format validation with clear error messages",
              "Barcodes — custom width, height, colors, optional text",
              "Batch — paste a list of URLs / text, generate one PNG per line",
              "Local history with thumbnails and search",
              "Dark / light / system theme",
              "Privacy-first — no upload, no account, no tracking",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "#94a3b8" }}>
                <CheckCircle2 size={14} style={{ color: "#22c55e", flexShrink: 0 }} />
                {f}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <p className="text-sm font-semibold mb-3" style={{ color: "#f1f5f9" }}>Technical Notes</p>
          <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
            QR codes are produced by the open-source <span style={{ color: "#cbd5e1", fontFamily: "JetBrains Mono, monospace" }}>qrcode</span> library; 1D barcodes
            by <span style={{ color: "#cbd5e1", fontFamily: "JetBrains Mono, monospace" }}>jsbarcode</span>. Both render in pure JavaScript — no WASM dependencies.
            Wi-Fi QR codes use the standard WIFI: format; vCards use VCARD 3.0; emails use mailto:.
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: "#64748b" }}>
            Built with Tauri, React, TypeScript, and Tailwind CSS.
          </p>
        </Card>

        <div className="flex items-center gap-2 text-xs" style={{ color: "#475569" }}>
          <Info size={12} />
          <span>© 2024 KART L. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}

// ─── Help ─────────────────────────────────────────────────────────────────────
export function Help() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Help" subtitle="How to use QR Barcode Studio" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        {[
          { q: "How do I generate a QR code?",
            a: "Open the QR Generator from the sidebar, pick a type (URL / Text / Wi-Fi / vCard / Email), fill in the fields, and the preview updates live. Click Export PNG or Export SVG to download. Click Save to keep it in History." },
          { q: "What's the difference between error correction levels?",
            a: "L recovers about 7% of a damaged code, M about 15%, Q about 25%, H about 30%. Higher recovery makes the code denser but more scannable when partially obscured (e.g. by a logo overlay or print smudge)." },
          { q: "How does Wi-Fi QR work on a scanner?",
            a: "Most modern phone cameras recognise the standard WIFI: payload and offer to join the network when scanned. You don't need a separate app on the scanning device." },
          { q: "Which barcode format should I use?",
            a: "Use Code 128 for general purpose alphanumeric codes (warehouse, internal IDs). Use EAN-13 / UPC-A for retail products with official assigned numbers. Use EAN-8 for tiny packaging. Use Code 39 when an older system requires it." },
          { q: "Why does the barcode preview disappear?",
            a: "The preview clears whenever your value fails the format's validation rules. Check the red message under the value field — e.g. EAN-13 needs digits only and a specific length." },
          { q: "What does batch mode produce?",
            a: "One QR PNG file per non-empty line in your input. Click Generate to render previews, then Download all to trigger sequential downloads of the full-size PNGs." },
          { q: "Is anything I generate uploaded somewhere?",
            a: "No. All generation runs in your browser using the qrcode and jsbarcode libraries. Payloads, settings, history, and exported files all stay on your device." },
          { q: "Where is my data stored?",
            a: "Saved codes (with small thumbnail previews) and settings live in your browser's localStorage. You can clear all data from Settings → Local Data. Files you have already downloaded are not affected." },
        ].map(({ q, a }) => (
          <Card key={q}>
            <div className="flex gap-3">
              <HelpCircle size={16} strokeWidth={1.8} className="flex-shrink-0 mt-0.5" style={{ color: ACCENT }} />
              <div>
                <p className="font-medium mb-1.5" style={{ color: "#f1f5f9" }}>{q}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{a}</p>
              </div>
            </div>
          </Card>
        ))}

        <Card style={{ background: "rgba(16,185,129,.06)", borderColor: "rgba(16,185,129,.2)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Mail size={15} style={{ color: ACCENT }} />
            <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Support</p>
          </div>
          <p className="text-sm" style={{ color: "#64748b" }}>
            For support, feedback, or bug reports, please use the Microsoft Store review system
            or contact KART L through the app listing.
          </p>
        </Card>
      </div>
    </div>
  );
}
