/**
 * pdfService.ts
 * Real PDF operations powered by pdf-lib. Everything runs in the browser —
 * no uploads, no servers, no analytics.
 */

import { PDFDocument, degrees } from "pdf-lib";

// ── Helpers ───────────────────────────────────────────────────────────────────

export async function readPdf(file: File): Promise<PDFDocument> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return PDFDocument.load(bytes, { ignoreEncryption: true });
}

export async function getPageCount(file: File): Promise<number> {
  const doc = await readPdf(file);
  return doc.getPageCount();
}

export function downloadBytes(bytes: Uint8Array, filename: string): void {
  // Force a fresh, plain ArrayBuffer copy so Blob accepts the typed array
  // safely regardless of underlying SharedArrayBuffer / ArrayBuffer types.
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

export function suggestName(base: string, suffix: string): string {
  const noExt = base.replace(/\.pdf$/i, "");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `${noExt}-${suffix}-${stamp}.pdf`;
}

// ── Merge ─────────────────────────────────────────────────────────────────────

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  if (files.length < 2) throw new Error("Need at least two PDF files to merge.");
  const out = await PDFDocument.create();
  for (const f of files) {
    const src   = await readPdf(f);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  return out.save();
}

// ── Split ─────────────────────────────────────────────────────────────────────

export function parsePageList(input: string, max: number): number[] {
  const result = new Set<number>();
  for (const chunk of input.split(",").map((c) => c.trim()).filter(Boolean)) {
    if (chunk.includes("-")) {
      const [aStr, bStr] = chunk.split("-").map((s) => s.trim());
      const a = parseInt(aStr, 10);
      const b = parseInt(bStr, 10);
      if (!isNaN(a) && !isNaN(b)) {
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        for (let i = lo; i <= hi; i++) if (i >= 1 && i <= max) result.add(i);
      }
    } else {
      const n = parseInt(chunk, 10);
      if (!isNaN(n) && n >= 1 && n <= max) result.add(n);
    }
  }
  return Array.from(result).sort((a, b) => a - b);
}

export interface SplitOutput { name: string; bytes: Uint8Array; pageCount: number; }

export async function splitByPages(file: File, pages: number[]): Promise<SplitOutput[]> {
  const src   = await readPdf(file);
  const out: SplitOutput[] = [];
  for (const pageNum of pages) {
    const idx = pageNum - 1;
    if (idx < 0 || idx >= src.getPageCount()) continue;
    const doc = await PDFDocument.create();
    const [copied] = await doc.copyPages(src, [idx]);
    doc.addPage(copied);
    const bytes = await doc.save();
    out.push({ name: suggestName(file.name, `page-${pageNum}`), bytes, pageCount: 1 });
  }
  return out;
}

export async function splitByRanges(file: File, ranges: string): Promise<SplitOutput[]> {
  const src   = await readPdf(file);
  const max   = src.getPageCount();
  const out: SplitOutput[] = [];
  const chunks = ranges.split(",").map((c) => c.trim()).filter(Boolean);
  let i = 0;
  for (const chunk of chunks) {
    i += 1;
    let lo: number; let hi: number;
    if (chunk.includes("-")) {
      const [aStr, bStr] = chunk.split("-").map((s) => s.trim());
      lo = Math.max(1, parseInt(aStr, 10) || 1);
      hi = Math.min(max, parseInt(bStr, 10) || lo);
    } else {
      lo = hi = Math.max(1, Math.min(max, parseInt(chunk, 10) || 1));
    }
    if (lo > hi || lo < 1 || hi > max) continue;
    const indices: number[] = [];
    for (let p = lo; p <= hi; p++) indices.push(p - 1);
    const doc    = await PDFDocument.create();
    const copied = await doc.copyPages(src, indices);
    copied.forEach((p) => doc.addPage(p));
    const bytes  = await doc.save();
    out.push({ name: suggestName(file.name, `range-${i}-${lo}-${hi}`), bytes, pageCount: indices.length });
  }
  return out;
}

export async function splitByInterval(file: File, interval: number): Promise<SplitOutput[]> {
  const src   = await readPdf(file);
  const total = src.getPageCount();
  if (interval < 1) throw new Error("Interval must be at least 1.");
  const out: SplitOutput[] = [];
  let part = 0;
  for (let start = 0; start < total; start += interval) {
    part += 1;
    const end     = Math.min(total - 1, start + interval - 1);
    const indices = Array.from({ length: end - start + 1 }, (_, k) => start + k);
    const doc     = await PDFDocument.create();
    const copied  = await doc.copyPages(src, indices);
    copied.forEach((p) => doc.addPage(p));
    const bytes   = await doc.save();
    out.push({ name: suggestName(file.name, `part-${part}`), bytes, pageCount: indices.length });
  }
  return out;
}

// ── Compress ──────────────────────────────────────────────────────────────────
// pdf-lib does not perform image re-encoding. We re-save with object streams
// enabled, which removes unused objects and can produce a smaller, cleaner file.
// We are transparent about this — it is a structural optimization, not a lossy
// image compressor.

export async function compressPdf(file: File): Promise<Uint8Array> {
  const src = await readPdf(file);
  return src.save({ useObjectStreams: true, addDefaultPage: false });
}

// ── Rotate ────────────────────────────────────────────────────────────────────

export async function rotateAll(file: File, angle: number): Promise<Uint8Array> {
  const src = await readPdf(file);
  src.getPages().forEach((page) => {
    const current = page.getRotation().angle;
    page.setRotation(degrees(((current + angle) % 360 + 360) % 360));
  });
  return src.save();
}

export async function rotatePerPage(file: File, rotations: number[]): Promise<Uint8Array> {
  const src   = await readPdf(file);
  const pages = src.getPages();
  pages.forEach((page, i) => {
    const r       = rotations[i] ?? 0;
    const current = page.getRotation().angle;
    page.setRotation(degrees(((current + r) % 360 + 360) % 360));
  });
  return src.save();
}

// ── Reorder ───────────────────────────────────────────────────────────────────

export async function reorderPages(
  file: File,
  order: { origIndex: number; rotation: number }[],
): Promise<Uint8Array> {
  const src    = await readPdf(file);
  const out    = await PDFDocument.create();
  const indices = order.map((o) => o.origIndex);
  const copied = await out.copyPages(src, indices);
  copied.forEach((p, i) => {
    const r = order[i].rotation;
    if (r !== 0) p.setRotation(degrees(((r % 360) + 360) % 360));
    out.addPage(p);
  });
  return out.save();
}

// ── Extract ───────────────────────────────────────────────────────────────────

export async function extractPages(file: File, pages: number[]): Promise<Uint8Array> {
  const src    = await readPdf(file);
  const max    = src.getPageCount();
  const indices = pages.filter((p) => p >= 1 && p <= max).map((p) => p - 1);
  if (indices.length === 0) throw new Error("No valid pages selected.");
  const out    = await PDFDocument.create();
  const copied = await out.copyPages(src, indices);
  copied.forEach((p) => out.addPage(p));
  return out.save();
}
