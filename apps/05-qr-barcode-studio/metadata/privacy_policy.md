# Privacy Policy — QR Barcode Studio

**Last updated:** 2024
**Publisher:** KART L

---

## Summary

QR Barcode Studio is a local-first Windows desktop application. QR payloads, barcode values, options, and exported images all stay on your device.

---

## Data Collection

QR Barcode Studio **does not collect** any personal data. Specifically:

- No usage analytics or telemetry
- No crash reporting sent to external servers
- No account or sign-in required
- No advertising identifiers used
- No third-party tracking SDKs included

---

## Code Generation

QR and barcode generation runs entirely in your browser using the open-source `qrcode` and `JsBarcode` libraries.

- Payloads (the URL, text, Wi-Fi credentials, contact card, email body, barcode value, …) are never sent anywhere
- Rendered PNG and SVG files are produced locally and downloaded directly to your Downloads folder
- No copies of payloads or images are retained beyond your explicit Save actions

---

## Wi-Fi QR codes — a specific note

When you generate a Wi-Fi QR code, your network SSID and password are encoded into the resulting image. Anyone who can scan that image will be able to join the network. Please treat exported Wi-Fi QR images with the same care you would treat the network password.

---

## Local Storage

QR Barcode Studio uses browser localStorage to save:

- App settings (theme, default export format, default size, default colours)
- Saved codes — each entry includes the payload, options, and a small thumbnail
- Aggregate counters (codes generated, batch runs)

All of this data is stored **locally on your device only**. It is never transmitted.

You can delete all locally stored data at any time from **Settings → Local Data → Clear all local data**. This does not delete PNG / SVG files you have already downloaded.

---

## Future Online Features

If any future version of QR Barcode Studio adds online or cloud features, this privacy policy will be updated **before** that version is released, and users will be clearly informed within the app.

---

## Contact

For privacy questions or concerns, contact KART L via the Microsoft Store app listing support channel.
