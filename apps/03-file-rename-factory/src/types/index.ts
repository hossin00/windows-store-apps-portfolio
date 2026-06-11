// ─── Core domain types for File Rename Factory ───────────────────────────────

export type Theme       = "dark" | "light" | "system";
export type CaseMode    = "upper" | "lower" | "title" | "sentence";
export type Position    = "prefix" | "suffix";
export type DateFormat  = "YYYY-MM-DD" | "YYYYMMDD" | "YYYY_MM_DD" | "DD-MM-YYYY";

export type RuleKind =
  | "prefix" | "suffix" | "numbering" | "date"
  | "replace" | "regex" | "case" | "removeSpecial" | "trim";

export interface BaseRule { id: string; kind: RuleKind; enabled: boolean; }

export interface PrefixRule        extends BaseRule { kind: "prefix";        text: string; }
export interface SuffixRule        extends BaseRule { kind: "suffix";        text: string; }
export interface NumberingRule     extends BaseRule { kind: "numbering";     position: Position; startAt: number; digits: number; separator: string; }
export interface DateRule          extends BaseRule { kind: "date";          position: Position; format: DateFormat; separator: string; }
export interface ReplaceRule       extends BaseRule { kind: "replace";       find: string; replaceWith: string; caseSensitive: boolean; }
export interface RegexRule         extends BaseRule { kind: "regex";         pattern: string; replaceWith: string; flags: string; }
export interface CaseRule          extends BaseRule { kind: "case";          mode: CaseMode; }
export interface RemoveSpecialRule extends BaseRule { kind: "removeSpecial"; keepDots: boolean; keepDashes: boolean; }
export interface TrimRule          extends BaseRule { kind: "trim";          collapseSpaces: boolean; }

export type RenameRule =
  | PrefixRule | SuffixRule | NumberingRule | DateRule
  | ReplaceRule | RegexRule | CaseRule | RemoveSpecialRule | TrimRule;

export interface InputFile {
  id:   string;
  name: string;
  size: number;
  type: string;
  file: File;
}

export interface PreviewRow {
  id:           string;
  originalName: string;
  newName:      string;
  unchanged:    boolean;
  collision:    boolean;
  error?:       string;
}

export interface RenameSession {
  id:        string;
  createdAt: string;
  fileCount: number;
  ruleCount: number;
  rules:     { kind: RuleKind; summary: string }[];
  samples:   { from: string; to: string }[];   // up to 5 samples
  applied:   boolean;                          // true after Apply was pressed
  undone:    boolean;                          // true if user later undid this session
}

export interface AppSettings {
  theme:       Theme;
  saveHistory: boolean;
  privacyMode: boolean;
  showWelcome: boolean;
}
