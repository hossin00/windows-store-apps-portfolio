/**
 * localStorageService.ts
 * All data is stored in browser localStorage — entirely local, zero cloud.
 */

import type { HistoryEntry, AppSettings, ExportRecord } from "../types";

const KEYS = {
  SETTINGS:  "pdfocr_settings",
  HISTORY:   "pdfocr_history",
  EXPORTS:   "pdfocr_exports",
  STATS:     "pdfocr_stats",
} as const;

// ── Settings ──────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  theme:               "dark",
  saveHistory:         true,
  defaultExportFormat: "txt",
  privacyMode:         false,
  ocrLanguage:         "eng",
  defaultExportFolder: "",
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

export function addHistoryEntry(entry: HistoryEntry): void {
  if (!getSettings().saveHistory) return;
  const hist = [entry, ...getHistory()].slice(0, 500);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(hist));
  incrementStat("filesProcessed");
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
    (h) => h.fileName.toLowerCase().includes(lq) || h.extractedText.toLowerCase().includes(lq)
  );
}

// ── Export Records ────────────────────────────────────────────────────────────

export function getExportRecords(): ExportRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.EXPORTS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addExportRecord(record: ExportRecord): void {
  const recs = [record, ...getExportRecords()].slice(0, 200);
  localStorage.setItem(KEYS.EXPORTS, JSON.stringify(recs));
  incrementStat("textExports");
}

export function clearExportRecords(): void {
  localStorage.removeItem(KEYS.EXPORTS);
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface AppStats {
  filesProcessed: number;
  textExports:    number;
  batchJobsRun:   number;
}

const DEFAULT_STATS: AppStats = { filesProcessed: 0, textExports: 0, batchJobsRun: 0 };

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
