# Paid Value Notes — PDF OCR Desk

## Current state (v1.0 — free)
- Mock OCR engine (development placeholder)
- Full UI functional: workspace, batch, history, export, settings
- Privacy-first local-only storage

## What justifies a paid price in a future version

### Must-have for paid tier:
- Real OCR engine integrated (Tesseract.js WASM or Windows OCR API via Tauri)
- Accurate multi-language text extraction
- Reliable PDF page rendering + OCR per page
- True batch export (ZIP archive of all results)

### Value-add features for paid tier:
- Table detection and structured export
- Handwriting recognition (via Windows OCR API)
- Custom export templates
- Auto-rotate and image pre-processing
- History search with full-text indexing
- Tauri native Save dialog (write directly to chosen folder)

## Suggested pricing when ready for paid:
- $14.99–$19.99 one-time purchase
- No subscription model
- No ads in paid version (same as free)

## Store strategy:
- Launch free to accumulate reviews and ratings
- Transition to paid after real OCR engine is stable and user-tested
- Keep free version available if possible (feature-limited)
