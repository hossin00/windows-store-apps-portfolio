import { Shield, Lock, Eye, EyeOff, Database, Trash2, CheckCircle2, Info, HelpCircle, FileStack, Mail } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Card } from "../components/UI";

// ─── Privacy ─────────────────────────────────────────────────────────────────
export function Privacy() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Privacy" subtitle="How PDF Master Kit handles your data" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        <Card style={{ background: "rgba(139,92,246,.06)", borderColor: "rgba(139,92,246,.2)" }}>
          <div className="flex items-center gap-3 mb-3">
            <Shield size={20} style={{ color: "#8b5cf6" }} />
            <p className="font-semibold" style={{ color: "#f1f5f9" }}>Privacy-First Design</p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            PDF Master Kit processes every operation locally in your browser. Your PDF files stay on your device.
            No accounts. No telemetry. No ads.
          </p>
        </Card>

        {[
          { icon: Lock,    title: "Files Stay on Your Device",
            body: "PDFs you open are parsed and rewritten entirely in-browser using the open-source pdf-lib library. Files are never uploaded to any server." },
          { icon: EyeOff,  title: "No Tracking by Default",
            body: "PDF Master Kit does not use analytics, crash reporting, or behavioural tracking. No usage data is sent anywhere." },
          { icon: Database,title: "Local Storage Only",
            body: "Operation history and settings are stored only in your browser's localStorage. This data never leaves your device." },
          { icon: Eye,     title: "No Account Required",
            body: "You do not need to create an account, sign in, or provide any personal information to use any feature of this app." },
          { icon: Trash2,  title: "Delete Your Data Anytime",
            body: "You can clear all locally stored data at any time from Settings → Local Data. Removing the app removes all data completely." },
        ].map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <div className="flex gap-4">
              <div className="rounded-lg p-2 flex-shrink-0 self-start" style={{ background: "rgba(139,92,246,.08)", color: "#8b5cf6" }}>
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
          <p className="text-sm font-semibold mb-3" style={{ color: "#f1f5f9" }}>Future Updates</p>
          <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
            If any future version of PDF Master Kit adds online features or changes how data is handled,
            this privacy policy will be updated before that version is released and users will be informed
            clearly within the app.
          </p>
        </Card>

        <div className="text-xs pb-4" style={{ color: "#475569" }}>
          Last updated: 2024. PDF Master Kit — KART L
        </div>
      </div>
    </div>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────
export function About() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="About" subtitle="PDF Master Kit" />
      <div className="flex-1 overflow-y-auto p-6 max-w-xl space-y-5">
        <Card>
          <div className="flex items-center gap-4 mb-5">
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{ width: 56, height: 56, background: "linear-gradient(135deg,#8b5cf6,#7c3aed)", flexShrink: 0 }}>
              <FileStack size={26} color="white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: "#f1f5f9" }}>PDF Master Kit</p>
              <p className="text-sm" style={{ color: "#64748b" }}>Version 1.0.0</p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>by KART L</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            PDF Master Kit is a Windows desktop utility for editing PDF documents. Merge multiple PDFs, split a PDF
            into parts, compress, rotate, reorder pages, and extract specific pages — all in a clean, local-first interface.
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Features</p>
          <ul className="space-y-2">
            {[
              "Merge multiple PDFs into one",
              "Split by pages, ranges, or interval",
              "Compress with object stream re-save",
              "Rotate all pages or per page",
              "Reorder pages by drag-and-drop",
              "Extract specific pages into a new PDF",
              "Local operation history with search",
              "Dark and light themes",
              "Privacy-first — local data only",
              "Powered by pdf-lib",
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
            All PDF operations are performed in-browser using pdf-lib. Compression is a structural re-save
            (object streams enabled) and does not re-encode images. Encrypted PDFs are read with the
            ignoreEncryption flag and may not always re-save correctly.
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: "#64748b" }}>
            Built with Tauri, React, TypeScript, pdf-lib, and Tailwind CSS.
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
      <Topbar title="Help" subtitle="How to use PDF Master Kit" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        {[
          { q: "How do I merge PDFs?",
            a: "Open Merge, drop two or more PDF files, reorder them with the arrow buttons if needed, then click Merge. The combined PDF is downloaded automatically." },
          { q: "What split modes are available?",
            a: "Split offers three modes — by pages (each page becomes its own PDF), by ranges (1-3, 4-6 produces grouped PDFs), and by interval (every N pages becomes one file)." },
          { q: "Does the compress tool always shrink my file?",
            a: "Not always. The compressor re-saves the PDF with object stream compression, which removes unused objects and can shrink files with verbose structure. It does not re-encode embedded images, so already-tight PDFs may not get smaller." },
          { q: "Can I rotate only some pages?",
            a: "Yes. Open Rotate, switch to Per page, and click each page to cycle through 0/90/180/270 degrees. Pages with non-zero rotation will be turned." },
          { q: "How does Reorder work?",
            a: "Drag pages up or down in the list, or use the arrow buttons. Each page can also be rotated 90° at a time. Click Apply order to produce the new PDF." },
          { q: "What's the difference between Split and Extract?",
            a: "Split creates several output PDFs at once. Extract creates a single new PDF containing only the pages you selected." },
          { q: "Where is my data stored?",
            a: "Operation history and settings are stored in your browser's localStorage — on your device only. Source and output PDFs are never uploaded. You can clear all data from Settings → Local Data." },
          { q: "Are encrypted PDFs supported?",
            a: "PDF Master Kit reads PDFs with the ignoreEncryption flag for compatibility, but some encrypted documents may not save correctly. For best results, decrypt the PDF first." },
        ].map(({ q, a }) => (
          <Card key={q}>
            <div className="flex gap-3">
              <HelpCircle size={16} strokeWidth={1.8} className="flex-shrink-0 mt-0.5" style={{ color: "#8b5cf6" }} />
              <div>
                <p className="font-medium mb-1.5" style={{ color: "#f1f5f9" }}>{q}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{a}</p>
              </div>
            </div>
          </Card>
        ))}

        <Card style={{ background: "rgba(139,92,246,.06)", borderColor: "rgba(139,92,246,.2)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Mail size={15} style={{ color: "#8b5cf6" }} />
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
