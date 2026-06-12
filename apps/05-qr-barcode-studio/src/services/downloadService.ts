/**
 * downloadService.ts
 * Small helpers for downloading generated PNG / SVG files from the browser.
 */

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadString(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSvg(svg: string, filename: string): void {
  downloadString(svg, filename.endsWith(".svg") ? filename : `${filename}.svg`, "image/svg+xml");
}

export function safeName(base: string, ext: "png" | "svg"): string {
  const cleaned = base.replace(/[<>:"/\\|?*\s]/g, "_").slice(0, 40) || "code";
  const stamp   = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `${cleaned}-${stamp}.${ext}`;
}
