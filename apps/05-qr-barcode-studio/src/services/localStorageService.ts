/**
 * localStorageService.ts
 * All data is stored in browser localStorage — entirely local, zero cloud.
 */

import type { HistoryEntry, AppSettings } from "../types";

const KEYS = {
  SETTINGS: "qrbar_settings",
  HISTORY:  "qrbar_history",
  STATS:    "qrbar_stats",
} as const;

// ── Settings ──────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  theme:               "dark",
  saveHistory:         true,
  privacyMode:         false,
  defaultExportFormat: "png",
  defaultQrSize:       512,
  defaultFg:           "#000000",
  defaultBg:           "#ffffff",
  showWelcome:         true,
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

// ── History ───────────────────────────────────────────────────────────────────

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getHistoryEntry(id: string): HistoryEntry | undefined {
  return getHistory().find((h) => h.id === id);
}

export function addHistoryEntry(entry: HistoryEntry): void {
  if (!getSettings().saveHistory) return;
  // Cap at 200 entries — thumbnails can be heavy in localStorage.
  const hist = [entry, ...getHistory()].slice(0, 200);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(hist));
  incrementStat("codesGenerated");
  if (entry.kind === "qr") incrementStat("qrCodes");
  else                     incrementStat("barcodes");
}

export function deleteHistoryEntry(id: string): void {
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(getHistory().filter((h) => h.id !== id)));
}

export function clearHistory(): void {
  localStorage.removeItem(KEYS.HISTORY);
}

export function searchHistory(q: string): HistoryEntry[] {
  const lq = q.toLowerCase();
  return getHistory().filter(
    (h) => h.title.toLowerCase().includes(lq)
        || h.content.toLowerCase().includes(lq)
        || h.kind.includes(lq)
        || (h.barcodeFormat ?? "").toLowerCase().includes(lq)
        || (h.qrInput?.kind ?? "").toLowerCase().includes(lq)
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface AppStats {
  codesGenerated: number;
  qrCodes:        number;
  barcodes:       number;
  batchRuns:      number;
}

const DEFAULT_STATS: AppStats = { codesGenerated: 0, qrCodes: 0, barcodes: 0, batchRuns: 0 };

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
