import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FilePlus2, Boxes, Upload, BookMarked, Shield, ShoppingBag,
  ArrowRight, Sparkles, Copy, Tags,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { StatCard, Card, Button, Badge, ACCENT } from "../components/UI";
import { ActivityChart } from "../components/ActivityChart";
import {
  getStats, getListings, getFirstUseDate, formatPrice,
} from "../services/listingService";
import type { ProductListing } from "../types";
import { formatDistanceToNow, differenceInCalendarDays } from "date-fns";

export function Dashboard() {
  const nav = useNavigate();
  const [stats,    setStats]    = useState(getStats());
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [firstUse, setFirstUse] = useState<string>("");

  useEffect(() => {
    setStats(getStats());
    setListings(getListings());
    setFirstUse(getFirstUseDate());
  }, []);

  const daysWithUs = firstUse ? Math.max(0, differenceInCalendarDays(new Date(), new Date(firstUse))) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Up early" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const activityTs = listings.map((l) => l.createdAt);
  const recent     = listings.slice(0, 5);

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Dashboard" subtitle="Product Listing Builder" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Welcome */}
        <Card style={{
          background: "linear-gradient(135deg, rgba(14,165,233,0.10), rgba(3,105,161,0.06))",
          borderColor: "rgba(14,165,233,0.25)",
        }}>
          <div className="flex items-center gap-4">
            <div className="rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ width: 44, height: 44, background: `linear-gradient(135deg,${ACCENT},#0369a1)` }}>
              <Sparkles size={20} color="#ffffff" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold" style={{ color: "#f1f5f9" }}>{greeting} — welcome back</p>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                {daysWithUs === 0
                  ? "Glad you're here on day one — start your first listing in the editor."
                  : `Day ${daysWithUs + 1} · ${stats.listingsCreated} listing${stats.listingsCreated !== 1 ? "s" : ""} created so far`}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Listings Created"  value={stats.listingsCreated}    icon={<ShoppingBag size={18} />} accent />
          <StatCard label="Duplicated"        value={stats.listingsDuplicated} icon={<Copy size={18} />} />
          <StatCard label="Templates Saved"   value={stats.templatesSaved}     icon={<BookMarked size={18} />} />
          <StatCard label="Bulk Runs"         value={stats.bulkRuns}           icon={<Upload size={18} />} />
        </div>

        <Card>
          <ActivityChart timestamps={activityTs} label="Listings — last 7 days" />
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Card>
              <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Quick Actions</p>
              <div className="grid grid-cols-4 gap-3">
                <ActionTile icon={<FilePlus2 size={20} strokeWidth={1.8} />} label="New listing"
                  desc="Open the structured editor" onClick={() => nav("/editor")} accent />
                <ActionTile icon={<Boxes size={20} strokeWidth={1.8} />} label="Listings"
                  desc="Search, filter, edit, duplicate" onClick={() => nav("/listings")} />
                <ActionTile icon={<Upload size={20} strokeWidth={1.8} />} label="Bulk"
                  desc="Paste a CSV, generate many at once" onClick={() => nav("/bulk")} />
                <ActionTile icon={<BookMarked size={20} strokeWidth={1.8} />} label="Templates"
                  desc="Start from a saved shape" onClick={() => nav("/templates")} />
              </div>

              <p className="text-sm font-semibold mt-6 mb-3" style={{ color: "#f1f5f9" }}>What's built in</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Per-platform live preview (6 marketplaces)",
                  "SEO score with actionable suggestions",
                  "Feature bullets + reorderable",
                  "Tag chips with comma input",
                  "Image slot grid (placeholder for now)",
                  "CSV bulk importer (pipe-separated lists)",
                ].map((label) => (
                  <div key={label} className="rounded-md px-3 py-2 text-xs flex items-center gap-2"
                    style={{ background: "rgba(30,37,53,.5)", border: "1px solid #2d3748", color: "#94a3b8" }}>
                    <Tags size={12} style={{ color: ACCENT }} />
                    {label}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card style={{ background: "rgba(14,165,233,0.06)", borderColor: "rgba(14,165,233,0.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} style={{ color: ACCENT }} />
              <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Privacy-First</span>
            </div>
            <ul className="space-y-2 mb-4">
              {["Listings stay on your device", "No account required", "No ads, no tracking", "Clear data anytime"].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs" style={{ color: "#94a3b8" }}>
                  <span style={{ color: "#22c55e", fontSize: 14 }}>✓</span>{item}
                </li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" onClick={() => nav("/privacy")}
              style={{ color: ACCENT, paddingLeft: 0 }}>
              Privacy details <ArrowRight size={13} />
            </Button>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Recent listings</p>
            <Button variant="ghost" size="sm" onClick={() => nav("/listings")} style={{ color: ACCENT }}>
              View all <ArrowRight size={13} />
            </Button>
          </div>
          {recent.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center py-8 text-center gap-3">
                <div className="rounded-xl p-3" style={{ background: "rgba(14,165,233,0.08)", color: ACCENT }}>
                  <ShoppingBag size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1" style={{ color: "#f1f5f9" }}>No listings yet</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>Open the editor and try a template, or paste a CSV.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => nav("/editor")}>New listing</Button>
              </div>
            </Card>
          ) : (
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {recent.map((l, i) => (
                <div key={l.id}
                  className="flex items-center gap-4 px-5 py-3 cursor-pointer"
                  style={{ borderBottom: i < recent.length - 1 ? "1px solid #2d3748" : undefined }}
                  onClick={() => nav(`/editor/${l.id}`)}>
                  <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(14,165,233,0.1)", color: ACCENT }}>
                    <ShoppingBag size={16} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>{l.name || "(untitled)"}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "#64748b" }}>
                      {l.category} · {l.platforms.join(", ") || "no platform"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="purple">{l.category}</Badge>
                    <span className="text-sm font-bold" style={{ color: "#f1f5f9" }}>{formatPrice(l.price, l.currency)}</span>
                    <span className="text-xs" style={{ color: "#475569" }}>
                      {formatDistanceToNow(new Date(l.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionTile({ icon, label, desc, onClick, accent = false }: {
  icon: React.ReactNode; label: string; desc: string; onClick: () => void; accent?: boolean;
}) {
  return (
    <button onClick={onClick}
      className="text-left rounded-lg p-4 border transition-all duration-100"
      style={{
        background: accent ? "rgba(14,165,233,0.08)" : "rgba(30,37,53,.6)",
        borderColor: accent ? "rgba(14,165,233,0.25)" : "#2d3748",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = ACCENT)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = accent ? "rgba(14,165,233,0.25)" : "#2d3748")}>
      <div className="mb-2" style={{ color: accent ? ACCENT : "#64748b" }}>{icon}</div>
      <p className="text-sm font-medium leading-tight mb-1" style={{ color: "#f1f5f9" }}>{label}</p>
      <p className="text-xs leading-snug" style={{ color: "#64748b" }}>{desc}</p>
    </button>
  );
}
