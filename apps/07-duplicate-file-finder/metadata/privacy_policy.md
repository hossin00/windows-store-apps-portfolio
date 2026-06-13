# Privacy Policy — Duplicate File Finder

**Last updated:** 2024
**Publisher:** KART L

---

## Summary

Duplicate File Finder is a local-first Windows desktop application. Files you drop into the scanner are read for name and size only in the browser build; nothing is uploaded. The plan-then-apply safety model means no file is ever deleted without explicit confirmation in the Tauri desktop build, and never in the browser build.

---

## Data Collection

Duplicate File Finder **does not collect** any personal data. Specifically:

- No usage analytics or telemetry
- No crash reporting sent to external servers
- No account or sign-in required
- No advertising identifiers used
- No third-party tracking SDKs included

---

## File Handling

- The browser-only build reads file metadata (name, size, MIME, last modified, optional image preview URL for thumbnails)
- File contents are not read in the browser build
- Nothing is uploaded to any server
- In the Tauri-bundled desktop build, content-level SHA-256 hashing happens locally via a Rust helper — still nothing leaves your device

---

## Local Storage

Duplicate File Finder uses browser localStorage to save:

- App settings (theme, compare mode, minimum size, show hidden, privacy mode)
- Saved scan sessions (label, totals, group count, duplicate count, wasted/reclaimable bytes, plan size)
- Aggregate counters (sessions run, files scanned, duplicates found, space recovered)
- First-use date

All of this data is stored **locally on your device only**. It is never transmitted.

You can delete all locally stored data at any time from **Settings → Local Data → Clear all local data**. This does not delete CSV / JSON exports already downloaded.

---

## Plan, Then Apply

- Selecting files in the scanner only marks them in memory as "will remove"
- Saving the plan records the decision as a session in History
- In the browser build, files on disk are never deleted by this app
- In the Tauri desktop build, the same plan is then handed to a Rust `delete_file` command — and only after a final user confirmation

---

## Future Online Features

If any future version adds online or auto-scan features, this privacy policy will be updated before that version is released, and users will be clearly informed within the app.

---

## Contact

For privacy questions or concerns, contact KART L via the Microsoft Store app listing support channel.
