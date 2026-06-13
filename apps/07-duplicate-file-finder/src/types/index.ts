// ─── Core domain types for Duplicate File Finder ─────────────────────────────

export type Theme       = "dark" | "light" | "system";

export type CompareMode = "hash" | "name" | "size";
// "hash" — name+size fingerprint (in-browser simulation; see duplicateService.ts)
// "name" — group by exact filename only
// "size" — group by exact byte count only

export type AutoKeepMode = "newest" | "oldest" | "first";

export interface ScanFile {
  id:           string;
  name:         string;
  size:         number;
  lastModified: number;          // millis since epoch
  type:         string;          // MIME from File.type
  file:         File;            // raw browser File handle
  previewUrl?:  string;          // object URL when the file is an image
  selected:     boolean;         // selected for "would be deleted"
}

export interface DuplicateGroup {
  id:      string;
  kind:    CompareMode;
  key:     string;               // the matching fingerprint
  files:   ScanFile[];
}

export interface ScanSession {
  id:              string;
  startedAt:       string;
  finishedAt:      string;
  label:           string;       // user-supplied or generated label
  compareMode:     CompareMode;
  totalFiles:      number;
  totalSize:       number;
  groupCount:      number;
  duplicateCount:  number;       // total redundant files across all groups
  wastedSpace:     number;       // size that could be reclaimed (sum minus smallest in each group)
  recoveredSpace:  number;       // sum of file sizes that were marked-deleted
  filesRemoved:    number;
}

export interface AppSettings {
  theme:           Theme;
  compareMode:     CompareMode;
  minSizeKB:       number;       // skip files smaller than this
  showHidden:      boolean;
  privacyMode:     boolean;
  saveHistory:     boolean;
  showWelcome:     boolean;
}
