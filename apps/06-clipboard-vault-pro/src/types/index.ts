// ─── Core domain types for Clipboard Vault Pro ───────────────────────────────

export type Theme = "dark" | "light" | "system";

export type ContentType = "url" | "email" | "code" | "phone" | "text";

export type MaxItemsOption = "100" | "500" | "1000" | "unlimited";

export type ViewMode = "list" | "grid";

export type SortMode =
  | "newest"
  | "oldest"
  | "most-used"
  | "pinned-first";

export interface Snippet {
  id:            string;
  title:         string;
  content:       string;
  type:          ContentType;     // auto-detected unless overridden manually
  manualType:    boolean;         // true if user overrode the detected type
  tags:          string[];
  pinned:        boolean;
  favorite:      boolean;
  collectionIds: string[];        // collections this snippet belongs to
  copyCount:     number;
  createdAt:     string;
  updatedAt:     string;
}

export interface Collection {
  id:        string;
  name:      string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme:           Theme;
  saveHistory:     boolean;
  privacyMode:     boolean;
  autoDetectTypes: boolean;
  maxItems:        MaxItemsOption;
  defaultView:     ViewMode;
  showWelcome:     boolean;
}

export interface SearchFilter {
  query:         string;
  types:         ContentType[];
  pinnedOnly:    boolean;
  favoritesOnly: boolean;
  collectionId:  string | null;
  dateFromIso:   string | null;   // yyyy-mm-dd
  dateToIso:     string | null;   // yyyy-mm-dd
  sort:          SortMode;
}
