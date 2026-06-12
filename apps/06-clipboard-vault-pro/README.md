# Clipboard Vault Pro

> App 06 in the KART L Windows Store Apps Portfolio
> Premium Windows desktop snippet vault with auto type detection, tags, collections, and search.

---

## Setup (PowerShell — from portfolio root)

```powershell
.\scripts\install-app.ps1 -AppSlug "06-clipboard-vault-pro"
.\scripts\run-app.ps1     -AppSlug "06-clipboard-vault-pro"
.\scripts\build-app.ps1   -AppSlug "06-clipboard-vault-pro"
.\scripts\check-app.ps1   -AppSlug "06-clipboard-vault-pro"
```

Or directly:

```powershell
cd apps\06-clipboard-vault-pro
npm install
npm run dev        # http://localhost:1425
npm run build      # dist/
```

---

## Features

| Feature | Status |
|---------|--------|
| Add snippet via text area + Add button | ✅ |
| Auto-detection (URL / Email / Code / Phone / Text) | ✅ |
| Title (optional, editable) + tags (editable) | ✅ |
| Pin to top | ✅ |
| Favourite | ✅ |
| Quick copy button + copy counter | ✅ |
| Grid / list view toggle | ✅ |
| Expand to see full content + char/word count | ✅ |
| Collections (many-to-many) — create, rename, delete | ✅ |
| Add / remove items per collection | ✅ |
| Search across content, title, tags | ✅ |
| Filter: type, pinned, favourite, collection, date range | ✅ |
| Sort: newest, oldest, most used, pinned first | ✅ |
| Full chronological History page | ✅ |
| Export all as TXT or JSON | ✅ |
| Settings: theme, max items, auto-detect, privacy, clear data, storage size | ✅ |
| Premium UI (splash, onboarding, page transitions, skeletons, activity chart, micro-interactions) | ✅ |
| Privacy / About / Help pages | ✅ |
| Tauri clipboard auto-capture | ⬜ Future paid tier — recipe in `src/services/clipboardService.ts` |

---

## Clipboard Engine

- `detectContentType(text)` — regex pipeline (URL → email → phone → code → text)
- `addSnippet / updateSnippet / deleteSnippet / togglePin / toggleFavorite / recordCopy`
- `createCollection / renameCollection / deleteCollection / addToCollection / removeFromCollection`
- `filterSnippets(filter)` — full filter + sort engine for the Search page
- `exportAsJson() / exportAsTxt()` — round-trip-safe JSON and human-readable TXT

The file's top comment block documents the exact Cargo / Rust / frontend wiring needed for the Tauri `clipboard-manager` plugin if you want OS-level auto-capture in a future build.

---

## Package Details

| Key | Value |
|-----|-------|
| App Number | 06 |
| App Slug | clipboard-vault-pro |
| Package ID | com.kartdev.clipboardvaultpro |
| Platform | Windows (Tauri + React + TypeScript) |
| Dev Port | 1425 |
| Accent | Violet `#8b5cf6` |
| Store | Microsoft Store |
| Price | Free at launch |

---

## Privacy

Snippets, collections, tags, and settings stay on your device. Manual capture only — the app never reads your OS clipboard silently. See `metadata/privacy_policy.md` for the full policy.
