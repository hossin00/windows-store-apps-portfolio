/**
 * clipboardService.ts
 *
 * All snippet/collection storage, content-type detection, and filtering. Pure
 * functions plus localStorage CRUD — nothing leaves the device.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Connecting the Tauri clipboard-manager plugin (auto-capture)
 * ────────────────────────────────────────────────────────────────────────────
 * Out of the box this app is a manual vault: the user types or pastes into the
 * Add field. To auto-capture every OS clipboard change in the Tauri-bundled
 * desktop build, add the `tauri-plugin-clipboard-manager` plugin:
 *
 * 1. In src-tauri/Cargo.toml:
 *
 *      [dependencies]
 *      tauri-plugin-clipboard-manager = "2"
 *
 * 2. Register it in src-tauri/src/lib.rs:
 *
 *      tauri::Builder::default()
 *        .plugin(tauri_plugin_clipboard_manager::init())
 *        ...
 *
 * 3. From the frontend, poll `readText()` on an interval (e.g. 1.5s) and call
 *    `addSnippet({ content, type: detectContentType(content), ... })` whenever
 *    the text changes:
 *
 *      import { readText } from "@tauri-apps/plugin-clipboard-manager";
 *      let last = "";
 *      setInterval(async () => {
 *        const t = await readText();
 *        if (t && t !== last) {
 *          last = t;
 *          autoCaptureSnippet(t);
 *        }
 *      }, 1500);
 *
 * The `Privacy mode` setting in this app should gate auto-capture in any
 * future build that adds it. Wi-Fi passwords and bank cards live in the OS
 * clipboard too — guard the capture loop with explicit user consent.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { v4 as uuidv4 } from "uuid";
import type { Snippet, Collection, ContentType, SearchFilter, MaxItemsOption } from "../types";

// ── localStorage keys ────────────────────────────────────────────────────────

const KEYS = {
  SETTINGS:    "clipboard_settings",
  SNIPPETS:    "clipboard_snippets",
  COLLECTIONS: "clipboard_collections",
  STATS:       "clipboard_stats",
  FIRST_USE:   "clipboard_first_use",
} as const;

// ── Content-type auto-detection ──────────────────────────────────────────────

const URL_RE     = /^(https?:\/\/|www\.)\S+$/i;
const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE   = /^\+?[\d][\d\s\-().]{5,}\d$/;
const CODE_HINTS = /(\bfunction\s|\bconst\s|\blet\s|\bvar\s|\bclass\s|\bimport\s|\bexport\s|\breturn\s|=>|\{[\s\S]*\}|#include|<\?php|def\s+\w+\s*\(|public\s+(class|static)|<html|<\/\w+>)/;
const CODE_SYMS  = /[{};=]|<\/?\w+>/;

export function detectContentType(raw: string): ContentType {
  const text = raw.trim();
  if (text.length === 0) return "text";

  const oneLine = !text.includes("\n");

  if (oneLine && URL_RE.test(text))   return "url";
  if (oneLine && EMAIL_RE.test(text)) return "email";

  if (oneLine && PHONE_RE.test(text)) {
    // Reject phone-like strings that are clearly code (e.g. "1-2-3-4-5-6-7" is also a phone, allow)
    // We accept the regex match.
    return "phone";
  }

  // Code if there are multiple lines AND symbol density, OR explicit code hints anywhere.
  if (CODE_HINTS.test(text)) return "code";
  if (!oneLine && CODE_SYMS.test(text) && hasCodeShape(text)) return "code";

  return "text";
}

function hasCodeShape(text: string): boolean {
  // Counts braces, parens, semicolons relative to length. Anything >2% triggers.
  const symbols = (text.match(/[{};]/g) ?? []).length;
  return symbols / Math.max(1, text.length) > 0.02;
}

// ── Settings ─────────────────────────────────────────────────────────────────

import type { AppSettings } from "../types";

const DEFAULT_SETTINGS: AppSettings = {
  theme:           "dark",
  saveHistory:     true,
  privacyMode:     false,
  autoDetectTypes: true,
  maxItems:        "500",
  defaultView:     "list",
  showWelcome:     true,
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

export function maxItemsToCap(opt: MaxItemsOption): number {
  return opt === "unlimited" ? Number.MAX_SAFE_INTEGER : parseInt(opt, 10);
}

// ── First-use ────────────────────────────────────────────────────────────────

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

// ── Snippets CRUD ────────────────────────────────────────────────────────────

export function getSnippets(): Snippet[] {
  try {
    const raw = localStorage.getItem(KEYS.SNIPPETS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getSnippet(id: string): Snippet | undefined {
  return getSnippets().find((s) => s.id === id);
}

export interface NewSnippetInput {
  content:       string;
  title?:        string;
  tags?:         string[];
  collectionIds?: string[];
  pinned?:       boolean;
  favorite?:     boolean;
  type?:         ContentType;        // override detection
}

export function addSnippet(input: NewSnippetInput): Snippet {
  const settings = getSettings();
  const now      = new Date().toISOString();
  const detected = settings.autoDetectTypes ? detectContentType(input.content) : "text";
  const snippet: Snippet = {
    id:            uuidv4(),
    title:         input.title?.trim() ?? "",
    content:       input.content,
    type:          input.type ?? detected,
    manualType:    !!input.type,
    tags:          input.tags ?? [],
    pinned:        !!input.pinned,
    favorite:      !!input.favorite,
    collectionIds: input.collectionIds ?? [],
    copyCount:     0,
    createdAt:     now,
    updatedAt:     now,
  };

  const cap = maxItemsToCap(settings.maxItems);
  const all = [snippet, ...getSnippets()].slice(0, cap);
  localStorage.setItem(KEYS.SNIPPETS, JSON.stringify(all));
  incrementStat("snippetsCreated");
  incrementStat(`type_${snippet.type}` as keyof AppStats);
  return snippet;
}

export function updateSnippet(id: string, patch: Partial<Snippet>): Snippet | undefined {
  const all = getSnippets();
  const idx = all.findIndex((s) => s.id === id);
  if (idx < 0) return undefined;
  const next = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  all[idx] = next;
  localStorage.setItem(KEYS.SNIPPETS, JSON.stringify(all));
  return next;
}

export function deleteSnippet(id: string): void {
  localStorage.setItem(KEYS.SNIPPETS, JSON.stringify(getSnippets().filter((s) => s.id !== id)));
}

export function clearSnippets(): void {
  localStorage.removeItem(KEYS.SNIPPETS);
}

export function togglePin(id: string): void {
  const s = getSnippet(id);
  if (s) updateSnippet(id, { pinned: !s.pinned });
}

export function toggleFavorite(id: string): void {
  const s = getSnippet(id);
  if (s) updateSnippet(id, { favorite: !s.favorite });
}

export function recordCopy(id: string): void {
  const s = getSnippet(id);
  if (s) updateSnippet(id, { copyCount: s.copyCount + 1 });
  incrementStat("snippetsCopied");
}

// ── Tag helpers ──────────────────────────────────────────────────────────────

export function addTag(id: string, tag: string): void {
  const t = tag.trim().toLowerCase();
  if (!t) return;
  const s = getSnippet(id);
  if (!s) return;
  if (s.tags.includes(t)) return;
  updateSnippet(id, { tags: [...s.tags, t] });
}

export function removeTag(id: string, tag: string): void {
  const s = getSnippet(id);
  if (!s) return;
  updateSnippet(id, { tags: s.tags.filter((x) => x !== tag) });
}

export function allTags(): string[] {
  const set = new Set<string>();
  for (const s of getSnippets()) for (const t of s.tags) set.add(t);
  return Array.from(set).sort();
}

// ── Collections CRUD ─────────────────────────────────────────────────────────

export function getCollections(): Collection[] {
  try {
    const raw = localStorage.getItem(KEYS.COLLECTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getCollection(id: string): Collection | undefined {
  return getCollections().find((c) => c.id === id);
}

export function createCollection(name: string): Collection {
  const now = new Date().toISOString();
  const collection: Collection = { id: uuidv4(), name: name.trim() || "Untitled", createdAt: now, updatedAt: now };
  localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify([collection, ...getCollections()]));
  incrementStat("collectionsCreated");
  return collection;
}

export function renameCollection(id: string, name: string): void {
  const all  = getCollections();
  const next = all.map((c) => c.id === id ? { ...c, name: name.trim() || c.name, updatedAt: new Date().toISOString() } : c);
  localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify(next));
}

export function deleteCollection(id: string): void {
  // Remove the collection from each snippet's collectionIds, then delete it.
  const snippets = getSnippets().map((s) =>
    s.collectionIds.includes(id) ? { ...s, collectionIds: s.collectionIds.filter((c) => c !== id), updatedAt: new Date().toISOString() } : s);
  localStorage.setItem(KEYS.SNIPPETS, JSON.stringify(snippets));
  localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify(getCollections().filter((c) => c.id !== id)));
}

export function addToCollection(snippetId: string, collectionId: string): void {
  const s = getSnippet(snippetId);
  if (!s) return;
  if (s.collectionIds.includes(collectionId)) return;
  updateSnippet(snippetId, { collectionIds: [...s.collectionIds, collectionId] });
}

export function removeFromCollection(snippetId: string, collectionId: string): void {
  const s = getSnippet(snippetId);
  if (!s) return;
  updateSnippet(snippetId, { collectionIds: s.collectionIds.filter((c) => c !== collectionId) });
}

export function countInCollection(collectionId: string): number {
  return getSnippets().filter((s) => s.collectionIds.includes(collectionId)).length;
}

// ── Search & filter ──────────────────────────────────────────────────────────

export function filterSnippets(filter: SearchFilter): Snippet[] {
  const q = filter.query.trim().toLowerCase();
  let out = getSnippets().filter((s) => {
    if (q) {
      const blob = `${s.title}\n${s.content}\n${s.tags.join(" ")}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    if (filter.types.length > 0 && !filter.types.includes(s.type)) return false;
    if (filter.pinnedOnly && !s.pinned) return false;
    if (filter.favoritesOnly && !s.favorite) return false;
    if (filter.collectionId && !s.collectionIds.includes(filter.collectionId)) return false;
    if (filter.dateFromIso) {
      if (s.createdAt.slice(0, 10) < filter.dateFromIso) return false;
    }
    if (filter.dateToIso) {
      if (s.createdAt.slice(0, 10) > filter.dateToIso) return false;
    }
    return true;
  });

  switch (filter.sort) {
    case "newest":
      out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "oldest":
      out.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      break;
    case "most-used":
      out.sort((a, b) => b.copyCount - a.copyCount || b.createdAt.localeCompare(a.createdAt));
      break;
    case "pinned-first":
      out.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.createdAt.localeCompare(a.createdAt);
      });
      break;
  }
  return out;
}

// ── Stats ────────────────────────────────────────────────────────────────────

export interface AppStats {
  snippetsCreated:    number;
  snippetsCopied:     number;
  collectionsCreated: number;
  type_url:           number;
  type_email:         number;
  type_code:          number;
  type_phone:         number;
  type_text:          number;
}

const DEFAULT_STATS: AppStats = {
  snippetsCreated: 0, snippetsCopied: 0, collectionsCreated: 0,
  type_url: 0, type_email: 0, type_code: 0, type_phone: 0, type_text: 0,
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

// ── Export ───────────────────────────────────────────────────────────────────

export function exportAsJson(): string {
  const payload = {
    exportedAt:  new Date().toISOString(),
    settings:    getSettings(),
    collections: getCollections(),
    snippets:    getSnippets(),
  };
  return JSON.stringify(payload, null, 2);
}

export function exportAsTxt(): string {
  const snippets = getSnippets();
  const lines: string[] = [
    `# Clipboard Vault Pro export — ${new Date().toISOString()}`,
    `# ${snippets.length} snippet(s)`,
    "",
  ];
  for (const s of snippets) {
    lines.push(`## ${s.title || "(untitled)"}  [${s.type}]`);
    if (s.tags.length > 0) lines.push(`tags: ${s.tags.join(", ")}`);
    lines.push(`created: ${s.createdAt}`);
    lines.push("");
    lines.push(s.content);
    lines.push("");
    lines.push("---");
    lines.push("");
  }
  return lines.join("\n");
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
