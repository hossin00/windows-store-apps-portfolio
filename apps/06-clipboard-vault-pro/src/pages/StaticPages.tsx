import { Shield, Lock, Eye, EyeOff, Database, Trash2, CheckCircle2, Info, HelpCircle, ClipboardList, Mail } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Card, ACCENT } from "../components/UI";

// ─── Privacy ─────────────────────────────────────────────────────────────────
export function Privacy() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Privacy" subtitle="How Clipboard Vault Pro handles your data" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        <Card style={{ background: "rgba(139,92,246,0.06)", borderColor: "rgba(139,92,246,0.2)" }}>
          <div className="flex items-center gap-3 mb-3">
            <Shield size={20} style={{ color: ACCENT }} />
            <p className="font-semibold" style={{ color: "#f1f5f9" }}>Privacy-First Design</p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Snippets, collections, tags, and settings all live in your browser's localStorage on your
            device. No account, no cloud sync, no telemetry. Clear it any time.
          </p>
        </Card>

        {[
          { icon: Lock,    title: "Snippets Stay on Your Device",
            body: "Everything you add to the vault is stored in this browser only. Nothing is sent to any server. If you remove the app or clear the data, it is gone." },
          { icon: EyeOff,  title: "No Tracking by Default",
            body: "Clipboard Vault Pro does not use analytics, crash reporting, or behavioural tracking. No usage data is sent anywhere." },
          { icon: Database,title: "Manual Capture Only",
            body: "This version of the app never reads your OS clipboard silently. Every snippet you save is one you explicitly typed or pasted into the Add field. Any future auto-capture feature will be opt-in and gated by the Privacy mode setting." },
          { icon: Eye,     title: "No Account Required",
            body: "You do not need to create an account, sign in, or provide any personal information to use any feature of this app." },
          { icon: Trash2,  title: "Delete Your Data Anytime",
            body: "Clear all locally stored data at any time from Settings → Local Data. Removing the app removes all data completely." },
        ].map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <div className="flex gap-4">
              <div className="rounded-lg p-2 flex-shrink-0 self-start" style={{ background: "rgba(139,92,246,0.08)", color: ACCENT }}>
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
          <p className="text-sm font-semibold mb-3" style={{ color: "#f1f5f9" }}>A note about sensitive snippets</p>
          <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
            Treat passwords, recovery codes, and bank details with the same care you would treat any
            unencrypted note app. Browser localStorage is unencrypted and accessible to anyone with
            access to your Windows user account. If you need to store secrets, use a dedicated password
            manager — Clipboard Vault Pro is a productivity helper, not a secret store.
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold mb-3" style={{ color: "#f1f5f9" }}>Future Updates</p>
          <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
            If any future version adds online features or auto-capture from the OS clipboard, this
            privacy policy will be updated before that version is released and users will be informed
            clearly within the app.
          </p>
        </Card>

        <div className="text-xs pb-4" style={{ color: "#475569" }}>
          Last updated: 2024. Clipboard Vault Pro — KART L
        </div>
      </div>
    </div>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────
export function About() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="About" subtitle="Clipboard Vault Pro" />
      <div className="flex-1 overflow-y-auto p-6 max-w-xl space-y-5">
        <Card>
          <div className="flex items-center gap-4 mb-5">
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{ width: 56, height: 56, background: "linear-gradient(135deg,#8b5cf6,#7c3aed)", flexShrink: 0 }}>
              <ClipboardList size={26} color="white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: "#f1f5f9" }}>Clipboard Vault Pro</p>
              <p className="text-sm" style={{ color: "#64748b" }}>Version 1.0.0</p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>by KART L</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Clipboard Vault Pro is a Windows desktop utility for saving, organising, and reusing text
            snippets — URLs, emails, code, phone numbers, anything you copy often. Auto-tagged by
            content type, organised in collections, searchable in one keystroke.
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Features</p>
          <ul className="space-y-2">
            {[
              "Auto-detection of URL, email, code, phone, and plain text",
              "Optional manual title + editable tags per snippet",
              "Pin and favourite for one-click reuse",
              "Collections (named folders) — snippets can live in many",
              "Search across content, tags, type, date, collection",
              "Sort by newest, oldest, most used, or pinned first",
              "Quick copy button + copy counter",
              "Grid and list views in the vault",
              "Export all as TXT or JSON",
              "Dark / light / system theme",
              "Privacy-first — manual capture only, local-only storage",
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
            Type detection runs on a small regex pipeline (URL → email → phone → code → text). The
            engine recognises common code shape cues — function/import/class keywords, braces, JSX/HTML
            tags — without false-positive on regular prose.
          </p>
          <p className="text-sm leading-relaxed mt-3" style={{ color: "#64748b" }}>
            See <span style={{ color: "#cbd5e1", fontFamily: "JetBrains Mono, monospace" }}>src/services/clipboardService.ts</span> for the integration
            recipe to wire Tauri's <span style={{ color: "#cbd5e1", fontFamily: "JetBrains Mono, monospace" }}>clipboard-manager</span> plugin if you
            want automatic capture in a future desktop build.
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
      <Topbar title="Help" subtitle="How to use Clipboard Vault Pro" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        {[
          { q: "How do I add a snippet?",
            a: "Open the Vault page from the sidebar. Paste or type content into the Add field, give it an optional title, and click Add to vault. The content type is auto-detected and shown as a badge." },
          { q: "How does type auto-detection work?",
            a: "The app runs a regex pipeline: URLs (http(s) or www), then emails, then phone numbers, then code (function/class/import keywords or code shape). Anything that doesn't match becomes Plain text. You can turn this off in Settings — everything will be saved as Text." },
          { q: "What's the difference between pinning and favouriting?",
            a: "Pinning sticks a snippet to the top of the Vault list. Favouriting marks it but does not change ordering — useful for filters and search. A snippet can be both." },
          { q: "How do collections work?",
            a: "Collections are named folders. A snippet can belong to multiple collections at once. Open Collections from the sidebar, create a new one, then click into it to add or remove snippets. Renaming and deleting a collection do not delete its snippets — just the grouping." },
          { q: "Can I search inside snippet content?",
            a: "Yes. The Search page does full-text matching across title, content, and tags, and pairs it with filters for type, pinned, favourite, collection, and date range. Results respect the sort selector at the bottom." },
          { q: "How do I export everything?",
            a: "Open History and use the Export TXT or Export JSON button in the top bar. TXT is human-readable; JSON is round-trip-safe and includes settings, collections, and snippets." },
          { q: "How big can the vault get?",
            a: "Settings → Vault sets a cap (100, 500, 1000, or unlimited). When the cap is reached, the oldest snippets fall off as new ones are added. Pinned snippets count toward the cap." },
          { q: "Does the app read my system clipboard?",
            a: "Not in this version. Every snippet is one you explicitly typed or pasted into the Add field. If a future build adds auto-capture, it will be opt-in and gated by the Privacy mode setting." },
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

        <Card style={{ background: "rgba(139,92,246,0.06)", borderColor: "rgba(139,92,246,0.2)" }}>
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
