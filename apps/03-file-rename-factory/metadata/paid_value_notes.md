# Paid Value Notes — File Rename Factory

## Current state (v1.0 — free)
- Real rename engine with nine rule types
- Live preview with collision and Windows-illegal-character detection
- CSV plan export
- Local session history with mark-undone
- Privacy-first local-only storage
- Dark / light / system theme

## What justifies a paid price in a future version

### Must-have for paid tier:
- Tauri file dialog integration (real disk paths, not just File objects)
- Real disk rename via Rust `std::fs::rename` command
- True undo-to-disk (reverse plan applied automatically)
- Recursive folder rename (include subfolders, optionally filter by glob)

### Value-add features for paid tier:
- Rule templates (save and reuse named rule stacks)
- Smart rules based on EXIF for photos (date taken, camera model)
- Smart rules based on PDF metadata (title, author)
- Pre-flight check that lists files that would be skipped (in use, read-only)
- "Dry run" report exported as Markdown or PDF for change review
- Drag-and-drop reorder for file list, not just rules
- Filename collision auto-resolver (append -1, -2 …) toggle

## Suggested pricing when ready for paid:
- $14.99–$24.99 one-time purchase
- No subscription model
- No ads in paid version (same as free)

## Store strategy:
- Launch free with full rule pipeline + browser preview to build a user base
- Move to paid once Tauri disk-write + recursive folder rename + rule templates land
- Keep a free version available with the v1.0 feature set if possible
