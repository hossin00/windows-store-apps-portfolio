# PDF OCR Desk

> App 01 in the KART L Windows Store Apps Portfolio
> A professional Windows desktop utility for extracting text from images and scanned PDF files.

---

## Setup (PowerShell — from portfolio root)

```powershell
# Install dependencies
.\scripts\install-app.ps1 -AppSlug "01-pdf-ocr-desk"

# Run in browser dev mode (no Rust required)
.\scripts\run-app.ps1 -AppSlug "01-pdf-ocr-desk"

# Run as Tauri desktop app (requires Rust)
.\scripts\run-app.ps1 -AppSlug "01-pdf-ocr-desk" -Tauri

# Build frontend only
.\scripts\build-app.ps1 -AppSlug "01-pdf-ocr-desk"

# Build full Tauri .msi (requires Rust)
.\scripts\build-app.ps1 -AppSlug "01-pdf-ocr-desk" -Tauri

# Check app structure
.\scripts\check-app.ps1 -AppSlug "01-pdf-ocr-desk"

# Clean build output
.\scripts\clean-app.ps1 -AppSlug "01-pdf-ocr-desk"
```

Or run directly from the app folder:

```powershell
cd apps\01-pdf-ocr-desk
npm install
npm run dev        # browser dev on http://localhost:1420
npm run build      # frontend build to dist/
```

---

## Rust / Tauri Desktop Build

Requires Rust installed: https://rustup.rs

```powershell
# After installing Rust, from the app folder:
npm run tauri:dev    # live reload desktop app
npm run tauri:build  # produce .msi installer in src-tauri/target/release/bundle/
```

---

## Features

| Feature | Status |
|---------|--------|
| Import PNG / JPG / WebP images | ✅ |
| Import scanned PDF files | ✅ |
| OCR Workspace (extract, preview, copy) | ✅ (mock engine) |
| Batch Queue (multiple files) | ✅ |
| Local OCR History with search | ✅ |
| Export as TXT / Markdown / JSON | ✅ |
| Export Center with log | ✅ |
| Dark / Light / System theme | ✅ |
| Privacy page | ✅ |
| Settings with local data clear | ✅ |
| Real OCR engine | ⬜ Placeholder — see ocrService.ts |

---

## OCR Engine

The app currently uses a **mock OCR engine** that simulates realistic processing time and returns sample extracted text. This allows the full UI to be tested and demonstrated without Rust or a native dependency.

**To connect a real OCR engine:**

See `src/services/ocrService.ts` — the integration points are clearly marked with `// TODO: Replace mockOCREngine`.

Options:
1. **Tesseract.js** — `npm install tesseract.js` — pure WASM, no Rust required
2. **Windows OCR API** — Tauri sidecar calling `Windows.Media.Ocr` — highest accuracy on Windows
3. **Tauri plugin-ocr** — when available

---

## Package Details

| Key | Value |
|-----|-------|
| App Number | 01 |
| App Slug | pdf-ocr-desk |
| Package ID | com.kartdev.pdfocrdesk |
| Platform | Windows (Tauri + React + TypeScript) |
| Store | Microsoft Store |
| Price | Free at launch |

---

## Privacy

Files processed locally. No ads. No tracking. No account required.
See `metadata/privacy_policy.md` for full details.
