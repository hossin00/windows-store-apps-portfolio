# Duplicate File Finder

> App 07 in the KART L Windows Store Apps Portfolio
> Premium Windows desktop duplicate file finder with plan-then-apply safety, donut chart, and CSV/JSON exports.

---

## Setup (PowerShell — from portfolio root)

```powershell
.\scripts\install-app.ps1 -AppSlug "07-duplicate-file-finder"
.\scripts\run-app.ps1     -AppSlug "07-duplicate-file-finder"
.\scripts\build-app.ps1   -AppSlug "07-duplicate-file-finder"
```

Or directly:

```powershell
cd apps\07-duplicate-file-finder
npm install
npm run dev        # http://localhost:1426
npm run build      # dist/
```

---

## Features

| Feature | Status |
|---------|--------|
| Drag & drop + multi-file picker ingestion | ✅ |
| Group by hash (name + size), name only, or size only | ✅ |
| Per-group reclaim estimate | ✅ |
| Image preview thumbnails | ✅ |
| Live "will free" calculator | ✅ |
| Auto-select keep newest / oldest / first | ✅ |
| Toggle per-file removal manually | ✅ |
| Donut chart of redundant vs unique | ✅ |
| 4-stat results summary | ✅ |
| Export current scan as CSV or JSON | ✅ |
| Save scan plan to local history | ✅ |
| History page with search and delete | ✅ |
| Settings — theme, compare mode, min size, show hidden, privacy mode | ✅ |
| Premium UI (splash, onboarding, page transitions, skeletons, activity chart, micro-interactions) | ✅ |
| Privacy / About / Help pages | ✅ |
| Real Tauri folder scan + SHA-256 + delete | ⬜ Future paid tier — recipe in `src/services/duplicateService.ts` |

---

## Duplicate engine

`src/services/duplicateService.ts` ships with:

- `toScanFile(file)` — wraps a browser `File` with id, metadata, image preview URL, selection flag
- `applyFilters(files, settings)` — drops hidden files and files below the minimum size
- `groupFiles(files, mode)` — buckets by `hash` (name+size), `name`, or `size`
- `autoSelect(groups, mode)` — bulk-select keep newest / oldest / first
- `toggleFile / clearSelections` — per-file selection management
- `wastedSpaceForGroup / totalWastedSpace / selectedSize / duplicateCount` — running totals
- `applyDeletion(...)` — records the plan as a saved ScanSession in history (browser build is plan-only)
- `groupsToCsv / groupsToJson / downloadString` — export helpers
- `getSessions / saveSession / deleteSession / clearSessions` — local history
- `formatBytes` — friendly byte units

The file's top comment block walks through the exact Cargo / Rust / frontend wiring to swap the in-browser name+size fingerprint for content-level SHA-256 hashes and to call `std::fs::remove_file` in the Tauri desktop build.

---

## Package Details

| Key | Value |
|-----|-------|
| App Number | 07 |
| App Slug | duplicate-file-finder |
| Package ID | com.kartdev.duplicatefilefinder |
| Platform | Windows (Tauri + React + TypeScript) |
| Dev Port | 1426 |
| Accent | Red `#ef4444` |
| Store | Microsoft Store |
| Price | Free at launch |

---

## Privacy

Names and sizes only — no file contents are read in the browser build. Plan-then-apply: nothing is deleted without your confirmation in the desktop build, and never in the browser build. See `metadata/privacy_policy.md` for the full policy.
