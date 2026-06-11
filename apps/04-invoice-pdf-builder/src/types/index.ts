// ─── Core domain types for Invoice PDF Builder ───────────────────────────────

export type Theme    = "dark" | "light" | "system";
export type Currency = "USD" | "EUR" | "GBP" | "MAD";

export interface BusinessInfo {
  name:      string;
  address:   string;
  email:     string;
  logoEmoji: string;   // simple emoji as logo placeholder
}

export interface ClientInfo {
  name:    string;
  address: string;
  email:   string;
}

export interface LineItem {
  id:          string;
  description: string;
  quantity:    number;
  unitPrice:   number;
}

export interface Invoice {
  id:        string;
  number:    string;     // e.g. "INV-001"
  issueDate: string;     // ISO yyyy-mm-dd
  dueDate:   string;
  business:  BusinessInfo;
  client:    ClientInfo;
  lineItems: LineItem[];
  taxRate:   number;     // percentage 0–100
  discount:  number;     // percentage 0–100
  currency:  Currency;
  notes:     string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceTotals {
  subtotal:    number;
  discountAmt: number;
  afterDiscount: number;
  taxAmt:      number;
  total:       number;
}

export interface AppSettings {
  theme:           Theme;
  saveHistory:     boolean;
  privacyMode:     boolean;
  defaultCurrency: Currency;
  defaultTaxRate:  number;
  invoicePrefix:   string;   // "INV-"
  nextInvoiceSeq:  number;   // auto-increment counter
  business:        BusinessInfo;
  showWelcome:     boolean;
}
