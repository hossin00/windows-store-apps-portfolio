# PDF Master Kit — Store Readiness Checklist

## Build Status
- [x] npm install passes
- [x] npm run build passes (frontend)
- [ ] tauri build passes — requires Rust (https://rustup.rs)

## UI Status
- [x] Dashboard page — stats, quick actions, recent operations
- [x] Merge page — multi-file, reorder, total stats, real merge
- [x] Split page — by pages / ranges / interval
- [x] Compress page — re-save with object streams, size delta
- [x] Rotate page — all pages or per-page cycling
- [x] Reorder page — drag-and-drop, arrows, per-page rotate
- [x] Extract page — click-to-pick grid and typed page list
- [x] History — search, expand, delete
- [x] Settings — theme, filename prefix, auto-download, privacy, data clear
- [x] Privacy page — detailed local-first explanation
- [x] About page — app info, features, technical notes
- [x] Help page — FAQ, usage guide, support
- [x] Sidebar navigation works
- [x] Dark/Light/System theme toggle
- [x] Toast notifications
- [x] Loading states (busy buttons during operations)
- [x] Empty states (no file picked, no history)

## Services Status
- [x] pdfService.ts — real pdf-lib backed merge / split / compress / rotate / reorder / extract
- [x] localStorageService.ts — settings, history, stats

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

## Next Steps Before App 03
1. Test full build on Windows: npm run build (done)
2. Test Tauri desktop: npm run tauri:dev (after Rust install)
3. Generate app icon using icon_prompt.md
4. Take 6 screenshots using screenshots_prompt.md
5. Submit to Microsoft Partner Center
