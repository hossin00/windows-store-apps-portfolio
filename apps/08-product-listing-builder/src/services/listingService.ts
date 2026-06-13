/**
 * listingService.ts
 *
 * Product-listing engine — CRUD, per-platform formatter, SEO scorer, CSV import,
 * templates (built-in + user), and JSON / TXT exports. Pure functions + browser
 * localStorage.
 *
 * Wiring marketplace APIs (Amazon SP-API, eBay Inventory API, Etsy Open API,
 * Shopify Admin GraphQL, WooCommerce REST) belongs in the Tauri-bundled paid
 * tier — they require OAuth, seller credentials, and signed requests and are
 * outside the scope of this free local build. The per-platform formatter
 * below already produces title and description text that matches each
 * marketplace's rules.
 */

import { v4 as uuidv4 } from "uuid";
import type {
  ProductListing, Template, AppSettings, Currency, Category, Condition,
  Platform, PlatformFormatted,
} from "../types";

const KEYS = {
  SETTINGS:  "listing_settings",
  LISTINGS:  "listing_records",
  TEMPLATES: "listing_templates",
  STATS:     "listing_stats",
  FIRST_USE: "listing_first_use",
} as const;

// ── Settings ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  theme:            "dark",
  defaultCurrency:  "USD",
  defaultPlatform:  "amazon",
  defaultCondition: "new",
  businessName:     "",
  saveHistory:      true,
  privacyMode:      false,
  showWelcome:      true,
};

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

export function saveSettings(patch: Partial<AppSettings>): AppSettings {
  const updated = { ...getSettings(), ...patch };
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
}

export function getFirstUseDate(): string {
  try {
    let v = localStorage.getItem(KEYS.FIRST_USE);
    if (!v) { v = new Date().toISOString(); localStorage.setItem(KEYS.FIRST_USE, v); }
    return v;
  } catch { return new Date().toISOString(); }
}

// ── Constants ────────────────────────────────────────────────────────────────

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing",    label: "Clothing" },
  { value: "home",        label: "Home" },
  { value: "beauty",      label: "Beauty" },
  { value: "sports",      label: "Sports" },
  { value: "books",       label: "Books" },
  { value: "food",        label: "Food" },
  { value: "other",       label: "Other" },
];

export const CURRENCY_OPTIONS: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "USD — US Dollar",       symbol: "$" },
  { value: "EUR", label: "EUR — Euro",            symbol: "€" },
  { value: "GBP", label: "GBP — British Pound",   symbol: "£" },
  { value: "MAD", label: "MAD — Moroccan Dirham", symbol: "MAD " },
  { value: "CAD", label: "CAD — Canadian Dollar", symbol: "CA$" },
  { value: "AUD", label: "AUD — Australian Dollar", symbol: "A$" },
];

export const CONDITION_OPTIONS: { value: Condition; label: string }[] = [
  { value: "new",          label: "New" },
  { value: "used",         label: "Used" },
  { value: "refurbished",  label: "Refurbished" },
];

export const PLATFORM_OPTIONS: { value: Platform; label: string; titleMax: number }[] = [
  { value: "amazon",      label: "Amazon",      titleMax: 200 },
  { value: "ebay",        label: "eBay",        titleMax: 80  },
  { value: "etsy",        label: "Etsy",        titleMax: 140 },
  { value: "shopify",     label: "Shopify",     titleMax: 70  },
  { value: "woocommerce", label: "WooCommerce", titleMax: 70  },
  { value: "generic",     label: "Generic",     titleMax: 200 },
];

export function currencySymbol(c: Currency): string {
  return CURRENCY_OPTIONS.find((o) => o.value === c)?.symbol ?? "";
}

