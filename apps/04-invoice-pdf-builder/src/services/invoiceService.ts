/**
 * invoiceService.ts
 * Pure invoice math + real pdf-lib PDF generation. Everything runs in the
 * browser — nothing leaves the device.
 */

import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from "pdf-lib";
import type { Invoice, InvoiceTotals, Currency, LineItem } from "../types";

// ── Currency formatting ───────────────────────────────────────────────────────

const CURRENCY_SYMBOL: Record<Currency, string> = {
  USD: "$", EUR: "€", GBP: "£", MAD: "MAD ",
};

export function currencySymbol(c: Currency): string {
  return CURRENCY_SYMBOL[c] ?? "";
}

export function formatMoney(amount: number, currency: Currency): string {
  const sign = amount < 0 ? "-" : "";
  const abs  = Math.abs(amount);
  const body = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${sign}${currencySymbol(currency)}${body}`;
}

// ── Math ──────────────────────────────────────────────────────────────────────

export function lineTotal(item: LineItem): number {
  return round2((item.quantity || 0) * (item.unitPrice || 0));
}

export function calcTotals(invoice: Invoice): InvoiceTotals {
  const subtotal      = round2(invoice.lineItems.reduce((s, it) => s + lineTotal(it), 0));
  const discountPct   = clamp(invoice.discount, 0, 100);
  const taxPct        = clamp(invoice.taxRate, 0, 100);
  const discountAmt   = round2(subtotal * (discountPct / 100));
  const afterDiscount = round2(subtotal - discountAmt);
  const taxAmt        = round2(afterDiscount * (taxPct / 100));
  const total         = round2(afterDiscount + taxAmt);
  return { subtotal, discountAmt, afterDiscount, taxAmt, total };
}

function round2(n: number): number { return Math.round((n + Number.EPSILON) * 100) / 100; }
function clamp(n: number, lo: number, hi: number): number { return Math.min(hi, Math.max(lo, n)); }

// ── PDF generation ────────────────────────────────────────────────────────────

const ACCENT     = rgb(0.961, 0.620, 0.043);  // #f59e0b amber-500
const TEXT_DARK  = rgb(0.06,  0.09,  0.16);   // #0f172a slate-900
const TEXT_MUTE  = rgb(0.39,  0.46,  0.55);   // #64748b slate-500
const LINE_GRAY  = rgb(0.85,  0.87,  0.91);   // slate-200
const BG_TINT    = rgb(0.99,  0.97,  0.94);   // very light orange wash

export async function generateInvoicePdf(invoice: Invoice): Promise<Uint8Array> {
  const doc       = await PDFDocument.create();
  const fontReg   = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold  = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([595.28, 841.89]); // A4
  const { width } = page.getSize();

  const margin   = 40;
  const right    = width - margin;
  let   y        = 800;

  const sym      = currencySymbol(invoice.currency);
  const totals   = calcTotals(invoice);

  // Header band
  page.drawRectangle({ x: 0, y: 770, width, height: 60, color: ACCENT });
  page.drawText("INVOICE", { x: margin, y: 793, size: 24, font: fontBold, color: rgb(1,1,1) });
  page.drawText(invoice.number || "—", {
    x: right - fontBold.widthOfTextAtSize(invoice.number || "—", 14),
    y: 798, size: 14, font: fontBold, color: rgb(1,1,1),
  });
  page.drawText(invoice.currency, {
    x: right - fontReg.widthOfTextAtSize(invoice.currency, 9),
    y: 783, size: 9, font: fontReg, color: rgb(1,1,1),
  });

  y = 740;

  // From + To columns
  page.drawText("FROM", { x: margin, y, size: 9, font: fontBold, color: TEXT_MUTE });
  page.drawText("BILL TO", { x: width / 2, y, size: 9, font: fontBold, color: TEXT_MUTE });
  y -= 14;

  drawBlock(page, margin,        y, invoice.business.name,    fontBold, 12, TEXT_DARK);
  drawBlock(page, width / 2,     y, invoice.client.name,      fontBold, 12, TEXT_DARK);
  y -= 16;

  const fromLines = paragraphLines(invoice.business.address, fontReg, 10, width / 2 - margin - 10);
  const toLines   = paragraphLines(invoice.client.address,   fontReg, 10, width / 2 - margin - 10);
  const blockLines = Math.max(fromLines.length, toLines.length);
  for (let i = 0; i < blockLines; i++) {
    if (fromLines[i]) page.drawText(fromLines[i], { x: margin,    y: y - i * 12, size: 10, font: fontReg, color: TEXT_DARK });
    if (toLines[i])   page.drawText(toLines[i],   { x: width / 2, y: y - i * 12, size: 10, font: fontReg, color: TEXT_DARK });
  }
  y -= blockLines * 12 + 6;

  if (invoice.business.email) page.drawText(invoice.business.email, { x: margin,    y, size: 10, font: fontReg, color: TEXT_MUTE });
  if (invoice.client.email)   page.drawText(invoice.client.email,   { x: width / 2, y, size: 10, font: fontReg, color: TEXT_MUTE });
  y -= 24;

  // Dates strip
  drawDateBox(page, margin,                 y, "ISSUE DATE", invoice.issueDate, fontReg, fontBold);
  drawDateBox(page, margin + 140,           y, "DUE DATE",   invoice.dueDate,   fontReg, fontBold);
  drawDateBox(page, margin + 280,           y, "CURRENCY",   invoice.currency,  fontReg, fontBold);
  y -= 40;

  // Line item table header
  const rowY     = y;
  const colDesc  = margin;
  const colQty   = right - 220;
  const colUnit  = right - 140;
  const colTot   = right - 60;

  page.drawRectangle({ x: margin, y: rowY - 6, width: right - margin, height: 22, color: BG_TINT });
  page.drawText("DESCRIPTION",  { x: colDesc, y: rowY,     size: 9, font: fontBold, color: TEXT_MUTE });
  page.drawText("QTY",          { x: colQty - 14,  y: rowY, size: 9, font: fontBold, color: TEXT_MUTE });
  page.drawText("UNIT",         { x: colUnit - 26, y: rowY, size: 9, font: fontBold, color: TEXT_MUTE });
  page.drawText("TOTAL",        { x: colTot - 30,  y: rowY, size: 9, font: fontBold, color: TEXT_MUTE });
  y = rowY - 22;

  for (const item of invoice.lineItems) {
    if (y < 180) { page = doc.addPage([595.28, 841.89]); y = 800; }
    const descLines = paragraphLines(item.description || "—", fontReg, 10, colQty - margin - 16);
    for (let i = 0; i < descLines.length; i++) {
      page.drawText(descLines[i], { x: colDesc, y: y - i * 12, size: 10, font: fontReg, color: TEXT_DARK });
    }
    page.drawText(String(item.quantity), {
      x: colQty - fontReg.widthOfTextAtSize(String(item.quantity), 10), y,
      size: 10, font: fontReg, color: TEXT_DARK,
    });
    const unitStr  = `${sym}${item.unitPrice.toFixed(2)}`;
    page.drawText(unitStr, {
      x: colUnit - fontReg.widthOfTextAtSize(unitStr, 10), y,
      size: 10, font: fontReg, color: TEXT_DARK,
    });
    const totStr = `${sym}${lineTotal(item).toFixed(2)}`;
    page.drawText(totStr, {
      x: colTot - fontReg.widthOfTextAtSize(totStr, 10), y,
      size: 10, font: fontBold, color: TEXT_DARK,
    });
    const blockHeight = Math.max(descLines.length, 1) * 12 + 6;
    page.drawLine({
      start: { x: margin,   y: y - blockHeight + 8 },
      end:   { x: right,    y: y - blockHeight + 8 },
      thickness: 0.5, color: LINE_GRAY,
    });
    y -= blockHeight;
  }

  y -= 10;
  // Totals box
  const boxX = right - 260;
  drawTotalsRow(page, boxX, y,      "Subtotal",       formatMoney(totals.subtotal,    invoice.currency), fontReg, fontReg);
  y -= 18;
  if (invoice.discount > 0) {
    drawTotalsRow(page, boxX, y,    `Discount (${invoice.discount}%)`, "−" + formatMoney(totals.discountAmt, invoice.currency), fontReg, fontReg);
    y -= 18;
  }
  if (invoice.taxRate > 0) {
    drawTotalsRow(page, boxX, y,    `Tax (${invoice.taxRate}%)`,       formatMoney(totals.taxAmt, invoice.currency),           fontReg, fontReg);
    y -= 18;
  }
  page.drawLine({
    start: { x: boxX,  y: y + 6 }, end: { x: right, y: y + 6 },
    thickness: 1, color: LINE_GRAY,
  });
  y -= 8;
  page.drawText("TOTAL",                   { x: boxX, y, size: 11, font: fontBold, color: TEXT_DARK });
  const totalStr = formatMoney(totals.total, invoice.currency);
  page.drawText(totalStr, {
    x: right - fontBold.widthOfTextAtSize(totalStr, 13),
    y: y - 1,
    size: 13, font: fontBold, color: ACCENT,
  });
  y -= 36;

  // Notes
  if (invoice.notes.trim().length > 0) {
    page.drawText("NOTES / PAYMENT TERMS", { x: margin, y, size: 9, font: fontBold, color: TEXT_MUTE });
    y -= 14;
    const noteLines = paragraphLines(invoice.notes, fontReg, 10, right - margin);
    for (const line of noteLines) {
      if (y < 60) { page = doc.addPage([595.28, 841.89]); y = 800; }
      page.drawText(line, { x: margin, y, size: 10, font: fontReg, color: TEXT_DARK });
      y -= 12;
    }
  }

  // Footer
  page.drawText("Generated by Invoice PDF Builder", {
    x: margin, y: 30, size: 8, font: fontReg, color: TEXT_MUTE,
  });

  return doc.save();
}

function drawBlock(page: PDFPage, x: number, y: number, text: string, font: PDFFont, size: number, color = TEXT_DARK) {
  page.drawText(text || "—", { x, y, size, font, color });
}

function drawDateBox(page: PDFPage, x: number, y: number, label: string, value: string, fontReg: PDFFont, fontBold: PDFFont) {
  page.drawText(label, { x, y: y + 14, size: 8, font: fontBold, color: TEXT_MUTE });
  page.drawText(value || "—", { x, y, size: 11, font: fontReg, color: TEXT_DARK });
}

function drawTotalsRow(page: PDFPage, x: number, y: number, label: string, value: string, _fontLbl: PDFFont, fontVal: PDFFont) {
  const page_width = page.getWidth();
  const margin = 40;
  const right  = page_width - margin;
  page.drawText(label, { x, y, size: 10, font: _fontLbl, color: TEXT_MUTE });
  page.drawText(value, {
    x: right - fontVal.widthOfTextAtSize(value, 10),
    y, size: 10, font: fontVal, color: TEXT_DARK,
  });
}

// Naive word-wrap that respects pdf-lib width measurement.
function paragraphLines(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  if (!text) return [];
  const lines: string[] = [];
  for (const para of text.split(/\r?\n/)) {
    if (para.length === 0) { lines.push(""); continue; }
    const words = para.split(/\s+/);
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        // word longer than the column — hard-split it
        if (font.widthOfTextAtSize(word, size) > maxWidth) {
          let chunk = "";
          for (const ch of word) {
            if (font.widthOfTextAtSize(chunk + ch, size) > maxWidth) {
              lines.push(chunk); chunk = ch;
            } else {
              chunk += ch;
            }
          }
          current = chunk;
        } else {
          current = word;
        }
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

// ── Download ─────────────────────────────────────────────────────────────────

export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  const blob = new Blob([ab], { type: "application/pdf" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function safeFilename(invoice: Invoice): string {
  const base = `${invoice.number || "invoice"}`.replace(/[<>:"/\\|?*]/g, "_");
  return `${base}.pdf`;
}
