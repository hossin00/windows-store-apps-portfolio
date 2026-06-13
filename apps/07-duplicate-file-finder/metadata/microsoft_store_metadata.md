# Microsoft Store Metadata — Duplicate File Finder

## App Title
Duplicate File Finder

## Short Description (max 200 chars)
Find duplicate files on Windows. Drop a folder's contents, group by name + size, review the plan, and reclaim disk space. Local-only, plan-then-apply safety.

## Full Description

Duplicate File Finder is a Windows desktop utility for cleaning up redundant files with confidence.

**How it works:**
- Drop a folder's files into the scanner (multi-select via picker or drag & drop)
- The app groups exact duplicates by name + size (or name only / size only)
- Each group shows you every copy with image thumbnail or file icon, size, and last-modified date
- Auto-select keep-newest, keep-oldest, or keep-first across all groups at once
- See exact bytes you'll reclaim before applying

**Reviewer-friendly results:**
- Donut chart of redundant vs unique files
- 4-stat summary: total files, duplicate groups, redundant files, space wasted
- Export the scan as CSV (spreadsheet) or JSON (round-trip-safe)

**Privacy & safety:**
- File names and sizes only — no file contents are read in the browser build
- Plan-then-apply — selections are recorded as a "scan plan" until you confirm
- Local-only storage; no account, no cloud sync, no telemetry, no ads

**Settings:**
- Theme dark/light/system
- Compare mode: hash (name+size), name only, size only
- Minimum file size to include
- Show / hide dotfiles
- Privacy mode (no history)
- Clear all local data

Built with Tauri, React, TypeScript. The Tauri-bundled build wires the filesystem and a Rust SHA-256 helper for content-level hashing and actual disk delete — see the doc comment at the top of src/services/duplicateService.ts.

## Category
Utilities & Tools

## Age Rating
3+ (no objectionable content)

## Languages Supported
English (UI). File names and contents are treated as opaque bytes.

## Keywords
duplicate file finder, disk cleanup, find duplicates, file deduplication, productivity, utility, Windows disk space

## Pricing
Free at launch.
Future paid price consideration: $14.99–$24.99 once content-level SHA-256 hashing and the Tauri delete flow ship.

---

## Store Compliance Notes
- No "best", "#1", "top" claims
- No fake awards or ratings
- No copyrighted assets
- Privacy policy included with a clear plan-then-apply description
- No ads
- No account required
- Local-first design
