import { Shield, Lock, Eye, EyeOff, Database, Trash2, CheckCircle2, Info, HelpCircle, Files, Mail } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Card, ACCENT } from "../components/UI";

// ─── Privacy ─────────────────────────────────────────────────────────────────
export function Privacy() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Privacy" subtitle="How Duplicate File Finder handles your data" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        <Card style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}>
          <div className="flex items-center gap-3 mb-3">
            <Shield size={20} style={{ color: ACCENT }} />
            <p className="font-semibold" style={{ color: "#f1f5f9" }}>Privacy-First Design</p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Files you drop into the scanner are read only for filename and size to compute the
            duplicate fingerprint. No file contents leave your device, and no scan plan is applied
            to disk without your explicit confirmation in the desktop build.
          </p>
        </Card>

        {[
          { icon: Lock,    title: "Names and Sizes Only",
            body: "The browser-only build reads file metadata (name, size, MIME, last modified). It does not read file contents and does not upload anything. The Tauri-bundled build can stream-hash file contents locally for SHA-256-strength accuracy — still nothing leaves your device." },
          { icon: EyeOff,  title: "No Tracking by Default",
            body: "Duplicate File Finder does not use analytics, crash reporting, or behavioural tracking. No usage data is sent anywhere." },
          { icon: Database,title: "Local Storage Only",
            body: "Scan sessions, settings, and aggregate counters are stored only in your browser's localStorage. Files dropped into the scanner stay in memory until you reset or close the app." },
          { icon: Eye,     title: "No Account Required",
            body: "You do not need to create an account, sign in, or provide any personal information to use any feature of this app." },
          { icon: Trash2,  title: "Plan, Then Apply",
            body: "Selecting files in the scanner marks them as 'will remove' but does not touch disk in this browser build. Saving the plan records a session you can review; actual disk deletion runs through Tauri in the desktop build only after you confirm." },
        ].map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <div className="flex gap-4">
              <div className="rounded-lg p-2 flex-shrink-0 self-start" style={{ background: "rgba(239,68,68,0.08)", color: ACCENT }}>
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
            If a future version adds online features or background scanning, this policy will be
            updated before that version is released and users will be informed clearly within the app.
          </p>
        </Card>

        <div className="text-xs pb-4" style={{ color: "#475569" }}>
          Last updated: 2024. Duplicate File Finder — KART L
        </div>
      </div>
    </div>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────
export function About() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="About" subtitle="Duplicate File Finder" />
      <div className="flex-1 overflow-y-auto p-6 max-w-xl space-y-5">
        <Card>
          <div className="flex items-center gap-4 mb-5">
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{ width: 56, height: 56, background: "linear-gradient(135deg,#ef4444,#b91c1c)", flexShrink: 0 }}>
              <Files size={26} color="white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: "#f1f5f9" }}>Duplicate File Finder</p>
              <p className="text-sm" style={{ color: "#64748b" }}>Version 1.0.0</p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>by KART L</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Duplicate File Finder is a Windows desktop utility for cleaning up redundant files.
            Drop a folder's contents in, group by name and size, review the plan, and reclaim disk
            space — all locally, with a plan-then-apply safety model.
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Features</p>
          <ul className="space-y-2">
            {[
              "Drag-and-drop or multi-file picker ingestion",
              "Group duplicates by hash (name + size), name only, or size only",
              "Per-group reclaim estimate (total minus the largest copy)",
              "Image preview thumbnails for picture files",
              "Auto-select: keep newest / oldest / first",
              "Live space-saved calculator",
              "Donut chart + 4-stat summary in Results",
              "Export current scan as CSV or JSON",
              "Save scan plan to local history",
              "Settings: theme, compare mode, min size, show hidden, privacy mode",
              "Premium UI: splash, onboarding, page transitions, skeleton loaders, activity chart",
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
            In the browser-only build the duplicate fingerprint is name + size. This is a strong
            heuristic — most real-world duplicates share both — and runs instantly even on thousands
            of files. The file's top comment in <span style={{ color: "#cbd5e1", fontFamily: "JetBrains Mono, monospace" }}>src/services/duplicateService.ts</span> explains
            how to wire Tauri's filesystem and a Rust SHA-256 helper for content-level hashing in the
            desktop build.
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: "#64748b" }}>
            Built with Tauri, React, TypeScript, react-dropzone, and Tailwind CSS.
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
      <Topbar title="Help" subtitle="How to use Duplicate File Finder" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        {[
          { q: "Why can't I drag a folder?",
            a: "Browsers do not give web apps access to entire folder trees by default. Use the file picker and select all files inside a folder with Ctrl+A — Windows treats that as a multi-file selection the app can read. The Tauri desktop build adds a native folder-pick command (see the comment block in src/services/duplicateService.ts)." },
          { q: "How is a duplicate decided?",
            a: "In the browser build, duplicates are files that share both name and exact byte size — the 'hash' mode. You can also switch to name-only or size-only grouping. A real SHA-256 content hash (provided by the Tauri desktop build) requires reading every byte and is therefore far slower; the name+size fingerprint catches the same duplicates in nearly all real cases." },
          { q: "What does Auto-select do?",
            a: "It checks every file in each duplicate group except the one chosen by your rule. Keep newest preserves the most recently modified copy, Keep oldest the earliest, Keep first the topmost in the group as currently listed." },
          { q: "What happens when I click 'Save scan plan'?",
            a: "The currently selected files become a recorded session in History showing how much space would be freed. In this browser build the disk is not touched. In the Tauri desktop build the same action calls a Rust delete_file command per selected path." },
          { q: "Can I undo a scan?",
            a: "Yes — clicking 'Reset' in the Scanner clears the current selection. Sessions in History can be deleted individually. The disk is not touched by the browser build, so there's nothing to undo on the filesystem." },
          { q: "Why are image thumbnails sometimes missing?",
            a: "Thumbnails appear for files whose MIME type is png/jpeg/webp/gif/svg. Files without an extension or with an obscure type fall back to a generic file icon." },
          { q: "How do I export the results?",
            a: "From the Results page, click Export CSV or Export JSON. CSV is good for spreadsheets; JSON is round-trip-safe and includes every group and file." },
          { q: "Where is my data stored?",
            a: "Scan history and settings live in your browser's localStorage. You can clear all data from Settings → Local Data. CSV / JSON files you have already downloaded are not affected." },
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

        <Card style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}>
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
