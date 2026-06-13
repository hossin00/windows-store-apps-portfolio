// ─── Core domain types for Product Listing Builder ───────────────────────────

export type Theme = "dark" | "light" | "system";

export type Currency = "USD" | "EUR" | "GBP" | "MAD" | "CAD" | "AUD";

export type Category =
  | "electronics" | "clothing" | "home" | "beauty"
  | "sports" | "books" | "food" | "other";

export type Condition = "new" | "used" | "refurbished";

export type Platform =
  | "amazon" | "ebay" | "etsy" | "shopify" | "woocommerce" | "generic";

export interface ProductListing {
  id:              string;
  name:            string;
  description:     string;
  category:        Category;
  price:           number;
  compareAtPrice:  number;    // 0 if not set
  currency:        Currency;
  sku:             string;
  condition:       Condition;
  features:        string[];           // bullet points
  tags:            string[];
  imageSlots:      number;             // 0–8 (placeholder count)
  seoTitle:        string;
  seoDescription:  string;
  platforms:       Platform[];         // targeted marketplaces
  businessName:    string;
  createdAt:       string;
  updatedAt:       string;
}

export interface Template {
  id:        string;
  name:      string;
  builtIn:   boolean;
  product:   Omit<ProductListing, "id" | "createdAt" | "updatedAt">;
  createdAt: string;
}

export interface AppSettings {
  theme:            Theme;
  defaultCurrency:  Currency;
  defaultPlatform:  Platform;
  defaultCondition: Condition;
  businessName:     string;
  saveHistory:      boolean;
  privacyMode:      boolean;
  showWelcome:      boolean;
}

// Platform-specific formatted output (computed, not stored).
export interface PlatformFormatted {
  platform:        Platform;
  displayTitle:    string;        // platform-constrained title
  formattedBody:   string;        // platform-friendly description
  warnings:        string[];      // soft warnings about length/format
}
