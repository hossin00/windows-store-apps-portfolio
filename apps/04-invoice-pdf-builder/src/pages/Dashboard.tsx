import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FilePlus2, Clock, Shield, Receipt, ArrowRight, Download, Save,
  Building2, Users, Edit3,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { StatCard, Card, Button, Badge, ACCENT } from "../components/UI";
import { getStats, getInvoices } from "../services/localStorageService";
import { formatMoney, calcTotals } from "../services/invoiceService";
import type { Invoice } from "../types";
import { formatDistanceToNow } from "date-fns";

export function Dashboard() {
  const nav = useNavigate();
  const [stats,  setStats]  = useState({ invoicesSaved: 0, invoicesExported: 0, lineItemsCreated: 0 });
  const [recent, setRecent] = useState<Invoice[]>([]);

  useEffect(() => { setStats(getStats()); setRecent(getInvoices().slice(0, 5)); }, []);

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Dashboard" subtitle="Invoice PDF Builder" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Invoices Saved"   value={stats.invoicesSaved}    icon={<Save size={18} />} accent />
          <StatCard label="PDFs Exported"    value={stats.invoicesExported} icon={<Download size={18} />} />
          <StatCard label="Line Items Created" value={stats.lineItemsCreated} icon={<Edit3 size={18} />} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Card>
              <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>Quick Actions</p>
              <div className="grid grid-cols-2 gap-3">
                <ActionTile icon={<FilePlus2 size={20} strokeWidth={1.8} />} label="New Invoice"
                  desc="Build a fresh invoice and export a PDF" onClick={() => nav("/editor")} accent />
                <ActionTile icon={<Clock size={20} strokeWidth={1.8} />} label="Invoices"
                  desc="Browse, edit, duplicate, or delete saved invoices" onClick={() => nav("/history")} />
              </div>

              <p className="text-sm font-semibold mt-6 mb-3" style={{ color: "#f1f5f9" }}>What's included</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Business profile",  Building2],
                  ["Client details",    Users],
                  ["Line items table",  Edit3],
                  ["Subtotal · tax · discount", Receipt],
                  ["Multi-currency (USD/EUR/GBP/MAD)", Receipt],
                  ["Real PDF export with pdf-lib", Download],
                ].map(([label, Icon]: any) => (
                  <div key={label} className="flex items-center gap-2 rounded-md px-3 py-2 text-xs"
                    style={{ background: "rgba(30,37,53,.5)", border: "1px solid #2d3748", color: "#94a3b8" }}>
                    <Icon size={12} style={{ color: ACCENT }} />
                    {label}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card style={{ background: "rgba(249,115,22,.06)", borderColor: "rgba(249,115,22,.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} style={{ color: ACCENT }} />
              <span className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Privacy-First</span>
            </div>
            <ul className="space-y-2 mb-4">
              {["Invoices stay on your device", "No account required", "No ads, no tracking", "Clear data anytime"].map(item => (
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
            <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Recent Invoices</p>
            <Button variant="ghost" size="sm" onClick={() => nav("/history")} style={{ color: ACCENT }}>
              View all <ArrowRight size={13} />
            </Button>
          </div>
          {recent.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center py-8 text-center gap-3">
                <div className="rounded-xl p-3" style={{ background: "rgba(249,115,22,.08)", color: ACCENT }}>
                  <Receipt size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1" style={{ color: "#f1f5f9" }}>No invoices yet</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>Build your first invoice in the editor — it stays on this device.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => nav("/editor")}>New invoice</Button>
              </div>
            </Card>
          ) : (
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {recent.map((inv, i) => {
                const totals = calcTotals(inv);
                return (
                  <div key={inv.id}
                    className="flex items-center gap-4 px-5 py-3 cursor-pointer"
                    style={{ borderBottom: i < recent.length - 1 ? "1px solid #2d3748" : undefined }}
                    onClick={() => nav(`/editor/${inv.id}`)}>
                    <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(249,115,22,.1)", color: ACCENT }}>
                      <Receipt size={16} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>
                        {inv.number} · {inv.client.name || "—"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                        {inv.lineItems.length} item{inv.lineItems.length !== 1 ? "s" : ""} · issued {inv.issueDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant="orange">{inv.currency}</Badge>
                      <span className="text-sm font-bold" style={{ color: "#f1f5f9" }}>
                        {formatMoney(totals.total, inv.currency)}
                      </span>
                      <span className="text-xs" style={{ color: "#475569" }}>
                        {formatDistanceToNow(new Date(inv.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                );
              })}
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
        background: accent ? "rgba(249,115,22,.08)" : "rgba(30,37,53,.6)",
        borderColor: accent ? "rgba(249,115,22,.25)" : "#2d3748",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = ACCENT)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = accent ? "rgba(249,115,22,.25)" : "#2d3748")}
    >
      <div className="mb-2" style={{ color: accent ? ACCENT : "#64748b" }}>{icon}</div>
      <p className="text-sm font-medium leading-tight mb-1" style={{ color: "#f1f5f9" }}>{label}</p>
      <p className="text-xs leading-snug" style={{ color: "#64748b" }}>{desc}</p>
    </button>
  );
}
