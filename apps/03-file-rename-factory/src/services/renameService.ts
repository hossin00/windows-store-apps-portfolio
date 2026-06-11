/**
 * renameService.ts
 *
 * The real rename engine. Each rule is a pure transform on a string.
 * Rules are applied in order. The extension is preserved (the engine only
 * transforms the base name); a rule can opt into touching the extension by
 * setting `targetsExtension: true` — currently none of the built-in rules do.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * Connecting the Tauri File System API
 * ────────────────────────────────────────────────────────────────────────────
 * When this app is bundled as a Tauri desktop application, the browser File
 * objects come without a real disk path, so we cannot rename in-place from the
 * web layer. To perform actual disk renames:
 *
 * 1. Pick files via the Tauri dialog plugin (returns full paths):
 *
 *      import { open } from "@tauri-apps/plugin-dialog";
 *      const paths = await open({ multiple: true });
 *
 * 2. Add a Rust command in src-tauri/src/lib.rs:
 *
 *      #[tauri::command]
 *      fn rename_file(from: String, to: String) -> Result<(), String> {
 *          std::fs::rename(&from, &to).map_err(|e| e.to_string())
 *      }
 *
 *      // register with .invoke_handler(tauri::generate_handler![rename_file])
 *
 * 3. Call it from the frontend, replacing the placeholder in `applyRenamePlan`:
 *
 *      import { invoke } from "@tauri-apps/api/core";
 *      await invoke("rename_file", { from: oldPath, to: newPath });
 *
 * For an actual undo, the Rust side should also expose `rename_file` in the
 * reverse direction (it is symmetric — just swap arguments).
 * ────────────────────────────────────────────────────────────────────────────
 */

import type {
  RenameRule, PreviewRow, InputFile, DateFormat, CaseMode,
} from "../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

export function splitExt(name: string): { base: string; ext: string } {
  const dot = name.lastIndexOf(".");
  if (dot <= 0 || dot === name.length - 1) return { base: name, ext: "" };
  return { base: name.slice(0, dot), ext: name.slice(dot) };
}

export function formatDate(d: Date, fmt: DateFormat): string {
  const y  = String(d.getFullYear());
  const m  = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  switch (fmt) {
    case "YYYY-MM-DD": return `${y}-${m}-${dd}`;
    case "YYYYMMDD":   return `${y}${m}${dd}`;
    case "YYYY_MM_DD": return `${y}_${m}_${dd}`;
    case "DD-MM-YYYY": return `${dd}-${m}-${y}`;
  }
}

