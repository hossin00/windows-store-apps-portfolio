import { Shield, Lock, Eye, EyeOff, Database, Trash2, CheckCircle2, Info, HelpCircle, FilePenLine, Mail } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Card } from "../components/UI";

// ─── Privacy ─────────────────────────────────────────────────────────────────
export function Privacy() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Privacy" subtitle="How File Rename Factory handles your data" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        <Card style={{ background: "rgba(249,115,22,.06)", borderColor: "rgba(249,115,22,.2)" }}>
          <div className="flex items-center gap-3 mb-3">
            <Shield size={20} style={{ color: "#f97316" }} />
            <p className="font-semibold" style={{ color: "#f1f5f9" }}>Privacy-First Design</p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            File Rename Factory reads only file names — never file contents — and does all rename
            planning locally. No accounts. No telemetry. No ads.
          </p>
        </Card>

        {[
          { icon: Lock,    title: "We Only See File Names",
            body: "When you drop or pick files, only the filename (and size, for display) is read by the rename engine. File contents are never opened, parsed, or uploaded." },
          { icon: EyeOff,  title: "No Tracking by Default",
            body: "File Rename Factory does not use analytics, crash reporting, or behavioural tracking. No usage data is sent anywhere." },
          { icon: Database,title: "Local Storage Only",
            body: "Settings and rename session history are stored in your browser's localStorage. This data never leaves your device." },
          { icon: Eye,     title: "No Account Required",
            body: "You do not need to create an account, sign in, or provide any personal information to use any feature of this app." },
          { icon: Trash2,  title: "Delete Your Data Anytime",
            body: "You can clear all locally stored data at any time from Settings → Local Data. Removing the app removes all data completely." },
        ].map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <div className="flex gap-4">
              <div className="rounded-lg p-2 flex-shrink-0 self-start" style={{ background: "rgba(249,115,22,.08)", color: "#f97316" }}>
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
            If any future version of File Rename Factory adds online features or changes how data
            is handled, this privacy policy will be updated before that version is released and users
            will be informed clearly within the app.
          </p>
        </Card>

        <div className="text-xs pb-4" style={{ color: "#475569" }}>
          Last updated: 2024. File Rename Factory — KART L
        </div>
      </div>
    </div>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────
export function About() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="About" subtitle="File Rename Factory" />
      <div className="flex-1 overflow-y-auto p-6 max-w-xl space-y-5">
        <Card>
          <div className="flex items-center gap-4 mb-5">
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{ width: 56, height: 56, background: "linear-gradient(135deg,#f97316,#ea580c)", flexShrink: 0 }}>
              <FilePenLine size={26} color="white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: "#f1f5f9" }}>File Rename Factory</p>
              <p className="text-sm" style={{ color: "#64748b" }}>Version 1.0.0</p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>by KART L</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            File Rename Factory is a Windows desktop utility for batch renaming files using a clear
            rule pipeline with live preview. Build a plan, see exactly what changes, then apply.
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Rules</p>
          <ul className="space-y-2">
            {[
              "Add prefix or suffix",
              "Auto numbering (001, 002 …) with custom digits and start",
              "Insert date (YYYY-MM-DD, YYYYMMDD, etc.)",
              "Find & replace plain text",
              "Regex replace with custom flags",
              "Case convert — UPPER, lower, Title, Sentence",
              "Remove special characters",
              "Trim and collapse whitespace",
              "Live preview with collision and error detection",
              "Local session history with mark-undone",
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
            The rename engine is fully real — every rule type is a pure transform on the file's base name
            (the extension is preserved). The disk-write step is performed by Tauri's filesystem
            command in the bundled desktop build; see <span style={{ color: "#cbd5e1", fontFamily: "JetBrains Mono, monospace" }}>src/services/renameService.ts</span> for the integration recipe.
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
      <Topbar title="Help" subtitle="How to use File Rename Factory" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        {[
          { q: "How do I build a rename plan?",
            a: "Open Workspace, drop one or more files (any type), then add rules using the + Add rule button. Each rule applies in order, top to bottom. The preview table updates live." },
          { q: "Can I reorder my rules?",
            a: "Yes. Each rule row has up and down arrows. Order matters — for example, uppercasing then adding a suffix keeps the suffix in its original case." },
          { q: "How do collisions and errors show up?",
            a: "If two files end up with the same new name, both are flagged as collisions. If a rule generates a name with Windows-illegal characters or empties the name entirely, that row shows an error. The Apply button is disabled while errors or collisions exist." },
          { q: "What happens when I click Apply?",
            a: "In this browser build, the plan is recorded as a session in local history and a CSV export option is available. In the Tauri desktop build, the same plan triggers Rust's std::fs::rename for each file. See src/services/renameService.ts for the integration recipe." },
          { q: "How does Undo work?",
            a: "Each applied session can be marked undone from the Workspace's Undo last button or from any session card in History. In the desktop build, the symmetric Tauri rename command restores original names. In the browser build, the session is flagged for visibility only." },
          { q: "Can I export the plan without applying?",
            a: "Yes. Use Export plan in the Workspace top bar to download a CSV with original and new names side-by-side, plus collision and error flags." },
          { q: "Does the app rename file contents?",
            a: "No. File Rename Factory only changes file names. File contents are never opened, parsed, or modified." },
          { q: "Where is my data stored?",
            a: "Settings and rename session history live in your browser's localStorage. You can clear all data from Settings → Local Data. Files on disk are not touched by clearing local data." },
        ].map(({ q, a }) => (
          <Card key={q}>
            <div className="flex gap-3">
              <HelpCircle size={16} strokeWidth={1.8} className="flex-shrink-0 mt-0.5" style={{ color: "#f97316" }} />
              <div>
                <p className="font-medium mb-1.5" style={{ color: "#f1f5f9" }}>{q}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{a}</p>
              </div>
            </div>
          </Card>
        ))}

        <Card style={{ background: "rgba(249,115,22,.06)", borderColor: "rgba(249,115,22,.2)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Mail size={15} style={{ color: "#f97316" }} />
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
