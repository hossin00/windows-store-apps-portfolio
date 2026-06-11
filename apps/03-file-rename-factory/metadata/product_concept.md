# Product Concept — File Rename Factory

## Problem it solves
Windows users routinely need to batch rename files — scanned documents, photos from a camera SD card, 
exported assets, downloaded receipts. Built-in Explorer rename is one file at a time. PowerShell scripts 
work but are scary. Web renamers want a file upload. File Rename Factory provides a clean, local desktop
tool that combines a rule pipeline (prefix, suffix, numbering, date, find/replace, regex, case, clean-up)
with a live preview and a single Apply button.

## Target users
- Photographers and creators organizing exported batches
- Office staff and freelancers tidying scanned receipts and contracts
- Developers preparing assets and downloads
- Students renaming lecture recordings, screenshots, references
- Anyone with a folder full of "IMG_0001.jpg, IMG_0002.jpg…" they want to clean up

## Core value loop
1. Drop files (any extension)
2. Stack rules in the order you want them applied
3. See the live original → new preview, with collision and error flags
4. Apply — the plan is recorded; in the desktop build it writes to disk
5. Undo a session at any time

## Differentiators
- Rule pipeline UI — rules can be reordered, toggled, deleted
- Live preview with collision and error detection
- All nine common rename modes built in (prefix, suffix, numbering, date, replace, regex, case, remove special, trim)
- CSV plan export for review or scripting
- Privacy-first: only filenames are read, never file contents
- No account, no upload, no subscription
