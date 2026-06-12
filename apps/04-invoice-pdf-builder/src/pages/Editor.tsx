import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  Save, Download, Trash2, Plus, ArrowUp, ArrowDown, X, Copy, RotateCcw, FilePlus2,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, Section, TextField, SelectField, ACCENT } from "../components/UI";
import { InvoicePreview } from "../components/InvoicePreview";
import { useToast } from "../context/ToastContext";
import { useApp } from "../context/AppContext";
import {
  generateInvoicePdf, downloadPdf, safeFilename, calcTotals, formatMoney, lineTotal,
} from "../services/invoiceService";
import {
  getInvoice, saveInvoice, deleteInvoice, nextInvoiceNumber, peekInvoiceNumber,
  incrementStat,
} from "../services/localStorageService";
import type { Invoice, Currency, LineItem } from "../types";

function makeBlankInvoice(opts: { number: string; currency: Currency; taxRate: number; business: Invoice["business"]; }): Invoice {
  const today    = new Date().toISOString().slice(0, 10);
  const due      = new Date(); due.setDate(due.getDate() + 14);
  const dueIso   = due.toISOString().slice(0, 10);
  return {
    id:        uuidv4(),
    number:    opts.number,
    issueDate: today,
    dueDate:   dueIso,
    business:  opts.business,
    client:    { name: "", address: "", email: "" },
    lineItems: [{ id: uuidv4(), description: "Consulting services", quantity: 1, unitPrice: 0 }],
    taxRate:   opts.taxRate,
    discount:  0,
    currency:  opts.currency,
    notes:     "Payment due within 14 days. Thank you.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function Editor() {
  const { id }   = useParams<{ id?: string }>();
  const nav      = useNavigate();
  const { toast } = useToast();
  const { settings } = useApp();

  const [invoice, setInvoice] = useState<Invoice>(() => {
    if (id) {
      const existing = getInvoice(id);
      if (existing) return existing;
    }
    return makeBlankInvoice({
      number:   peekInvoiceNumber(),
      currency: settings.defaultCurrency,
      taxRate:  settings.defaultTaxRate,
      business: settings.business,
    });
  });
  const [savedToStorage, setSavedToStorage] = useState<boolean>(!!id);
  const [exporting, setExporting] = useState(false);

  // If id param changes (load a different invoice), refresh state.
  useEffect(() => {
    if (id) {
      const existing = getInvoice(id);
      if (existing) {
        setInvoice(existing);
        setSavedToStorage(true);
      }
    }
  }, [id]);

  const totals = useMemo(() => calcTotals(invoice), [invoice]);

  // ── Field helpers ───────────────────────────────────────────────────────────
  const patch = (p: Partial<Invoice>) => setInvoice((cur) => ({ ...cur, ...p }));
  const patchBusiness = (p: Partial<Invoice["business"]>) => setInvoice((cur) => ({ ...cur, business: { ...cur.business, ...p } }));
  const patchClient   = (p: Partial<Invoice["client"]>)   => setInvoice((cur) => ({ ...cur, client:   { ...cur.client,   ...p } }));

  // ── Line items ─────────────────────────────────────────────────────────────
  const addItem    = () => {
    setInvoice((cur) => ({ ...cur, lineItems: [...cur.lineItems, { id: uuidv4(), description: "", quantity: 1, unitPrice: 0 }] }));
    incrementStat("lineItemsCreated");
  };
  const updateItem = (id: string, patch: Partial<LineItem>) => setInvoice((cur) => ({
    ...cur, lineItems: cur.lineItems.map((it) => it.id === id ? { ...it, ...patch } : it),
  }));
  const removeItem = (id: string) => setInvoice((cur) => ({ ...cur, lineItems: cur.lineItems.filter((it) => it.id !== id) }));
  const moveItem   = (id: string, dir: -1 | 1) => setInvoice((cur) => {
    const idx = cur.lineItems.findIndex((it) => it.id === id);
    if (idx < 0) return cur;
    const ni = idx + dir;
    if (ni < 0 || ni >= cur.lineItems.length) return cur;
    const copy = cur.lineItems.slice();
    [copy[idx], copy[ni]] = [copy[ni], copy[idx]];
    return { ...cur, lineItems: copy };
  });

  // ── Actions ────────────────────────────────────────────────────────────────
  const saveDraft = () => {
    saveInvoice(invoice);
    setSavedToStorage(true);
    toast("Draft saved", "success");
  };

  const newInvoice = () => {
    const nextNum = nextInvoiceNumber();
    setInvoice(makeBlankInvoice({
      number: nextNum, currency: settings.defaultCurrency,
      taxRate: settings.defaultTaxRate, business: settings.business,
    }));
    setSavedToStorage(false);
    nav("/editor", { replace: true });
    toast(`New invoice ${nextNum} ready`, "info");
  };

  const duplicate = () => {
    const nextNum = nextInvoiceNumber();
    setInvoice((cur) => ({
      ...cur, id: uuidv4(), number: nextNum,
      issueDate: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    setSavedToStorage(false);
    nav("/editor", { replace: true });
    toast(`Duplicated as ${nextNum}`, "success");
  };

  const exportPdf = async () => {
    if (invoice.lineItems.length === 0) { toast("Add at least one line item", "warning"); return; }
    setExporting(true);
    try {
      const bytes = await generateInvoicePdf(invoice);
      downloadPdf(bytes, safeFilename(invoice));
      incrementStat("invoicesExported");
      toast("Invoice PDF downloaded", "success");
    } catch (e: any) {
      toast(`Export failed: ${e.message ?? "unknown"}`, "error");
    } finally {
      setExporting(false);
    }
  };

  const removeFromHistory = () => {
    if (!savedToStorage) { toast("Nothing to delete — this draft hasn't been saved yet", "warning"); return; }
    deleteInvoice(invoice.id);
    setSavedToStorage(false);
    toast("Invoice deleted from history", "info");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title={invoice.number || "New Invoice"}
        subtitle={savedToStorage ? "Saved · editing existing invoice" : "Unsaved draft"}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={newInvoice} icon={<FilePlus2 size={13} />}>New</Button>
            <Button variant="secondary" size="sm" onClick={duplicate}  icon={<Copy size={13} />}>Duplicate</Button>
            <Button variant="secondary" size="sm" onClick={saveDraft}  icon={<Save size={13} />}>Save draft</Button>
            <Button variant="primary"   size="sm" onClick={exportPdf}  loading={exporting} icon={<Download size={13} />}>Export PDF</Button>
            {savedToStorage && (
              <Button variant="danger" size="sm" onClick={removeFromHistory} icon={<Trash2 size={13} />}>Delete</Button>
            )}
          </>
        }
      />

      <div className="flex-1 overflow-hidden grid" style={{ gridTemplateColumns: "minmax(420px,1fr) minmax(420px,1fr)" }}>
        {/* Left: form */}
        <div className="overflow-y-auto p-6 space-y-5" style={{ borderRight: "1px solid #2d3748" }}>

          <Section title="Your Business">
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Business name" value={invoice.business.name}
                onChange={(v) => patchBusiness({ name: v })} placeholder="Acme Studio" />
              <TextField label="Logo (emoji)" value={invoice.business.logoEmoji}
                onChange={(v) => patchBusiness({ logoEmoji: v.slice(0, 4) })} placeholder="🧾" />
            </div>
            <TextField label="Address" multiline rows={2}
              value={invoice.business.address}
              onChange={(v) => patchBusiness({ address: v })}
              placeholder="123 Example Street\nCity, ZIP\nCountry" />
            <TextField label="Email" type="email"
              value={invoice.business.email}
              onChange={(v) => patchBusiness({ email: v })}
              placeholder="billing@example.com" />
          </Section>

          <Section title="Bill To (Client)">
            <TextField label="Client name" value={invoice.client.name}
              onChange={(v) => patchClient({ name: v })} placeholder="Client name or company" />
            <TextField label="Address" multiline rows={2}
              value={invoice.client.address}
              onChange={(v) => patchClient({ address: v })}
              placeholder="Street\nCity, ZIP\nCountry" />
            <TextField label="Email" type="email"
              value={invoice.client.email}
              onChange={(v) => patchClient({ email: v })}
              placeholder="client@example.com" />
          </Section>

          <Section title="Invoice Details">
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Invoice number" value={invoice.number}
                onChange={(v) => patch({ number: v })} />
              <SelectField label="Currency" value={invoice.currency}
                onChange={(v) => patch({ currency: v as Currency })}
                options={[
                  { value: "USD", label: "USD — US Dollar" },
                  { value: "EUR", label: "EUR — Euro" },
                  { value: "GBP", label: "GBP — British Pound" },
                  { value: "MAD", label: "MAD — Moroccan Dirham" },
                ]} />
              <TextField label="Issue date" type="date" value={invoice.issueDate}
                onChange={(v) => patch({ issueDate: v })} />
              <TextField label="Due date" type="date" value={invoice.dueDate}
                onChange={(v) => patch({ dueDate: v })} />
            </div>
          </Section>

          <Section title={`Line Items (${invoice.lineItems.length})`}
            action={
              <button onClick={addItem}
                className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: ACCENT }}>
                <Plus size={13} /> Add row
              </button>
            }>
            {invoice.lineItems.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "#64748b" }}>
                No line items — click Add row to start.
              </p>
            ) : invoice.lineItems.map((item, idx) => (
              <LineItemRow key={item.id} item={item} index={idx} total={invoice.lineItems.length}
                currency={invoice.currency}
                onChange={(p) => updateItem(item.id, p)}
                onRemove={() => removeItem(item.id)}
                onMove={(d) => moveItem(item.id, d)} />
            ))}
          </Section>

          <Section title="Totals">
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Tax rate" type="number" min={0} max={100} step={0.01}
                value={String(invoice.taxRate)}
                onChange={(v) => patch({ taxRate: Math.max(0, Math.min(100, parseFloat(v) || 0)) })}
                suffix="%" />
              <TextField label="Discount" type="number" min={0} max={100} step={0.01}
                value={String(invoice.discount)}
                onChange={(v) => patch({ discount: Math.max(0, Math.min(100, parseFloat(v) || 0)) })}
                suffix="%" />
            </div>
            <Card style={{ background: "rgba(245,158,11,.04)", borderColor: "rgba(245,158,11,.2)", padding: "12px 16px" }}>
              <div className="space-y-1.5 text-xs">
                <Row label="Subtotal" value={formatMoney(totals.subtotal, invoice.currency)} />
                {invoice.discount > 0 && <Row label={`Discount (${invoice.discount}%)`} value={"−" + formatMoney(totals.discountAmt, invoice.currency)} />}
                {invoice.taxRate > 0 && <Row label={`Tax (${invoice.taxRate}%)`}      value={formatMoney(totals.taxAmt, invoice.currency)} />}
                <div className="flex items-baseline justify-between pt-1.5 mt-1.5" style={{ borderTop: "1px solid #2d3748" }}>
                  <span className="text-xs font-semibold" style={{ color: "#f1f5f9" }}>TOTAL</span>
                  <span className="text-base font-bold" style={{ color: ACCENT }}>{formatMoney(totals.total, invoice.currency)}</span>
                </div>
              </div>
            </Card>
          </Section>

          <Section title="Notes / Payment Terms">
            <TextField multiline rows={4} value={invoice.notes}
              onChange={(v) => patch({ notes: v })}
              placeholder="Payment due within 14 days. Bank transfer to …" />
          </Section>

          {savedToStorage && (
            <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
              <RotateCcw size={11} /> This invoice is in your saved history. Use Save draft after edits to keep the latest version.
            </div>
          )}
        </div>

        {/* Right: live preview */}
        <div className="overflow-y-auto p-6">
          <p className="text-xs uppercase tracking-wide mb-3" style={{ color: "#64748b" }}>Live preview</p>
          <InvoicePreview invoice={invoice} />
          <p className="text-xs mt-4 text-center" style={{ color: "#475569" }}>
            PDF export renders the same layout as this preview at A4 size.
          </p>
        </div>
      </div>
    </div>
  );
}

