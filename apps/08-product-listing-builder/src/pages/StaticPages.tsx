import { Shield, Lock, Eye, EyeOff, Database, Trash2, CheckCircle2, Info, HelpCircle, ShoppingBag, Mail } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Card, ACCENT } from "../components/UI";

// ─── Privacy ─────────────────────────────────────────────────────────────────
export function Privacy() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Privacy" subtitle="How Product Listing Builder handles your data" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        <Card style={{ background: "rgba(14,165,233,0.06)", borderColor: "rgba(14,165,233,0.2)" }}>
          <div className="flex items-center gap-3 mb-3">
            <Shield size={20} style={{ color: ACCENT }} />
            <p className="font-semibold" style={{ color: "#f1f5f9" }}>Privacy-First Design</p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Listings, templates, and settings live in your browser's localStorage. No marketplace API
            is contacted in this version — every preview and export runs locally on your device.
          </p>
        </Card>

        {[
          { icon: Lock,    title: "Listings Stay on Your Device",
            body: "Every product you add to the vault is stored only in this browser. CSV imports, templates, and exports all stay local. No content is uploaded to any marketplace from this app." },
          { icon: EyeOff,  title: "No Tracking by Default",
            body: "Product Listing Builder does not use analytics, crash reporting, or behavioural tracking. No usage data is sent anywhere." },
          { icon: Database,title: "Local Storage Only",
            body: "Saved listings, custom templates, settings, and aggregate counters are stored in your browser's localStorage. Built-in templates are baked into the app and not stored." },
          { icon: Eye,     title: "No Account Required",
            body: "You do not need to create an account, sign in, or provide any personal information to use any feature of this app." },
          { icon: Trash2,  title: "Delete Your Data Anytime",
            body: "Clear all locally stored data at any time from Settings → Local Data. Removing the app removes all data completely." },
        ].map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <div className="flex gap-4">
              <div className="rounded-lg p-2 flex-shrink-0 self-start" style={{ background: "rgba(14,165,233,0.08)", color: ACCENT }}>
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
          <p className="text-sm font-semibold mb-3" style={{ color: "#f1f5f9" }}>Future marketplace integrations</p>
          <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
            A future paid build may add direct posting to Amazon SP-API, eBay Inventory API, Etsy Open API,
            Shopify Admin GraphQL, or WooCommerce REST. Those features require seller credentials and OAuth
            consent, and the policy will be updated to reflect them before they ship.
          </p>
        </Card>

        <div className="text-xs pb-4" style={{ color: "#475569" }}>
          Last updated: 2024. Product Listing Builder — KART L
        </div>
      </div>
    </div>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────
export function About() {
  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="About" subtitle="Product Listing Builder" />
      <div className="flex-1 overflow-y-auto p-6 max-w-xl space-y-5">
        <Card>
          <div className="flex items-center gap-4 mb-5">
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{ width: 56, height: 56, background: "linear-gradient(135deg,#0ea5e9,#0369a1)", flexShrink: 0 }}>
              <ShoppingBag size={26} color="white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: "#f1f5f9" }}>Product Listing Builder</p>
              <p className="text-sm" style={{ color: "#64748b" }}>Version 1.0.0</p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>by KART L</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Product Listing Builder is a Windows desktop tool for crafting marketplace-ready product listings.
            Fill in the structured editor once and see auto-formatted previews for Amazon, eBay, Etsy, Shopify,
            WooCommerce, and a generic shopfront — with an SEO score and per-platform warnings.
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Features</p>
          <ul className="space-y-2">
            {[
              "Editor with name, description, category, condition, SKU",
              "Price + compare-at price with 6 currencies",
              "Feature bullet list (reorderable, deletable)",
              "Tag chips with comma-separated input",
              "Image placeholder grid (1–8 slots)",
              "SEO title + meta description with sweet-spot counters",
              "Per-platform live preview with title-length warnings",
              "Real SEO score (0–100) with actionable suggestions",
              "Save / duplicate / delete / export TXT / export JSON",
              "Listings vault with search, 4 filters, 4 sort modes",
              "CSV bulk importer with preview table",
              "3 built-in templates + your own saved templates",
              "Premium UI: splash, onboarding, page transitions, skeletons, activity chart",
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
            The per-platform formatter encodes each marketplace's title-length cap and produces
            description text matched to the host: bullet block for Amazon, paragraph for eBay,
            story-led for Etsy, HTML for Shopify and WooCommerce. The SEO score weighs title, meta
            description, feature count, tag count, and image-slot count.
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
      <Topbar title="Help" subtitle="How to use Product Listing Builder" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        {[
          { q: "How do I start a listing?",
            a: "Open Settings and set your default currency, condition, platform, and business name. Then click New Listing in the sidebar. Each new listing pre-fills with your defaults." },
          { q: "What does the SEO score evaluate?",
            a: "Five parts: SEO title length (sweet spot 30–60 chars), meta description length (120–160), at least 3 feature bullets, at least 3 tags, and at least 3 image slots. The score is a soft target — listings still publish without 100/100." },
          { q: "Why does Amazon look different from Shopify in the preview?",
            a: "The per-platform formatter applies each marketplace's conventions: Amazon leads with bullet features, eBay uses paragraph + condition prefix, Etsy uses a story-led description plus tags, Shopify and WooCommerce produce HTML with feature lists. The preview also enforces the per-platform title length cap." },
          { q: "How does Bulk import work?",
            a: "Paste a CSV that follows the header row shown in the template. Multiple features or tags in one row go in the same cell, separated by the pipe character. Click Preview CSV to validate, then Generate listings to save them all." },
          { q: "Can I save my own template?",
            a: "Yes. In the editor's top bar, configure the listing then click Save — that adds it to Listings. To stash it as a reusable starter, open Templates and use the Save form there. Built-in templates can't be deleted." },
          { q: "Can the app publish directly to Amazon / eBay / Etsy?",
            a: "Not in this version. Direct API publishing requires seller credentials and OAuth flows that are outside the scope of this free local build. Export as JSON / TXT and paste into your marketplace's bulk import flow — or wait for the Tauri-bundled paid tier with native API integration." },
          { q: "Is there a length limit on the description?",
            a: "No hard limit, but per-platform previews wrap and may show warnings. The SEO scorer prefers a meta description of 120–160 characters; the long description has no SEO cap." },
          { q: "Where is my data stored?",
            a: "Saved listings, custom templates, and settings live in your browser's localStorage. You can clear all data from Settings → Local Data. Built-in templates are baked into the app and not stored." },
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

        <Card style={{ background: "rgba(14,165,233,0.06)", borderColor: "rgba(14,165,233,0.2)" }}>
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
