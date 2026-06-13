import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save, Download, Trash2, Plus, X, Copy, FilePlus2, Image as ImageIcon,
  FileText, FileCode, Sparkles, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import {
  Button, Card, Section, TextField, SelectField, Chip, ACCENT, Segmented,
} from "../components/UI";
import { useToast } from "../context/ToastContext";
import { useApp } from "../context/AppContext";
import {
  emptyListing, getListing, saveListing, deleteListing, duplicateListing,
  formatForPlatform, seoScore, formatPrice,
  CATEGORY_OPTIONS, CURRENCY_OPTIONS, CONDITION_OPTIONS, PLATFORM_OPTIONS,
  listingToJson, listingToTxt, downloadString, safeFilename,
} from "../services/listingService";
import type {
  ProductListing, Category, Currency, Condition, Platform,
} from "../types";

export function Editor() {
  const { id }   = useParams<{ id?: string }>();
  const nav      = useNavigate();
  const { toast } = useToast();
  const { settings } = useApp();

  const [listing, setListing] = useState<ProductListing>(() => {
    if (id) {
      const existing = getListing(id);
      if (existing) return existing;
    }
    return emptyListing(settings);
  });
  const [savedToStorage, setSavedToStorage] = useState<boolean>(!!id);
  const [featureDraft,   setFeatureDraft]   = useState("");
  const [tagDraft,       setTagDraft]       = useState("");
  const [previewPlatform, setPreviewPlatform] = useState<Platform>(listing.platforms[0] ?? settings.defaultPlatform);

  useEffect(() => {
    if (id) {
      const existing = getListing(id);
      if (existing) {
        setListing(existing);
        setSavedToStorage(true);
        setPreviewPlatform(existing.platforms[0] ?? settings.defaultPlatform);
      }
    }
  }, [id, settings.defaultPlatform]);

  const seo       = useMemo(() => seoScore(listing), [listing]);
  const preview   = useMemo(() => formatForPlatform(listing, previewPlatform), [listing, previewPlatform]);

  const patch = (p: Partial<ProductListing>) => setListing((cur) => ({ ...cur, ...p }));

  const addFeature = () => {
    const f = featureDraft.trim();
    if (!f) return;
    patch({ features: [...listing.features, f] });
    setFeatureDraft("");
  };
  const removeFeature = (idx: number) => patch({ features: listing.features.filter((_, i) => i !== idx) });
  const moveFeature   = (idx: number, dir: -1 | 1) => {
    const ni = idx + dir;
    if (ni < 0 || ni >= listing.features.length) return;
    const arr = listing.features.slice();
    [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
    patch({ features: arr });
  };

  const addTagsFromInput = () => {
    const raw = tagDraft.trim();
    if (!raw) return;
    const parts = raw.split(/[,\n]/).map((t) => t.trim().toLowerCase()).filter(Boolean);
    const merged = Array.from(new Set([...listing.tags, ...parts]));
    patch({ tags: merged });
    setTagDraft("");
  };
  const removeTag = (t: string) => patch({ tags: listing.tags.filter((x) => x !== t) });

  const togglePlatform = (p: Platform) => {
    const has = listing.platforms.includes(p);
    patch({ platforms: has ? listing.platforms.filter((x) => x !== p) : [...listing.platforms, p] });
  };

  const onSave = () => {
    const saved = saveListing(listing);
    setListing(saved);
    setSavedToStorage(true);
    toast("Listing saved to vault", "success");
  };

  const onNew = () => {
    const fresh = emptyListing(settings);
    setListing(fresh);
    setSavedToStorage(false);
    nav("/editor", { replace: true });
  };

  const onDuplicate = () => {
    if (!savedToStorage) {
      toast("Save first, then duplicate", "warning");
      return;
    }
    const dup = duplicateListing(listing.id);
    if (dup) {
      setListing(dup);
      setSavedToStorage(true);
      nav(`/editor/${dup.id}`, { replace: true });
      toast("Duplicated", "success");
    }
  };

  const onDelete = () => {
    if (!savedToStorage) return;
    deleteListing(listing.id);
    toast("Deleted", "info");
    onNew();
  };

  const exportJson = () => {
    downloadString(listingToJson(listing), safeFilename(listing.name, "json"), "application/json;charset=utf-8");
    toast("Exported as JSON", "success");
  };
  const exportTxt = () => {
    downloadString(listingToTxt(listing), safeFilename(listing.name, "txt"), "text/plain;charset=utf-8");
    toast("Exported as TXT", "success");
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title={listing.name || "New Listing"}
        subtitle={savedToStorage ? "Saved · editing existing listing" : "Unsaved draft"}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={onNew}      icon={<FilePlus2 size={13} />}>New</Button>
            <Button variant="secondary" size="sm" onClick={onDuplicate} icon={<Copy size={13} />}>Duplicate</Button>
            <Button variant="secondary" size="sm" onClick={exportTxt}  icon={<FileText size={13} />}>TXT</Button>
            <Button variant="secondary" size="sm" onClick={exportJson} icon={<FileCode size={13} />}>JSON</Button>
            <Button variant="primary"   size="sm" onClick={onSave}     icon={<Save size={13} />}>Save</Button>
            {savedToStorage && (
              <Button variant="danger" size="sm" onClick={onDelete} icon={<Trash2 size={13} />}>Delete</Button>
            )}
          </>
        } />

      <div className="flex-1 overflow-hidden grid" style={{ gridTemplateColumns: "minmax(440px,1fr) minmax(380px,1fr)" }}>
        {/* Left — form */}
        <div className="overflow-y-auto p-6 space-y-5" style={{ borderRight: "1px solid #2d3748" }}>

          <Section title="Basics">
            <TextField label="Product name" value={listing.name} onChange={(v) => patch({ name: v })}
              placeholder="Wireless Earbuds X-200" />
            <TextField label="Description" multiline rows={4}
              value={listing.description} onChange={(v) => patch({ description: v })}
              placeholder="A clear paragraph that introduces what the product is, what it's for, and what makes it different." />
            <div className="text-xs flex items-center gap-4" style={{ color: "#64748b" }}>
              <span>{listing.description.length} characters</span>
              <span>{listing.description.trim() ? listing.description.trim().split(/\s+/).length : 0} words</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Category" value={listing.category}
                onChange={(v) => patch({ category: v as Category })} options={CATEGORY_OPTIONS} />
              <SelectField label="Condition" value={listing.condition}
                onChange={(v) => patch({ condition: v as Condition })} options={CONDITION_OPTIONS} />
            </div>
          </Section>

          <Section title="Pricing & inventory">
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Price" type="number" min={0} step={0.01}
                value={String(listing.price)}
                onChange={(v) => patch({ price: Math.max(0, parseFloat(v) || 0) })}
                prefix={CURRENCY_OPTIONS.find((c) => c.value === listing.currency)?.symbol.trim() ?? listing.currency} />
              <TextField label="Compare-at price (optional)" type="number" min={0} step={0.01}
                value={String(listing.compareAtPrice)}
                onChange={(v) => patch({ compareAtPrice: Math.max(0, parseFloat(v) || 0) })}
                prefix={CURRENCY_OPTIONS.find((c) => c.value === listing.currency)?.symbol.trim() ?? listing.currency} />
            </div>
            <SelectField label="Currency" value={listing.currency}
              onChange={(v) => patch({ currency: v as Currency })}
              options={CURRENCY_OPTIONS.map((c) => ({ value: c.value, label: c.label }))} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="SKU / barcode" value={listing.sku}
                onChange={(v) => patch({ sku: v })} placeholder="WB-X200-BLK" mono />
              <TextField label="Business name (optional)" value={listing.businessName}
                onChange={(v) => patch({ businessName: v })} placeholder="Acme Studio" />
            </div>
          </Section>

          <Section title="Key features"
            action={
              <span className="text-xs" style={{ color: "#64748b" }}>
                {listing.features.length} bullet{listing.features.length !== 1 ? "s" : ""}
              </span>
            }>
            <div className="flex gap-2">
              <TextField value={featureDraft} onChange={setFeatureDraft}
                placeholder="Add a feature and press Enter" />
              <Button variant="primary" size="md" onClick={addFeature} icon={<Plus size={13} />}>Add</Button>
            </div>
            {listing.features.length > 0 ? (
              <ul className="space-y-1.5">
                {listing.features.map((f, i) => (
                  <li key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                    style={{ background: "rgba(30,37,53,.5)", border: "1px solid #2d3748" }}>
                    <span className="text-xs font-mono w-6 flex-shrink-0" style={{ color: "#475569" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm flex-1" style={{ color: "#cbd5e1" }}>{f}</span>
                    <button onClick={() => moveFeature(i, -1)} disabled={i === 0}
                      className="text-xs cursor-pointer disabled:opacity-30" style={{ color: "#94a3b8" }}>↑</button>
                    <button onClick={() => moveFeature(i, 1)}  disabled={i === listing.features.length - 1}
                      className="text-xs cursor-pointer disabled:opacity-30" style={{ color: "#94a3b8" }}>↓</button>
                    <button onClick={() => removeFeature(i)}
                      className="cursor-pointer" style={{ color: "#ef4444" }}><X size={13} /></button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs" style={{ color: "#475569" }}>No features yet — bullets dramatically improve marketplace conversion.</p>
            )}
          </Section>

          <Section title="Tags"
            action={
              <span className="text-xs" style={{ color: "#64748b" }}>{listing.tags.length} tag{listing.tags.length !== 1 ? "s" : ""}</span>
            }>
            <div className="flex gap-2">
              <TextField value={tagDraft} onChange={setTagDraft}
                placeholder="Comma-separated: earbuds, wireless, bluetooth" />
              <Button variant="primary" size="md" onClick={addTagsFromInput} icon={<Plus size={13} />}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {listing.tags.map((t) => (
                <Chip key={t} color="sky" onRemove={() => removeTag(t)}>{t}</Chip>
              ))}
            </div>
          </Section>

          <Section title="Images"
            action={<span className="text-xs" style={{ color: "#64748b" }}>{listing.imageSlots} / 8</span>}>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => {
                const active = i < listing.imageSlots;
                return (
                  <button key={i}
                    onClick={() => patch({ imageSlots: i + 1 === listing.imageSlots ? Math.max(0, i) : i + 1 })}
                    className="btn-press flex flex-col items-center justify-center rounded-lg cursor-pointer"
                    style={{
                      aspectRatio: "1 / 1",
                      background: active ? "rgba(14,165,233,.10)" : "rgba(30,37,53,.5)",
                      border: `1px dashed ${active ? "#0ea5e9" : "#2d3748"}`,
                      color: active ? "#38bdf8" : "#475569",
                    }}>
                    <ImageIcon size={20} />
                    <span className="text-xs mt-1">{i + 1}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs" style={{ color: "#475569" }}>
              Click a slot to set the number of image placeholders. The Tauri-bundled build can attach real image files here.
            </p>
          </Section>

          <Section title="SEO"
            action={
              <span className="text-xs font-semibold"
                style={{ color: seo.total >= 75 ? "#22c55e" : seo.total >= 40 ? "#fbbf24" : "#f87171" }}>
                {seo.total} / 100
              </span>
            }>
            <TextField label="SEO title (sweet spot 30–60 chars)"
              value={listing.seoTitle} onChange={(v) => patch({ seoTitle: v })}
              placeholder="Wireless Earbuds X-200 — ANC, 24h Battery, Bluetooth 5.3"
              maxLength={120} />
            <CounterRow length={listing.seoTitle.length} sweet={[30, 60]} hard={120} />
            <TextField label="Meta description (sweet spot 120–160 chars)" multiline rows={3}
              value={listing.seoDescription} onChange={(v) => patch({ seoDescription: v })}
              placeholder="One sentence that earns the click on a search results page."
              maxLength={300} />
            <CounterRow length={listing.seoDescription.length} sweet={[120, 160]} hard={300} />
            <div className="rounded-md p-3 space-y-1.5"
              style={{ background: "rgba(30,37,53,.4)", border: "1px solid #2d3748" }}>
              {seo.parts.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {p.status === "ok"   ? <CheckCircle2 size={12} style={{ color: "#22c55e" }} /> :
                   p.status === "warn" ? <AlertTriangle size={12} style={{ color: "#fbbf24" }} /> :
                                          <AlertTriangle size={12} style={{ color: "#f87171" }} />}
                  <span className="flex-1" style={{ color: "#94a3b8" }}>{p.label}</span>
                  <span style={{ color: p.status === "ok" ? "#22c55e" : "#cbd5e1" }}>{p.value} / {p.max}</span>
                </div>
              ))}
              {seo.suggestions.length > 0 && (
                <ul className="pt-2 mt-2 space-y-1" style={{ borderTop: "1px solid #2d3748" }}>
                  {seo.suggestions.map((s, i) => (
                    <li key={i} className="text-xs" style={{ color: "#fbbf24" }}>• {s}</li>
                  ))}
                </ul>
              )}
            </div>
          </Section>

          <Section title="Platform targeting"
            action={<span className="text-xs" style={{ color: "#64748b" }}>{listing.platforms.length} selected</span>}>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORM_OPTIONS.map((p) => {
                const active = listing.platforms.includes(p.value);
                return (
                  <button key={p.value} onClick={() => togglePlatform(p.value)}
                    className="btn-press rounded-md px-3 py-2 text-sm font-medium cursor-pointer"
                    style={{
                      background:  active ? "rgba(14,165,233,.12)" : "#1e2535",
                      border:      `1px solid ${active ? "#0ea5e9" : "#2d3748"}`,
                      color:       active ? "#38bdf8" : "#94a3b8",
                    }}>{p.label}</button>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Right — live preview */}
        <div className="overflow-y-auto p-6 space-y-4">
          <p className="text-xs uppercase tracking-wide" style={{ color: "#64748b" }}>Live preview · choose platform</p>
          <Segmented<Platform> value={previewPlatform}
            onChange={(v) => setPreviewPlatform(v)}
            options={PLATFORM_OPTIONS.map((p) => ({ value: p.value, label: p.label }))} />

          {/* Mini "browser window" preview */}
          <div className="rounded-xl shadow-xl overflow-hidden"
            style={{ background: "#ffffff", color: "#0f172a" }}>
            <div className="px-4 py-2 text-xs"
              style={{ background: "linear-gradient(90deg,#0369a1,#0ea5e9)", color: "#ffffff" }}>
              {preview.platform.toUpperCase()} preview · title up to {PLATFORM_OPTIONS.find((p) => p.value === preview.platform)!.titleMax} chars
            </div>
            <div className="p-5">
              <p className="text-base font-bold" style={{ color: "#0369a1" }}>{preview.displayTitle || "(empty title)"}</p>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-xl font-bold">{formatPrice(listing.price, listing.currency)}</span>
                {listing.compareAtPrice > listing.price && (
                  <span className="text-sm line-through" style={{ color: "#94a3b8" }}>
                    {formatPrice(listing.compareAtPrice, listing.currency)}
                  </span>
                )}
                {listing.condition !== "new" && (
                  <span className="text-xs px-2 py-0.5 rounded"
                    style={{ background: "#fef3c7", color: "#92400e" }}>{listing.condition.toUpperCase()}</span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1 mt-3">
                {Array.from({ length: Math.max(1, listing.imageSlots) }).map((_, i) => (
                  <div key={i}
                    className="rounded flex items-center justify-center"
                    style={{ aspectRatio: "1 / 1", background: "#e2e8f0", color: "#94a3b8" }}>
                    <ImageIcon size={20} />
                  </div>
                ))}
              </div>
              <pre className="text-xs mt-4 whitespace-pre-wrap"
                style={{ color: "#475569", fontFamily: preview.platform === "shopify" || preview.platform === "woocommerce" ? "JetBrains Mono, monospace" : "inherit", maxHeight: 260, overflow: "auto" }}>
                {preview.formattedBody || "(empty)"}
              </pre>
              {listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {listing.tags.slice(0, preview.platform === "etsy" ? 13 : 20).map((t) => (
                    <span key={t}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(14,165,233,0.10)", color: "#0369a1", border: "1px solid #bae6fd" }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {preview.warnings.length > 0 && (
            <Card style={{ background: "rgba(251,191,36,0.05)", borderColor: "rgba(251,191,36,0.25)" }}>
              <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "#fbbf24" }}>
                <AlertTriangle size={14} /> Platform warnings
              </p>
              <ul className="space-y-1 text-xs" style={{ color: "#94a3b8" }}>
                {preview.warnings.map((w, i) => <li key={i}>• {w}</li>)}
              </ul>
            </Card>
          )}

          <Card style={{ background: "rgba(14,165,233,0.04)", borderColor: "rgba(14,165,233,0.18)" }}>
            <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "#f1f5f9" }}>
              <Sparkles size={14} style={{ color: ACCENT }} /> SEO score
            </p>
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              {seo.total} / 100 — keep title 30–60 chars, meta description 120–160, at least 3 features, 3 tags, and 3 image slots.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CounterRow({ length, sweet, hard }: { length: number; sweet: [number, number]; hard: number }) {
  const status: "miss" | "low" | "ok" | "high" | "bad" =
    length === 0 ? "miss" :
    length < sweet[0] ? "low" :
    length <= sweet[1] ? "ok" :
    length <= hard ? "high" : "bad";
  const color = status === "ok" ? "#22c55e" : status === "miss" ? "#475569" : status === "low" ? "#fbbf24" : status === "high" ? "#fbbf24" : "#f87171";
  const label = status === "ok" ? "in sweet spot" : status === "miss" ? "empty" : status === "low" ? "short — aim higher" : status === "high" ? "may be truncated" : "too long";
  return (
    <div className="flex items-center justify-between text-xs">
      <span style={{ color: "#64748b" }}>{length} / {sweet[1]} chars · sweet spot {sweet[0]}–{sweet[1]}</span>
      <span style={{ color }}>{label}</span>
    </div>
  );
}