function LineItemRow({ item, index, total, currency, onChange, onRemove, onMove }: {
  item: LineItem; index: number; total: number; currency: Currency;
  onChange: (p: Partial<LineItem>) => void;
  onRemove: () => void;
  onMove: (d: -1 | 1) => void;
}) {
  return (
    <div className="rounded-lg p-3" style={{ background: "rgba(30,37,53,.5)", border: "1px solid #2d3748" }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono" style={{ color: "#475569" }}>{String(index + 1).padStart(2, "0")}</span>
        <span className="text-xs flex-1" style={{ color: "#94a3b8" }}>
          Subtotal: <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{formatMoney(lineTotal(item), currency)}</span>
        </span>
        <button onClick={() => onMove(-1)} disabled={index === 0}
          className="rounded-md cursor-pointer disabled:opacity-30 flex items-center justify-center"
          style={{ width: 24, height: 24, color: "#94a3b8", border: "1px solid #2d3748" }}>
          <ArrowUp size={11} />
        </button>
        <button onClick={() => onMove(1)} disabled={index === total - 1}
          className="rounded-md cursor-pointer disabled:opacity-30 flex items-center justify-center"
          style={{ width: 24, height: 24, color: "#94a3b8", border: "1px solid #2d3748" }}>
          <ArrowDown size={11} />
        </button>
        <button onClick={onRemove}
          className="rounded-md cursor-pointer flex items-center justify-center"
          style={{ width: 24, height: 24, color: "#ef4444", border: "1px solid rgba(239,68,68,.25)" }}>
          <X size={11} />
        </button>
      </div>
      <div className="space-y-2">
        <TextField label="Description" value={item.description}
          onChange={(v) => onChange({ description: v })}
          placeholder="What you're billing for" multiline rows={2} />
        <div className="grid grid-cols-2 gap-2">
          <TextField label="Quantity" type="number" min={0} step={0.01}
            value={String(item.quantity)}
            onChange={(v) => onChange({ quantity: Math.max(0, parseFloat(v) || 0) })} />
          <TextField label="Unit price" type="number" min={0} step={0.01}
            value={String(item.unitPrice)}
            onChange={(v) => onChange({ unitPrice: Math.max(0, parseFloat(v) || 0) })} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span style={{ color: "#94a3b8" }}>{label}</span>
      <span style={{ color: "#f1f5f9" }}>{value}</span>
    </div>
  );
}
