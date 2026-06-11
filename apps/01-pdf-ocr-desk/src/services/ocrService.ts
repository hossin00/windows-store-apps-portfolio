/**
 * ocrService.ts — OCR abstraction layer for PDF OCR Desk
 *
 * Currently uses a mock engine for development and complete UI testing.
 *
 * ── HOW TO CONNECT A REAL OCR ENGINE ────────────────────────────────────────
 * Option A — Tesseract.js (WASM, no server required):
 *   npm install tesseract.js
 *   In extractTextFromImage(), replace mockOCREngine() with:
 *     import Tesseract from "tesseract.js";
 *     const result = await Tesseract.recognize(file, settings.ocrLanguage, {
 *       logger: (m) => { if (m.status === "recognizing text") onProgress?.(m.progress * 100) }
 *     });
 *     return { text: result.data.text, confidence: result.data.confidence, language: "en" };
 *
 * Option B — Windows OCR API via Tauri sidecar:
 *   Bundle a PowerShell / C# sidecar that calls Windows.Media.Ocr
 *   Invoke with: invoke("ocr_image", { path: filePath })
 *
 * Option C — Tauri plugin:
 *   Use tauri-plugin-ocr when it becomes stable
 *
 * The public API stays identical regardless of which engine you connect.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { OCREngineResult, OCRError } from "../types";

// ─── Mock sample texts ────────────────────────────────────────────────────────
const MOCK_TEXTS = [
  `Invoice #INV-2024-0047
Date: March 15, 2024
Bill To: Acme Corporation
123 Business Park, Suite 400
New York, NY 10001

Description                   Qty    Unit Price     Total
─────────────────────────────────────────────────────────
Web Development Services       40h      $150.00   $6,000.00
UI/UX Design Review             8h      $120.00     $960.00
Technical Documentation         5h       $80.00     $400.00
─────────────────────────────────────────────────────────
                                         Subtotal  $7,360.00
                                              Tax    $736.00
                                            TOTAL  $8,096.00

Payment due within 30 days. Thank you for your business.`,

  `Meeting Notes – Product Review
Date: April 3, 2024
Attendees: Sarah M., James K., Lin T., Robert P.

Action Items:
1. Sarah to finalise Q2 roadmap by April 10
2. James to schedule usability testing for new dashboard
3. Lin to review accessibility compliance checklist
4. Robert to update API documentation for v2.1 release

Key Decisions:
- Launch date moved to May 14 to allow extra QA time
- Mobile-first approach confirmed for next sprint
- Analytics integration deferred to v2.2

Next meeting: April 17, 2024 at 10:00 AM`,

  `Chapter 3: Data Structures and Algorithms

3.1 Introduction to Binary Trees

A binary tree is a hierarchical data structure in which each node
has at most two children, referred to as the left child and the
right child.

Key Properties:
  • Root: The topmost node with no parent
  • Leaf nodes: Nodes with no children
  • Height: Edges on the longest path from root to leaf
  • Depth: Edges from root to a given node

Time Complexity:
  Search  O(log n) average  O(n) worst case
  Insert  O(log n) average  O(n) worst case
  Delete  O(log n) average  O(n) worst case`,

  `CERTIFICATE OF COMPLETION

This certifies that

ALEX JOHNSON

has successfully completed the course

Advanced Project Management
with a score of 94/100

Issued: February 28, 2024
Certificate ID: PM-2024-AJ-0392
Authorized by: Learning Institute of Technology`,

  `PURCHASE ORDER

PO Number: PO-2024-00891
Date: January 12, 2024

Vendor: TechSupply Co.
Address: 456 Industrial Ave, Chicago, IL 60601

Item               Part No.    Qty    Unit Price    Amount
──────────────────────────────────────────────────────────
Laptop Stand       TS-LS-001    10       $45.00     $450.00
USB-C Hub 7-Port   TS-HUB-7     5       $38.00     $190.00
Wireless Keyboard  TS-KB-BT     8       $62.00     $496.00
──────────────────────────────────────────────────────────
                                        Subtotal  $1,136.00
                                     Shipping       $45.00
                                        TOTAL   $1,181.00

Approved by: J. Rodriguez, Procurement Manager`,
];

// ─── Mock engine ──────────────────────────────────────────────────────────────
async function mockOCREngine(
  _file: File,
  onProgress?: (pct: number) => void
): Promise<OCREngineResult> {
  const steps = [8, 22, 41, 60, 77, 91, 100];
  for (const pct of steps) {
    await new Promise<void>((r) => setTimeout(r, 180 + Math.random() * 280));
    onProgress?.(pct);
  }
  const text       = MOCK_TEXTS[Math.floor(Math.random() * MOCK_TEXTS.length)];
  const confidence = Math.round(88 + Math.random() * 10); // 88–98
  return { text, confidence, language: "en" };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function extractTextFromImage(
  file: File,
  onProgress?: (pct: number) => void
): Promise<OCREngineResult> {
  const supported = ["image/png", "image/jpeg", "image/webp"];
  if (!supported.includes(file.type)) {
    throw {
      code: "UNSUPPORTED_FORMAT",
      message: `Unsupported format: ${file.type}. Use PNG, JPG, or WebP.`,
    } as OCRError;
  }
  if (file.size > 50 * 1024 * 1024) {
    throw {
      code: "FILE_TOO_LARGE",
      message: "File exceeds the 50 MB limit.",
    } as OCRError;
  }
  return mockOCREngine(file, onProgress);
}

export async function extractTextFromPdf(
  file: File,
  onProgress?: (pct: number) => void
): Promise<OCREngineResult> {
  if (file.type !== "application/pdf") {
    throw {
      code: "UNSUPPORTED_FORMAT",
      message: "File is not a valid PDF.",
    } as OCRError;
  }
  if (file.size > 100 * 1024 * 1024) {
    throw {
      code: "FILE_TOO_LARGE",
      message: "PDF exceeds the 100 MB limit.",
    } as OCRError;
  }
  await new Promise<void>((r) => setTimeout(r, 350)); // slight extra delay for PDFs
  return mockOCREngine(file, onProgress);
}

export interface BatchResult {
  id:       string;
  fileName: string;
  result?:  OCREngineResult;
  error?:   OCRError;
}

export async function extractBatch(
  files: File[],
  onItemProgress?: (index: number, pct: number) => void,
  onItemDone?:     (index: number, result: OCREngineResult | null, error?: OCRError) => void
): Promise<BatchResult[]> {
  const results: BatchResult[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const fn = file.type.startsWith("image/") ? extractTextFromImage : extractTextFromPdf;
      const result = await fn(file, (pct) => onItemProgress?.(i, pct));
      results.push({ id: `batch-${i}`, fileName: file.name, result });
      onItemDone?.(i, result);
    } catch (err) {
      const ocrErr = err as OCRError;
      results.push({ id: `batch-${i}`, fileName: file.name, error: ocrErr });
      onItemDone?.(i, null, ocrErr);
    }
  }
  return results;
}

export function getAcceptedMimeTypes(): Record<string, string[]> {
  return {
    "image/png":      [".png"],
    "image/jpeg":     [".jpg", ".jpeg"],
    "image/webp":     [".webp"],
    "application/pdf":[".pdf"],
  };
}
