# Paid Value Notes — Duplicate File Finder

## Current state (v1.0 — free)
- Drag & drop + multi-file picker ingestion
- Three compare modes (hash=name+size, name only, size only)
- Per-group reclaim estimate + live "will free" sum
- Image preview thumbnails
- Auto-select keep newest / oldest / first
- Donut chart + 4-stat results summary
- CSV / JSON export of the scan plan
- Scan session history with search
- Settings: theme, compare mode, min size, show hidden, privacy mode, clear data
- Premium UI: splash, onboarding, page transitions, skeletons, activity chart

## What justifies a paid price in a future version

### Must-have for paid tier:
- Tauri folder picker — real recursive folder scan
- Tauri SHA-256 streaming hash for content-level duplicates
- Tauri delete_file — actual cleanup on disk with confirmation
- Send-to-Recycle-Bin instead of permanent delete
- Optional "always include subfolders" toggle

### Value-add features for paid tier:
- Smart-group detection (very similar files — image perceptual hash, near-duplicate text)
- Filter chips by file extension, type, last-modified bucket
- Schedule recurring scans (daily / weekly) of a pinned folder
- Compare two folders side by side
- Export plan as PowerShell script for review before run

## Suggested pricing when ready for paid:
- $14.99–$24.99 one-time purchase
- No subscription model
- No ads in paid version (same as free)

## Store strategy:
- Launch free to gather users and validate UX
- Move to paid once Tauri folder-pick + real hashing + Recycle-Bin land
- Keep a free version with the v1.0 feature set if possible
