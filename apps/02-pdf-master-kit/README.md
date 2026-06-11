# PDF Master Kit

> App 02 in the KART L Windows Store Apps Portfolio
> A professional Windows desktop utility for merging, splitting, compressing, rotating, reordering, and extracting PDF pages — locally.

---

## Setup (PowerShell — from portfolio root)

```powershell
# Install dependencies
.\scripts\install-app.ps1 -AppSlug "02-pdf-master-kit"

# Run in browser dev mode (no Rust required)
.\scripts\run-app.ps1 -AppSlug "02-pdf-master-kit"

# Run as Tauri desktop app (requires Rust)
.\scripts\run-app.ps1 -AppSlug "02-pdf-master-kit" -Tauri

# Build frontend only
.\scripts\build-app.ps1 -AppSlug "02-pdf-master-kit"

# Build full Tauri .msi (requires Rust)
.\scripts\build-app.ps1 -AppSlug "02-pdf-master-kit" -Tauri

# Check app structure
.\scripts\check-app.ps1 -AppSlug "02-pdf-master-kit"

# Clean build output
.\scripts\clean-app.ps1 -AppSlug "02-pdf-master-kit"
```

Or run directly from the app folder:

```powershell
cd apps\02-pdf-master-kit
npm install
npm run dev        # browser dev on http://localhost:1421
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
| Merge multiple PDFs into one | ✅ Real (pdf-lib) |
| Split by pages | ✅ Real |
| Split by ranges | ✅ Real |
| Split by interval | ✅ Real |
| Compress (object stream re-save) | ✅ Real |
| Rotate all pages | ✅ Real |
| Rotate per page | ✅ Real |
| Reorder pages (drag & drop) | ✅ Real |
| Per-page rotate during reorder | ✅ Real |
| Extract specific pages | ✅ Real |
| Local operation history with search | ✅ |
| Dark / Light / System theme | ✅ |
| Privacy page | ✅ |
| Settings with local data clear | ✅ |
| Native page thumbnails (pdf.js) | ⬜ Future paid tier |
| Image-aware compression | ⬜ Future paid tier |

---

## PDF Engine

PDF Master Kit uses **pdf-lib** — an open-source, pure-JavaScript PDF library that runs entirely in the browser.
No Rust crates required for PDF operations, no servers, no uploads.

The compress tool re-saves the PDF with object streams enabled. This is a structural optimization, not a lossy
image compressor — see Help for details.

---

## Package Details

| Key | Value |
|-----|-------|
| App Number | 02 |
| App Slug | pdf-master-kit |
| Package ID | com.kartdev.pdfmasterkit |
| Platform | Windows (Tauri + React + TypeScript) |
| Dev Port | 1421 |
| Store | Microsoft Store |
| Price | Free at launch |

---

## Privacy

Files processed locally. No ads. No tracking. No account required.
See `metadata/privacy_policy.md` for full details.
