/**
 * qrService.ts
 * Real QR generation powered by the open-source `qrcode` library. All rendering
 * happens in the browser — payload, options, and exported files never leave the
 * device.
 */

import QRCode from "qrcode";
import type {
  QrInput, QrOptions, QrUrlData, QrTextData, QrWifiData, QrVCardData, QrEmailData,
} from "../types";

// ── Payload encoders ─────────────────────────────────────────────────────────
// Each function returns the exact string that gets encoded into the QR code.
// Standard formats: BCP-47 URL, MECARD/VCard, MeCard, MailTo, Wi-Fi.

function escapeWifi(s: string): string {
  return s.replace(/([\\;,:"])/g, "\\$1");
}

export function encodeQr(input: QrInput): string {
  switch (input.kind) {
    case "url":  return (input as QrUrlData).url.trim();
    case "text": return (input as QrTextData).text;
    case "wifi": {
      const w = input as QrWifiData;
      const sec = w.security === "nopass" ? "nopass" : w.security;
      return `WIFI:T:${sec};S:${escapeWifi(w.ssid)};P:${escapeWifi(w.password)};H:${w.hidden ? "true" : "false"};;`;
    }
    case "vcard": {
      const v = input as QrVCardData;
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${v.lastName};${v.firstName}`,
        `FN:${[v.firstName, v.lastName].filter(Boolean).join(" ") || v.firstName || v.lastName || ""}`,
        v.organization ? `ORG:${v.organization}` : null,
        v.phone        ? `TEL:${v.phone}`        : null,
        v.email        ? `EMAIL:${v.email}`      : null,
        "END:VCARD",
      ].filter(Boolean) as string[];
      return lines.join("\n");
    }
    case "email": {
      const e = input as QrEmailData;
      const params: string[] = [];
      if (e.subject) params.push(`subject=${encodeURIComponent(e.subject)}`);
      if (e.body)    params.push(`body=${encodeURIComponent(e.body)}`);
      const qs = params.length ? `?${params.join("&")}` : "";
      return `mailto:${e.to}${qs}`;
    }
  }
}

// ── Render to canvas (live preview + PNG export) ─────────────────────────────

export async function renderQrToCanvas(canvas: HTMLCanvasElement, input: QrInput, opts: QrOptions): Promise<void> {
  const payload = encodeQr(input);
  // qrcode requires non-empty payload; substitute a single space for an empty draft so the canvas paints something
  await QRCode.toCanvas(canvas, payload || " ", {
    width:             opts.size,
    margin:            2,
    errorCorrectionLevel: opts.errorLevel,
    color: { dark: opts.fg, light: opts.bg },
  });
}

export async function renderQrDataUrl(input: QrInput, opts: QrOptions, sizePx?: number): Promise<string> {
  const payload = encodeQr(input);
  return QRCode.toDataURL(payload || " ", {
    width: sizePx ?? opts.size,
    margin: 2,
    errorCorrectionLevel: opts.errorLevel,
    color: { dark: opts.fg, light: opts.bg },
  });
}

export async function renderQrSvgString(input: QrInput, opts: QrOptions): Promise<string> {
  const payload = encodeQr(input);
  return QRCode.toString(payload || " ", {
    type: "svg",
    width: opts.size,
    margin: 2,
    errorCorrectionLevel: opts.errorLevel,
    color: { dark: opts.fg, light: opts.bg },
  });
}

// ── Validation hint ──────────────────────────────────────────────────────────

export function qrPayloadStats(input: QrInput): { bytes: number; ok: boolean; warning?: string } {
  const text = encodeQr(input);
  const bytes = new TextEncoder().encode(text).length;
  // QR capacity at H = 1273 bytes for binary, much less for alphanumeric only.
  // We surface a soft warning at 1000 bytes — anything denser may still scan with H-level correction.
  if (bytes === 0) return { bytes, ok: false, warning: "Add some content to generate a QR" };
  if (bytes > 1800) return { bytes, ok: false, warning: "Payload may be too large for a single QR — try a shorter URL" };
  if (bytes > 1000) return { bytes, ok: true, warning: "Payload is dense; use error correction L for best scan reliability" };
  return { bytes, ok: true };
}
