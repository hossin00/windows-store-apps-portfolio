// ─── Core domain types for QR Barcode Studio ─────────────────────────────────

export type Theme = "dark" | "light" | "system";

export type ExportFormat = "png" | "svg";

// ── QR ────────────────────────────────────────────────────────────────────────

export type QrInputType = "url" | "text" | "wifi" | "vcard" | "email";
export type QrErrorLevel = "L" | "M" | "Q" | "H";

export interface QrUrlData    { kind: "url";   url: string; }
export interface QrTextData   { kind: "text";  text: string; }
export interface QrWifiData   { kind: "wifi";  ssid: string; password: string; security: "WPA" | "WEP" | "nopass"; hidden: boolean; }
export interface QrVCardData  { kind: "vcard"; firstName: string; lastName: string; phone: string; email: string; organization: string; }
export interface QrEmailData  { kind: "email"; to: string; subject: string; body: string; }

export type QrInput = QrUrlData | QrTextData | QrWifiData | QrVCardData | QrEmailData;

export interface QrOptions {
  size:        number;          // pixel size of the rendered canvas
  fg:          string;          // foreground hex
  bg:          string;          // background hex
  errorLevel:  QrErrorLevel;
}

// ── Barcode ──────────────────────────────────────────────────────────────────

export type BarcodeFormat = "CODE128" | "EAN13" | "EAN8" | "UPC" | "CODE39";

export interface BarcodeOptions {
  width:        number;         // bar width in px (jsbarcode "width")
  height:       number;         // bar height in px
  fg:           string;
  bg:           string;
  displayValue: boolean;
}

// ── History (saved generated codes) ──────────────────────────────────────────

export type HistoryKind = "qr" | "barcode";

export interface HistoryEntry {
  id:        string;
  kind:      HistoryKind;
  title:     string;          // human label (first 60 chars of payload)
  content:   string;          // exact payload encoded
  // type-specific snapshots so we can re-open and edit
  qrInput?:        QrInput;
  qrOptions?:      QrOptions;
  barcodeFormat?:  BarcodeFormat;
  barcodeValue?:   string;
  barcodeOptions?: BarcodeOptions;
  thumbnailDataUrl: string;   // small PNG for the history list thumbnail
  createdAt: string;
}

// ── Settings ─────────────────────────────────────────────────────────────────

export interface AppSettings {
  theme:               Theme;
  saveHistory:         boolean;
  privacyMode:         boolean;
  defaultExportFormat: ExportFormat;
  defaultQrSize:       number;
  defaultFg:           string;
  defaultBg:           string;
  showWelcome:         boolean;
}