export function formatPrice(amount: number, c: Currency): string {
  const sign = amount < 0 ? "-" : "";
  const abs  = Math.abs(amount);
  return `${sign}${currencySymbol(c)}${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Empty / default listing ──────────────────────────────────────────────────

export function emptyListing(settings: AppSettings): ProductListing {
  const now = new Date().toISOString();
  return {
    id:             uuidv4(),
    name:           "",
    description:    "",
    category:       "other",
    price:          0,
    compareAtPrice: 0,
    currency:       settings.defaultCurrency,
    sku:            "",
    condition:      settings.defaultCondition,
    features:       [],
    tags:           [],
    imageSlots:     1,
    seoTitle:       "",
    seoDescription: "",
    platforms:      [settings.defaultPlatform],
    businessName:   settings.businessName,
    createdAt:      now,
    updatedAt:      now,
  };
}

// ── Listings CRUD ────────────────────────────────────────────────────────────

export function getListings(): ProductListing[] {
  try {
    const raw = localStorage.getItem(KEYS.LISTINGS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getListing(id: string): ProductListing | undefined {
  return getListings().find((l) => l.id === id);
}

export function saveListing(listing: ProductListing): ProductListing {
  if (!getSettings().saveHistory) return listing;
  const others = getListings().filter((l) => l.id !== listing.id);
  const next   = { ...listing, updatedAt: new Date().toISOString() };
  const all    = [next, ...others].slice(0, 1000);
  localStorage.setItem(KEYS.LISTINGS, JSON.stringify(all));
  if (others.length === getListings().length - 1) incrementStat("listingsCreated");
  return next;
}

export function deleteListing(id: string): void {
  localStorage.setItem(KEYS.LISTINGS, JSON.stringify(getListings().filter((l) => l.id !== id)));
}

export function clearListings(): void {
  localStorage.removeItem(KEYS.LISTINGS);
}

export function duplicateListing(id: string): ProductListing | undefined {
  const src = getListing(id);
  if (!src) return undefined;
  const now: ProductListing = {
    ...src,
    id:        uuidv4(),
    name:      `${src.name} (copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveListing(now);
  incrementStat("listingsDuplicated");
  return now;
}

export function searchListings(query: string): ProductListing[] {
  const q = query.trim().toLowerCase();
  if (!q) return getListings();
  return getListings().filter((l) => {
    const blob = `${l.name}\n${l.description}\n${l.tags.join(" ")}\n${l.sku}`.toLowerCase();
    return blob.includes(q);
  });
}

// ── Per-platform formatter ───────────────────────────────────────────────────

export function formatForPlatform(listing: ProductListing, platform: Platform): PlatformFormatted {
  const titleMax = PLATFORM_OPTIONS.find((p) => p.value === platform)!.titleMax;
  const warnings: string[] = [];

  let title = listing.name.trim();
  if (title.length > titleMax) {
    warnings.push(`Title is ${title.length} chars — ${platform} caps at ${titleMax}. It will be truncated.`);
    title = title.slice(0, titleMax - 1).trim() + "…";
  } else if (title.length === 0) {
    warnings.push("Product name is empty.");
  }

  let body = "";
  switch (platform) {
    case "amazon": {
      // Amazon: bullets first, then description; uppercase brand-prefix style optional.
      const bullets = listing.features.slice(0, 5).map((f) => `• ${f.trim()}`).join("\n");
      body = [
        title,
        listing.businessName ? `By ${listing.businessName}` : null,
        "",
        bullets,
        bullets ? "" : null,
        listing.description.trim(),
      ].filter((s) => s !== null).join("\n");
      if (listing.features.length === 0) warnings.push("Amazon listings benefit from 3–5 feature bullets.");
      break;
    }
    case "ebay": {
      // eBay: simple HTML-style with paragraph breaks.
      const tagLine = listing.tags.length > 0 ? `Tags: ${listing.tags.join(", ")}` : "";
      body = [
        title,
        listing.condition !== "new" ? `Condition: ${listing.condition}` : null,
        "",
        listing.description.trim(),
        "",
        listing.features.map((f) => `- ${f}`).join("\n"),
        tagLine ? "" : null,
        tagLine,
      ].filter((s) => s !== null && s !== "").join("\n");
      break;
    }
    case "etsy": {
      // Etsy: friendly, story-led description and a long tag list (Etsy allows up to 13 tags).
      const tagSnippet = listing.tags.slice(0, 13);
      body = [
        title,
        "",
        listing.description.trim(),
        "",
        listing.features.length > 0 ? "What's included:" : null,
        ...listing.features.map((f) => `★ ${f}`),
        "",
        tagSnippet.length > 0 ? `Tags: ${tagSnippet.join(", ")}` : null,
      ].filter((s) => s !== null).join("\n");
      if (listing.tags.length > 13) warnings.push(`Etsy allows up to 13 tags; ${listing.tags.length - 13} extra ignored.`);
      break;
    }
    case "shopify":
    case "woocommerce": {
      // Shopify / WooCommerce: HTML-friendly description with feature list.
      const featuresHtml = listing.features.length > 0
        ? `<ul>${listing.features.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>`
        : "";
      body = `<h2>${escapeHtml(title)}</h2>\n${escapeHtml(listing.description).replace(/\n+/g, "</p>\n<p>")}` +
             (featuresHtml ? `\n${featuresHtml}` : "");
      if (body.startsWith("<h2></h2>")) warnings.push("Title is empty — preview HTML will start with an empty heading.");
      break;
    }
    case "generic": {
      body = [
        title,
        listing.businessName ? `Sold by ${listing.businessName}` : null,
        "",
        listing.description.trim(),
        listing.features.length > 0 ? "" : null,
        ...listing.features.map((f) => `- ${f}`),
        listing.tags.length > 0 ? "" : null,
        listing.tags.length > 0 ? `#${listing.tags.join(" #")}` : null,
      ].filter((s) => s !== null).join("\n");
      break;
    }
  }

  if (listing.description.length === 0) warnings.push("Description is empty.");

  return { platform, displayTitle: title, formattedBody: body, warnings };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]!));
}

