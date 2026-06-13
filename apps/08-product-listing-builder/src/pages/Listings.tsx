import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, Trash2, Copy, Edit3, X, FileText, FileCode, ShoppingBag,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import {
  Button, Card, Badge, EmptyState, SelectField, Segmented,
} from "../components/UI";
import { EmptyListingsIllustration } from "../components/illustrations";
import {
  getListings, deleteListing, duplicateListing, formatPrice,
  listingToJson, listingToTxt, downloadString, safeFilename,
  CATEGORY_OPTIONS, PLATFORM_OPTIONS, CONDITION_OPTIONS,
} from "../services/listingService";
import { useToast } from "../context/ToastContext";
import type { ProductListing, Category, Platform, Condition } from "../types";
import { format } from "date-fns";

type SortMode = "newest" | "name-asc" | "price-asc" | "price-desc";

export function Listings() {
  const nav      = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<ProductListing[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [condition, setCondition] = useState<Condition | "all">("all");
  const [sort, setSort] = useState<SortMode>("newest");

  const reload = () => setItems(getListings());
  useEffect(reload, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = items.filter((l) => {
      if (q) {
        const blob = `${l.name}\n${l.description}\n${l.tags.join(" ")}\n${l.sku}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      if (category !== "all" && l.category !== category) return false;
      if (condition !== "all" && l.condition !== condition) return false;
      if (platform !== "all" && !l.platforms.includes(platform)) return false;
      return true;
    });
    switch (sort) {
      case "newest":     out.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
      case "name-asc":   out.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "price-asc":  out.sort((a, b) => a.price - b.price); break;
      case "price-desc": out.sort((a, b) => b.price - a.price); break;
    }
    return out;
  }, [items, query, category, condition, platform, sort]);

  const exportJson = (l: ProductListing) => {
    downloadString(listingToJson(l), safeFilename(l.name, "json"), "application/json;charset=utf-8");
    toast("Exported as JSON", "success");
  };
  const exportTxt = (l: ProductListing) => {
    downloadString(listingToTxt(l), safeFilename(l.name, "txt"), "text/plain;charset=utf-8");
    toast("Exported as TXT", "success");
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Listings"
        subtitle={`${items.length} saved · ${filtered.length} shown`}
        actions={
          <Button variant="primary" size="sm" onClick={() => nav("/editor")} icon={<Plus size={13} />}>
            New listing
          </Button>
        } />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {items.length > 0 && (
          <Card style={{ padding: 16 }}>
            <div className="space-y-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
                <input type="text" placeholder="Search name, description, tags, SKU…" value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-md pl-9 pr-9 py-2 text-sm outline-none"
                  style={{ background: "#1e2535", border: "1px solid #2d3748", color: "#f1f5f9" }} />
                {query && (
                  <button onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-3">
                <SelectField label="Category" value={category}
                  onChange={(v) => setCategory(v as Category | "all")}
                  options={[{ value: "all", label: "All categories" }, ...CATEGORY_OPTIONS]} />
                <SelectField label="Platform" value={platform}
                  onChange={(v) => setPlatform(v as Platform | "all")}
                  options={[{ value: "all", label: "All platforms" }, ...PLATFORM_OPTIONS.map((p) => ({ value: p.value, label: p.label }))]} />
                <SelectField label="Condition" value={condition}
                  onChange={(v) => setCondition(v as Condition | "all")}
                  options={[{ value: "all", label: "All conditions" }, ...CONDITION_OPTIONS]} />
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: "#94a3b8" }}>Sort</label>
                  <Segmented<SortMode> value={sort} onChange={setSort}
                    options={[
                      { value: "newest",     label: "Newest" },
                      { value: "name-asc",   label: "A–Z" },
                      { value: "price-asc",  label: "Price ↑" },
                      { value: "price-desc", label: "Price ↓" },
                    ]} />
                </div>
              </div>
            </div>
          </Card>
        )}

        {items.length === 0 ? (
          <EmptyState illustration={<EmptyListingsIllustration />}
            title="No listings yet"
            description="Build your first listing in the editor — auto-formatted previews per marketplace and an SEO score guide you through."
            action={<Button variant="primary" onClick={() => nav("/editor")} icon={<Plus size={14} />}>New listing</Button>} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={ShoppingBag}
            title="No matches"
            description="Try different filters — clear them with the segmented control." />
        ) : (
          <div className="space-y-3">
            {filtered.map((l) => (
              <Card key={l.id} style={{ padding: 0 }}>
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => nav(`/editor/${l.id}`)}>
                  <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(14,165,233,.1)", color: "#0ea5e9" }}>
                    <ShoppingBag size={16} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>{l.name || "(untitled)"}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "#64748b" }}>
                      {l.description ? l.description.slice(0, 110) + (l.description.length > 110 ? "…" : "") : "(no description)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="purple">{l.category}</Badge>
                    {l.condition !== "new" && <Badge variant="amber">{l.condition}</Badge>}
                    <span className="text-sm font-bold" style={{ color: "#f1f5f9" }}>{formatPrice(l.price, l.currency)}</span>
                    <span className="text-xs" style={{ color: "#475569" }}>{format(new Date(l.updatedAt), "MMM d, HH:mm")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5"
                  style={{ borderTop: "1px solid #2d3748", background: "rgba(30,37,53,0.4)" }}>
                  <span className="text-xs flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
                    Platforms: {l.platforms.length === 0 ? "—" : l.platforms.join(", ")}
                  </span>
                  <div className="flex-1" />
                  <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); nav(`/editor/${l.id}`); }} icon={<Edit3 size={11} />}>Edit</Button>
                  <Button variant="secondary" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    const d = duplicateListing(l.id);
                    if (d) { reload(); toast(`Duplicated as "${d.name}"`, "success"); }
                  }} icon={<Copy size={11} />}>Duplicate</Button>
                  <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); exportTxt(l); }} icon={<FileText size={11} />}>TXT</Button>
                  <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); exportJson(l); }} icon={<FileCode size={11} />}>JSON</Button>
                  <Button variant="danger"   size="sm" onClick={(e) => { e.stopPropagation(); deleteListing(l.id); reload(); toast("Deleted", "info"); }} icon={<Trash2 size={11} />}>Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
