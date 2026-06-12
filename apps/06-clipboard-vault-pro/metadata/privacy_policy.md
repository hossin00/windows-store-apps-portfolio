# Privacy Policy — Clipboard Vault Pro

**Last updated:** 2024
**Publisher:** KART L

---

## Summary

Clipboard Vault Pro is a local-first Windows desktop application. Snippets, collections, tags, and settings all live in your browser's localStorage on your device.

---

## Data Collection

Clipboard Vault Pro **does not collect** any personal data. Specifically:

- No usage analytics or telemetry
- No crash reporting sent to external servers
- No account or sign-in required
- No advertising identifiers used
- No third-party tracking SDKs included

---

## Manual Capture Only

This version of the app does not read your OS clipboard silently. Every snippet you save is one you typed or pasted into the Add field. If a future build adds auto-capture (via Tauri's clipboard-manager plugin), it will be opt-in and gated by the Privacy mode setting.

---

## Local Storage

Clipboard Vault Pro uses browser localStorage to save:

- App settings (theme, max items, auto-detect toggle, default view)
- All saved snippets (content, title, tags, pin/favourite/collection links, copy count)
- All collections (id, name, dates)
- Aggregate counters (snippets created, copied, type breakdown)
- First-use date

All of this data is stored **locally on your device only**. It is never transmitted.

You can delete all locally stored data at any time from **Settings → Local Data → Clear all local data**. This does not delete TXT or JSON exports you have already downloaded.

---

## Sensitive snippets

Treat passwords, recovery codes, and bank details with the same care you would treat any unencrypted note. Browser localStorage is unencrypted and accessible to anyone with access to your Windows user account. For real secrets, use a dedicated password manager.

---

## Future Online Features

If any future version of Clipboard Vault Pro adds online or cloud features, this privacy policy will be updated **before** that version is released, and users will be clearly informed within the app.

---

## Contact

For privacy questions or concerns, contact KART L via the Microsoft Store app listing support channel.
