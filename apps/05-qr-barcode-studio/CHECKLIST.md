# QR Barcode Studio — Store Readiness Checklist

## Build Status
- [x] npm install passes
- [x] npm run build passes (frontend)
- [ ] tauri build passes — requires Rust (https://rustup.rs)

## UI Status
- [x] Dashboard page — stats (4), quick actions (3), features grid, recent codes with thumbnails
- [x] QR Generator — type selector (5), per-type form, appearance options, live canvas preview
- [x] QR Generator — Save / Export PNG / Export SVG actions
- [x] Barcode Generator — format selector (5), validation messages, appearance options, live SVG preview
- [x] Barcode Generator — Save / Export PNG / Export SVG (gated by validation)
- [x] Batch — paste list, generate previews, download all as PNGs
- [x] History — thumbnail grid, search, edit / PNG / SVG / delete per row
- [x] Settings — theme, default export format, default QR size, default colours, history toggle, privacy mode, clear data
- [x] Privacy page — detailed local-first explanation + Wi-Fi QR specific note
- [x] About page — features list, technical notes
- [x] Help page — FAQ, usage guide, support
- [x] Sidebar navigation works
- [x] Dark/Light/System theme toggle
- [x] Toast notifications
- [x] Empty states (no codes, no batch results, no search results)
- [x] Emerald accent throughout (#10b981 / #059669)

## Services Status
- [x] qrService.ts — real QR generation with 5 payload encoders
- [x] qrService.ts — canvas, data URL, SVG outputs
- [x] qrService.ts — payload byte counter with capacity warning
- [x] barcodeService.ts — real 1D barcode generation with 5 formats
- [x] barcodeService.ts — per-format validation with clear reasons
- [x] barcodeService.ts — SVG live preview + PNG/SVG export
- [x] downloadService.ts — data URL / Blob downloads
- [x] localStorageService.ts — settings, history (with thumbnails), stats

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
- [x] Privacy mode toggle
- [x] Specific Wi-Fi QR warning in Privacy + Help

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

## Next Steps Before App 06
1. Test full build on Windows: npm run build (done)
2. Test Tauri desktop: npm run tauri:dev (after Rust install)
3. Generate app icon using icon_prompt.md
4. Take 6 screenshots using screenshots_prompt.md
5. Submit to Microsoft Partner Center
