# File Rename Factory

> App 03 in the KART L Windows Store Apps Portfolio
> A professional Windows desktop utility for batch renaming files with a rule pipeline and live preview.

---

## Setup (PowerShell — from portfolio root)

```powershell
# Install dependencies
.\scripts\install-app.ps1 -AppSlug "03-file-rename-factory"

# Run in browser dev mode (no Rust required)
.\scripts\run-app.ps1 -AppSlug "03-file-rename-factory"

# Run as Tauri desktop app (requires Rust)
.\scripts\run-app.ps1 -AppSlug "03-file-rename-factory" -Tauri

# Build frontend only
.\scripts\build-app.ps1 -AppSlug "03-file-rename-factory"

# Build full Tauri .msi (requires Rust)
.\scripts\build-app.ps1 -AppSlug "03-file-rename-factory" -Tauri

# Check app structure
.\scripts\check-app.ps1 -AppSlug "03-file-rename-factory"

# Clean build output
.\scripts\clean-app.ps1 -AppSlug "03-file-rename-factory"
```

Or run directly from the app folder:

```powershell
cd apps\03-file-rename-factory
npm install
npm run dev        # browser dev on http://localhost:1422
npm run build      # frontend build to dist/
```

---

## Features

| Feature | Status |
|---------|--------|
| Drag & drop / click-to-browse file import (any type) | ✅ |
| Add prefix / suffix rules | ✅ |
| Auto numbering with custom start and digit width | ✅ |
| Insert date (YYYY-MM-DD, YYYYMMDD, etc.) | ✅ |
| Find & replace plain text | ✅ |
| Regex replace with custom flags | ✅ |
| Case convert (UPPER / lower / Title / Sentence) | ✅ |
| Remove special characters (keep dots / dashes) | ✅ |
| Trim and collapse whitespace | ✅ |
| Live preview with collision + error detection | ✅ |
| Rule reorder + enable toggle + delete | ✅ |
| CSV plan export | ✅ |
| Local rename session history with search | ✅ |
| Mark session undone / re-applied | ✅ |
| Dark / Light / System theme | ✅ |
| Privacy / About / Help / Settings pages | ✅ |
| Disk apply via Tauri FS API | ⬜ Placeholder — see `src/services/renameService.ts` |

---

## Rename Engine

The rename engine in `src/services/renameService.ts` is fully real:

- Each rule is a pure transform on the file's base name (the extension is preserved)
- Rules are applied in order; reordering rules changes the result
- `buildPreview()` returns a full table including collision detection and Windows-illegal-character flags
- `rowsToCsv()` exports the plan as a CSV for review or scripting

**Disk write integration:** the file's top comment block explains exactly how to wire a Rust `std::fs::rename` command for the Tauri-bundled desktop build.

---

## Package Details

| Key | Value |
|-----|-------|
| App Number | 03 |
| App Slug | file-rename-factory |
| Package ID | com.kartdev.filerenameFactory |
| Platform | Windows (Tauri + React + TypeScript) |
| Dev Port | 1422 |
| Store | Microsoft Store |
| Price | Free at launch |

---

## Privacy

Only file **names** are read — never file contents. No ads. No tracking. No account required.
See `metadata/privacy_policy.md` for full details.
