# Clipboard Vault Pro — Store Readiness Checklist

## Build Status
- [x] npm install passes
- [x] npm run build passes (frontend)
- [ ] tauri build passes — requires Rust (https://rustup.rs)

## UI Status (premium from day one)
- [x] Splash screen on app start (2s, logo + name + progress bar)
- [x] 3-slide Onboarding overlay on first launch (skip / back / next / get started)
- [x] PageTransition fade between routes (150 ms)
- [x] Skeleton shimmer placeholders available for list/card loading
- [x] ActivityChart — 7-day SVG bar chart
- [x] Premium illustrations (clipboard stack, folder tabs, lock+shield, empty states)
- [x] Micro-interactions (btn-press, card-lift, nav-link)
- [x] Welcome banner with day count and time-of-day greeting

## Pages Status
- [x] Dashboard — stats, activity chart, quick actions, type breakdown, recent
- [x] Vault — Add form, auto-detect badge, list + grid views, expand, tag editor, pin/favourite/copy/delete
- [x] Collections — create, rename, delete, add/remove items, item counts
- [x] Search — query, type chips, pinned/favourite segments, collection select, date range, 4-mode sort
- [x] History — chronological, TXT/JSON export
- [x] Settings — theme, max items, auto-detect, privacy mode, clear data, storage size
- [x] Privacy page — detailed local-first explanation + sensitive snippets note
- [x] About page — features list, technical notes
- [x] Help page — 8-question FAQ
- [x] Sidebar navigation works
- [x] Dark/Light/System theme toggle
- [x] Toast notifications

## Services Status
- [x] clipboardService.ts — type detection (5 types), snippet CRUD, tag CRUD, collection CRUD
- [x] clipboardService.ts — filter+sort engine for Search page
- [x] clipboardService.ts — TXT and JSON export
- [x] clipboardService.ts — Tauri clipboard-manager integration recipe documented in file header

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
- [x] Manual capture only — no silent clipboard reading
- [x] Privacy mode toggle reserved for future auto-capture
- [x] User can clear all local data (Settings → Local Data)
- [x] Sensitive-snippets warning in Privacy + Help

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

## Next Steps Before App 07
1. Test full build on Windows: npm run build (done)
2. Test Tauri desktop: npm run tauri:dev (after Rust install)
3. Generate app icon using icon_prompt.md
4. Take 6 screenshots using screenshots_prompt.md
5. Submit to Microsoft Partner Center
