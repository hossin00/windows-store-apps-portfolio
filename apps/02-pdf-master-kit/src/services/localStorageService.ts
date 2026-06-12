/**
 * localStorageService.ts
 * All data is stored in browser localStorage — entirely local, zero cloud.
 */

import type { HistoryEntry, AppSettings } from "../types";

const KEYS = {
  SETTINGS: "pdfmaster_settings",
  HISTORY:  "pdfmaster_history",
  STATS:    "pdfmaster_stats",
  FIRST_USE: "pdfmaster_first_use",
} as const;

// ── First-use date ────────────────────────────────────────────────────────────
export function getFirstUseDate(): string {
  try {
    let v = localStorage.getItem(KEYS.FIRST_USE);
    if (!v) {
      v = new Date().toISOString();
      localStorage.setItem(KEYS.FIRST_USE, v);
    }
    return v;
  } catch { return new Date().toISOString(); }
}

// ── Settings ──────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  theme:                 "dark",
  saveHistory:           true,
  defaultFilenamePrefix: "pdfmaster",
  privacyMode:           false,
  autoDownload:          true,
  showWelcome:           true,
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
  incrementStat("operationsRun");
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
    (h) => h.inputName.toLowerCase().includes(lq) || h.outputName.toLowerCase().includes(lq) || h.kind.includes(lq)
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface AppStats {
  operationsRun: number;
  pagesProcessed: number;
  filesProcessed: number;
}

const DEFAULT_STATS: AppStats = { operationsRun: 0, pagesProcessed: 0, filesProcessed: 0 };

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
