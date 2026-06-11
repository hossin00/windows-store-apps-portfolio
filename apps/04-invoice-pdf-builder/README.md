# Invoice PDF Builder

> App 04 in the KART L Windows Store Apps Portfolio
> A professional Windows desktop utility for creating invoices with a live preview and a real PDF export.

---

## Setup (PowerShell — from portfolio root)

```powershell
# Install dependencies
.\scripts\install-app.ps1 -AppSlug "04-invoice-pdf-builder"

# Run in browser dev mode (no Rust required)
.\scripts\run-app.ps1 -AppSlug "04-invoice-pdf-builder"

# Run as Tauri desktop app (requires Rust)
.\scripts\run-app.ps1 -AppSlug "04-invoice-pdf-builder" -Tauri

# Build frontend only
.\scripts\build-app.ps1 -AppSlug "04-invoice-pdf-builder"

# Build full Tauri .msi (requires Rust)
.\scripts\build-app.ps1 -AppSlug "04-invoice-pdf-builder" -Tauri
```

Or run directly from the app folder:

```powershell
cd apps\04-invoice-pdf-builder
npm install
npm run dev        # browser dev on http://localhost:1423
npm run build      # frontend build to dist/
```

---

## Features

| Feature | Status |
|---------|--------|
| Business info form (name, address, email, emoji logo) | ✅ |
| Client info form | ✅ |
| Invoice number auto-increment with editable prefix | ✅ |
| Issue + due date pickers | ✅ |
| Line items table (description, qty, unit price, total) | ✅ |
| Add / remove / reorder line items | ✅ |
| Subtotal, tax %, discount %, grand total | ✅ |
| Notes / payment terms | ✅ |
| Multi-currency (USD, EUR, GBP, MAD) | ✅ |
| Live HTML preview as you type | ✅ |
| Real PDF export with pdf-lib | ✅ |
| Save draft → local storage | ✅ |
| Load saved invoice for re-edit | ✅ |
| Duplicate invoice | ✅ |
| Delete invoice | ✅ |
| Invoice history with search | ✅ |
| Default business profile in Settings | ✅ |
| Dark / Light / System theme | ✅ |
| Privacy / About / Help pages | ✅ |
| Native Tauri save dialog | ⬜ Future paid tier |

---

## Invoice Engine

The invoice math and PDF generation live in `src/services/invoiceService.ts`:

- `calcTotals(invoice)` — subtotal, discount amount, after-discount, tax amount, grand total. All rounded to 2dp.
- `generateInvoicePdf(invoice)` — produces a real A4 PDF with embedded Helvetica fonts, header band, From / To columns, dates strip, line item table with word wrapping, totals box, and notes. Pages overflow gracefully.
- `formatMoney(amount, currency)` — handles USD, EUR, GBP, MAD.
- `downloadPdf(bytes, filename)` — browser download via Blob.

The live preview component in `src/components/InvoicePreview.tsx` shares the layout philosophy and updates as you type — no debouncing, no async cost.

---

## Package Details

| Key | Value |
|-----|-------|
| App Number | 04 |
| App Slug | invoice-pdf-builder |
| Package ID | com.kartdev.invoicepdfbuilder |
| Platform | Windows (Tauri + React + TypeScript) |
| Dev Port | 1423 |
| Store | Microsoft Store |
| Price | Free at launch |

---

## Privacy

Invoices stay on your device. No ads. No tracking. No account required.
See `metadata/privacy_policy.md` for full details.