function pad(n: number, digits: number): string {
  const s = String(n);
  if (s.length >= digits) return s;
  return "0".repeat(digits - s.length) + s;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toTitleCase(s: string): string {
  return s.replace(/\b([\p{L}\p{N}])([\p{L}\p{N}]*)/gu, (_, a: string, b: string) => a.toUpperCase() + b.toLowerCase());
}

function toSentenceCase(s: string): string {
  const lower = s.toLowerCase();
  return lower.replace(/(^|[.!?]\s+)([\p{L}])/gu, (_, p1: string, p2: string) => p1 + p2.toUpperCase());
}

function caseConvert(s: string, mode: CaseMode): string {
  switch (mode) {
    case "upper":    return s.toUpperCase();
    case "lower":    return s.toLowerCase();
    case "title":    return toTitleCase(s);
    case "sentence": return toSentenceCase(s);
  }
}

// ── Apply a single rule to a single base name ─────────────────────────────────

function applyRule(rule: RenameRule, base: string, ctx: { index: number; now: Date }): string {
  if (!rule.enabled) return base;
  switch (rule.kind) {
    case "prefix":
      return rule.text + base;
    case "suffix":
      return base + rule.text;
    case "numbering": {
      const n   = rule.startAt + ctx.index;
      const seq = pad(n, Math.max(1, rule.digits));
      return rule.position === "prefix"
        ? `${seq}${rule.separator}${base}`
        : `${base}${rule.separator}${seq}`;
    }
    case "date": {
      const d = formatDate(ctx.now, rule.format);
      return rule.position === "prefix"
        ? `${d}${rule.separator}${base}`
        : `${base}${rule.separator}${d}`;
    }
    case "replace": {
      if (!rule.find) return base;
      const flags = "g" + (rule.caseSensitive ? "" : "i");
      const re    = new RegExp(escapeRegex(rule.find), flags);
      return base.replace(re, rule.replaceWith);
    }
    case "regex": {
      try {
        const re = new RegExp(rule.pattern, rule.flags || "g");
        return base.replace(re, rule.replaceWith);
      } catch {
        return base; // invalid regex → no-op; UI surfaces the error separately
      }
    }
    case "case":
      return caseConvert(base, rule.mode);
    case "removeSpecial": {
      const allowed = `\\p{L}\\p{N}\\s_` + (rule.keepDashes ? "\\-" : "") + (rule.keepDots ? "\\." : "");
      const re      = new RegExp(`[^${allowed}]`, "gu");
      return base.replace(re, "");
    }
    case "trim": {
      let out = base.trim();
      if (rule.collapseSpaces) out = out.replace(/\s+/g, " ");
      return out;
    }
  }
}

// ── Build the preview rows for a file list ────────────────────────────────────

export function buildPreview(files: InputFile[], rules: RenameRule[]): PreviewRow[] {
  const now    = new Date();
  const rows: PreviewRow[] = [];
  const taken  = new Map<string, number>();   // newName → count, to detect collisions

  files.forEach((f, index) => {
    const { base, ext } = splitExt(f.name);
    let working = base;
    let ruleError: string | undefined;

    for (const rule of rules) {
      if (!rule.enabled) continue;
      if (rule.kind === "regex") {
        try { new RegExp(rule.pattern, rule.flags || "g"); }
        catch (e: any) { ruleError = `Invalid regex: ${e.message ?? "syntax error"}`; }
      }
      working = applyRule(rule, working, { index, now });
    }

    let finalName = working + ext;
    // sanitize forbidden filename characters for Windows (only flag, do not remove)
    const forbidden = /[<>:"/\\|?*]/.test(finalName);
    if (forbidden && !ruleError) ruleError = "Contains characters not allowed in Windows filenames";

    if (finalName.length === 0) {
      finalName = f.name;
      if (!ruleError) ruleError = "Rules removed the entire filename";
    }

    rows.push({
      id:           f.id,
      originalName: f.name,
      newName:      finalName,
      unchanged:    finalName === f.name,
      collision:    false,           // filled in below after counting
      error:        ruleError,
    });

    taken.set(finalName, (taken.get(finalName) ?? 0) + 1);
  });

  for (const row of rows) {
    if ((taken.get(row.newName) ?? 0) > 1) row.collision = true;
  }
  return rows;
}

// ── Apply (placeholder) ───────────────────────────────────────────────────────
// In the browser, we cannot actually rewrite the user's disk. We surface the
// plan as a session record and return it. The Tauri-bundled build should swap
// this implementation for the real `std::fs::rename` flow described at the top
// of this file.

export interface ApplyResult {
  ok:          boolean;
  renamed:     number;
  skipped:     number;
  collisions:  number;
  errors:      number;
  message:     string;
}

export function applyRenamePlan(rows: PreviewRow[]): ApplyResult {
  const collisions = rows.filter((r) => r.collision).length;
  const errors     = rows.filter((r) => r.error).length;
  const skipped    = rows.filter((r) => r.unchanged).length;
  const renamed    = rows.length - skipped - errors - collisions;
  return {
    ok:         errors === 0 && collisions === 0,
    renamed, skipped, collisions, errors,
    message:    errors > 0 || collisions > 0
      ? `Plan has ${errors} error(s) and ${collisions} collision(s) — resolve before disk apply.`
      : `Plan ready for ${renamed} rename(s). Disk apply runs through Tauri FS API.`,
  };
}

// ── Plan export (CSV) ─────────────────────────────────────────────────────────

export function rowsToCsv(rows: PreviewRow[]): string {
  const header = "original,new,unchanged,collision,error";
  const lines  = rows.map((r) => [
    csv(r.originalName), csv(r.newName),
    r.unchanged ? "1" : "0",
    r.collision ? "1" : "0",
    csv(r.error ?? ""),
  ].join(","));
  return [header, ...lines].join("\r\n");
}

function csv(v: string): string {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function downloadCsv(content: string, filename: string): void {
  const ab   = new TextEncoder().encode(content);
  const blob = new Blob([ab], { type: "text/csv;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Rule summary strings for history ──────────────────────────────────────────

export function summarizeRule(rule: RenameRule): string {
  if (!rule.enabled) return "(disabled)";
  switch (rule.kind) {
    case "prefix":        return `Add prefix "${rule.text}"`;
    case "suffix":        return `Add suffix "${rule.text}"`;
    case "numbering":     return `Number ${rule.position} from ${rule.startAt} (${rule.digits} digits)`;
    case "date":          return `Insert date ${rule.format} as ${rule.position}`;
    case "replace":       return `Replace "${rule.find}" → "${rule.replaceWith}"`;
    case "regex":         return `Regex /${rule.pattern}/${rule.flags || "g"} → "${rule.replaceWith}"`;
    case "case":          return `Case → ${rule.mode}`;
    case "removeSpecial": return `Remove special chars${rule.keepDots ? " (keep dots)" : ""}${rule.keepDashes ? " (keep dashes)" : ""}`;
    case "trim":          return `Trim whitespace${rule.collapseSpaces ? " + collapse" : ""}`;
  }
}

// ── Defaults (used when the user inserts a new rule) ──────────────────────────

export function defaultRule(kind: RenameRule["kind"], id: string): RenameRule {
  const base = { id, enabled: true };
  switch (kind) {
    case "prefix":        return { ...base, kind: "prefix",        text: "new-" };
    case "suffix":        return { ...base, kind: "suffix",        text: "-edited" };
    case "numbering":     return { ...base, kind: "numbering",     position: "prefix", startAt: 1, digits: 3, separator: "-" };
    case "date":          return { ...base, kind: "date",          position: "prefix", format: "YYYY-MM-DD", separator: "_" };
    case "replace":       return { ...base, kind: "replace",       find: "", replaceWith: "", caseSensitive: false };
    case "regex":         return { ...base, kind: "regex",         pattern: "", replaceWith: "", flags: "g" };
    case "case":          return { ...base, kind: "case",          mode: "lower" };
    case "removeSpecial": return { ...base, kind: "removeSpecial", keepDots: true, keepDashes: true };
    case "trim":          return { ...base, kind: "trim",          collapseSpaces: true };
  }
}
