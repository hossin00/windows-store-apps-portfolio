# Product Concept — Duplicate File Finder

## Problem it solves
Most Windows machines end up with megabytes of redundant copies — multiple downloads of the same PDF,
photos imported twice, "report (1).docx" and "report (2).docx" sitting side by side. Cleaning them up
by hand is slow and risky. Web tools want a folder upload; system tools want elevated permissions.
Duplicate File Finder is a clean, local Windows desktop tool that groups dropped files by exact
fingerprint, lets you review each group, and produces a precise plan before anything is removed.

## Target users
- Photographers and creators with image folders bloated by duplicate imports
- Developers cleaning up downloads and assets folders
- IT and support staff prepping machines for handover
- Anyone with a "downloads" folder they're scared to look at

## Core value loop
1. Multi-select files (or drag a folder of files into the dropzone)
2. The app groups exact duplicates by name + size and shows total reclaimable space
3. Auto-select keep-newest / oldest / first, or pick manually
4. Save the scan plan — view in Results with a donut chart and CSV / JSON export
5. In the Tauri desktop build, apply the plan to actually delete

## Differentiators
- Plan-then-apply safety model — never deletes silently
- Three compare modes (hash = name+size, name-only, size-only)
- Per-group reclaim estimate
- Image thumbnails inline in the duplicate cards
- Live "space saved" calculator updates as you tick
- Donut chart of redundant vs unique files
- CSV and JSON export of the scan plan
- Local-only storage; no account, no cloud, no telemetry