// ── SEO scorer ───────────────────────────────────────────────────────────────

export interface SeoScoreBreakdown {
  total:        number;        // 0–100
  parts:        { label: string; value: number; max: number; status: "ok" | "warn" | "miss" }[];
  suggestions:  string[];
}

export function seoScore(listing: ProductListing): SeoScoreBreakdown {
  const parts: SeoScoreBreakdown["parts"] = [];
  const suggestions: string[] = [];

  // 1. SEO title length (sweet spot 30–60 chars) → 25 pts
  {
    const len = listing.seoTitle.length;
    let v = 0;
    let status: "ok" | "warn" | "miss" = "miss";
    if (len === 0) {
      suggestions.push("Add an SEO title (aim for 30–60 characters).");
    } else if (len >= 30 && len <= 60) {
      v = 25; status = "ok";
    } else if (len > 0 && len < 30) {
      v = 12; status = "warn"; suggestions.push("SEO title is short — aim for 30 characters to get full credit.");
    } else if (len > 60) {
      v = 14; status = "warn"; suggestions.push("SEO title is over 60 characters — search engines may truncate.");
    }
    parts.push({ label: "SEO title 30–60 chars", value: v, max: 25, status });
  }

  // 2. SEO description length 120–160 → 25 pts
  {
    const len = listing.seoDescription.length;
    let v = 0;
    let status: "ok" | "warn" | "miss" = "miss";
    if (len === 0) {
      suggestions.push("Add a meta description (aim for 120–160 characters).");
    } else if (len >= 120 && len <= 160) {
      v = 25; status = "ok";
    } else if (len > 0 && len < 120) {
      v = 12; status = "warn"; suggestions.push("Meta description is short — aim for 120 characters.");
    } else if (len > 160) {
      v = 14; status = "warn"; suggestions.push("Meta description is over 160 chars — most engines truncate.");
    }
    parts.push({ label: "Meta description 120–160 chars", value: v, max: 25, status });
  }

  // 3. At least 3 features → 20 pts (gracefully: 1 → 8, 2 → 14, 3+ → 20)
  {
    const n = listing.features.filter((f) => f.trim()).length;
    const v = n === 0 ? 0 : n === 1 ? 8 : n === 2 ? 14 : 20;
    const status = n >= 3 ? "ok" : n > 0 ? "warn" : "miss";
    if (n < 3) suggestions.push("Add at least 3 feature bullets — marketplaces reward bullet-rich listings.");
    parts.push({ label: "≥ 3 feature bullets", value: v, max: 20, status });
  }

  // 4. At least 3 tags → 15 pts (1 → 6, 2 → 10, 3+ → 15)
  {
    const n = listing.tags.filter((t) => t.trim()).length;
    const v = n === 0 ? 0 : n === 1 ? 6 : n === 2 ? 10 : 15;
    const status = n >= 3 ? "ok" : n > 0 ? "warn" : "miss";
    if (n < 3) suggestions.push("Add at least 3 tags for better discoverability.");
    parts.push({ label: "≥ 3 tags", value: v, max: 15, status });
  }

  // 5. At least 3 image slots → 15 pts (1 → 6, 2 → 10, 3+ → 15)
  {
    const n = listing.imageSlots;
    const v = n <= 0 ? 0 : n === 1 ? 6 : n === 2 ? 10 : 15;
    const status = n >= 3 ? "ok" : n > 0 ? "warn" : "miss";
    if (n < 3) suggestions.push("Reserve at least 3 image slots — main photo + 2 alternates is the minimum buyers expect.");
    parts.push({ label: "≥ 3 image slots", value: v, max: 15, status });
  }

  const total = Math.min(100, parts.reduce((s, p) => s + p.value, 0));
  return { total, parts, suggestions };
}

