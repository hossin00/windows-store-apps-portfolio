# Windows Store Apps Portfolio

> 28 professional Windows desktop apps — built by **KART L**  
> Stack: Tauri + React + TypeScript + Tailwind CSS  
> Model: Free at launch · No ads · No tracking · Local-first

---

## Apps

| # | App | Status | Package |
|---|-----|--------|---------|
| 01 | [PDF OCR Desk](./apps/01-pdf-ocr-desk) — _blue_ | ✅ Premium | com.kartdev.pdfocrdesk |
| 02 | [PDF Master Kit](./apps/02-pdf-master-kit) — _violet_ | ✅ Premium | com.kartdev.pdfmasterkit |
| 03 | [File Rename Factory](./apps/03-file-rename-factory) — _orange_ | ✅ Premium | com.kartdev.filerenameFactory |
| 04 | [Invoice PDF Builder](./apps/04-invoice-pdf-builder) — _amber_ | ✅ Premium | com.kartdev.invoicepdfbuilder |
| 05 | [QR Barcode Studio](./apps/05-qr-barcode-studio) — _emerald_ | ✅ Premium | com.kartdev.qrbarcodestudio |
| 06 | [Clipboard Vault Pro](./apps/06-clipboard-vault-pro) — _violet_ | ✅ Premium | com.kartdev.clipboardvaultpro |
| 07 | [Duplicate File Finder](./apps/07-duplicate-file-finder) — _red_ | ✅ Premium | com.kartdev.duplicatefilefinder |
| 08 | [Product Listing Builder](./apps/08-product-listing-builder) — _sky_ | ✅ Premium | com.kartdev.productlistingbuilder |
| 09 | Resume Studio Pro | 🔜 Next | — |
| 10 | Privacy File Cleaner | 📋 Planned | — |
| 11 | Image to PDF Factory | 📋 Planned | — |
| 12 | PDF Redact & Protect | 📋 Planned | — |
| 13 | Scan Organizer Desk | 📋 Planned | — |
| 14 | Focus Timer Studio | 📋 Planned | — |
| 15 | Task Board Offline | 📋 Planned | — |
| 16 | Habit Tracker Desktop | 📋 Planned | — |
| 17 | Study Planner Pro | 📋 Planned | — |
| 18 | Meeting Notes Builder | 📋 Planned | — |
| 19 | Text Cleaner Studio | 📋 Planned | — |
| 20 | Folder Compare Desk | 📋 Planned | — |
| 21 | Watermark Studio Pro | 📋 Planned | — |
| 22 | Local Password Notebook | 📋 Planned | — |
| 23 | Budget Planner Desktop | 📋 Planned | — |
| 24 | Freelance Client Tracker | 📋 Planned | — |
| 25 | Social Caption Studio | 📋 Planned | — |
| 26 | Simple Inventory Desk | 📋 Planned | — |
| 27 | Contract Template Studio | 📋 Planned | — |
| 28 | Screenshot Organizer AI | 📋 Planned | — |

---

## Quick Start (Windows PowerShell)

```powershell
# Allow scripts to run
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Install & run App 01
.\scripts\install-app.ps1 -AppSlug "01-pdf-ocr-desk"
.\scripts\run-app.ps1 -AppSlug "01-pdf-ocr-desk"
# → opens http://localhost:1420
```

## Scripts

| Script | Usage |
|--------|-------|
| `create-template.ps1` | Rebuild shared template |
| `create-app.ps1` | Scaffold new app from template |
| `install-app.ps1 -AppSlug "01-pdf-ocr-desk"` | npm install |
| `run-app.ps1 -AppSlug "01-pdf-ocr-desk"` | Dev server |
| `build-app.ps1 -AppSlug "01-pdf-ocr-desk"` | Frontend build |
| `check-app.ps1 -AppSlug "01-pdf-ocr-desk"` | Validate structure |
| `clean-app.ps1 -AppSlug "01-pdf-ocr-desk"` | Remove build output |

## Tauri Desktop Build (requires Rust)

```powershell
# Install Rust: https://rustup.rs
.\scripts\run-app.ps1 -AppSlug "01-pdf-ocr-desk" -Tauri
.\scripts\build-app.ps1 -AppSlug "01-pdf-ocr-desk" -Tauri
```

---

**Publisher:** KART L · Microsoft Partner Center · Seller ID: 94550090
