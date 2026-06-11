# Privacy Policy — File Rename Factory

**Last updated:** 2024
**Publisher:** KART L

---

## Summary

File Rename Factory is a local-first Windows desktop application. It reads only file names — never file contents — and performs all rename planning on your device.

---

## Data Collection

File Rename Factory **does not collect** any personal data. Specifically:

- No usage analytics or telemetry
- No crash reporting sent to external servers
- No account or sign-in required
- No advertising identifiers used
- No third-party tracking SDKs included

---

## File Handling

Files you import into File Rename Factory are processed within the application on your local device.

- Only file **names** (and sizes, for display) are read by the rename engine
- File **contents** are never opened, parsed, or read
- Nothing is uploaded to any server
- In the bundled Tauri desktop build, actual disk renames are performed locally by the OS through `std::fs::rename`
- In the browser build, the Apply action records the rename plan as a session and offers CSV export — no disk changes occur

---

## Local Storage

File Rename Factory uses browser localStorage to save:

- App settings (theme, history toggle, privacy mode)
- Rename session history (rules used, sample renames)
- Aggregate counters (sessions applied, files renamed, rules used)

All of this data is stored **locally on your device only**. It is never transmitted.

You can delete all locally stored data at any time from **Settings → Local Data → Clear all local data**.

---

## Future Online Features

If any future version of File Rename Factory adds online or cloud features, this privacy policy will be updated **before** that version is released, and users will be clearly informed within the app.

---

## Contact

For privacy questions or concerns, contact KART L via the Microsoft Store app listing support channel.
