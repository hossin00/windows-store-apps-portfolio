# PDF OCR Desk — Store Readiness Checklist

## Build Status
- [x] npm install passes
- [x] npm run build passes (frontend)
- [ ] tauri build passes — requires Rust (https://rustup.rs)

## UI Status
- [x] Dashboard page — stats, quick actions, recent jobs
- [x] OCR Workspace — file drop, preview, extraction, copy/export
- [x] Batch Queue — multi-file, progress bars, export all
- [x] History — search, expand, copy, export, delete
- [x] Export Center — bulk export TXT/JSON, per-entry export, log
- [x] Settings — theme, OCR language, history toggle, export format, data clear
- [x] Privacy page — detailed local-first explanation
- [x] About page — app info, features, technical notes
- [x] Help page — FAQ, usage guide, support
- [x] Sidebar navigation works
- [x] Dark/Light/System theme toggle
- [x] Toast notifications
- [x] Loading states (processing with progress bar)
- [x] Error states (OCR failed with retry)
- [x] Empty states (no history, no queue items)

## Services Status
- [x] ocrService.ts — mock engine + clean interface for real engine
- [x] localStorageService.ts — settings, history, stats, export records
- [x] exportService.ts — TXT, Markdown, JSON, batch TXT download

## Metadata Status
- [x] microsoft_store_metadata.md
- [x] privacy_policy.md
- [x] terms_of_use.md
- [x] icon_prompt.md
- [x] screenshots_prompt.md
- [x] feature_graphic_prompt.md
- [x] product_concept.md
- [x] paid_value_notes.md

## Privacy Compliance
- [x] No ads in the app
- [x] No tracking by default
- [x] No account required
- [x] User can clear all local data (Settings → Local Data)
- [x] Privacy page exists and is accurate
- [x] Privacy-first footer in sidebar

## Store Readiness
- [x] App title is Microsoft Store safe
- [x] Description has no fake claims
- [x] No "best", "#1", "top" claims anywhere
- [x] No copyrighted assets
- [x] No fake awards or ratings
- [ ] App icon prepared (300×300 PNG) — use icon_prompt.md
- [ ] Screenshots prepared (6 minimum) — use screenshots_prompt.md
- [ ] Feature graphic prepared — use feature_graphic_prompt.md
- [ ] Age rating determined (suggest: 3+)
- [ ] Tauri .msi bundle tested on target Windows version

## OCR Engine Status
- [x] Mock OCR engine working — realistic simulation with progress
- [ ] Real OCR engine integrated — see src/services/ocrService.ts for integration points
  - Option A: Tesseract.js (npm install tesseract.js)
  - Option B: Windows OCR API via Tauri sidecar
  - Option C: tauri-plugin-ocr

## Next Steps Before App 02
1. Test full build on Windows: npm run build
2. Test Tauri desktop: npm run tauri:dev (after Rust install)
3. Generate app icon using icon_prompt.md
4. Take 6 screenshots using screenshots_prompt.md
5. Connect real OCR engine (optional before Store submission)
6. Submit to Microsoft Partner Center
