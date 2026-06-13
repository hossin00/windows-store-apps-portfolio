/**
 * duplicateService.ts
 *
 * Browser-side duplicate-detection engine. Groups dropped files by:
 *   - "hash"  — name + size fingerprint (in-browser simulation)
 *   - "name"  — exact filename only
 *   - "size"  — exact byte count only
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Why a name+size fingerprint?
 * ────────────────────────────────────────────────────────────────────────────
 * The browser File API does not expose real disk paths and cannot stream-read
 * gigabytes of data efficiently. Most real-world duplicates share both name
 * and exact byte length, so name+size is a strong heuristic for an in-browser
 * demo without reading file contents.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Connecting Tauri for real MD5 / SHA-256 hashing + folder scan + disk delete
 * ────────────────────────────────────────────────────────────────────────────
 *
 * 1. Add the file-system plugin in src-tauri/Cargo.toml:
 *
 *      tauri-plugin-fs    = "2"
 *      tauri-plugin-dialog = "2"
 *      sha2 = "0.10"
 *      walkdir = "2"
 *
 * 2. Add a Rust command in src-tauri/src/lib.rs:
 *
 *      use sha2::{Digest, Sha256};
 *      use std::fs::File;
 *      use std::io::{BufReader, Read};
 *      use walkdir::WalkDir;
 *
 *      #[tauri::command]
 *      fn hash_file(path: String) -> Result<String, String> {
 *        let f = File::open(&path).map_err(|e| e.to_string())?;
 *        let mut reader = BufReader::with_capacity(1 << 20, f);
 *        let mut hasher = Sha256::new();
 *        let mut buf = [0u8; 1 << 20];
 *        loop {
 *          let n = reader.read(&mut buf).map_err(|e| e.to_string())?;
 *          if n == 0 { break; }
 *          hasher.update(&buf[..n]);
 *        }
 *        Ok(format!("{:x}", hasher.finalize()))
 *      }
 *
 *      #[tauri::command]
 *      fn list_dir(path: String) -> Vec<(String, u64)> {
 *        WalkDir::new(path).into_iter().filter_map(|e| e.ok())
 *          .filter(|e| e.file_type().is_file())
 *          .filter_map(|e| {
 *            let meta = e.metadata().ok()?;
 *            Some((e.path().to_string_lossy().to_string(), meta.len()))
 *          }).collect()
 *      }
 *
 *      #[tauri::command]
 *      fn delete_file(path: String) -> Result<(), String> {
 *        std::fs::remove_file(path).map_err(|e| e.to_string())
 *      }
 *
 *      // register with .invoke_handler(tauri::generate_handler![hash_file, list_dir, delete_file])
 *
 * 3. Call from the frontend in this file's `groupFiles` to switch from
 *    name+size fingerprints to real SHA-256 hashes:
 *
 *      import { invoke } from "@tauri-apps/api/core";
 *      const hash = await invoke<string>("hash_file", { path });
 *
 *    And `applyDeletion` to actually remove files:
 *
 *      await invoke("delete_file", { path });
 *
 * In the browser-only build, `applyDeletion` returns a session record marked
 * as a simulation — files on disk are untouched.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { v4 as uuidv4 } from "uuid";
import type {
  ScanFile, DuplicateGroup, CompareMode, AutoKeepMode,
  AppSettings, ScanSession,
} from "../types";

const KEYS = {
  SETTINGS:  "dupefinder_settings",
  SESSIONS:  "dupefinder_sessions",
  STATS:     "dupefinder_stats",
  FIRST_USE: "dupefinder_first_use",
} as const;

// ── Settings ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  theme:       "dark",
  compareMode: "hash",
  minSizeKB:   0,
  showHidden:  true,
  privacyMode: false,
  saveHistory: true,
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

// ── File ingestion ───────────────────────────────────────────────────────────

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);

export function toScanFile(file: File): ScanFile {
  const isImage = IMAGE_TYPES.has(file.type);
  return {
    id:           uuidv4(),
    name:         file.name,
    size:         file.size,
    lastModified: file.lastModified,
    type:         file.type || "application/octet-stream",
    file,
    previewUrl:   isImage ? URL.createObjectURL(file) : undefined,
    selected:     false,
  };
}

export function isHidden(name: string): boolean {
  return name.startsWith(".");
}

export function applyFilters(files: ScanFile[], settings: AppSettings): ScanFile[] {
  const minBytes = settings.minSizeKB * 1024;
  return files.filter((f) => {
    if (!settings.showHidden && isHidden(f.name)) return false;
    if (f.size < minBytes) return false;
    return true;
  });
}

// ── Grouping ────────────────────────────────────────────────────────────────

function keyFor(file: ScanFile, mode: CompareMode): string {
  switch (mode) {
    case "hash": return `${file.name.toLowerCase()}::${file.size}`;
    case "name": return file.name.toLowerCase();
    case "size": return String(file.size);
  }
}

export function groupFiles(files: ScanFile[], mode: CompareMode): DuplicateGroup[] {
  const buckets = new Map<string, ScanFile[]>();
  for (const f of files) {
    const k = keyFor(f, mode);
    const arr = buckets.get(k);
    if (arr) arr.push(f);
    else buckets.set(k, [f]);
  }
  const groups: DuplicateGroup[] = [];
  for (const [k, arr] of buckets) {
    if (arr.length < 2) continue;
    // Newest first inside the group.
    arr.sort((a, b) => b.lastModified - a.lastModified);
    groups.push({ id: uuidv4(), kind: mode, key: k, files: arr });
  }
  // Largest waste first.
  groups.sort((a, b) => wastedSpaceForGroup(b) - wastedSpaceForGroup(a));
  return groups;
}

// ── Stats per group / session ───────────────────────────────────────────────

export function wastedSpaceForGroup(g: DuplicateGroup): number {
  // Reclaimable = total in group minus the one copy you keep (largest by default).
  if (g.files.length < 2) return 0;
  const total = g.files.reduce((s, f) => s + f.size, 0);
  const keep  = Math.max(...g.files.map((f) => f.size));
  return Math.max(0, total - keep);
}

export function totalWastedSpace(groups: DuplicateGroup[]): number {
  return groups.reduce((s, g) => s + wastedSpaceForGroup(g), 0);
}

export function selectedSize(groups: DuplicateGroup[]): number {
  let total = 0;
  for (const g of groups) for (const f of g.files) if (f.selected) total += f.size;
  return total;
}

export function duplicateCount(groups: DuplicateGroup[]): number {
  // Number of files that are "redundant" (everything except the first/kept copy in each group).
  return groups.reduce((s, g) => s + Math.max(0, g.files.length - 1), 0);
}

// ── Auto-select helpers ─────────────────────────────────────────────────────

/** Mark all but the "keep" file selected within each group. */
export function autoSelect(groups: DuplicateGroup[], mode: AutoKeepMode): DuplicateGroup[] {
  return groups.map((g) => {
    const sorted = g.files.slice().sort((a, b) => {
      if (mode === "newest") return b.lastModified - a.lastModified;
      if (mode === "oldest") return a.lastModified - b.lastModified;
      // first — keep insertion order, just keep index 0
      return 0;
    });
    const keepId = sorted[0]?.id;
    return {
      ...g,
      files: g.files.map((f) => ({ ...f, selected: f.id !== keepId })),
    };
  });
}

