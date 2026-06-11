/**
 * exportService.ts
 * Browser-download export utilities.
 * In a Tauri build: swap downloadBlob() to use the Tauri FS API
 * (invoke("save_file", { path, content })) for native Save Dialog support.
 */

import type { ExportFormat, HistoryEntry } from "../types";
import { addExportRecord } from "./localStorageService";
import { v4 as uuidv4 } from "uuid";

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 150);
}

export function exportText(
  text:             string,
  originalFileName: string,
  format:           ExportFormat,
  resultId:         string
): void {
  const base = originalFileName.replace(/\.[^.]+$/, "");
  let content  = text;
  let mimeType = "text/plain";
  let ext      = "txt";

  if (format === "md") {
    content  = `# OCR Result: ${originalFileName}\n\n_Extracted with PDF OCR Desk_\n\n---\n\n${text}`;
    mimeType = "text/markdown";
    ext      = "md";
  }

  downloadBlob(new Blob([content], { type: mimeType }), `${base}_ocr.${ext}`);

  addExportRecord({
    id:         uuidv4(),
    resultId,
    fileName:   originalFileName,
    format,
    exportedAt: new Date().toISOString(),
  });
}

export function exportHistoryAsJSON(history: HistoryEntry[]): void {
  const data = {
    exportedAt:   new Date().toISOString(),
    appName:      "PDF OCR Desk",
    version:      "1.0.0",
    totalEntries: history.length,
    entries:      history,
  };
  downloadBlob(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    `ocr-history-${Date.now()}.json`
  );
}

export function exportBatchResultsAsText(
  items: { fileName: string; text: string }[]
): void {
  const lines: string[] = [];
  items.forEach((item, i) => {
    lines.push("=".repeat(60));
    lines.push(`File ${i + 1}: ${item.fileName}`);
    lines.push("=".repeat(60));
    lines.push(item.text);
    lines.push("");
  });
  downloadBlob(
    new Blob([lines.join("\n")], { type: "text/plain" }),
    `batch-ocr-results-${Date.now()}.txt`
  );
}