// ── Templates ────────────────────────────────────────────────────────────────

const BUILTIN_TEMPLATES: Template[] = [
  {
    id: "tpl-electronics", name: "Electronics gadget",
    builtIn: true, createdAt: "2024-01-01T00:00:00.000Z",
    product: {
      name: "Wireless Earbuds X-200",
      description: "Compact wireless earbuds with active noise cancellation and 24-hour battery life via the charging case. Sweat-resistant for workouts, Bluetooth 5.3 for stable pairing with any device.",
      category: "electronics",
      price: 49.99, compareAtPrice: 79.99, currency: "USD",
      sku: "WB-X200-BLK", condition: "new",
      features: [
        "Active Noise Cancellation",
        "24-hour battery (case + buds)",
        "Bluetooth 5.3 stable pairing",
        "IPX4 sweat resistance",
        "Touch controls + voice assistant",
      ],
      tags: ["earbuds", "wireless", "bluetooth", "anc", "audio"],
      imageSlots: 5,
      seoTitle: "Wireless Earbuds X-200 — ANC, 24h Battery, Bluetooth 5.3",
      seoDescription: "X-200 wireless earbuds with active noise cancellation, 24h battery, Bluetooth 5.3, and IPX4 sweat resistance. Stable, sweatproof, all-day audio.",
      platforms: ["amazon", "shopify"],
      businessName: "",
    },
  },
  {
    id: "tpl-clothing", name: "Clothing item",
    builtIn: true, createdAt: "2024-01-01T00:00:00.000Z",
    product: {
      name: "Organic Cotton Crewneck Tee — Heather Grey",
      description: "A relaxed-fit crewneck tee cut from 100% GOTS-certified organic cotton. Pre-washed for softness, mid-weight at 180 gsm, holds its shape through dozens of washes.",
      category: "clothing",
      price: 24.00, compareAtPrice: 0, currency: "USD",
      sku: "TEE-OC-HG-M", condition: "new",
      features: [
        "100% GOTS organic cotton",
        "Mid-weight 180 gsm",
        "Pre-washed — no shrinkage",
        "Reinforced ribbed collar",
        "Unisex relaxed fit",
      ],
      tags: ["tshirt", "organic", "cotton", "unisex", "basic"],
      imageSlots: 4,
      seoTitle: "Organic Cotton Crewneck Tee — Heather Grey (Unisex)",
      seoDescription: "Mid-weight 180 gsm GOTS-certified organic cotton crewneck tee. Pre-washed, soft, unisex relaxed fit. Made to last, free of synthetic dyes.",
      platforms: ["shopify", "etsy"],
      businessName: "",
    },
  },
  {
    id: "tpl-home", name: "Home decor",
    builtIn: true, createdAt: "2024-01-01T00:00:00.000Z",
    product: {
      name: "Hand-thrown Ceramic Vase — Matte Sand",
      description: "A small-batch ceramic vase hand-thrown on a wheel in our studio. Matte sand glaze with subtle iron specks. Each piece varies slightly in shape — yours will be unique.",
      category: "home",
      price: 38.00, compareAtPrice: 0, currency: "USD",
      sku: "VASE-CMS-01", condition: "new",
      features: [
        "Hand-thrown in small batches",
        "Matte sand glaze with iron specks",
        "Holds water — for fresh or dried stems",
        "Approx. 18 cm tall, 12 cm wide",
        "Each piece slightly unique",
      ],
      tags: ["vase", "ceramic", "handmade", "home-decor", "matte"],
      imageSlots: 6,
      seoTitle: "Hand-thrown Ceramic Vase — Matte Sand Glaze",
      seoDescription: "Small-batch hand-thrown ceramic vase with a matte sand glaze. ~18 cm tall, holds water, each piece subtly unique. Made for fresh or dried flowers.",
      platforms: ["etsy", "shopify"],
      businessName: "",
    },
  },
];

