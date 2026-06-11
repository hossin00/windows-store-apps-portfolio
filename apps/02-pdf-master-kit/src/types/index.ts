// ─── Core domain types for PDF Master Kit ────────────────────────────────────

export type Theme        = "dark" | "light" | "system";
export type SplitMode    = "pages" | "ranges" | "interval";
export type RotateAngle  = 90 | 180 | 270;
export type OperationKind =
  | "merge"
  | "split"
  | "compress"
  | "rotate"
  | "reorder"
  | "extract";

export interface PdfFileInfo {
  id:       string;
  name:     string;
  size:     number;
  pageCount: number;
  file:     File;
}

export interface HistoryEntry {
  id:           string;
  kind:         OperationKind;
  inputName:    string;
  outputName:   string;
  inputSize:    number;
  outputSize:   number;
  inputPages:   number;
  outputPages:  number;
  createdAt:    string;
  notes?:       string;
}

export interface AppSettings {
  theme:               Theme;
  saveHistory:         boolean;
  defaultFilenamePrefix: string;
  privacyMode:         boolean;
  autoDownload:        boolean;
  showWelcome:         boolean;
}

export interface PageEntry {
  id:        string;
  origIndex: number;       // 0-based original page index
  rotation:  number;       // total rotation degrees, normalized 0/90/180/270
}

export interface OperationError {
  code:    "FILE_TOO_LARGE" | "INVALID_PDF" | "PARSE_ERROR" | "EMPTY_RANGE" | "UNKNOWN";
  message: string;
}
