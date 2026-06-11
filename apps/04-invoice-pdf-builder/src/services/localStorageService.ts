/**
 * localStorageService.ts
 * All data is stored in browser localStorage — entirely local, zero cloud.
 */

import type { Invoice, AppSettings, BusinessInfo } from "../types";

const KEYS = {
  SETTINGS: "invoice_settings",
  HISTORY:  "invoice_history",
  STATS:    "invoice_stats",
} as const;

// ── Settings ──────────────────────────────────────────────────────────────────

const EMPTY_BUSINESS: BusinessInfo = {
  name:      "Your Business Name",
  address:   "123 Example Street\nCity, ZIP\nCountry",
  email:     "hello@example.com",
  logoEmoji: "🧾",
};

const DEFAULT_SETTINGS: AppSettings = {
  theme:           "dark",
  saveHistory:     true,
  privacyMode:     false,
  defaultCurrency: "USD",
  defaultTaxRate:  0,
  invoicePrefix:   "INV-",
  nextInvoiceSeq:  1,
  business:        EMPTY_BUSINESS,
  showWelcome:     true,
};

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      business: { ...EMPTY_BUSINESS, ...(parsed.business ?? {}) },
    };
  } catch { return DEFAULT_SETTINGS; }
}

export function saveSettings(patch: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated: AppSettings = {
    ...current,
    ...patch,
    business: { ...current.business, ...(patch.business ?? {}) },
  };
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
}

export function nextInvoiceNumber(): string {
  const s    = getSettings();
  const seq  = s.nextInvoiceSeq;
  const next = seq + 1;
  saveSettings({ nextInvoiceSeq: next });
  return `${s.invoicePrefix}${String(seq).padStart(3, "0")}`;
}

export function peekInvoiceNumber(): string {
  const s = getSettings();
  return `${s.invoicePrefix}${String(s.nextInvoiceSeq).padStart(3, "0")}`;
}

// ── History (saved invoices) ──────────────────────────────────────────────────

export function getInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getInvoice(id: string): Invoice | undefined {
  return getInvoices().find((i) => i.id === id);
}

export function saveInvoice(invoice: Invoice): void {
  if (!getSettings().saveHistory) return;
  const others = getInvoices().filter((i) => i.id !== invoice.id);
  const updated = [{ ...invoice, updatedAt: new Date().toISOString() }, ...others].slice(0, 500);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
  // increment "saved" stat only on first save (rough heuristic — new id)
  if (others.length === getInvoices().length - 1) incrementStat("invoicesSaved");
}

export function deleteInvoice(id: string): void {
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(getInvoices().filter((i) => i.id !== id)));
}

export function clearInvoices(): void {
  localStorage.removeItem(KEYS.HISTORY);
}

export function searchInvoices(q: string): Invoice[] {
  const lq = q.toLowerCase();
  return getInvoices().filter(
    (i) => i.number.toLowerCase().includes(lq)
        || i.client.name.toLowerCase().includes(lq)
        || i.business.name.toLowerCase().includes(lq)
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface AppStats {
  invoicesSaved:    number;
  invoicesExported: number;
  lineItemsCreated: number;
}

const DEFAULT_STATS: AppStats = { invoicesSaved: 0, invoicesExported: 0, lineItemsCreated: 0 };

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

// ── Clear All ─────────────────────────────────────────────────────────────────

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
