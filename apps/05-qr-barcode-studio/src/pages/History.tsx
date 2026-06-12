import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Trash2, Clock, X, Download, Edit3, FileImage, FileCode,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, Badge, EmptyState } from "../components/UI";
import {
  getHistory, deleteHistoryEntry, clearHistory, searchHistory,
} from "../services/localStorageService";
import { renderQrDataUrl, renderQrSvgString } from "../services/qrService";
import {
  renderBarcodeToPngDataUrl, renderBarcodeToSvgString,
} from "../services/barcodeService";
import { downloadDataUrl, downloadSvg, safeName } from "../services/downloadService";
import { useToast } from "../context/ToastContext";
import type { HistoryEntry } from "../types";
import { format } from "date-fns";

export function History() {
  const nav      = useNavigate();
  const { toast } = useToast();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [query,   setQuery]   = useState("");

  const load = () => setEntries(getHistory());
  useEffect(load, []);

  const filtered = query.trim() ? searchHistory(query) : entries;

  const exportPng = async (entry: HistoryEntry) => {
    try {
      if (entry.kind === "qr" && entry.qrInput && entry.qrOptions) {
        const url = await renderQrDataUrl(entry.qrInput, entry.qrOptions);
        downloadDataUrl(url, safeName(`qr-${entry.qrInput.kind}`, "png"));
      } else if (entry.kind === "barcode" && entry.barcodeFormat && entry.barcodeValue && entry.barcodeOptions) {
        const url = renderBarcodeToPngDataUrl(entry.barcodeFormat, entry.barcodeValue, entry.barcodeOptions);
        if (!url) throw new Error("Cannot render — value invalid");
        downloadDataUrl(url, safeName(`barcode-${entry.barcodeFormat.toLowerCase()}`, "png"));
      } else {
        downloadDataUrl(entry.thumbnailDataUrl, safeName("code", "png"));
      }
      toast("PNG downloaded", "success");
    } catch (e: any) { toast(`Export failed: ${e.message ?? "unknown"}`, "error"); }
  };

  const exportSvg = async (entry: HistoryEntry) => {
    try {
      if (entry.kind === "qr" && entry.qrInput && entry.qrOptions) {
        const svg = await renderQrSvgString(entry.qrInput, entry.qrOptions);
        downloadSvg(svg, safeName(`qr-${entry.qrInput.kind}`, "svg"));
      } else if (entry.kind === "barcode" && entry.barcodeFormat && entry.barcodeValue && entry.barcodeOptions) {
        const svg = renderBarcodeToSvgString(entry.barcodeFormat, entry.barcodeValue, entry.barcodeOptions);
        if (!svg) throw new Error("Cannot render — value invalid");
        downloadSvg(svg, safeName(`barcode-${entry.barcodeFormat.toLowerCase()}`, "svg"));
      } else {
        throw new Error("SVG unavailable for this entry");
      }
      toast("SVG downloaded", "success");
    } catch (e: any) { toast(`Export failed: ${e.message ?? "unknown"}`, "error"); }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="History"
        subtitle={`${entries.length} saved code${entries.length !== 1 ? "s" : ""}`}
        actions={entries.length > 0 && (
          <Button variant="danger" size="sm"
            onClick={() => { clearHistory(); load(); toast("History cleared", "info"); }}
            icon={<Trash2 size={13} />}>Clear</Button>
        )} />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {entries.length > 0 && (
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <input type="text" placeholder="Search by content, type, or format…" value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none"
              style={{ background: "#161b27", border: "1px solid #2d3748", color: "#f1f5f9" }} />
            {query && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setQuery("")}
                style={{ color: "#475569" }}><X size={14} /></button>
            )}
          </div>
        )}
        {query && <p className="text-xs" style={{ color: "#64748b" }}>{filtered.length} result(s) for "{query}"</p>}

        {filtered.length === 0 ? (
          <EmptyState icon={Clock} title={query ? "No results" : "No saved codes"}
            description={query ? "Try a different search." : "Generate a QR or barcode and click Save to keep it here."} />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((e) => (
              <Card key={e.id} style={{ padding: 0, overflow: "hidden" }}>
                <div className="flex items-stretch">
                  <div className="flex-shrink-0 flex items-center justify-center"
                    style={{ width: 120, background: "#fff", borderRight: "1px solid #2d3748" }}>
                    <img src={e.thumbnailDataUrl} alt={e.title}
                      style={{ maxWidth: 100, maxHeight: 100, display: "block" }} />
                  </div>
                  <div className="flex-1 p-4 min-w-0 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={e.kind === "qr" ? "emerald" : "blue"}>{e.kind.toUpperCase()}</Badge>
                      <Badge variant="default">{e.kind === "qr" ? e.qrInput?.kind?.toUpperCase() : e.barcodeFormat}</Badge>
                      <span className="text-xs ml-auto" style={{ color: "#475569" }}>{format(new Date(e.createdAt), "MMM d, HH:mm")}</span>
                    </div>
                    <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>{e.title}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "#64748b" }}>{e.content}</p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <Button variant="primary"   size="sm"
                        onClick={() => nav(e.kind === "qr" ? `/qr/${e.id}` : `/barcode/${e.id}`)}
                        icon={<Edit3 size={11} />}>Edit</Button>
                      <Button variant="secondary" size="sm" onClick={() => exportPng(e)} icon={<FileImage size={11} />}>PNG</Button>
                      <Button variant="secondary" size="sm" onClick={() => exportSvg(e)} icon={<FileCode  size={11} />}>SVG</Button>
                      <div className="flex-1" />
                      <Button variant="danger" size="sm"
                        onClick={() => { deleteHistoryEntry(e.id); load(); toast("Deleted", "info"); }}
                        icon={<Trash2 size={11} />}>Delete</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
