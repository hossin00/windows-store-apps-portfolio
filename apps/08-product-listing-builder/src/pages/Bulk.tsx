import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, Play, Download, FileCode, Trash2, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import {
  Button, Card, EmptyState, Badge, TextField, Section,
} from "../components/UI";
import { EmptyBulkIllustration } from "../components/illustrations";
import {
  parseCsv, saveListing, formatPrice, CSV_TEMPLATE,
  allListingsToJson, downloadString, incrementStat,
} from "../services/listingService";
import { useToast } from "../context/ToastContext";
import { useApp } from "../context/AppContext";
import type { ProductListing } from "../types";

type Row = { listing: ProductListing; warnings: string[]; saved: boolean };

export function Bulk() {
  const nav      = useNavigate();
  const { toast } = useToast();
  const { settings } = useApp();
  const [csv,   setCsv]   = useState(CSV_TEMPLATE);
  const [rows,  setRows]  = useState<Row[]>([]);
  const [busy,  setBusy]  = useState(false);

  const parsed = useMemo(() => parseCsv(csv, settings), [csv, settings]);

  const preview = () => {
    if (parsed.length === 0) { toast("CSV has no rows", "warning"); return; }
    setRows(parsed.map((r) => ({ listing: r.listing, warnings: r.warnings, saved: false })));
    toast(`Parsed ${parsed.length} row${parsed.length !== 1 ? "s" : ""}`, "success");
  };

  const generateAll = () => {
    if (rows.length === 0) { toast("Preview the CSV first", "warning"); return; }
    setBusy(true);
    try {
      const next = rows.map((r) => {
        saveListing(r.listing);
        return { ...r, saved: true };
      });
      setRows(next);
      incrementStat("bulkRuns");
      toast(`Created ${next.length} listing${next.length !== 1 ? "s" : ""}`, "success");
    } catch (e: any) {
      toast(`Bulk save failed: ${e.message ?? "unknown"}`, "error");
    } finally {
      setBusy(false);
    }
  };

  const exportAll = () => {
    if (rows.length === 0) { toast("Nothing to export", "warning"); return; }
    const payload = JSON.stringify({
      exportedAt: new Date().toISOString(),
      listings:   rows.map((r) => r.listing),
    }, null, 2);
    downloadString(payload, `bulk-${Date.now()}.json`, "application/json;charset=utf-8");
    toast("Exported as JSON", "success");
  };

  const downloadAll = () => {
    downloadString(allListingsToJson(), `all-listings-${Date.now()}.json`, "application/json;charset=utf-8");
    toast("Exported all saved listings", "success");
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Bulk import"
        subtitle={`${parsed.length} row${parsed.length !== 1 ? "s" : ""} parsed${rows.length > 0 ? ` · ${rows.filter((r) => r.saved).length} saved` : ""}`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={downloadAll} icon={<Download size={13} />}>Export all saved</Button>
            <Button variant="secondary" size="sm" onClick={preview}     icon={<Upload size={13} />}>Preview CSV</Button>
            <Button variant="primary"   size="sm" onClick={generateAll} loading={busy} icon={<Play size={13} />}>
              Generate listings
            </Button>
            {rows.length > 0 && (
              <Button variant="secondary" size="sm" onClick={exportAll} icon={<FileCode size={13} />}>Export batch JSON</Button>
            )}
          </>
        } />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <Section title="CSV template"
          action={
            <Button variant="ghost" size="sm" onClick={() => { setCsv(CSV_TEMPLATE); setRows([]); toast("Reset to template", "info"); }}
              icon={<Trash2 size={11} />} style={{ color: "#94a3b8" }}>Reset</Button>
          }>
          <p className="text-xs" style={{ color: "#64748b" }}>
            Header row: <span style={{ color: "#cbd5e1", fontFamily: "JetBrains Mono, monospace" }}>name, description, category, price, compareAtPrice, currency, sku, condition, features, tags, seoTitle, seoDescription, imageSlots</span>.
            Multiple <em>features</em> or <em>tags</em> in one cell are split on the <span style={{ color: "#cbd5e1" }}>|</span> character.
          </p>
          <TextField multiline rows={10} value={csv} onChange={setCsv} mono />
        </Section>

        {rows.length === 0 ? (
          <EmptyState illustration={<EmptyBulkIllustration />}
            title="No batch generated yet"
            description="Paste a CSV above (or edit the template), click Preview CSV, review the parsed rows, then Generate listings." />
        ) : (
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div className="px-5 py-3 border-b flex items-center justify-between"
              style={{ borderColor: "#2d3748" }}>
              <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>
                Preview · {rows.length} row{rows.length !== 1 ? "s" : ""}
              </p>
              <Button variant="ghost" size="sm" onClick={() => nav("/listings")}
                style={{ color: "#0ea5e9", paddingLeft: 0 }}>
                Open Listings →
              </Button>
            </div>
            <table className="w-full text-xs">
              <thead style={{ background: "rgba(30,37,53,.5)" }}>
                <tr>
                  <th className="text-left px-4 py-2 font-medium" style={{ color: "#94a3b8" }}>Name</th>
                  <th className="text-left px-4 py-2 font-medium" style={{ color: "#94a3b8" }}>Category</th>
                  <th className="text-left px-4 py-2 font-medium" style={{ color: "#94a3b8" }}>Price</th>
                  <th className="text-left px-4 py-2 font-medium" style={{ color: "#94a3b8" }}>SKU</th>
                  <th className="text-left px-4 py-2 font-medium" style={{ color: "#94a3b8" }}>Tags</th>
                  <th className="text-left px-4 py-2 font-medium" style={{ color: "#94a3b8" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: i < rows.length - 1 ? "1px solid #2d3748" : undefined }}>
                    <td className="px-4 py-2 truncate max-w-[260px]" style={{ color: "#cbd5e1" }}>
                      {r.listing.name || "(untitled)"}
                    </td>
                    <td className="px-4 py-2"><Badge variant="purple">{r.listing.category}</Badge></td>
                    <td className="px-4 py-2 font-semibold" style={{ color: "#f1f5f9" }}>
                      {formatPrice(r.listing.price, r.listing.currency)}
                    </td>
                    <td className="px-4 py-2 font-mono" style={{ color: "#94a3b8" }}>{r.listing.sku || "—"}</td>
                    <td className="px-4 py-2" style={{ color: "#94a3b8" }}>
                      {r.listing.tags.slice(0, 4).join(", ")}{r.listing.tags.length > 4 ? "…" : ""}
                    </td>
                    <td className="px-4 py-2">
                      {r.saved ? (
                        <span className="flex items-center gap-1.5" style={{ color: "#22c55e" }}>
                          <CheckCircle2 size={12} /> saved
                        </span>
                      ) : r.warnings.length > 0 ? (
                        <span className="flex items-center gap-1.5" style={{ color: "#fbbf24" }} title={r.warnings.join("\n")}>
                          <AlertTriangle size={12} /> {r.warnings.length} warning{r.warnings.length !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>ready</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
