import { Shield, Lock, Eye, EyeOff, Database, Trash2, CheckCircle2, Info, HelpCircle, FileText, Mail } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Card } from "../components/UI";

// ─── Privacy ─────────────────────────────────────────────────────────────────
export function Privacy() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Privacy" subtitle="How PDF OCR Desk handles your data" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        <Card style={{ background: "rgba(59,130,246,.06)", borderColor: "rgba(59,130,246,.2)" }}>
          <div className="flex items-center gap-3 mb-3">
            <Shield size={20} style={{ color: "#3b82f6" }} />
            <p className="font-semibold" style={{ color: "#f1f5f9" }}>Privacy-First Design</p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            PDF OCR Desk is built to process your files locally. Your documents stay on your device.
            No accounts. No telemetry. No ads.
          </p>
        </Card>

        {[
          { icon: Lock,    title: "Files Stay on Your Device",
            body: "Imported images and PDF files are processed entirely within your browser and this application. Files are not uploaded to any server." },
          { icon: EyeOff,  title: "No Tracking by Default",
            body: "PDF OCR Desk does not use analytics, crash reporting, or behavioural tracking. No usage data is sent anywhere." },
          { icon: Database,title: "Local Storage Only",
            body: "OCR history and settings are saved only in your browser's localStorage. This data never leaves your device." },
          { icon: Eye,     title: "No Account Required",
            body: "You do not need to create an account, sign in, or provide any personal information to use any feature of this app." },
          { icon: Trash2,  title: "Delete Your Data Anytime",
            body: "You can clear all locally stored data at any time from Settings → Local Data. Deleting the app removes all data completely." },
        ].map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <div className="flex gap-4">
              <div className="rounded-lg p-2 flex-shrink-0 self-start" style={{ background: "rgba(59,130,246,.08)", color: "#3b82f6" }}>
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
            If any future version of PDF OCR Desk adds online features or changes how data is handled,
            this privacy policy will be updated before that version is released and users will be informed
            clearly within the app.
          </p>
        </Card>

        <div className="text-xs pb-4" style={{ color: "#475569" }}>
          Last updated: 2024. PDF OCR Desk — KART L
        </div>
      </div>
    </div>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────
export function About() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="About" subtitle="PDF OCR Desk" />
      <div className="flex-1 overflow-y-auto p-6 max-w-xl space-y-5">
        <Card>
          <div className="flex items-center gap-4 mb-5">
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{ width: 56, height: 56, background: "linear-gradient(135deg,#3b82f6,#6366f1)", flexShrink: 0 }}>
              <FileText size={26} color="white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: "#f1f5f9" }}>PDF OCR Desk</p>
              <p className="text-sm" style={{ color: "#64748b" }}>Version 1.0.0</p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>by KART L</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            PDF OCR Desk is a Windows desktop utility for extracting text from images and scanned PDF files.
            Import documents, extract text, copy results, and export in multiple formats — all without leaving your device.
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Features</p>
          <ul className="space-y-2">
            {[
              "Import PNG, JPG, JPEG, WebP images",
              "Import scanned PDF files",
              "OCR text extraction workspace",
              "File preview and extracted text editor",
              "Copy and export results (TXT, Markdown)",
              "Batch queue for multiple files",
              "Local OCR history with search",
              "Export center with format options",
              "Dark and light themes",
              "Privacy-first — local data only",
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
            OCR quality depends on image clarity, resolution, contrast, and document formatting.
            PDF OCR Desk does not guarantee specific accuracy levels — results vary by source material.
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
      <Topbar title="Help" subtitle="How to use PDF OCR Desk" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        {[
          { q: "How do I extract text from a file?",
            a: "Open the OCR Workspace from the sidebar or Dashboard. Drop an image (PNG, JPG, WebP) or PDF onto the drop zone, or click to browse. The extraction will start automatically." },
          { q: "What file types are supported?",
            a: "Images: PNG, JPG, JPEG, WebP. Documents: PDF. File size limit: 50 MB for images, 100 MB for PDF files." },
          { q: "How do I process multiple files at once?",
            a: "Open the Batch Queue from the sidebar. Drop multiple files onto the drop zone, then click Run batch. Results are saved to history automatically." },
          { q: "How do I export extracted text?",
            a: "After extraction in the Workspace, use the Export TXT or Export MD buttons. You can also export all history from the Export Center or History page." },
          { q: "Where is my data stored?",
            a: "OCR history and settings are stored in your browser's localStorage — on your device only. Nothing is uploaded or transmitted. You can clear all data from Settings → Local Data." },
          { q: "Can I edit the extracted text?",
            a: "Yes — the extracted text panel in the Workspace is an editable text area. Make corrections before copying or exporting." },
          { q: "How do I turn off history saving?",
            a: "Go to Settings → History & Export → toggle off 'Save OCR history locally'. You can also enable Privacy mode to prevent saving during a session." },
          { q: "Why does OCR quality vary?",
            a: "OCR accuracy depends on image sharpness, resolution, contrast, fonts used, and the language of the text. For best results, use clear, high-resolution scans with good contrast." },
        ].map(({ q, a }) => (
          <Card key={q}>
            <div className="flex gap-3">
              <HelpCircle size={16} strokeWidth={1.8} className="flex-shrink-0 mt-0.5" style={{ color: "#3b82f6" }} />
              <div>
                <p className="font-medium mb-1.5" style={{ color: "#f1f5f9" }}>{q}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{a}</p>
              </div>
            </div>
          </Card>
        ))}

        <Card style={{ background: "rgba(59,130,246,.06)", borderColor: "rgba(59,130,246,.2)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Mail size={15} style={{ color: "#3b82f6" }} />
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