export function getTemplates(): Template[] {
  try {
    const raw = localStorage.getItem(KEYS.TEMPLATES);
    const user = raw ? JSON.parse(raw) as Template[] : [];
    return [...BUILTIN_TEMPLATES, ...user];
  } catch { return BUILTIN_TEMPLATES; }
}

export function getUserTemplates(): Template[] {
  try {
    const raw = localStorage.getItem(KEYS.TEMPLATES);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveTemplate(name: string, listing: ProductListing): Template {
  const { id: _, createdAt: __, updatedAt: ___, ...product } = listing;
  void _; void __; void ___;
  const tpl: Template = {
    id:        uuidv4(),
    name:      name.trim() || "Untitled template",
    builtIn:   false,
    product,
    createdAt: new Date().toISOString(),
  };
  const user = getUserTemplates();
  localStorage.setItem(KEYS.TEMPLATES, JSON.stringify([tpl, ...user]));
  incrementStat("templatesSaved");
  return tpl;
}

export function deleteTemplate(id: string): void {
  const user = getUserTemplates().filter((t) => t.id !== id);
  localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(user));
}

export function listingFromTemplate(tpl: Template): ProductListing {
  const now = new Date().toISOString();
  return {
    ...tpl.product,
    id:        uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
}

// ── CSV import ───────────────────────────────────────────────────────────────

export const CSV_TEMPLATE = `name,description,category,price,compareAtPrice,currency,sku,condition,features,tags,seoTitle,seoDescription,imageSlots
Wireless Earbuds,"Compact wireless earbuds with ANC.",electronics,49.99,79.99,USD,WB-X200,new,"ANC|24h battery|Bluetooth 5.3","earbuds|wireless|anc",Wireless Earbuds X200 ANC,Compact wireless earbuds with ANC and 24h battery,4
Organic Cotton Tee,"100% GOTS organic cotton crewneck.",clothing,24.00,0,USD,TEE-OC-HG-M,new,"GOTS organic|180 gsm|Pre-washed","tshirt|organic|cotton",Organic Cotton Tee,GOTS organic cotton crewneck tee — soft and durable,3
`;

export interface CsvRow {
  raw:      Record<string, string>;
  listing:  ProductListing;
  warnings: string[];
}

export function parseCsv(text: string, settings: AppSettings): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const out: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    header.forEach((h, idx) => { row[h] = cells[idx] ?? ""; });
    const warnings: string[] = [];

    const listing: ProductListing = {
      id:             uuidv4(),
      name:           row.name ?? "",
      description:    row.description ?? "",
      category:       (CATEGORY_OPTIONS.some((c) => c.value === row.category) ? row.category : "other") as Category,
      price:          parseFloat(row.price ?? "0") || 0,
      compareAtPrice: parseFloat(row.compareatprice ?? "0") || 0,
      currency:       (CURRENCY_OPTIONS.some((c) => c.value === row.currency) ? row.currency : settings.defaultCurrency) as Currency,
      sku:            row.sku ?? "",
      condition:      (CONDITION_OPTIONS.some((c) => c.value === row.condition) ? row.condition : settings.defaultCondition) as Condition,
      features:       (row.features ?? "").split("|").map((s) => s.trim()).filter(Boolean),
      tags:           (row.tags ?? "").split("|").map((s) => s.trim().toLowerCase()).filter(Boolean),
      imageSlots:     Math.max(0, Math.min(8, parseInt(row.imageslots ?? "0", 10) || 0)),
      seoTitle:       row.seotitle ?? "",
      seoDescription: row.seodescription ?? "",
      platforms:      [settings.defaultPlatform],
      businessName:   settings.businessName,
      createdAt:      new Date().toISOString(),
      updatedAt:      new Date().toISOString(),
    };
    if (!listing.name) warnings.push("Row has no name — will be saved as untitled.");
    if (listing.price <= 0) warnings.push("Price is zero or missing.");
    out.push({ raw: row, listing, warnings });
  }
  return out;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === "\"") {
        if (line[i + 1] === "\"") { cur += "\""; i += 1; }
        else inQuotes = false;
      } else cur += ch;
    } else {
      if (ch === ",") { out.push(cur); cur = ""; }
      else if (ch === "\"") inQuotes = true;
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

// ── Stats ────────────────────────────────────────────────────────────────────

export interface AppStats {
  listingsCreated:    number;
  listingsDuplicated: number;
  templatesSaved:     number;
  bulkRuns:           number;
}

const DEFAULT_STATS: AppStats = {
  listingsCreated: 0, listingsDuplicated: 0, templatesSaved: 0, bulkRuns: 0,
};

export function getStats(): AppStats {
  try {
    const raw = localStorage.getItem(KEYS.STATS);
    return raw ? { ...DEFAULT_STATS, ...JSON.parse(raw) } : DEFAULT_STATS;
  } catch { return DEFAULT_STATS; }
}

export function incrementStat(key: keyof AppStats, by = 1): void {
  const s = getStats();
  s[key] = (s[key] || 0) + by;
  localStorage.setItem(KEYS.STATS, JSON.stringify(s));
}

// ── Clear all + storage size ─────────────────────────────────────────────────

export function clearAllLocalData(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

export function getStorageSizeKB(): number {
  return Math.round(
    Object.values(KEYS).reduce((acc, k) => {
      const v = localStorage.getItem(k);
      return acc + (v ? v.length * 2 : 0);
    }, 0) / 1024
  );
}

// ── Export helpers ───────────────────────────────────────────────────────────

export function listingToJson(listing: ProductListing): string {
  return JSON.stringify(listing, null, 2);
}

export function listingToTxt(listing: ProductListing): string {
  const lines: string[] = [
    `# ${listing.name || "(untitled)"}`,
    listing.businessName ? `Sold by: ${listing.businessName}` : "",
    `SKU: ${listing.sku || "(none)"}    Condition: ${listing.condition}    Category: ${listing.category}`,
    `Price: ${formatPrice(listing.price, listing.currency)}${listing.compareAtPrice > 0 ? `  (was ${formatPrice(listing.compareAtPrice, listing.currency)})` : ""}`,
    "",
    listing.description.trim(),
    "",
    listing.features.length > 0 ? "Features:" : "",
    ...listing.features.map((f) => `- ${f}`),
    "",
    listing.tags.length > 0 ? `Tags: ${listing.tags.join(", ")}` : "",
    "",
    "SEO:",
    `  title:       ${listing.seoTitle}`,
    `  description: ${listing.seoDescription}`,
    "",
    `Targeting: ${listing.platforms.join(", ")}`,
    `Image slots reserved: ${listing.imageSlots}`,
  ];
  return lines.filter((l) => l !== null).join("\n");
}

export function allListingsToJson(): string {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    listings:   getListings(),
  }, null, 2);
}

export function downloadString(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function safeFilename(name: string, ext: string): string {
  const base = (name || "listing").replace(/[<>:"/\\|?*\s]+/g, "_").slice(0, 40) || "listing";
  return `${base}.${ext}`;
}