/** Clear every selection. */
export function clearSelections(groups: DuplicateGroup[]): DuplicateGroup[] {
  return groups.map((g) => ({ ...g, files: g.files.map((f) => ({ ...f, selected: false })) }));
}

/** Toggle one file's selection inside a group. */
export function toggleFile(groups: DuplicateGroup[], groupId: string, fileId: string): DuplicateGroup[] {
  return groups.map((g) => g.id !== groupId ? g : ({
    ...g, files: g.files.map((f) => f.id === fileId ? { ...f, selected: !f.selected } : f),
  }));
}

// ── "Delete" simulation + session save ──────────────────────────────────────

export interface ApplyResult {
  filesRemoved:   number;
  recoveredSpace: number;
  session:        ScanSession;
}

export function applyDeletion(opts: {
  files:        ScanFile[];          // every ingested file
  groups:       DuplicateGroup[];    // post-grouping, with selection flags
  compareMode:  CompareMode;
  label:        string;
}): ApplyResult {
  const now = new Date().toISOString();
  const selected = opts.groups.flatMap((g) => g.files.filter((f) => f.selected));
  const recoveredSpace = selected.reduce((s, f) => s + f.size, 0);
  const totalSize      = opts.files.reduce((s, f) => s + f.size, 0);
  const wastedSpace    = totalWastedSpace(opts.groups);

  const session: ScanSession = {
    id:             uuidv4(),
    startedAt:      now,
    finishedAt:     now,
    label:          opts.label || generateLabel(opts.files),
    compareMode:    opts.compareMode,
    totalFiles:     opts.files.length,
    totalSize,
    groupCount:     opts.groups.length,
    duplicateCount: duplicateCount(opts.groups),
    wastedSpace,
    recoveredSpace,
    filesRemoved:   selected.length,
  };

  saveSession(session);
  return { filesRemoved: selected.length, recoveredSpace, session };
}

