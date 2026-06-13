# Product Listing Builder — Store Readiness Checklist

## Build Status
- [x] npm install passes
- [x] npm run build passes (frontend)
- [ ] tauri build passes — requires Rust

## UI Status (premium from day one)
- [x] Splash screen on app start
- [x] 3-slide Onboarding overlay (product card / platforms / publish everywhere)
- [x] PageTransition fade between routes
- [x] Skeleton shimmer placeholders available
- [x] ActivityChart — 7-day SVG bar chart
- [x] Premium illustrations (product card + tag, platform windows, publish arrows, empty listings/templates/bulk)
- [x] Micro-interactions (btn-press, card-lift, nav-link)
- [x] Welcome banner with day count

## Pages Status
- [x] Dashboard — welcome, 4 stats, activity chart, quick actions, recent listings
- [x] Editor — split form / per-platform preview, SEO scorer, feature reorder, image slot grid
- [x] Listings — search, 3 filters, 4 sort modes, per-row Edit/Duplicate/TXT/JSON/Delete
- [x] Bulk — CSV template, parse preview table, generate all, export batch JSON
- [x] Templates — 3 built-in + user-saved, use / delete
- [x] Settings — theme, default currency / platform / condition / business name, history, privacy
- [x] Privacy page — local-first explanation + marketplace API note
- [x] About page — features list, technical notes
- [x] Help page — 8-question FAQ
- [x] Sidebar navigation works
- [x] Dark/Light/System theme toggle
- [x] Toast notifications

## Services Status
- [x] listingService.ts — listing CRUD + tag/feature helpers
- [x] listingService.ts — per-platform formatter (6 marketplaces) with title-cap warnings
- [x] listingService.ts — SEO scorer (5 parts, suggestions, 0–100 total)
- [x] listingService.ts — CSV importer (pipe-separated cells, validation warnings)
- [x] listingService.ts — TXT and JSON exports per listing + batch JSON
- [x] listingService.ts — 3 built-in templates + user templates CRUD
- [x] listingService.ts — Tauri marketplace API integration recipe in file header

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
- [x] No marketplace API contacted in this version
- [x] User can clear all local data (Settings → Local Data)
- [x] Privacy page exists and is accurate
- [x] Privacy mode toggle reserved for future API integrations

## Store Readiness
- [x] App title is Microsoft Store safe
- [x] Description has no fake claims
- [x] No marketplace trademarks used in icon / screenshots
- [x] No "best", "#1", "top" claims anywhere
- [x] No copyrighted assets
- [x] No fake awards or ratings
- [ ] App icon prepared (300×300 PNG) — use icon_prompt.md
- [ ] Screenshots prepared (6 minimum) — use screenshots_prompt.md
- [ ] Feature graphic prepared — use feature_graphic_prompt.md
- [ ] Age rating determined (suggest: 3+)
- [ ] Tauri .msi bundle tested on target Windows version

## Next Steps Before App 09
1. Test full build on Windows: npm run build (done)
2. Test Tauri desktop: npm run tauri:dev (after Rust install)
3. Generate app icon using icon_prompt.md
4. Take 6 screenshots using screenshots_prompt.md
5. Submit to Microsoft Partner Center
