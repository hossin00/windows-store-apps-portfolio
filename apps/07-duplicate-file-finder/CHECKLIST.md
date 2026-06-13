# Duplicate File Finder — Store Readiness Checklist

## Build Status
- [x] npm install passes
- [x] npm run build passes (frontend)
- [ ] tauri build passes — requires Rust

## UI Status (premium from day one)
- [x] Splash screen on app start (2s, logo + name + progress bar)
- [x] 3-slide Onboarding overlay (twin files / review checklist / disk freed)
- [x] PageTransition fade between routes (150 ms)
- [x] Skeleton shimmer placeholders available
- [x] ActivityChart — 7-day SVG bar chart
- [x] Premium illustrations (twin files, checklist, disk free, empty folder+magnifier, all-clean, empty history)
- [x] Micro-interactions (btn-press, card-lift, nav-link)
- [x] Welcome banner with day count and time-of-day greeting

## Pages Status
- [x] Dashboard — welcome, 4 stats, activity chart, quick actions, recent scans
- [x] Scanner — dropzone, compare-mode picker, 4-pill summary, auto-select, manual toggle, file tiles with thumbnails
- [x] Results — current-scan summary, donut chart, legend, saved-session picker
- [x] History — search, per-session card with all stats, delete
- [x] Settings — theme, compare mode, min size, show hidden, save history, privacy mode, clear data
- [x] Privacy page — local-first explanation + plan-then-apply note
- [x] About page — features list, technical notes
- [x] Help page — 8-question FAQ
- [x] Sidebar navigation works
- [x] Dark/Light/System theme toggle
- [x] Toast notifications

## Services Status
- [x] duplicateService.ts — ingest, filter, three group modes, auto-select, manual toggle
- [x] duplicateService.ts — totals (wasted, will-free, duplicate count) and image preview URLs
- [x] duplicateService.ts — saved ScanSession history with CSV / JSON export
- [x] duplicateService.ts — Tauri integration recipe documented in file header

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
- [x] No ads
- [x] No tracking by default
- [x] No account required
- [x] File contents never read in the browser build
- [x] Plan-then-apply safety — never silent deletion
- [x] User can clear all local data (Settings → Local Data)
- [x] Privacy mode toggle

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

## Next Steps Before App 08
1. Test full build on Windows: npm run build (done)
2. Test Tauri desktop: npm run tauri:dev (after Rust install)
3. Generate app icon using icon_prompt.md
4. Take 6 screenshots using screenshots_prompt.md
5. Submit to Microsoft Partner Center