function generateLabel(files: ScanFile[]): string {
  if (files.length === 0) return "Empty scan";
  return `${files.length} file${files.length !== 1 ? "s" : ""} · ${new Date().toLocaleString()}`;
}

// ── Sessions ────────────────────────────────────────────────────────────────

export function getSessions(): ScanSession[] {
  try {
    const raw = localStorage.getItem(KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getSession(id: string): ScanSession | undefined {
  return getSessions().find((s) => s.id === id);
}

export function saveSession(session: ScanSession): void {
  if (!getSettings().saveHistory) return;
  const all = [session, ...getSessions()].slice(0, 200);
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(all));
  incrementStat("sessionsRun");
  incrementStat("filesScanned",     session.totalFiles);
  incrementStat("duplicatesFound",  session.duplicateCount);
  incrementStat("spaceRecovered",   session.recoveredSpace);
}

export function deleteSession(id: string): void {
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(getSessions().filter((s) => s.id !== id)));
}

export function clearSessions(): void {
  localStorage.removeItem(KEYS.SESSIONS);
}

// ── Stats ────────────────────────────────────────────────────────────────────

export interface AppStats {
  sessionsRun:     number;
  filesScanned:    number;
  duplicatesFound: number;
  spaceRecovered:  number;     // bytes
}

const DEFAULT_STATS: AppStats = { sessionsRun: 0, filesScanned: 0, duplicatesFound: 0, spaceRecovered: 0 };

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

// ── Export — CSV / JSON ─────────────────────────────────────────────────────

export function groupsToCsv(groups: DuplicateGroup[]): string {
  const header = "group_id,group_key,group_kind,file_name,file_size_bytes,last_modified_iso,mime_type,selected_for_removal";
  const rows: string[] = [header];
  for (const g of groups) {
    for (const f of g.files) {
      rows.push([
        g.id, csv(g.key), g.kind, csv(f.name), String(f.size),
        new Date(f.lastModified).toISOString(),
        csv(f.type), f.selected ? "1" : "0",
      ].join(","));
    }
  }
  return rows.join("\r\n");
}

export function groupsToJson(groups: DuplicateGroup[]): string {
  const payload = groups.map((g) => ({
    id: g.id, key: g.key, kind: g.kind,
    files: g.files.map((f) => ({
      id: f.id, name: f.name, size: f.size,
      lastModified: new Date(f.lastModified).toISOString(),
      type: f.type, selected: f.selected,
    })),
    wastedSpace: wastedSpaceForGroup(g),
  }));
  return JSON.stringify({ exportedAt: new Date().toISOString(), groups: payload }, null, 2);
}

function csv(v: string): string {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
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

// ── Friendly formatting ─────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
