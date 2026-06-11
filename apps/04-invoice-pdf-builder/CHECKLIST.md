# Invoice PDF Builder — Store Readiness Checklist

## Build Status
- [x] npm install passes
- [x] npm run build passes (frontend)
- [ ] tauri build passes — requires Rust (https://rustup.rs)

## UI Status
- [x] Dashboard page — stats, quick actions, features grid, recent invoices
- [x] Editor — split form / live preview, real-time calculations
- [x] Editor — business info, client info, dates, line items, totals, notes
- [x] Editor — Save draft, Export PDF, New, Duplicate, Delete
- [x] History — search, edit, export, duplicate, delete
- [x] Settings — theme, default currency, default tax rate, prefix, sequence, default business profile
- [x] Privacy page — detailed local-first explanation
- [x] About page — features, technical notes
- [x] Help page — FAQ, usage guide, support
- [x] Sidebar navigation works
- [x] Dark/Light/System theme toggle
- [x] Toast notifications
- [x] Empty states (no invoices, no line items, no search results)
- [x] Orange/amber accent throughout (#f97316 / #ea580c)

## Services Status
- [x] invoiceService.ts — real totals math (subtotal, discount, tax, total)
- [x] invoiceService.ts — real PDF generation with pdf-lib (A4, embedded fonts, multi-page support)
- [x] invoiceService.ts — multi-currency formatting (USD, EUR, GBP, MAD)
- [x] invoiceService.ts — word-wrapped descriptions in PDF table
- [x] localStorageService.ts — settings, saved invoices, stats
- [x] localStorageService.ts — auto-increment invoice number

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

## Next Steps Before App 05
1. Test full build on Windows: npm run build (done)
2. Test Tauri desktop: npm run tauri:dev (after Rust install)
3. Generate app icon using icon_prompt.md
4. Take 6 screenshots using screenshots_prompt.md
5. Submit to Microsoft Partner Center
