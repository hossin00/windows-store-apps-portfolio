# QR Barcode Studio

> App 05 in the KART L Windows Store Apps Portfolio
> A professional Windows desktop utility for generating QR codes and 1D barcodes with a live preview.

---

## Setup (PowerShell — from portfolio root)

```powershell
# Install dependencies
.\scripts\install-app.ps1 -AppSlug "05-qr-barcode-studio"

# Run in browser dev mode (no Rust required)
.\scripts\run-app.ps1 -AppSlug "05-qr-barcode-studio"

# Run as Tauri desktop app (requires Rust)
.\scripts\run-app.ps1 -AppSlug "05-qr-barcode-studio" -Tauri

# Build frontend only
.\scripts\build-app.ps1 -AppSlug "05-qr-barcode-studio"
```

Or run directly from the app folder:

```powershell
cd apps\05-qr-barcode-studio
npm install
npm run dev        # browser dev on http://localhost:1424
npm run build      # frontend build to dist/
```

---

## Features

| Feature | Status |
|---------|--------|
| QR — URL payload | ✅ |
| QR — Plain Text payload | ✅ |
| QR — Wi-Fi payload (SSID / password / security / hidden) | ✅ |
| QR — vCard 3.0 payload (name / phone / email / org) | ✅ |
| QR — Email mailto payload (to / subject / body) | ✅ |
| QR — custom fg / bg, size 128–1024, error level L/M/Q/H | ✅ |
| Barcode — Code 128 | ✅ |
| Barcode — EAN-13 | ✅ |
| Barcode — EAN-8 | ✅ |
| Barcode — UPC-A | ✅ |
| Barcode — Code 39 | ✅ |
| Barcode — per-format validation, custom width/height/colors, show/hide text | ✅ |
| Live preview as you type | ✅ |
| Export PNG | ✅ |
| Export SVG | ✅ |
| Batch — paste list, download all as PNGs | ✅ |
| Local history with thumbnails + search | ✅ |
| Re-open and re-export | ✅ |
| Dark / Light / System theme | ✅ |
| Privacy / About / Help / Settings pages | ✅ |

---

## Code Engines

- **QR generation:** `src/services/qrService.ts` wraps the open-source `qrcode` library and adds payload encoders for URL, plain text, Wi-Fi (WIFI: format), vCard 3.0, and mailto links. Supports canvas, data URL, and SVG output.
- **Barcode generation:** `src/services/barcodeService.ts` wraps `jsbarcode` with per-format input validation and clean error reasons. Renders into SVG for live preview and into off-screen canvas for PNG export.
- **Storage:** `src/services/localStorageService.ts` saves codes (with PNG thumbnails for the history grid), settings, and aggregate counters.

---

## Package Details

| Key | Value |
|-----|-------|
| App Number | 05 |
| App Slug | qr-barcode-studio |
| Package ID | com.kartdev.qrbarcodestudio |
| Platform | Windows (Tauri + React + TypeScript) |
| Dev Port | 1424 |
| Store | Microsoft Store |
| Price | Free at launch |

---

## Privacy

Codes are generated locally. No upload. No ads. No tracking. No account.
See `metadata/privacy_policy.md` for the full policy, including a specific note on Wi-Fi QR.
