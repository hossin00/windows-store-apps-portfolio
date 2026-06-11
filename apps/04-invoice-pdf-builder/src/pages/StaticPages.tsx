import { Shield, Lock, Eye, EyeOff, Database, Trash2, CheckCircle2, Info, HelpCircle, Receipt, Mail } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Card, ACCENT } from "../components/UI";

// ─── Privacy ─────────────────────────────────────────────────────────────────
export function Privacy() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Privacy" subtitle="How Invoice PDF Builder handles your data" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        <Card style={{ background: "rgba(249,115,22,.06)", borderColor: "rgba(249,115,22,.2)" }}>
          <div className="flex items-center gap-3 mb-3">
            <Shield size={20} style={{ color: ACCENT }} />
            <p className="font-semibold" style={{ color: "#f1f5f9" }}>Privacy-First Design</p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Invoice PDF Builder generates every PDF locally in your browser. Invoice data stays on your device.
            No accounts. No telemetry. No ads.
          </p>
        </Card>

        {[
          { icon: Lock,    title: "Invoices Stay on Your Device",
            body: "Invoice data is held in memory while you edit and stored only in your browser's localStorage when you save a draft. PDFs are generated client-side with the open-source pdf-lib library and downloaded directly to your computer." },
          { icon: EyeOff,  title: "No Tracking by Default",
            body: "Invoice PDF Builder does not use analytics, crash reporting, or behavioural tracking. No usage data is sent anywhere." },
          { icon: Database,title: "Local Storage Only",
            body: "Saved invoices, business profile, and app settings are stored only in your browser's localStorage. This data never leaves your device." },
          { icon: Eye,     title: "No Account Required",
            body: "You do not need to create an account, sign in, or provide any personal information to use any feature of this app." },
          { icon: Trash2,  title: "Delete Your Data Anytime",
            body: "You can clear all locally stored data at any time from Settings → Local Data. Removing the app removes all data completely." },
        ].map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <div className="flex gap-4">
              <div className="rounded-lg p-2 flex-shrink-0 self-start" style={{ background: "rgba(249,115,22,.08)", color: ACCENT }}>
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
            If any future version of Invoice PDF Builder adds online features (cloud sync, email delivery,
            payment links), this privacy policy will be updated before that version is released and users
            will be informed clearly within the app.
          </p>
        </Card>

        <div className="text-xs pb-4" style={{ color: "#475569" }}>
          Last updated: 2024. Invoice PDF Builder — KART L
        </div>
      </div>
    </div>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────
export function About() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="About" subtitle="Invoice PDF Builder" />
      <div className="flex-1 overflow-y-auto p-6 max-w-xl space-y-5">
        <Card>
          <div className="flex items-center gap-4 mb-5">
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{ width: 56, height: 56, background: "linear-gradient(135deg,#f97316,#ea580c)", flexShrink: 0 }}>
              <Receipt size={26} color="white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: "#f1f5f9" }}>Invoice PDF Builder</p>
              <p className="text-sm" style={{ color: "#64748b" }}>Version 1.0.0</p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>by KART L</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Invoice PDF Builder is a Windows desktop utility for creating professional invoices with a live
            preview and a real PDF export. Build, save drafts, duplicate, and re-edit — every step runs on
            your device.
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Features</p>
          <ul className="space-y-2">
            {[
              "Business and client info fields",
              "Auto-increment invoice number with custom prefix",
              "Issue and due dates",
              "Line items with quantity, unit price, line total",
              "Subtotal, tax %, discount %, grand total — accurate to 2dp",
              "Multi-currency (USD, EUR, GBP, MAD)",
              "Notes / payment terms field",
              "Live HTML preview that mirrors the PDF",
              "Real PDF export with pdf-lib",
              "Save drafts, load, duplicate, delete",
              "Local invoice history with search",
              "Dark / light / system theme",
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
            Every invoice is rendered in real time as you type. The PDF export uses pdf-lib to produce
            an A4 document with embedded Helvetica fonts and the same layout as the on-screen preview.
            Calculations are deterministic and rounded to 2 decimal places.
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
      <Topbar title="Help" subtitle="How to use Invoice PDF Builder" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        {[
          { q: "How do I create my first invoice?",
            a: "Open Settings and fill in your default business profile (name, address, email). Then click New Invoice in the sidebar. The editor preloads your business as the From section and gives you a starter line item." },
          { q: "How does invoice numbering work?",
            a: "Settings has a prefix (e.g. INV-) and a next-sequence counter. When you click Save draft on a new invoice or click Duplicate, the next number is consumed and the counter advances. You can also override any number manually in the editor." },
          { q: "What's the difference between Save draft and Export PDF?",
            a: "Save draft writes the invoice to local history so you can reopen and edit later. Export PDF generates an A4 PDF using pdf-lib and downloads it to your computer. You usually want to Save draft first, then Export PDF." },
          { q: "How are totals calculated?",
            a: "Subtotal = sum of (quantity × unit price) per line. Discount is applied to subtotal. Tax is applied to subtotal-after-discount. Total = subtotal − discount + tax. Everything is rounded to 2 decimal places." },
          { q: "Can I duplicate an invoice?",
            a: "Yes. From History click Duplicate on any invoice, or click Duplicate in the editor top bar. A fresh invoice with the next auto-number is created carrying over the line items, totals, and parties." },
          { q: "Does the PDF look exactly like the preview?",
            a: "Very close. The PDF uses the same layout, accent colour, and total math. Fonts in the PDF are standard Helvetica (embedded), so the exact glyphs may differ slightly from the on-screen Inter font, but the layout matches." },
          { q: "Which currencies are supported?",
            a: "USD ($), EUR (€), GBP (£), and MAD (Moroccan Dirham). The currency setting affects both the on-screen totals and the exported PDF." },
          { q: "Where is my data stored?",
            a: "Saved invoices, business profile, and app settings live in your browser's localStorage. You can clear all data from Settings → Local Data. Exported PDFs already downloaded to your disk are not affected by clearing local data." },
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

        <Card style={{ background: "rgba(249,115,22,.06)", borderColor: "rgba(249,115,22,.2)" }}>
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
