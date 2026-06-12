/**
 * barcodeService.ts
 * Real 1D barcode generation powered by the open-source `jsbarcode` library.
 * Renders to a passed-in SVG element (for live preview + SVG export) and
 * to an off-screen canvas (for PNG export). All operations are local.
 */

import JsBarcode from "jsbarcode";
import type { BarcodeFormat, BarcodeOptions } from "../types";

// ── Validation per format ────────────────────────────────────────────────────

export interface Validation { ok: boolean; reason?: string; sample?: string; }

const SAMPLES: Record<BarcodeFormat, string> = {
  CODE128: "ABC-1234-XYZ",
  EAN13:   "5901234123457",
  EAN8:    "96385074",
  UPC:     "036000291452",
  CODE39:  "HELLO-2024",
};

export function sampleFor(format: BarcodeFormat): string { return SAMPLES[format]; }

export function validateBarcode(format: BarcodeFormat, value: string): Validation {
  if (!value || value.length === 0) return { ok: false, reason: "Enter a value to encode" };
  switch (format) {
    case "EAN13": {
      if (!/^\d+$/.test(value)) return { ok: false, reason: "EAN-13 must contain only digits" };
      if (value.length !== 12 && value.length !== 13) return { ok: false, reason: "EAN-13 needs 12 digits (jsbarcode adds the check digit) or 13 with checksum" };
      return { ok: true };
    }
    case "EAN8": {
      if (!/^\d+$/.test(value)) return { ok: false, reason: "EAN-8 must contain only digits" };
      if (value.length !== 7 && value.length !== 8) return { ok: false, reason: "EAN-8 needs 7 digits (auto check digit) or 8 with checksum" };
      return { ok: true };
    }
    case "UPC": {
      if (!/^\d+$/.test(value)) return { ok: false, reason: "UPC-A must contain only digits" };
      if (value.length !== 11 && value.length !== 12) return { ok: false, reason: "UPC-A needs 11 digits (auto check digit) or 12 with checksum" };
      return { ok: true };
    }
    case "CODE39": {
      if (!/^[A-Z0-9\-. $/+%]+$/.test(value)) return { ok: false, reason: "Code 39 supports uppercase letters, digits, and - . space $ / + %" };
      return { ok: true };
    }
    case "CODE128": {
      // Accepts any ASCII; jsbarcode picks the right subset.
      // eslint-disable-next-line no-control-regex
      if (/[^\x00-\x7F]/.test(value)) return { ok: false, reason: "Code 128 supports ASCII characters only" };
      return { ok: true };
    }
  }
}

// ── Live preview into an SVG element ─────────────────────────────────────────

export function renderBarcodeToSvg(svg: SVGSVGElement, format: BarcodeFormat, value: string, opts: BarcodeOptions): void {
  // Clear previous render
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  try {
    JsBarcode(svg, value, {
      format,
      width:        opts.width,
      height:       opts.height,
      lineColor:    opts.fg,
      background:   opts.bg,
      displayValue: opts.displayValue,
      margin:       12,
      fontSize:     14,
    });
  } catch {
    // jsbarcode throws on invalid values — keep the SVG empty; UI surfaces the validation error.
  }
}

// ── PNG export via off-screen canvas ─────────────────────────────────────────

export function renderBarcodeToPngDataUrl(format: BarcodeFormat, value: string, opts: BarcodeOptions): string | null {
  const canvas = document.createElement("canvas");
  try {
    JsBarcode(canvas, value, {
      format,
      width:        opts.width,
      height:       opts.height,
      lineColor:    opts.fg,
      background:   opts.bg,
      displayValue: opts.displayValue,
      margin:       12,
      fontSize:     14,
    });
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

// ── SVG string export ────────────────────────────────────────────────────────

export function renderBarcodeToSvgString(format: BarcodeFormat, value: string, opts: BarcodeOptions): string | null {
  // Create a detached SVG element to render into, then serialize.
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement;
  try {
    JsBarcode(svg, value, {
      format,
      width:        opts.width,
      height:       opts.height,
      lineColor:    opts.fg,
      background:   opts.bg,
      displayValue: opts.displayValue,
      margin:       12,
      fontSize:     14,
    });
    return new XMLSerializer().serializeToString(svg);
  } catch {
    return null;
  }
}
