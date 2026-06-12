import { useMemo, useState } from "react";
import {
  Search as SearchIcon, X, Pin, Star, Copy, Trash2, RotateCcw,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import {
  Card, Button, Badge, EmptyState, Section, SelectField, Segmented,
} from "../components/UI";
import { EmptySearchIllustration } from "../components/illustrations";
import {
  filterSnippets, getCollections, recordCopy, deleteSnippet,
} from "../services/clipboardService";
import { useToast } from "../context/ToastContext";
import type { ContentType, SearchFilter, SortMode } from "../types";

const TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: "url",   label: "URL" },
  { value: "email", label: "Email" },
  { value: "code",  label: "Code" },
  { value: "phone", label: "Phone" },
  { value: "text",  label: "Text" },
];

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "newest",        label: "Newest first" },
  { value: "oldest",        label: "Oldest first" },
  { value: "most-used",     label: "Most used" },
  { value: "pinned-first",  label: "Pinned first" },
];

const DEFAULT_FILTER: SearchFilter = {
  query: "", types: [], pinnedOnly: false, favoritesOnly: false,
  collectionId: null, dateFromIso: null, dateToIso: null, sort: "newest",
};

export function Search() {
  const { toast }     = useToast();
  const collections   = useMemo(() => getCollections(), []);
  const [filter, setFilter] = useState<SearchFilter>(DEFAULT_FILTER);
  const [version, setVersion] = useState(0);  // bump to re-run filter after delete/copy

  const results = useMemo(() => filterSnippets(filter), [filter, version]);

  const patch = (p: Partial<SearchFilter>) => setFilter((f) => ({ ...f, ...p }));
  const reset = () => setFilter(DEFAULT_FILTER);

  const toggleType = (t: ContentType) => patch({
    types: filter.types.includes(t) ? filter.types.filter((x) => x !== t) : [...filter.types, t],
  });

  const onCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      recordCopy(id);
      setVersion((v) => v + 1);
      toast("Copied", "success");
    } catch { toast("Could not copy", "error"); }
  };

  const onDelete = (id: string) => {
    deleteSnippet(id);
    setVersion((v) => v + 1);
    toast("Deleted", "info");
  };

  const anyFilter = filter.query || filter.types.length > 0 || filter.pinnedOnly || filter.favoritesOnly
    || filter.collectionId || filter.dateFromIso || filter.dateToIso || filter.sort !== "newest";

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Search & filter"
        subtitle={`${results.length} match${results.length !== 1 ? "es" : ""}`}
        actions={
          anyFilter && <Button variant="secondary" size="sm" onClick={reset} icon={<RotateCcw size={13} />}>Reset</Button>
        } />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <Section title="Search">
          <div className="relative">
            <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <input type="text" placeholder="Search title, content, or tags…"
              value={filter.query} onChange={(e) => patch({ query: e.target.value })}
              className="w-full rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none"
              style={{ background: "#1e2535", border: "1px solid #2d3748", color: "#f1f5f9" }} />
            {filter.query && (
              <button onClick={() => patch({ query: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }}>
                <X size={14} />
              </button>
            )}
          </div>
        </Section>

        <Section title="Filters">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "#94a3b8" }}>Types</label>
              <div className="flex gap-2 flex-wrap">
                {TYPE_OPTIONS.map((t) => (
                  <button key={t.value} onClick={() => toggleType(t.value)}
                    className="btn-press px-3 py-1.5 rounded-md border text-xs font-medium cursor-pointer"
                    style={{
                      background:  filter.types.includes(t.value) ? "rgba(139,92,246,.12)" : "#1e2535",
                      borderColor: filter.types.includes(t.value) ? "#8b5cf6" : "#2d3748",
                      color:       filter.types.includes(t.value) ? "#a78bfa" : "#94a3b8",
                    }}>{t.label}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#94a3b8" }}>Pinned</label>
                <Segmented<"true" | "false"> value={filter.pinnedOnly ? "true" : "false"}
                  onChange={(v) => patch({ pinnedOnly: v === "true" })}
                  options={[{ value: "false", label: "All" }, { value: "true", label: "Pinned only" }]} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#94a3b8" }}>Favorites</label>
                <Segmented<"true" | "false"> value={filter.favoritesOnly ? "true" : "false"}
                  onChange={(v) => patch({ favoritesOnly: v === "true" })}
                  options={[{ value: "false", label: "All" }, { value: "true", label: "Favorites only" }]} />
              </div>
            </div>
            <SelectField label="Collection"
              value={filter.collectionId ?? ""}
              onChange={(v) => patch({ collectionId: v === "" ? null : v })}
              options={[{ value: "", label: "Any collection" }, ...collections.map((c) => ({ value: c.id, label: c.name }))]} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#94a3b8" }}>From</label>
                <input type="date" value={filter.dateFromIso ?? ""}
                  onChange={(e) => patch({ dateFromIso: e.target.value || null })}
                  className="w-full rounded-md px-3 py-2 text-sm outline-none"
                  style={{ background: "#1e2535", border: "1px solid #2d3748", color: "#f1f5f9" }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#94a3b8" }}>To</label>
                <input type="date" value={filter.dateToIso ?? ""}
                  onChange={(e) => patch({ dateToIso: e.target.value || null })}
                  className="w-full rounded-md px-3 py-2 text-sm outline-none"
                  style={{ background: "#1e2535", border: "1px solid #2d3748", color: "#f1f5f9" }} />
              </div>
            </div>
            <SelectField label="Sort"
              value={filter.sort}
              onChange={(v) => patch({ sort: v as SortMode })}
              options={SORT_OPTIONS} />
          </div>
        </Section>

        {results.length === 0 ? (
          <EmptyState illustration={<EmptySearchIllustration />}
            title="No matches"
            description={anyFilter ? "Try widening the filters above — toggle off types or clear the date range." : "Search across every snippet in your vault. Filters narrow by type, pin, favorite, collection, and date."} />
        ) : (
          <div className="space-y-2.5">
            {results.map((s) => (
              <Card key={s.id} style={{ padding: 0 }}>
                <div className="flex items-center gap-3 px-4 py-3">
                  {s.pinned   && <Pin  size={12} style={{ color: "#a78bfa" }} />}
                  {s.favorite && <Star size={12} style={{ color: "#fbbf24" }} fill="#fbbf24" />}
                  <Badge variant="purple">{s.type.toUpperCase()}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>
                      {s.title || s.content.slice(0, 60)}
                    </p>
                    <p className="text-xs mt-0.5 truncate font-mono" style={{ color: "#94a3b8" }}>
                      {s.content.slice(0, 120)}{s.content.length > 120 ? "…" : ""}
                    </p>
                  </div>
                  <span className="text-xs" style={{ color: "#475569" }}>{s.copyCount}× copied</span>
                  <Button variant="primary"   size="sm" onClick={() => onCopy(s.id, s.content)} icon={<Copy size={11} />}>Copy</Button>
                  <Button variant="danger"    size="sm" onClick={() => onDelete(s.id)} icon={<Trash2 size={11} />} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
