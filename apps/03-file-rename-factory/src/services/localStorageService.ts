/**
 * localStorageService.ts
 * All data is stored in browser localStorage — entirely local, zero cloud.
 */

import type { RenameSession, AppSettings } from "../types";

const KEYS = {
  SETTINGS: "filerename_settings",
  HISTORY:  "filerename_history",
  STATS:    "filerename_stats",
  FIRST_USE: "filerename_first_use",
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
  theme:       "dark",
  saveHistory: true,
  privacyMode: false,
  showWelcome: true,
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

// ── History (rename sessions) ─────────────────────────────────────────────────

export function getHistory(): RenameSession[] {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addSession(session: RenameSession): void {
  if (!getSettings().saveHistory) return;
  const hist = [session, ...getHistory()].slice(0, 500);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(hist));
  incrementStat("sessionsApplied");
  incrementStat("filesRenamed", session.fileCount);
}

export function updateSession(id: string, patch: Partial<RenameSession>): void {
  const hist = getHistory().map((h) => h.id === id ? { ...h, ...patch } : h);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(hist));
}

export function deleteSession(id: string): void {
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(getHistory().filter((h) => h.id !== id)));
}

export function clearHistory(): void {
  localStorage.removeItem(KEYS.HISTORY);
}

export function searchHistory(q: string): RenameSession[] {
  const lq = q.toLowerCase();
  return getHistory().filter(
    (h) => h.samples.some((s) => s.from.toLowerCase().includes(lq) || s.to.toLowerCase().includes(lq))
        || h.rules.some((r) => r.summary.toLowerCase().includes(lq))
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface AppStats {
  sessionsApplied: number;
  filesRenamed:    number;
  rulesUsed:       number;
}

const DEFAULT_STATS: AppStats = { sessionsApplied: 0, filesRenamed: 0, rulesUsed: 0 };

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
