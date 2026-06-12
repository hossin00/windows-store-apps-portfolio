import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  QrCode, Barcode, Layers, Clock, Shield, ScanLine, ArrowRight, Sparkles,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { StatCard, Card, Button, Badge, ACCENT } from "../components/UI";
import { ActivityChart } from "../components/ActivityChart";
import { getStats, getHistory, getFirstUseDate } from "../services/localStorageService";
import type { HistoryEntry } from "../types";
import { formatDistanceToNow, differenceInCalendarDays } from "date-fns";

export function Dashboard() {
  const nav = useNavigate();
  const [stats,  setStats]  = useState({ codesGenerated: 0, qrCodes: 0, barcodes: 0, batchRuns: 0 });
  const [recent, setRecent] = useState<HistoryEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [firstUse, setFirstUse] = useState<string>("");

  useEffect(() => {
    setStats(getStats());
    const all = getHistory();
    setHistory(all);
    setRecent(all.slice(0, 5));
    setFirstUse(getFirstUseDate());
  }, []);

  const daysWithUs = firstUse ? Math.max(0, differenceInCalendarDays(new Date(), new Date(firstUse))) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Up early" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const activityTs = history.map((h) => h.createdAt);

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Dashboard" subtitle="QR Barcode Studio" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Welcome banner */}
        <Card style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.10), rgba(5,150,105,0.06))",
          borderColor: "rgba(16,185,129,0.25)",
        }}>
          <div className="flex items-center gap-4">
            <div className="rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ width: 44, height: 44, background: `linear-gradient(135deg,${ACCENT},#059669)` }}>
              <Sparkles size={20} color="#ffffff" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold" style={{ color: "#f1f5f9" }}>{greeting} — welcome back</p>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                {daysWithUs === 0
                  ? "Glad you're here on day one."
                  : `Day ${daysWithUs + 1} with QR Barcode Studio · ${stats.codesGenerated} code${stats.codesGenerated !== 1 ? "s" : ""} generated so far`}
              </p>
            </div>
          </div>
        </Card>

        {/* Activity chart */}
        <Card>
          <ActivityChart timestamps={activityTs} label="Activity — last 7 days" />
        </Card>

        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Codes Generated" value={stats.codesGenerated} icon={<Sparkles size={18} />} accent />
          <StatCard label="QR Codes"        value={stats.qrCodes}        icon={<QrCode size={18} />} />
          <StatCard label="Barcodes"        value={stats.barcodes}       icon={<Barcode size={18} />} />
          <StatCard label="Batch Runs"      value={stats.batchRuns}      icon={<Layers size={18} />} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Card>
              <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Quick Actions</p>
              <div className="grid grid-cols-3 gap-3">
                <ActionTile icon={<QrCode size={20} strokeWidth={1.8} />} label="QR Generator"
                  desc="URL, text, Wi-Fi, vCard, email" onClick={() => nav("/qr")} accent />
                <ActionTile icon={<Barcode size={20} strokeWidth={1.8} />} label="Barcode"
                  desc="Code 128, EAN, UPC, Code 39" onClick={() => nav("/barcode")} />
                <ActionTile icon={<Layers size={20} strokeWidth={1.8} />} label="Batch"
                  desc="One QR per line, download all" onClick={() => nav("/batch")} />
              </div>

              <p className="text-sm font-semibold mt-6 mb-3" style={{ color: "#f1f5f9" }}>What's included</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "QR — 5 payload types",
                  "QR — custom colors, size, error level",
                  "Barcode — 5 formats with validation",
                  "Live preview as you type",
                  "Export PNG + SVG",
                  "Batch QR per line",
                  "Local history with thumbnails",
                  "Dark / light / system theme",
                ].map((f) => (
                  <div key={f} className="rounded-md px-3 py-2 text-xs"
                    style={{ background: "rgba(30,37,53,.5)", border: "1px solid #2d3748", color: "#94a3b8" }}>
                    {f}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card style={{ background: "rgba(16,185,129,.06)", borderColor: "rgba(16,185,129,.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} style={{ color: ACCENT }} />
              <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Privacy-First</span>
            </div>
            <ul className="space-y-2 mb-4">
              {["Codes generated on device", "No account required", "No ads, no tracking", "Clear data anytime"].map(item => (
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
            <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Recent</p>
            <Button variant="ghost" size="sm" onClick={() => nav("/history")} style={{ color: ACCENT }}>
              View all <ArrowRight size={13} />
            </Button>
          </div>
          {recent.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center py-8 text-center gap-3">
                <div className="rounded-xl p-3" style={{ background: "rgba(16,185,129,.08)", color: ACCENT }}>
                  <ScanLine size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1" style={{ color: "#f1f5f9" }}>No codes yet</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>Generate a QR or barcode — saved codes appear here.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => nav("/qr")}>Make a QR</Button>
              </div>
            </Card>
          ) : (
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {recent.map((entry, i) => (
                <div key={entry.id}
                  className="flex items-center gap-4 px-5 py-3 cursor-pointer"
                  style={{ borderBottom: i < recent.length - 1 ? "1px solid #2d3748" : undefined }}
                  onClick={() => nav(entry.kind === "qr" ? `/qr/${entry.id}` : `/barcode/${entry.id}`)}>
                  <img src={entry.thumbnailDataUrl} alt={entry.title}
                    style={{ width: 36, height: 36, background: "#fff", borderRadius: 4, flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>{entry.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                      {entry.kind === "qr" ? `QR · ${entry.qrInput?.kind}` : `Barcode · ${entry.barcodeFormat}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={entry.kind === "qr" ? "emerald" : "blue"}>{entry.kind.toUpperCase()}</Badge>
                    <span className="text-xs" style={{ color: "#475569" }}>
                      {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
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
        background: accent ? "rgba(16,185,129,.08)" : "rgba(30,37,53,.6)",
        borderColor: accent ? "rgba(16,185,129,.25)" : "#2d3748",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = ACCENT)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = accent ? "rgba(16,185,129,.25)" : "#2d3748")}
    >
      <div className="mb-2" style={{ color: accent ? ACCENT : "#64748b" }}>{icon}</div>
      <p className="text-sm font-medium leading-tight mb-1" style={{ color: "#f1f5f9" }}>{label}</p>
      <p className="text-xs leading-snug" style={{ color: "#64748b" }}>{desc}</p>
    </button>
  );
}
