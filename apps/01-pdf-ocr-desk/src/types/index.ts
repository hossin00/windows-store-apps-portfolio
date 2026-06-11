// ─── Core domain types for PDF OCR Desk ──────────────────────────────────────

export type OCRStatus    = "waiting" | "processing" | "completed" | "failed";
export type ExportFormat = "txt" | "md" | "json";
export type Theme        = "dark" | "light" | "system";
export type FileType     = "image" | "pdf";

export interface OCRJob {
  id:             string;
  fileName:       string;
  fileType:       FileType;
  fileSize:       number;
  status:         OCRStatus;
  createdAt:      string;
  completedAt?:   string;
  extractedText?: string;
  errorMessage?:  string;
  previewUrl?:    string;
}

export interface OCRResult {
  id:          string;
  jobId:       string;
  text:        string;
  confidence?: number;   // 0–100, placeholder
  language?:   string;   // e.g. "en"
  wordCount:   number;
  charCount:   number;
  createdAt:   string;
}

export interface BatchQueueItem {
  id:            string;
  fileName:      string;
  fileType:      FileType;
  fileSize:      number;
  status:        OCRStatus;
  progress:      number;  // 0–100
  resultId?:     string;
  errorMessage?: string;
  file?:         File;    // not persisted
}

export interface HistoryEntry {
  id:            string;
  jobId:         string;
  fileName:      string;
  fileType:      FileType;
  extractedText: string;
  wordCount:     number;
  charCount:     number;
  createdAt:     string;
}

export interface ExportRecord {
  id:         string;
  resultId:   string;
  fileName:   string;
  format:     ExportFormat;
  exportedAt: string;
}

export interface AppSettings {
  theme:               Theme;
  saveHistory:         boolean;
  defaultExportFormat: ExportFormat;
  privacyMode:         boolean;
  ocrLanguage:         string;  // e.g. "eng" — Tesseract lang code placeholder
  defaultExportFolder: string;  // placeholder path
  showWelcome:         boolean;
}

// OCR engine abstractions
export interface OCREngineResult {
  text:       string;
  confidence: number;
  language:   string;
}

export interface OCRError {
  code:    "FILE_TOO_LARGE" | "UNSUPPORTED_FORMAT" | "ENGINE_ERROR" | "NO_TEXT_FOUND" | "UNKNOWN";
  message: string;
}
