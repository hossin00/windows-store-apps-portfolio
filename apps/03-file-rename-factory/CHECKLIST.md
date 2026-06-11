# File Rename Factory — Store Readiness Checklist

## Build Status
- [x] npm install passes
- [x] npm run build passes (frontend)
- [ ] tauri build passes — requires Rust (https://rustup.rs)

## UI Status
- [x] Dashboard page — stats, quick actions, rule type grid, recent sessions
- [x] Workspace — file list, rule pipeline, live preview, apply, export, undo
- [x] History — search, expand, mark-undone, mark-redone, delete
- [x] Settings — theme, save history, privacy mode, data clear
- [x] Privacy page — detailed local-first explanation
- [x] About page — app info, rule list, technical notes
- [x] Help page — FAQ, usage guide, support
- [x] Sidebar navigation works
- [x] Dark/Light/System theme toggle
- [x] Toast notifications
- [x] Empty states (no files, no rules, no history)
- [x] Error and collision states in preview table

## Services Status
- [x] renameService.ts — real engine for all nine rule types
- [x] renameService.ts — collision and Windows-illegal-character detection
- [x] renameService.ts — Tauri FS API integration recipe documented in file header
- [x] renameService.ts — CSV plan export
- [x] localStorageService.ts — settings, session history, stats

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
- [x] App reads only file names, never file contents

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

## Next Steps Before App 04
1. Test full build on Windows: npm run build (done)
2. Test Tauri desktop: npm run tauri:dev (after Rust install)
3. Add Rust rename_file command per renameService.ts top-of-file recipe
4. Generate app icon using icon_prompt.md
5. Take 6 screenshots using screenshots_prompt.md
6. Submit to Microsoft Partner Center
