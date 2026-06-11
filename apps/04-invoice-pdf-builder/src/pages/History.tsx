import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  Search, Trash2, Clock, Receipt, X, Copy, Download, Edit3,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, Badge, EmptyState } from "../components/UI";
import {
  getInvoices, deleteInvoice, clearInvoices, searchInvoices, saveInvoice,
  nextInvoiceNumber, incrementStat,
} from "../services/localStorageService";
import { calcTotals, formatMoney, generateInvoicePdf, downloadPdf, safeFilename } from "../services/invoiceService";
import { useToast } from "../context/ToastContext";
import type { Invoice } from "../types";
import { format } from "date-fns";

export function History() {
  const nav      = useNavigate();
  const { toast } = useToast();
  const [entries, setEntries] = useState<Invoice[]>([]);
  const [query,   setQuery]   = useState("");

  const load = () => setEntries(getInvoices());
  useEffect(load, []);

  const filtered = query.trim() ? searchInvoices(query) : entries;

  const duplicate = (inv: Invoice) => {
    const number  = nextInvoiceNumber();
    const newInv: Invoice = {
      ...inv, id: uuidv4(), number,
      issueDate: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    saveInvoice(newInv); load();
    toast(`Duplicated as ${number}`, "success");
    nav(`/editor/${newInv.id}`);
  };

  const exportInv = async (inv: Invoice) => {
    try {
      const bytes = await generateInvoicePdf(inv);
      downloadPdf(bytes, safeFilename(inv));
      incrementStat("invoicesExported");
      toast("Invoice PDF downloaded", "success");
    } catch (e: any) {
      toast(`Export failed: ${e.message ?? "unknown"}`, "error");
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Invoices"
        subtitle={`${entries.length} saved invoice${entries.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="primary" size="sm" onClick={() => nav("/editor")}>New invoice</Button>
            {entries.length > 0 && (
              <Button variant="danger" size="sm"
                onClick={() => { clearInvoices(); load(); toast("All invoices cleared", "info"); }}
                icon={<Trash2 size={13} />}>Clear all</Button>
            )}
          </>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {entries.length > 0 && (
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <input type="text" placeholder="Search by invoice number, client, or business…" value={query}
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
          <EmptyState icon={Clock} title={query ? "No results" : "No saved invoices"}
            description={query ? "Try a different search." : "Build an invoice in the editor and click Save draft to keep it here."} />
        ) : (
          <div className="space-y-3">
            {filtered.map((inv) => {
              const totals = calcTotals(inv);
              return (
                <Card key={inv.id} style={{ padding: 0, overflow: "hidden" }}>
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(249,115,22,.1)", color: "#f97316" }}>
                      <Receipt size={16} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "#f1f5f9" }}>
                        {inv.number} · {inv.client.name || "—"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                        {inv.business.name || "—"} → {inv.client.name || "—"} ·
                        issued {inv.issueDate} · due {inv.dueDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant="orange">{inv.currency}</Badge>
                      <span className="text-base font-bold" style={{ color: "#f1f5f9" }}>
                        {formatMoney(totals.total, inv.currency)}
                      </span>
                      <span className="text-xs" style={{ color: "#475569" }}>
                        {format(new Date(inv.updatedAt), "MMM d, HH:mm")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-5 py-3" style={{ borderTop: "1px solid #2d3748", background: "rgba(30,37,53,.4)" }}>
                    <Button variant="primary"   size="sm" onClick={() => nav(`/editor/${inv.id}`)} icon={<Edit3 size={12} />}>Edit</Button>
                    <Button variant="secondary" size="sm" onClick={() => exportInv(inv)}          icon={<Download size={12} />}>Export PDF</Button>
                    <Button variant="secondary" size="sm" onClick={() => duplicate(inv)}          icon={<Copy size={12} />}>Duplicate</Button>
                    <div className="flex-1" />
                    <Button variant="danger" size="sm"
                      onClick={() => { deleteInvoice(inv.id); load(); toast("Invoice deleted", "info"); }}
                      icon={<Trash2 size={12} />}>Delete</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
